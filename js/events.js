/**
 * events.js — 事件系统模块 (v2.0)
 * 依赖: State, Constants, Series, RawEvents (events_data.js)
 * 职责: 事件解析、条件编译、调度算法（日常/系列/伏笔）
 *
 * v2.0: 事件系统重构 —
 *   重写 getRandomEvent() 调度算法，支持三种系列类型
 *   移除旧 chain 链式逻辑
 *   新增 findEventById() 直接查找
 *
 * v1.4: 条件解析器、旧键名映射兼容
 */
window.Game = window.Game || {};

window.Game.Events = (function() {
    'use strict';

    var S = window.Game.State;
    var C = window.Game.Constants;
    var Series = window.Game.Series;
    if (!S || !C) throw new Error('[Events] 依赖 Game.State / Game.Constants 未加载');
    if (!Series) throw new Error('[Events] 依赖 Game.Series 未加载');

    var RawEvents = window.Game.RawEvents;
    var SeriesDefs = window.Game.SeriesDefs || {};
    if (!RawEvents || !RawEvents.length) throw new Error('[Events] Game.RawEvents 未加载或为空');

    // ==================== 安全的条件解析系统 ====================

    var OPERATORS = {
        '<=': function(a, b) { return a <= b; },
        '>=': function(a, b) { return a >= b; },
        '!=': function(a, b) { return a !== b; },
        '<': function(a, b) { return a < b; },
        '>': function(a, b) { return a > b; },
        '==': function(a, b) { return a === b; }
    };

    var STATE_PROPS = {
        's.wealth': 'wealth',
        's.ability': 'ability',
        's.team': 'team',
        's.ambition': 'ambition',
        's.reputation': 'reputation',
        's.physical': 'ability',  // 旧键兼容
        's.fame': 'reputation',   // 旧键兼容
        's.mood': 'ambition',     // 旧键兼容
        's.age': 'age',
        's.season': 'season',
        's.eventCount': 'eventCount',
        's.eventsThisSeason': 'eventsThisSeason'
    };

    function _parseSingleCondition(expr) {
        expr = expr.trim();

        // 布尔条件: s.milestoneFlags.X 或 !s.milestoneFlags.X
        var boolMatch = expr.match(/^(!?)s\.milestoneFlags\.(\w+)$/);
        if (boolMatch) {
            var isNegated = boolMatch[1] === '!';
            var flagName = boolMatch[2];
            return function(state) {
                var flags = state.milestoneFlags;
                if (!flags) return false;
                var val = flags[flagName];
                return isNegated ? !val : !!val;
            };
        }

        // v2.0 新增: s.completedSeries 条件 (系列已/未完成)
        var seriesMatch = expr.match(/^(!?)s\.completedSeries\.includes\(['"](\w+)['"]\)$/);
        if (seriesMatch) {
            var _isNeg = seriesMatch[1] === '!';
            var _sid = seriesMatch[2];
            return function(state) {
                var cs = state.completedSeries || [];
                var found = cs.indexOf(_sid) !== -1;
                return _isNeg ? !found : found;
            };
        }

        // v2.0 新增: s.hookCounters.X >= N (钩子计数器条件)
        var hookMatch = expr.match(/^s\.hookCounters\.(\w+)\s*(>=|>|<|<=|==)\s*(\d+)$/);
        if (hookMatch) {
            var hk = hookMatch[1];
            var hop = hookMatch[2];
            var hv = parseInt(hookMatch[3], 10);
            var opFn2 = OPERATORS[hop];
            return function(state) {
                var hc = state.hookCounters || {};
                return opFn2(hc[hk] || 0, hv);
            };
        }

        // 数值条件: s.property operator value
        var match = expr.match(/^(s\.\w+)\s*(<=|>=|!=|<|>|==)\s*(\d+)$/);
        if (!match) {
            console.warn('[Events] 无法解析条件:', expr);
            return null;
        }

        var propPath = match[1];
        var operator = match[2];
        var value = parseInt(match[3], 10);

        var stateKey = STATE_PROPS[propPath];
        if (!stateKey) {
            console.warn('[Events] 未知的状态属性:', propPath);
            return null;
        }

        var opFn = OPERATORS[operator];
        if (!opFn) {
            console.warn('[Events] 未知的操作符:', operator);
            return null;
        }

        return function(state) {
            var stateValue = state[stateKey];
            if (stateValue === undefined) return false;
            return opFn(stateValue, value);
        };
    }

    function _parseCondition(conditionStr) {
        if (!conditionStr || typeof conditionStr !== 'string') return null;

        var parts = conditionStr.split('&&');
        var conditions = parts.map(function(part) {
            return _parseSingleCondition(part);
        });

        if (conditions.some(function(fn) { return fn === null; })) {
            console.error('[Events] 条件解析失败:', conditionStr);
            return null;
        }

        return function(state) {
            return conditions.every(function(fn) { return fn(state); });
        };
    }

    // ==================== 事件解析 ====================

    function _parseEvents(rawEvents) {
        return rawEvents.map(function(ev) {
            if (ev.condition) {
                ev.conditionFn = _parseCondition(ev.condition);
                if (!ev.conditionFn) {
                    console.warn('[Events] 事件条件解析失败，事件ID:', ev.id);
                }
            }
            return ev;
        });
    }

    /** @type {Array<object>} 所有已解析事件 */
    var _allEvents = _parseEvents(RawEvents);

    /** @type {object} id→event 快速查找表 */
    var _eventById = {};
    _allEvents.forEach(function(ev) {
        _eventById[ev.id] = ev;
    });

    // ==================== 系列注册 ====================

    // 从 SeriesDefs 注册所有系列定义
    for (var sid in SeriesDefs) {
        if (SeriesDefs.hasOwnProperty(sid)) {
            var def = SeriesDefs[sid];
            def.id = sid;
            // 如果系列有条件，也编译它
            if (def.condition) {
                def.conditionFn = _parseCondition(def.condition);
            }
            Series.registerSeries(def);
        }
    }

    console.log('[Events] 已加载 ' + _allEvents.length + ' 个事件, ' +
        Object.keys(SeriesDefs).length + ' 个系列定义 (v2.0)');

    // ==================== 事件查找 ====================

    function getAllEvents() {
        return _allEvents;
    }

    function findEventById(eventId) {
        return _eventById[eventId] || null;
    }

    function findEvent(predicate) {
        for (var i = 0; i < _allEvents.length; i++) {
            if (predicate(_allEvents[i])) return _allEvents[i];
        }
        return undefined;
    }

    // ==================== 调度算法 (v2.0 重写) ====================

    /**
     * 核心调度: 获取下一个事件
     * 优先级: 进行中系列 > 伏笔钩子触发 > 随机启动系列 > 日常事件
     */
    function getRandomEvent() {
        var s = S.get();

        // ── 1. 系列进行中？继续系列 ──
        if (s.activeSeries) {
            var as = s.activeSeries;
            var def = SeriesDefs[as.id];

            // 已标记失败 (keynode 选错)
            if (as.failedAtKeyNode) {
                var failId = def.failNext;
                Series.endSeries();
                var failEvent = findEventById(failId);
                if (failEvent) return failEvent;
                // 兜底: 回到日常
                return _getRandomDaily();
            }

            // 获取下一步事件
            var nextId = Series.getNextEventId(null); // direction 在上一步已记录
            if (!nextId) {
                Series.endSeries();
                return _getRandomDaily();
            }

            // 系列最后一步（叶子结局/失败后）：结束系列，返回事件
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

        // ── 2. 赛季结束标记 ──
        if (s.pendingSeasonEnd) {
            s.pendingSeasonEnd = false;
            _triggerSeasonEnd();
        }

        // ── 3. 检查伏笔钩子阈值 ──
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

        // ── 4. 尝试随机启动树状/线性系列 ──
        var available = Series.getAvailableSeries();
        if (available.length > 0) {
            // 按权重随机选择一个
            var selected = _weightedSelectSeries(available);
            if (selected) {
                Series.startSeries(selected.id);
                var firstId = selected.stepEvents
                    ? selected.stepEvents[0]
                    : selected.step1EventId;
                if (firstId) {
                    var firstEvent = findEventById(firstId);
                    if (firstEvent) return firstEvent;
                }
            }
        }

        // ── 5. 抽取日常事件 ──
        return _getRandomDaily();
    }

    /**
     * 随机日常事件 (原权重逻辑，去掉系列事件)
     */
    function _getRandomDaily() {
        var s = S.get();

        var eligible = _allEvents.filter(function(ev) {
            // A. 排除系列事件
            if (ev.series) return false;
            // B. 排除叶子事件
            if (ev.isLeaf) return false;
            // C. 条件检查
            if (ev.conditionFn && !ev.conditionFn(s)) return false;
            // D. 防重复 (60% 跳过近期事件)
            if (s.recentEventIds.indexOf(ev.id) !== -1 &&
                s.recentEventIds.length < _allEvents.length - 5) {
                if (Math.random() < 0.6) return false;
            }
            return true;
        });

        if (eligible.length === 0) {
            return findEvent(function(e) { return e.id === 'training'; }) || _allEvents[0];
        }

        // 权重随机
        var weighted = [];
        eligible.forEach(function(ev) {
            var w = C.RARITY_WEIGHTS[ev.rarity] || 6;
            for (var i = 0; i < w; i++) weighted.push(ev);
        });
        return weighted[Math.floor(Math.random() * weighted.length)];
    }

    /**
     * 从可用系列中按权重随机选择
     */
    function _weightedSelectSeries(available) {
        if (available.length === 0) return null;
        if (available.length === 1) return available[0];

        // 树状权重: 3, 线性权重: 2
        var weighted = [];
        available.forEach(function(def) {
            var w = def.type === C.SERIES_TYPE.TREE ? 3 : 2;
            for (var i = 0; i < w; i++) weighted.push(def);
        });
        return weighted[Math.floor(Math.random() * weighted.length)];
    }

    /**
     * 处理赛季结束 (在 loadNewEvent 前触发)
     */
    function _triggerSeasonEnd() {
        var s = S.get();
        s.eventsThisSeason = 0;
        s.season++;
        s.age++;
        s.eventsPerSeason = C.EVENTS_PER_SEASON_MIN + Math.floor(Math.random() * C.EVENTS_PER_SEASON_RANGE);
        s.seriesThisSeason = { tree: 0, linear: 0 };

        // 年龄衰退
        if (s.age >= C.AGE_DECAY_START) {
            s.ability = Math.max(C.STAT_MIN, s.ability - C.AGE_DECAY_MILD_AMOUNT);
        }
        if (s.age >= C.AGE_DECAY_SEVERE) {
            s.ability = Math.max(C.STAT_MIN, s.ability - C.AGE_DECAY_SEVERE_AMOUNT);
        }

        // 财富自然积累
        var wealthGrowth = 2 + Math.floor(Math.random() * 3);
        s.wealth = Math.min(C.STAT_MAX, s.wealth + wealthGrowth);

        // 时间线赛季标记
        var Icons = window.Game.Icons;
        var TL = window.Game.Timeline;
        TL.record('', 'season_mark', s.season);

        var UI = window.Game.UI;
        if (UI) {
            UI.updateAllStats();
            UI.updateHeader();
        }
    }

    return {
        getAllEvents: getAllEvents,
        getRandomEvent: getRandomEvent,
        findEventById: findEventById,
        findEvent: findEvent,
        _triggerSeasonEnd: _triggerSeasonEnd  // card.js 需要手动触发赛季结束
    };
})();
