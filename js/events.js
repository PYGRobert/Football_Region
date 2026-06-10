/**
 * events.js — 事件系统模块
 * 依赖: State, Constants, RawEvents (events_data.js)
 * 职责: 事件解析（condition → conditionFn）、链式逻辑、权重随机选择
 *
 * 数据来源: Game.RawEvents（events_data.js 内嵌，无需 fetch，file:// 兼容）
 */
window.Game = window.Game || {};

window.Game.Events = (function() {
    'use strict';

    var S = window.Game.State;
    var C = window.Game.Constants;
    var RawEvents = window.Game.RawEvents;
    if (!S || !C) throw new Error('[Events] 依赖 Game.State / Game.Constants 未加载');
    if (!RawEvents || !RawEvents.length) throw new Error('[Events] Game.RawEvents 未加载或为空');

    // ==================== 安全的条件解析系统 ====================

    /**
     * 支持的操作符映射
     */
    var OPERATORS = {
        '<=': function(a, b) { return a <= b; },
        '>=': function(a, b) { return a >= b; },
        '!=': function(a, b) { return a !== b; },
        '<': function(a, b) { return a < b; },
        '>': function(a, b) { return a > b; },
        '==': function(a, b) { return a === b; }
    };

    /**
     * 支持的状态属性
     */
    var STATE_PROPS = {
        's.age': 'age',
        's.fame': 'fame',
        's.physical': 'physical',
        's.team': 'team',
        's.mood': 'mood',
        's.season': 'season',
        's.eventCount': 'eventCount',
        's.eventsThisSeason': 'eventsThisSeason'
    };

    /**
     * 解析单个条件表达式（如 "s.age<=19"）
     * @param {string} expr - 条件表达式
     * @returns {Function|null} 条件函数
     */
    function _parseSingleCondition(expr) {
        expr = expr.trim();

        // 尝试匹配 "s.property operator value" 格式
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

        // 返回条件检查函数
        return function(state) {
            var stateValue = state[stateKey];
            if (stateValue === undefined) {
                console.warn('[Events] 状态中缺少属性:', stateKey);
                return false;
            }
            return opFn(stateValue, value);
        };
    }

    /**
     * 解析复合条件（支持 && 连接的多个条件）
     * @param {string} conditionStr - 条件字符串
     * @returns {Function|null} 条件函数
     */
    function _parseCondition(conditionStr) {
        if (!conditionStr || typeof conditionStr !== 'string') {
            return null;
        }

        // 分割 && 条件
        var conditions = conditionStr.split('&&').map(function(part) {
            return _parseSingleCondition(part);
        });

        // 检查是否有解析失败的条件
        if (conditions.some(function(fn) { return fn === null; })) {
            console.error('[Events] 条件解析失败:', conditionStr);
            return null;
        }

        // 返回组合条件函数（所有条件都必须满足）
        return function(state) {
            return conditions.every(function(fn) {
                return fn(state);
            });
        };
    }

    // ==================== 事件解析 ====================

    /**
     * 将原始事件数据解析为带 conditionFn 的可执行事件数组
     * @param {Array<object>} rawEvents
     * @returns {Array<object>}
     */
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

    console.log('[Events] 已加载 ' + _allEvents.length + ' 个事件');

    // ==================== 事件选择逻辑 ====================

    /**
     * 同步获取所有事件
     * @returns {Array<object>}
     */
    function getAllEvents() {
        return _allEvents;
    }

    /**
     * 获取下一个随机事件
     * 优先级：链式事件 > 条件过滤 > 权重随机
     * @returns {object}
     */
    function getRandomEvent() {
        var s = S.get();
        var nextEvent = null;

        // 1. 优先处理正在进行的链式事件
        if (s.currentChainId) {
            var nextStep = s.chainStep + 1;
            var chainNext = findEvent(function(e) {
                return e.chain === s.currentChainId && e.step === nextStep;
            });
            if (chainNext) {
                if (!chainNext.conditionFn || chainNext.conditionFn(s)) {
                    nextEvent = chainNext;
                }
            }
            // 链断了
            if (!nextEvent) {
                if (s.completedChains.indexOf(s.currentChainId) === -1) {
                    s.completedChains.push(s.currentChainId);
                }
                s.currentChainId = null;
                s.chainStep = 0;
            }
        }

        // 2. 无链式事件时，随机选择
        if (!nextEvent) {
            var eligible = _allEvents.filter(function(ev) {
                // A. 条件检查
                if (ev.conditionFn && !ev.conditionFn(s)) return false;
                // B. 排除链式中间步骤
                if (ev.chain && ev.step > 1) return false;
                // C. 排除已完成链的第一步
                if (ev.chain && ev.step === 1 && s.completedChains.indexOf(ev.chain) !== -1) return false;
                // D. 防重复（60% 概率跳过近期事件）
                if (s.recentEventIds.indexOf(ev.id) !== -1 && s.recentEventIds.length < _allEvents.length - 5) {
                    if (Math.random() < 0.6) return false;
                }
                return true;
            });

            if (eligible.length === 0) {
                nextEvent = findEvent(function(e) { return e.id === 'training'; }) || _allEvents[0];
            } else {
                // 权重随机
                var weighted = [];
                eligible.forEach(function(ev) {
                    var w = C.RARITY_WEIGHTS[ev.rarity] || 6;
                    for (var i = 0; i < w; i++) weighted.push(ev);
                });
                nextEvent = weighted[Math.floor(Math.random() * weighted.length)];
            }
        }
        return nextEvent;
    }

    /** 辅助：在 _allEvents 中查找 */
    function findEvent(predicate) {
        for (var i = 0; i < _allEvents.length; i++) {
            if (predicate(_allEvents[i])) return _allEvents[i];
        }
        return undefined;
    }

    return {
        getAllEvents: getAllEvents,
        getRandomEvent: getRandomEvent
    };
})();
