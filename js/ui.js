/**
 * ui.js — UI 渲染模块 (v1.4)
 * 依赖: State, Constants, Icons
 * 职责: DOM 元素缓存、状态条更新、Toast 通知、选择覆盖层渲染、页头更新
 *
 * v1.4: 新四属性(财富/能力/团队/野心)、声望隐层过滤、debug声望切换
 */
window.Game = window.Game || {};

window.Game.UI = (function() {
    'use strict';

    const S = window.Game.State;
    const C = window.Game.Constants;
    const Icons = window.Game.Icons;
    if (!S || !C) throw new Error('[UI] 依赖 Game.State / Game.Constants 未加载');

    // ==================== DOM 缓存 ====================

    let _dom = null;

    /**
     * 获取缓存的 DOM 引用（首次调用时自动缓存）
     * @returns {object}
     */
    function dom() {
        if (_dom) return _dom;
        _dom = {
            // 粒子
            particles: document.getElementById('particles'),
            // 卡片
            card: document.getElementById('card'),
            cardIcon: document.getElementById('cardIcon'),
            cardTitle: document.getElementById('cardTitle'),
            cardDesc: document.getElementById('cardDesc'),
            cardArea: document.getElementById('cardArea'),
            // 选择覆盖层
            choiceOverlay: document.getElementById('choiceOverlay'),
            choiceLabel: document.getElementById('choiceLabel'),
            dotsContainer: document.getElementById('dotsContainer'),
            // 滑动提示
            swipeHint: document.getElementById('swipeHint'),
            // Toast
            toast: document.getElementById('toast'),
            // 结局遮罩
            endingOverlay: document.getElementById('endingOverlay'),
            timelineContainer: document.getElementById('timelineContainer'),
            endingIcon: document.getElementById('endingIcon'),
            endingTitle: document.getElementById('endingTitle'),
            endingSubtitle: document.getElementById('endingSubtitle'),
            finalStats: document.getElementById('finalStats'),
            restartBtn: document.getElementById('restartBtn'),
            resultScreen: document.getElementById('resultScreen'),
            // 页头
            ageDisplay: document.getElementById('ageDisplay'),
            seasonDisplay: document.getElementById('seasonDisplay'),
            // 属性条 (v1.4 新键名)
            barWealth: document.getElementById('barWealth'),
            barAbility: document.getElementById('barAbility'),
            barTeam: document.getElementById('barTeam'),
            barAmbition: document.getElementById('barAmbition'),
            // 属性图标 (v1.4)
            iconWealth: document.getElementById('iconWealth'),
            iconAbility: document.getElementById('iconAbility'),
            iconTeam: document.getElementById('iconTeam'),
            iconAmbition: document.getElementById('iconAmbition'),
            // Debug 声望
            debugReputation: document.getElementById('debugReputation'),
            debugRepValue: document.getElementById('debugRepValue'),
            debugRepLevel: document.getElementById('debugRepLevel')
        };
        return _dom;
    }

    // ==================== 状态条渲染 ====================

    /** @type {object} stat -> barElement 映射 */
    const _barMap = {
        wealth: null,
        ability: null,
        team: null,
        ambition: null
    };

    /** @type {object} stat -> iconElement 映射 */
    const _iconMap = {
        wealth: null,
        ability: null,
        team: null,
        ambition: null
    };

    /** 是否已初始化 */
    let _initialized = false;

    /**
     * 初始化UI元素和图标
     */
    function initUI() {
        if (_initialized) return;
        var d = dom();

        // 初始化映射
        _barMap.wealth = d.barWealth;
        _barMap.ability = d.barAbility;
        _barMap.team = d.barTeam;
        _barMap.ambition = d.barAmbition;

        _iconMap.wealth = d.iconWealth;
        _iconMap.ability = d.iconAbility;
        _iconMap.team = d.iconTeam;
        _iconMap.ambition = d.iconAmbition;

        // 初始化属性图标
        if (Icons) {
            if (d.iconWealth) d.iconWealth.innerHTML = Icons.getStatIcon('wealth', 16);
            if (d.iconAbility) d.iconAbility.innerHTML = Icons.getStatIcon('ability', 16);
            if (d.iconTeam) d.iconTeam.innerHTML = Icons.getStatIcon('teamwork', 16);
            if (d.iconAmbition) d.iconAmbition.innerHTML = Icons.getStatIcon('ambition', 16);
        }

        _initialized = true;
    }

    /**
     * 更新单个属性条
     * @param {string} stat - 'wealth' | 'ability' | 'team' | 'ambition'
     */
    function updateStat(stat) {
        initUI();
        var s = S.get();
        var bar = _barMap[stat];
        if (!bar) return;

        bar.style.width = s[stat] + '%';
        bar.classList.remove('danger-low', 'danger-high');
        if (s[stat] <= C.DANGER_LOW_THRESHOLD) bar.classList.add('danger-low');
        if (s[stat] >= C.DANGER_HIGH_THRESHOLD) bar.classList.add('danger-high');
    }

    /** 刷新所有属性条 */
    function updateAllStats() {
        C.STAT_KEYS.forEach(function(k) { updateStat(k); });
    }

    /** 更新debug声望显示 */
    function updateDebugReputation() {
        var d = dom();
        if (!d.debugReputation) return;
        var s = S.get();
        var rep = s.reputation;
        d.debugRepValue.textContent = rep;
        var level = C.getReputationLevel(rep);
        d.debugRepLevel.textContent = level.name;
    }

    /**
     * 切换debug声望面板显示/隐藏
     */
    function toggleDebugReputation() {
        var d = dom();
        if (!d.debugReputation) return;
        var el = d.debugReputation;
        if (el.style.display === 'none') {
            updateDebugReputation();
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    }

    // ==================== 页头渲染 ====================

    /** 更新年龄和赛季显示 */
    function updateHeader() {
        var s = S.get();
        var d = dom();
        d.ageDisplay.textContent = s.age;
        d.seasonDisplay.textContent = s.season;
    }

    // ==================== Toast 通知 ====================

    var _toastTimeout = null;

    /**
     * 显示 Toast 消息
     * @param {string} msg - 消息文本
     * @param {string} [type=''] - 'milestone' 或空字符串
     */
    function showToast(msg, type) {
        type = type || '';
        var d = dom();
        var toast = d.toast;
        toast.innerHTML = msg;
        toast.className = 'toast ' + type;
        void toast.offsetWidth;
        toast.classList.add('show');
        clearTimeout(_toastTimeout);
        var duration = type === 'milestone'
            ? C.TOAST_MILESTONE_DURATION
            : C.TOAST_DEFAULT_DURATION;
        _toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
        }, duration);
    }

    // ==================== 选择覆盖层渲染 ====================

    /**
     * 根据拖拽方向渲染选择覆盖层（属性变化点阵图）
     * 注意：reputation 是隐藏数值，不在覆盖层中显示
     * @param {string} direction - 'left' | 'right'
     */
    function renderOverlay(direction) {
        var s = S.get();
        var d = dom();
        var evt = s.pendingEvent;
        if (!evt) return;

        var label = direction === 'left'
            ? evt.choiceLeftLabel
            : evt.choiceRightLabel;
        var effects = direction === 'left'
            ? evt.effectsLeft
            : evt.effectsRight;

        d.choiceLabel.textContent = label;
        d.dotsContainer.innerHTML = '';

        // v1.4: 只显示四个可见属性的变化（过滤掉 reputation）
        C.STAT_KEYS.forEach(function(statKey) {
            // 映射旧事件键名 → 新属性键名
            // 先查 effects 的直接键名，再查映射后的键名
            var val = effects[statKey];
            if (val === undefined && C.STAT_KEY_MAP) {
                // 反向查找：旧键名映射
                for (var oldKey in C.STAT_KEY_MAP) {
                    if (C.STAT_KEY_MAP[oldKey] === statKey) {
                        val = effects[oldKey];
                        break;
                    }
                }
            }
            if (val === undefined) val = 0;
            var abs = Math.abs(val);

            var item = document.createElement('div');
            item.className = 'dot-item';

            var dot = document.createElement('div');
            dot.className = 'dot-circle';
            if (val > 0) { dot.classList.add('pos'); }
            else if (val < 0) { dot.classList.add('neg'); }
            else { dot.classList.add('neutral'); }
            if (abs >= 5) { dot.classList.add('large'); }
            else { dot.classList.add('small'); }

            item.appendChild(dot);

            var lbl = document.createElement('span');
            lbl.className = 'dot-label';
            lbl.textContent = C.STAT_LABELS[statKey];
            item.appendChild(lbl);

            d.dotsContainer.appendChild(item);
        });

        d.choiceOverlay.classList.add('visible');
    }

    /** 隐藏选择覆盖层 */
    function hideOverlay() {
        dom().choiceOverlay.classList.remove('visible');
    }

    // ==================== 公开 API ====================

    return {
        dom: dom,
        updateStat: updateStat,
        updateAllStats: updateAllStats,
        updateHeader: updateHeader,
        showToast: showToast,
        renderOverlay: renderOverlay,
        hideOverlay: hideOverlay,
        updateDebugReputation: updateDebugReputation,
        toggleDebugReputation: toggleDebugReputation
    };
})();
