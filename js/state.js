/**
 * state.js — 游戏状态管理模块 (v1.4)
 * 依赖: Constants
 * 职责: 创建、获取、重置全局游戏状态，本地存储保存/加载
 *
 * v1.4: 新增 reputation（隐藏声望）、_peakReputation 替换 _peakFame
 */
window.Game = window.Game || {};

window.Game.State = (function() {
    'use strict';

    const C = window.Game.Constants;
    if (!C) throw new Error('[State] 依赖 Game.Constants 未加载');

    /** @type {object} 游戏核心状态（可变） */
    let state = null;

    /** 本地存储键名 */
    const STORAGE_KEY = 'football-career-save-v1.4';

    /**
     * 创建全新的游戏状态对象（深拷贝初始模板 + 里程碑模板）
     * @returns {object} 新的状态对象
     */
    function create() {
        const s = {};
        const tmpl = C.INITIAL_STATE;
        for (const key of Object.keys(tmpl)) {
            if (Array.isArray(tmpl[key])) {
                s[key] = tmpl[key].slice();
            } else if (typeof tmpl[key] === 'object' && tmpl[key] !== null) {
                s[key] = Object.assign({}, tmpl[key]);
            } else {
                s[key] = tmpl[key];
            }
        }
        // 深拷贝 timeline
        s.timeline = tmpl.timeline.map(function(entry) {
            return Object.assign({}, entry);
        });
        // 拷贝里程碑模板
        s.milestoneFlags = Object.assign({}, C.MILESTONE_FLAGS_TEMPLATE);
        // 随机 eventsPerSeason
        s.eventsPerSeason = 10 + Math.floor(Math.random() * 5);
        return s;
    }

    /**
     * 获取当前状态（如果未初始化则创建）
     * @returns {object}
     */
    function get() {
        if (!state) {
            state = create();
        }
        return state;
    }

    /**
     * 重置状态为初始值
     */
    function reset() {
        state = create();
        return state;
    }

    /**
     * 保存游戏进度到本地存储
     * @returns {boolean} 是否保存成功
     */
    function save() {
        try {
            const stateToSave = Object.assign({}, state);
            if (stateToSave.pendingEvent) {
                stateToSave._pendingEventId = stateToSave.pendingEvent.id;
                delete stateToSave.pendingEvent;
            }
            const saveData = {
                version: '1.4',
                timestamp: Date.now(),
                state: stateToSave
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
            console.log('[State] 游戏进度已保存 (v1.4)');
            return true;
        } catch (e) {
            console.error('[State] 保存失败:', e);
            return false;
        }
    }

    /**
     * 从本地存储加载游戏进度
     * @returns {boolean} 是否加载成功
     */
    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return false;

            const saveData = JSON.parse(saved);
            if (!saveData || !saveData.state) return false;

            // 验证关键字段存在（v1.4新属性名）
            const requiredKeys = ['wealth', 'ability', 'team', 'ambition', 'age', 'season'];
            for (const key of requiredKeys) {
                if (saveData.state[key] === undefined) {
                    console.warn('[State] 存档数据不完整，缺少字段:', key);
                    return false;
                }
            }

            state = saveData.state;

            // 兼容旧存档：如果没有reputation则初始化为1
            if (state.reputation === undefined) {
                state.reputation = 1;
                state._peakReputation = 1;
            }
            // 兼容旧存档：如果没有_peakReputation
            if (state._peakReputation === undefined) {
                state._peakReputation = state.reputation || 1;
            }

            console.log('[State] 游戏进度已加载，存档时间:', new Date(saveData.timestamp).toLocaleString());
            return true;
        } catch (e) {
            console.error('[State] 加载失败:', e);
            return false;
        }
    }

    /**
     * 检查是否有存档
     * @returns {boolean}
     */
    function hasSave() {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    /**
     * 删除存档
     */
    function deleteSave() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[State] 存档已删除');
    }

    /**
     * 获取存档信息（不加载游戏状态）
     * @returns {object|null} 存档信息或null
     */
    function getSaveInfo() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return null;

            const saveData = JSON.parse(saved);
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                age: saveData.state.age,
                season: saveData.state.season,
                reputation: saveData.state.reputation
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * 获取待恢复的事件ID
     * @returns {string|null} 事件ID或null
     */
    function getPendingEventId() {
        return state && state._pendingEventId ? state._pendingEventId : null;
    }

    return {
        create, get, reset,
        save, load, hasSave, deleteSave, getSaveInfo, getPendingEventId
    };
})();
