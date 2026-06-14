/**
 * flags.js — 标志位管理模块 (v2.2)
 * 依赖: State, Constants
 * 职责: 标志位的初始化/设置/递增/清除/计时衰减/条件检查/unlock管理
 *
 * 三种标志类型:
 *   boolean — 永久存储，手动清除
 *   counter — 累加至max，用于伏笔钩子触发
 *   timer   — 设置后N个事件自动归零
 */
window.Game = window.Game || {};

window.Game.Flags = (function() {
    'use strict';

    var S = window.Game.State;
    var C = window.Game.Constants;
    if (!S || !C) throw new Error('[Flags] 依赖 Game.State / Game.Constants 未加载');

    var registry = C.FLAG_REGISTRY;
    if (!registry || !Object.keys(registry).length) {
        throw new Error('[Flags] FLAG_REGISTRY 为空或未加载');
    }

    // ==================== 初始化 ====================

    /**
     * 从注册表创建初始 flagStore
     * 在游戏启动时调用一次
     * @returns {object} 新的 flagStore
     */
    function init() {
        var store = { boolean: {}, counter: {}, timer: {} };

        Object.keys(registry).forEach(function(key) {
            var def = registry[key];
            switch (def.type) {
                case 'boolean':
                    store.boolean[key] = false;
                    break;
                case 'counter':
                    store.counter[key] = 0;
                    break;
                case 'timer':
                    store.timer[key] = { value: 0, remaining: 0 };
                    break;
                default:
                    console.warn('[Flags] 未知标志类型:', def.type, key);
            }
        });

        // 写入 state
        var s = S.get();
        s.flagStore = store;
        console.log('[Flags] flagStore 已初始化 (' +
            Object.keys(store.boolean).length + ' boolean, ' +
            Object.keys(store.counter).length + ' counter, ' +
            Object.keys(store.timer).length + ' timer)');
        return store;
    }

    /**
     * 确保 flagStore 存在（存档恢复后调用）
     * @returns {object} flagStore
     */
    function ensure() {
        var s = S.get();
        if (!s.flagStore || !s.flagStore.boolean) {
            return init();
        }
        // 检查是否有新注册的flag未在存档中
        Object.keys(registry).forEach(function(key) {
            var def = registry[key];
            switch (def.type) {
                case 'boolean':
                    if (!(key in s.flagStore.boolean)) s.flagStore.boolean[key] = false;
                    break;
                case 'counter':
                    if (!(key in s.flagStore.counter)) s.flagStore.counter[key] = 0;
                    break;
                case 'timer':
                    if (!(key in s.flagStore.timer)) s.flagStore.timer[key] = { value: 0, remaining: 0 };
                    break;
            }
        });
        return s.flagStore;
    }

    // ==================== 标志操作 ====================

    /**
     * 设置布尔标志
     * @param {string} key - 标志名(必须在FLAG_REGISTRY中)
     * @param {boolean} value
     */
    function set(key, value) {
        var def = registry[key];
        if (!def) { console.warn('[Flags] 未注册的标志:', key); return; }
        if (def.type !== 'boolean') { console.warn('[Flags] set() 仅用于boolean标志:', key); return; }
        ensure().boolean[key] = value;
        console.log('[Flags] set:', key, '=', value);
    }

    /**
     * 计数器递增
     * @param {string} key - 计数器标志名
     * @param {number} [amount=1] - 增量(可为负数)
     */
    function add(key, amount) {
        if (amount === undefined) amount = 1;
        var def = registry[key];
        if (!def) { console.warn('[Flags] 未注册的标志:', key); return; }
        if (def.type !== 'counter') { console.warn('[Flags] add() 仅用于counter标志:', key); return; }
        var store = ensure();
        store.counter[key] = Math.max(0, Math.min(def.max, store.counter[key] + amount));
        console.log('[Flags] add:', key, '+', amount, '=', store.counter[key],
            (def.threshold && store.counter[key] >= def.threshold ? ' [阈值!]' : ''));
    }

    /**
     * 检查计数器是否达到阈值
     * @param {string} key - 计数器标志名
     * @returns {boolean}
     */
    function atThreshold(key) {
        var def = registry[key];
        if (!def || def.type !== 'counter') return false;
        var store = ensure();
        return store.counter[key] >= (def.threshold || Infinity);
    }

    /**
     * 启动计时器标志
     * @param {string} key - 计时器标志名
     * @param {number} [duration] - 持续事件数(默认使用注册表的decayAfter)
     */
    function startTimer(key, duration) {
        var def = registry[key];
        if (!def) { console.warn('[Flags] 未注册的标志:', key); return; }
        if (def.type !== 'timer') { console.warn('[Flags] startTimer() 仅用于timer标志:', key); return; }
        var store = ensure();
        var dur = duration || def.decayAfter || 5;
        store.timer[key] = { value: 1, remaining: dur };
        console.log('[Flags] startTimer:', key, '持续', dur, '个事件');
    }

    /**
     * 清除标志(重置为初始值)
     * @param {string} key - 标志名
     */
    function clear(key) {
        var def = registry[key];
        if (!def) { console.warn('[Flags] 未注册的标志:', key); return; }
        var store = ensure();
        switch (def.type) {
            case 'boolean': store.boolean[key] = false; break;
            case 'counter': store.counter[key] = 0; break;
            case 'timer':   store.timer[key] = { value: 0, remaining: 0 }; break;
        }
    }

    /**
     * 每个事件后调用: 所有timer倒计时 → 归零
     */
    function tick() {
        var store = ensure();
        var expired = [];
        Object.keys(store.timer).forEach(function(key) {
            var t = store.timer[key];
            if (t.value > 0 && t.remaining > 0) {
                t.remaining--;
                if (t.remaining <= 0) {
                    t.value = 0;
                    t.remaining = 0;
                    expired.push(key);
                }
            }
        });
        if (expired.length > 0) {
            console.log('[Flags] tick: 计时器过期:', expired.join(', '));
        }
    }

    // ==================== 条件检查 ====================

    /**
     * 检查 requireFlags 是否全部满足
     * @param {Array<string>} flags - 需要检查的标志名列表
     * @returns {boolean}
     */
    function checkRequired(flags) {
        if (!flags || !flags.length) return true;
        var store = ensure();
        for (var i = 0; i < flags.length; i++) {
            var key = flags[i];
            var def = registry[key];
            if (!def) { console.warn('[Flags] checkRequired: 未注册的标志:', key); return false; }
            switch (def.type) {
                case 'boolean':
                    if (!store.boolean[key]) return false;
                    break;
                case 'counter':
                    if (store.counter[key] < (def.threshold || 1)) return false;
                    break;
                case 'timer':
                    if (!store.timer[key] || store.timer[key].value <= 0) return false;
                    break;
            }
        }
        return true;
    }

    /**
     * 检查 forbidFlags 是否全部不满足
     * @param {Array<string>} flags - 需要检查的标志名列表
     * @returns {boolean} true=全部不满足(允许通过)
     */
    function checkForbidden(flags) {
        if (!flags || !flags.length) return true;
        var store = ensure();
        for (var i = 0; i < flags.length; i++) {
            var key = flags[i];
            var def = registry[key];
            if (!def) continue; // 未注册的flag默认视为不满足
            var isSet = false;
            switch (def.type) {
                case 'boolean': isSet = store.boolean[key]; break;
                case 'counter': isSet = store.counter[key] >= (def.threshold || 1); break;
                case 'timer':   isSet = store.timer[key] && store.timer[key].value > 0; break;
            }
            if (isSet) return false; // 有一个满足即禁止
        }
        return true;
    }

    // ==================== Unlock 管理 ====================

    /**
     * 解锁因果事件（加入候选池）
     * @param {string} eventId - 事件ID
     */
    function unlock(eventId) {
        var s = S.get();
        if (s.unlockedEventIds.indexOf(eventId) === -1) {
            s.unlockedEventIds.push(eventId);
            console.log('[Flags] unlock 事件:', eventId);
        }
    }

    /**
     * 事件触发后从unlock池中移除
     * @param {string} eventId - 事件ID
     */
    function consumeUnlock(eventId) {
        var s = S.get();
        var idx = s.unlockedEventIds.indexOf(eventId);
        if (idx !== -1) {
            s.unlockedEventIds.splice(idx, 1);
            console.log('[Flags] consumeUnlock:', eventId);
        }
    }

    /**
     * 检查事件是否已被解锁
     * @param {string} eventId
     * @returns {boolean}
     */
    function isUnlocked(eventId) {
        var s = S.get();
        return s.unlockedEventIds.indexOf(eventId) !== -1;
    }

    // ==================== 批量操作 ====================

    /**
     * 处理选择后的flags变更 (从 event.choices[direction] 调用)
     * @param {object} flagOps - { flagsSet:{}, flagsAdd:{}, flagsClear:[], unlocks:[] }
     */
    function applyChoiceFlags(flagOps) {
        if (!flagOps) return;

        // set 布尔
        if (flagOps.flagsSet) {
            Object.keys(flagOps.flagsSet).forEach(function(k) {
                set(k, flagOps.flagsSet[k]);
            });
        }
        // add 计数器
        if (flagOps.flagsAdd) {
            Object.keys(flagOps.flagsAdd).forEach(function(k) {
                add(k, flagOps.flagsAdd[k]);
            });
        }
        // clear
        if (flagOps.flagsClear && flagOps.flagsClear.length) {
            flagOps.flagsClear.forEach(function(k) { clear(k); });
        }
        // unlock 因果事件
        if (flagOps.unlocks && flagOps.unlocks.length) {
            flagOps.unlocks.forEach(function(eventId) { unlock(eventId); });
        }
    }

    /**
     * 获取flagStore快照 (供debug面板)
     * @returns {object}
     */
    function getStore() {
        return ensure();
    }

    // ==================== 公开 API ====================

    return {
        init: init,
        ensure: ensure,
        set: set,
        add: add,
        atThreshold: atThreshold,
        startTimer: startTimer,
        clear: clear,
        tick: tick,
        checkRequired: checkRequired,
        checkForbidden: checkForbidden,
        unlock: unlock,
        consumeUnlock: consumeUnlock,
        isUnlocked: isUnlocked,
        applyChoiceFlags: applyChoiceFlags,
        getStore: getStore
    };
})();
