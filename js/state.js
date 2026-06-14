/**
 * state.js — 游戏状态管理模块 (v2.2)
 * 依赖: Constants
 * 职责: 创建、获取、重置全局游戏状态，本地存储保存/加载
 *
 * v2.2: 新增 flagStore/pressureLevel/eventCounter/unlockedEventIds/recentCategoryIds
 *        移除旧 chain 兼容代码
 * v2.1: 存档键升级至 v2.1
 * v2.0: 事件系统重构 — 系列字段、存档兼容
 */
window.Game = window.Game || {};

window.Game.State = (function() {
    'use strict';

    const C = window.Game.Constants;
    if (!C) throw new Error('[State] 依赖 Game.Constants 未加载');

    /** @type {object} 游戏核心状态（可变） */
    let state = null;

    /** 本地存储键名 */
    const STORAGE_KEY = 'football-career-save-v2.3';

    /**
     * 创建全新的游戏状态对象（深拷贝初始模板）
     * flagStore 由 flags.js init() 延迟填充
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
        // flagStore 初始为 null，由 flags.js 在 startGame 时填充
        s.flagStore = null;
        s.recentCategoryIds = [];
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
            } else {
                delete stateToSave._pendingEventId;
            }
            // 清除运行时状态
            delete stateToSave._pendingResult;
            stateToSave.isResultPhase = false;
            const saveData = {
                version: '2.2',
                timestamp: Date.now(),
                state: stateToSave
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
            console.log('[State] 游戏进度已保存 (v2.2)');
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

            // 验证关键字段存在
            const requiredKeys = ['wealth', 'ability', 'team', 'ambition', 'age', 'season'];
            for (const key of requiredKeys) {
                if (saveData.state[key] === undefined) {
                    console.warn('[State] 存档数据不完整，缺少字段:', key);
                    return false;
                }
            }

            state = saveData.state;

            // ---- 兼容旧存档: 缺失字段自动迁移 ----
            if (state.reputation === undefined) state.reputation = 1;
            if (state.activeSeries === undefined) state.activeSeries = null;
            if (state.completedSeries === undefined) state.completedSeries = [];
            if (state.pendingSeasonEnd === undefined) state.pendingSeasonEnd = false;
            if (state.seriesThisSeason === undefined) state.seriesThisSeason = { tree: 0, linear: 0 };
            if (state.isResultPhase === undefined) state.isResultPhase = false;
            // v2.2 新字段
            if (state.flagStore === undefined) state.flagStore = null;
            if (state.pressureLevel === undefined) state.pressureLevel = 0;
            if (state.tutorialStep === undefined) state.tutorialStep = 9;  // 旧存档视为已完成教程
            if (state.decompressing === undefined) state.decompressing = false;
            if (state.eventsSinceLastSeries === undefined) state.eventsSinceLastSeries = 0;
            // 迁移旧字段
            if (state.lastEventTension !== undefined) {
                state.pressureLevel = Math.min(state.lastEventTension, C.PRESSURE_CAP);
                delete state.lastEventTension;
            }
            if (state.eventCounter === undefined) state.eventCounter = 0;
            if (state.unlockedEventIds === undefined) state.unlockedEventIds = [];
            if (state.recentCategoryIds === undefined) state.recentCategoryIds = [];
            // 清理旧字段
            delete state.hookCounters;  // 由 flagStore 替代
            delete state.currentChainId;
            delete state.chainStep;
            delete state.completedChains;
            // 旧存档 timeline 条目可能没有 season 字段
            if (state.timeline) {
                state.timeline.forEach(function(entry) {
                    if (entry.season === undefined) entry.season = entry.age;
                });
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
