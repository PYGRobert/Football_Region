/**
 * events.js — 事件系统模块 (v2.2)
 * 依赖: State, Constants, Flags, Series, RawEvents (events_data.js)
 * 职责: 张力调度算法、条件评估、事件查找
 *
 * v2.2: 事件系统重建 —
 *   四级张力调度取代旧优先级线性检查
 *   声明式条件评估(Flags模块)取代字符串解析器
 *   unlocks双重门控因果系统
 *   类别多样性惩罚
 * v2.0-2.1: 旧调度算法、字符串条件解析器(已移除)
 */
window.Game = window.Game || {};

window.Game.Events = (function() {
    'use strict';

    var S = window.Game.State;
    var C = window.Game.Constants;
    var Flags = window.Game.Flags;
    var Series = window.Game.Series;
    if (!S || !C || !Flags) throw new Error('[Events] 依赖 Game.State/Constants/Flags 未加载');
    if (!Series) throw new Error('[Events] 依赖 Game.Series 未加载');

    var RawEvents = window.Game.RawEvents;
    var SeriesDefs = window.Game.SeriesDefs || {};
    if (!RawEvents || !RawEvents.length) throw new Error('[Events] Game.RawEvents 未加载或为空');

    // ==================== 事件注册与查找 ====================

    /** @type {object} id→event 快速查找表 */
    var _eventById = {};
    /** @type {object} 类别→事件列表 */
    var _eventsByCategory = {};
    /** @type {object} 张力→事件列表 */
    var _eventsByTension = {};

    RawEvents.forEach(function(ev) {
        // 基础结构校验
        if (!ev.id) { console.error('[Events] 事件缺少 id:', ev); return; }
        if (!ev.category) { console.warn('[Events] 事件缺少 category:', ev.id); }
        if (ev.tension === undefined) { console.warn('[Events] 事件缺少 tension:', ev.id); }

        _eventById[ev.id] = ev;

        // 类别索引
        var cat = ev.category || 'unknown';
        if (!_eventsByCategory[cat]) _eventsByCategory[cat] = [];
        _eventsByCategory[cat].push(ev);

        // 张力索引
        var t = String(ev.tension);
        if (!_eventsByTension[t]) _eventsByTension[t] = [];
        _eventsByTension[t].push(ev);
    });

    // ==================== 系列注册 ====================

    for (var sid in SeriesDefs) {
        if (SeriesDefs.hasOwnProperty(sid)) {
            var def = SeriesDefs[sid];
            def.id = sid;
            if (def.condition) {
                // 简单的条件: "s.reputation>=20&&s.age<=34"
                def.conditionFn = _parseSimpleCondition(def.condition);
            }
            Series.registerSeries(def);
        }
    }

    console.log('[Events] 已加载 ' + Object.keys(_eventById).length + ' 个事件, ' +
        Object.keys(SeriesDefs).length + ' 个系列定义');

    // ==================== 简单条件解析 (仅用于系列定义) ====================

    function _parseSimpleCondition(condStr) {
        if (!condStr || typeof condStr !== 'string') return function() { return true; };

        var parts = condStr.split('&&');
        var checkers = [];

        parts.forEach(function(part) {
            part = part.trim();
            var match = part.match(/^s\.(\w+)\s*(>=|<=|>|<|==)\s*(\d+)$/);
            if (match) {
                var key = match[1], op = match[2], val = parseInt(match[3], 10);
                checkers.push(function(s) {
                    var sv = s[key];
                    if (sv === undefined) return false;
                    switch (op) {
                        case '>=': return sv >= val;
                        case '<=': return sv <= val;
                        case '>':  return sv > val;
                        case '<':  return sv < val;
                        case '==': return sv === val;
                        default:   return false;
                    }
                });
            }
        });

        return function(s) {
            return checkers.every(function(fn) { return fn(s); });
        };
    }

    // ==================== 条件评估 ====================

    /**
     * 评估事件触发条件
     * @param {object} event - 事件对象
     * @returns {boolean}
     */
    function evaluateConditions(event) {
        var cond = event.conditions;
        if (!cond) return true;

        // requireFlags: 所有flag必须满足
        if (cond.requireFlags && cond.requireFlags.length > 0) {
            if (!Flags.checkRequired(cond.requireFlags)) return false;
        }
        // forbidFlags: 所有flag必须不满足
        if (cond.forbidFlags && cond.forbidFlags.length > 0) {
            if (!Flags.checkForbidden(cond.forbidFlags)) return false;
        }
        // requireStats: 属性范围检查
        if (cond.requireStats) {
            var s = S.get();
            var stats = cond.requireStats;
            for (var key in stats) {
                if (stats.hasOwnProperty(key)) {
                    var range = stats[key];
                    var val = s[key];
                    if (val === undefined) continue;
                    if (range.min !== undefined && val < range.min) return false;
                    if (range.max !== undefined && val > range.max) return false;
                }
            }
        }
        return true;
    }

    // ==================== 核心调度 (v2.2: 等概率 + 压力安全阀) ====================

    /**
     * 获取下一个事件
     * 层:
     *   0. 青训期 → 固定顺序教程事件
     *   1. 系列进行中 → 子弹时间继续
     *   2. 减压模式 → 强制LIGHT直到pressure≤0
     *   3. 伏笔钩子达阈值 → 启动伏笔系列
     *   4. 因果事件(已unlock+条件满足) → 优先
     *   5. 可用系列 + 距上次系列≥5 → 触发
     *   6. 等概率从独立事件池抽取
     */
    function getRandomEvent() {
        var s = S.get();

        // ── 0. 青训期? 固定顺序 ──
        if (s.tutorialStep < C.TUTORIAL_EVENT_COUNT) {
            var tutId = 'tutorial_' + (s.tutorialStep + 1);
            var tutEvent = findEventById(tutId);
            if (tutEvent) return tutEvent;
            // 教程事件未找到则跳过
            console.warn('[Events] 教程事件缺失:', tutId);
            s.tutorialStep = C.TUTORIAL_EVENT_COUNT;
        }

        // ── 1. 系列进行中? 子弹时间 ──
        if (s.activeSeries) {
            return _continueSeries();
        }

        // ── 1.5. 链式续接? 上一阶段系列刚结束, 立即启动下一阶段 ──
        if (s._pendingNextSeries) {
            var chainId = s._pendingNextSeries;
            s._pendingNextSeries = null;
            var chainDef = SeriesDefs[chainId];
            if (chainDef && (!chainDef.conditionFn || chainDef.conditionFn(s))) {
                Series.startSeries(chainId);
                s.eventsSinceLastSeries = 0;
                var chainFirstId = chainDef.stepEvents ? chainDef.stepEvents[0] : chainDef.step1EventId;
                if (chainFirstId) {
                    var chainEvent = findEventById(chainFirstId);
                    if (chainEvent) return chainEvent;
                }
            }
        }

        // ── 2. 减压模式? 强制LIGHT ──
        if (s.decompressing) {
            var lightEv = _pickLight();
            if (lightEv) return lightEv;
        }

        // ── 3. 伏笔钩子触发? ──
        var foreshadowId = Series.checkForeshadowTrigger();
        if (foreshadowId) {
            Series.startSeries(foreshadowId);
            var fsDef = SeriesDefs[foreshadowId];
            var fsFirstId = fsDef.stepEvents ? fsDef.stepEvents[0] : null;
            if (fsFirstId) {
                var fsEvent = findEventById(fsFirstId);
                if (fsEvent) return fsEvent;
            }
        }

        // ── 4. 因果事件(已unlock + 条件满足) — 双倍权重 ──
        var consequencePool = _buildConsequencePool();
        if (consequencePool.length > 0 && Math.random() < 0.6) {
            // 60%概率优先展示因果事件
            return consequencePool[Math.floor(Math.random() * consequencePool.length)];
        }

        // ── 5. 尝试启动系列 ──
        s.eventsSinceLastSeries = (s.eventsSinceLastSeries || 0);
        if (s.eventsSinceLastSeries >= 5) {
            var available = Series.getAvailableSeries();
            if (available.length > 0 && Math.random() < 0.4) {
                var selected = available[Math.floor(Math.random() * available.length)];
                Series.startSeries(selected.id);
                s.eventsSinceLastSeries = 0;
                var firstId = selected.stepEvents
                    ? selected.stepEvents[0]
                    : selected.step1EventId;
                if (firstId) {
                    var firstEvent = findEventById(firstId);
                    if (firstEvent) return firstEvent;
                }
            }
        }

        // ── 6. 等概率抽取独立事件 ──
        var pool = _buildStandalonePool();
        if (pool.length === 0) {
            pool = _buildPoolForTension(C.TENSION.LIGHT);
        }
        if (pool.length === 0) {
            return _eventById['field_training_highlight'] || RawEvents[0];
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /**
     * 继续系列事件
     */
    function _continueSeries() {
        var s = S.get();
        var as = s.activeSeries;
        var def = SeriesDefs[as.id];

        if (as.failedAtKeyNode) {
            // 支持按失败步骤返回不同结局 (failNextByStep), 回退到 failNext
            var failId = null;
            if (def.failNextByStep) {
                failId = def.failNextByStep[as.currentStep];
            }
            if (!failId) failId = def.failNext;
            Series.endSeries();
            if (failId) {
                var failEvent = findEventById(failId);
                if (failEvent) return failEvent;
            }
            return _getRandomDaily();
        }

        var nextId = Series.getNextEventId(null);
        if (!nextId) {
            Series.endSeries();
            return _getRandomDaily();
        }

        if (Series.isLastStep()) {
            Series.endSeries();
        }

        var event = findEventById(nextId);
        if (!event) {
            console.warn('[Events] 系列事件未找到:', nextId);
            Series.endSeries();
            return _getRandomDaily();
        }
        return event;
    }

    /**
     * 构建独立事件池(等概率)
     * 排除: 系列事件、叶子事件、教程事件
     */
    function _buildStandalonePool() {
        var s = S.get();
        var pool = [];
        RawEvents.forEach(function(ev) {
            if (ev.series) return;
            if (ev.isLeaf) return;
            if (ev.id.indexOf('tutorial_') === 0) return;
            if (ev.consequenceOnly) return;  // 因果事件不进独立池
            if (!evaluateConditions(ev)) return;
            if (!_checkCooldown(ev)) return;
            pool.push(ev);
        });
        return pool;
    }

    /**
     * 构建因果事件池(已unlock + 条件满足)
     */
    function _buildConsequencePool() {
        var s = S.get();
        var pool = [];
        RawEvents.forEach(function(ev) {
            if (ev.isLeaf) return;
            if (ev.series) return;
            if (!Flags.isUnlocked(ev.id)) return;
            if (!evaluateConditions(ev)) return;
            pool.push(ev);
        });
        return pool;
    }

    /**
     * 抽一个LIGHT事件(减压用)
     */
    function _pickLight() {
        var evts = _eventsByTension['-2'] || [];
        var pool = [];
        evts.forEach(function(ev) {
            if (ev.series || ev.isLeaf) return;
            if (ev.id.indexOf('tutorial_') === 0) return;
            if (!evaluateConditions(ev)) return;
            pool.push(ev);
        });
        if (pool.length === 0) {
            // fallback: any event with LIGHT tension
            return _eventById['field_training_highlight'] || null;
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function _buildPoolForTension(tension) {
        var evts = _eventsByTension[String(tension)] || [];
        return evts.filter(function(ev) {
            if (ev.series || ev.isLeaf) return false;
            if (ev.id.indexOf('tutorial_') === 0) return false;
            return evaluateConditions(ev);
        });
    }

    function _checkCooldown(ev) {
        var s = S.get();
        if (!ev.cooldown || ev.cooldown === 'none') return true;
        if (ev.cooldown === 'once_per_career' || ev.cooldown === 'once_per_season') {
            return s.recentEventIds.indexOf(ev.id) === -1;
        }
        return true;
    }

    function _getRandomDaily() {
        return _pickLight() || _eventById['field_training_highlight'] || RawEvents[0];
    }

    // ==================== 事件查找 ====================

    function getAllEvents() {
        return RawEvents;
    }

    function findEventById(eventId) {
        return _eventById[eventId] || null;
    }

    function findEvent(predicate) {
        for (var i = 0; i < RawEvents.length; i++) {
            if (predicate(RawEvents[i])) return RawEvents[i];
        }
        return undefined;
    }

    function getEventsByCategory(cat) {
        return _eventsByCategory[cat] || [];
    }

    function getEventsByTension(t) {
        return _eventsByTension[String(t)] || [];
    }

    // ==================== 公开 API ====================

    return {
        getAllEvents: getAllEvents,
        getRandomEvent: getRandomEvent,
        findEventById: findEventById,
        findEvent: findEvent,
        getEventsByCategory: getEventsByCategory,
        getEventsByTension: getEventsByTension,
        evaluateConditions: evaluateConditions
    };
})();
