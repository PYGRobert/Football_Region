/**
 * ui.js — UI 渲染模块 (v2.2)
 * 依赖: State, Constants, Icons
 * 职责: DOM 元素缓存、状态条更新、Toast 通知、选择覆盖层渲染(+/-)、系列进度条、页头更新
 *
 * v2.2: 适配新事件格式 — renderOverlay读取choices.left/right
 *       移除STAT_KEY_MAP兼容(效果值直接使用wealth/ability/team/ambition/reputation)
 * v2.0: 事件系统重构 — +/- 符号系统, 系列进度条, 树状隐藏模式
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

    function dom() {
        if (_dom) return _dom;
        _dom = {
            particles: document.getElementById('particles'),
            card: document.getElementById('card'),
            cardIcon: document.getElementById('cardIcon'),
            cardTitle: document.getElementById('cardTitle'),
            cardDesc: document.getElementById('cardDesc'),
            cardArea: document.getElementById('cardArea'),
            choiceOverlay: document.getElementById('choiceOverlay'),
            choiceLabel: document.getElementById('choiceLabel'),
            effectsContainer: document.getElementById('effectsContainer'),
            swipeHint: document.getElementById('swipeHint'),
            toast: document.getElementById('toast'),
            endingOverlay: document.getElementById('endingOverlay'),
            timelineContainer: document.getElementById('timelineContainer'),
            endingIcon: document.getElementById('endingIcon'),
            endingTitle: document.getElementById('endingTitle'),
            endingSubtitle: document.getElementById('endingSubtitle'),
            finalStats: document.getElementById('finalStats'),
            restartBtn: document.getElementById('restartBtn'),
            resultScreen: document.getElementById('resultScreen'),
            ageDisplay: document.getElementById('ageDisplay'),
            seasonDisplay: document.getElementById('seasonDisplay'),
            barWealth: document.getElementById('barWealth'),
            barAbility: document.getElementById('barAbility'),
            barTeam: document.getElementById('barTeam'),
            barAmbition: document.getElementById('barAmbition'),
            iconWealth: document.getElementById('iconWealth'),
            iconAbility: document.getElementById('iconAbility'),
            iconTeam: document.getElementById('iconTeam'),
            iconAmbition: document.getElementById('iconAmbition'),
            debugReputation: document.getElementById('debugReputation'),
            debugRepValue: document.getElementById('debugRepValue'),
            debugRepLevel: document.getElementById('debugRepLevel'),
            repLevelDisplay: document.getElementById('repLevelDisplay'),
            statsPanel: document.querySelector('.stats-panel'),
            header: document.querySelector('.header')
        };
        return _dom;
    }

    // ==================== 状态条渲染 ====================

    const _barMap = { wealth: null, ability: null, team: null, ambition: null };
    const _iconMap = { wealth: null, ability: null, team: null, ambition: null };
    let _initialized = false;

    function initUI() {
        if (_initialized) return;
        var d = dom();
        _barMap.wealth = d.barWealth;
        _barMap.ability = d.barAbility;
        _barMap.team = d.barTeam;
        _barMap.ambition = d.barAmbition;
        _iconMap.wealth = d.iconWealth;
        _iconMap.ability = d.iconAbility;
        _iconMap.team = d.iconTeam;
        _iconMap.ambition = d.iconAmbition;
        if (Icons) {
            if (d.iconWealth) d.iconWealth.innerHTML = Icons.getStatIcon('wealth', 16);
            if (d.iconAbility) d.iconAbility.innerHTML = Icons.getStatIcon('ability', 16);
            if (d.iconTeam) d.iconTeam.innerHTML = Icons.getStatIcon('teamwork', 16);
            if (d.iconAmbition) d.iconAmbition.innerHTML = Icons.getStatIcon('ambition', 16);
        }
        _initialized = true;
    }

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

    function updateAllStats() {
        C.STAT_KEYS.forEach(function(k) { updateStat(k); });
    }

    function updateDebugReputation() {
        var d = dom();
        if (!d.debugReputation) return;
        var s = S.get();
        d.debugRepValue.textContent = s.reputation;
        d.debugRepLevel.textContent = C.getReputationLevel(s.reputation).name;
    }

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

    function updateHeader() {
        var s = S.get();
        var d = dom();
        d.ageDisplay.textContent = s.age;
        d.seasonDisplay.textContent = s.season;
        if (d.repLevelDisplay) {
            d.repLevelDisplay.textContent = C.getReputationLevel(s.reputation).name;
        }
    }

    // ==================== Toast 通知 ====================

    var _toastTimeout = null;

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

    // ==================== 选择覆盖层 (v2.0: +/- 符号系统) ====================

    /** @type {string|null} */
    var _lastOverlayDir = null;

    /**
     * v2.2: 根据拖拽方向渲染选择覆盖层 (+/- 符号)
     * 适配新事件格式: event.choices.left/right 替代 effectsLeft/Right
     */
    /**
     * v2.2: 选择覆盖层 — 所有事件统一显示 ? (结果在翻转卡上揭示)
     */
    function renderOverlay(direction) {
        var s = S.get();
        var d = dom();
        var evt = s.pendingEvent;
        if (!evt) return;
        if (s.isResultPhase) return; // 结果卡阶段不显示覆盖层

        if (_lastOverlayDir === direction && d.choiceOverlay.classList.contains('visible')) return;
        _lastOverlayDir = direction;

        var choiceData = _getChoiceData(evt, direction);
        var label = choiceData.label || '继续';
        var effects = choiceData.effects || {};

        d.choiceLabel.textContent = label;
        d.effectsContainer.innerHTML = '';

        // 所有事件: 受影响属性显示 ?, 不受影响显示 ·
        var rowEl = null;
        for (var i = 0; i < C.STAT_KEYS.length; i++) {
            if (i % 2 === 0) {
                rowEl = document.createElement('div');
                rowEl.className = 'effect-row';
                d.effectsContainer.appendChild(rowEl);
            }
            var statKey = C.STAT_KEYS[i];
            var val = (effects && effects[statKey]) || 0;
            var item = document.createElement('div');
            item.className = 'effect-item';
            item.style.animationDelay = (i * 0.06) + 's';
            var lbl = document.createElement('span');
            lbl.className = 'effect-label'; lbl.textContent = C.STAT_LABELS[statKey];
            item.appendChild(lbl);
            var symEl = document.createElement('span');
            if (val !== 0) { symEl.className = 'effect-symbol effect-hidden'; symEl.textContent = '?'; }
            else { symEl.className = 'effect-symbol effect-neutral'; symEl.textContent = '·'; }
            item.appendChild(symEl);
            rowEl.appendChild(item);
        }

        // 声望
        var repVal = (effects && effects['reputation']) || 0;
        var oldRep = d.choiceOverlay.querySelector('.effect-rep-row');
        if (oldRep) oldRep.remove();
        if (repVal !== 0) {
            var repRow = document.createElement('div'); repRow.className = 'effect-rep-row';
            var repLbl = document.createElement('span');
            repLbl.className = 'effect-label rep-label'; repLbl.textContent = '声望';
            repRow.appendChild(repLbl);
            var repSym = document.createElement('span');
            repSym.className = 'effect-symbol effect-hidden'; repSym.textContent = '?';
            repRow.appendChild(repSym);
            d.effectsContainer.appendChild(repRow);
        }

        d.choiceOverlay.classList.add('visible');
    }

    /**
     * v2.2: 从事件对象提取选择数据 (兼容新旧格式)
     */
    function _getChoiceData(evt, direction) {
        if (evt.choices) {
            // 新格式
            if (evt.isLeaf) {
                // 叶节点: 无意义选择, 显示左侧效果
                return evt.choices.left || {};
            }
            return evt.choices[direction] || {};
        }
        // 旧格式兼容
        if (evt.isLeaf) {
            return {
                label: evt.choiceLeftLabel || '继续旅程',
                effects: evt.effectsLeft || {}
            };
        }
        return {
            label: direction === 'left' ? evt.choiceLeftLabel : evt.choiceRightLabel,
            effects: direction === 'left' ? evt.effectsLeft : evt.effectsRight
        };
    }

    function hideOverlay() {
        _lastOverlayDir = null;
        dom().choiceOverlay.classList.remove('visible');
    }

    // ==================== 系列进度条 ====================

    /**
     * 在卡片顶部渲染系列进度标识
     * @param {{ progressText, progressDots, type, seriesName, correctCount?, requiredCorrect? }} prog
     */
    function renderSeriesProgress(prog) {
        var d = dom();

        // 移除旧进度条
        var old = d.cardArea.querySelector('.series-progress-bar');
        if (old) old.remove();

        if (!prog) {
            d.cardArea.classList.remove('series-active');
            return;
        }

        d.cardArea.classList.add('series-active');

        var bar = document.createElement('div');
        bar.className = 'series-progress-bar';

        // 系列名称 + 进度点阵
        var nameSpan = document.createElement('span');
        nameSpan.className = 'series-progress-name';
        nameSpan.textContent = prog.seriesName;
        bar.appendChild(nameSpan);

        var dotsSpan = document.createElement('span');
        dotsSpan.className = 'series-progress-dots';
        dotsSpan.textContent = prog.progressDots;
        bar.appendChild(dotsSpan);

        var numSpan = document.createElement('span');
        numSpan.className = 'series-progress-num';
        numSpan.textContent = prog.progressText;
        bar.appendChild(numSpan);

        d.cardArea.insertBefore(bar, d.cardArea.firstChild);
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
        renderSeriesProgress: renderSeriesProgress,
        updateDebugReputation: updateDebugReputation,
        toggleDebugReputation: toggleDebugReputation
    };
})();
