/**
 * ui.js — UI 渲染模块 (v2.0)
 * 依赖: State, Constants, Icons
 * 职责: DOM 元素缓存、状态条更新、Toast 通知、选择覆盖层渲染(+/-)、系列进度条、页头更新
 *
 * v2.0: 事件系统重构 —
 *   renderOverlay 改为 +/- 符号系统(两行排列, 1~5档)
 *   新增 renderSeriesProgress 系列进度条
 *   树状系列隐藏模式: 显示 ? 而非具体符号
 * v1.5: 修复选择覆盖层重复创建问题（同方向不重建）
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
     * 根据拖拽方向渲染选择覆盖层 (+/- 符号)
     */
    function renderOverlay(direction) {
        var s = S.get();
        var d = dom();
        var evt = s.pendingEvent;
        if (!evt) return;

        if (_lastOverlayDir === direction && d.choiceOverlay.classList.contains('visible')) {
            return;
        }
        _lastOverlayDir = direction;

        var label = direction === 'left'
            ? evt.choiceLeftLabel
            : evt.choiceRightLabel;
        // 叶节点: 两侧显示相同效果
        var effects = (evt.isLeaf || direction === 'left')
            ? evt.effectsLeft
            : evt.effectsRight;

        d.choiceLabel.textContent = label;
        d.effectsContainer.innerHTML = '';

        // 树状系列隐藏模式
        var isHidden = evt.hideEffects;
        var hintEffects = null;
        if (isHidden) {
            hintEffects = direction === 'left'
                ? (evt.effectsHintLeft || {})
                : (evt.effectsHintRight || {});
        }

        // 映射效果
        var mappedEffects = {};
        var KEY_MAP = C.STAT_KEY_MAP;
        if (effects) {
            for (var ek in effects) {
                if (effects.hasOwnProperty(ek)) {
                    var mk = KEY_MAP[ek] || ek;
                    mappedEffects[mk] = (mappedEffects[mk] || 0) + effects[ek];
                }
            }
        }

        // 渲染四个属性 (两行 × 两列)
        var rowEl = null;
        for (var i = 0; i < C.STAT_KEYS.length; i++) {
            if (i % 2 === 0) {
                rowEl = document.createElement('div');
                rowEl.className = 'effect-row';
                d.effectsContainer.appendChild(rowEl);
            }

            var statKey = C.STAT_KEYS[i];
            var val = mappedEffects[statKey] || 0;

            var item = document.createElement('div');
            item.className = 'effect-item';
            item.style.animationDelay = (i * 0.06) + 's';

            // 属性标签
            var lbl = document.createElement('span');
            lbl.className = 'effect-label';
            lbl.textContent = C.STAT_LABELS[statKey];
            item.appendChild(lbl);

            // 效果符号
            var symEl = document.createElement('span');

            if (isHidden) {
                // 树状系列: 显示 ?
                var hint = hintEffects ? hintEffects[statKey] : null;
                if (hint) {
                    symEl.className = 'effect-symbol effect-hidden';
                    symEl.textContent = '?';
                } else {
                    symEl.className = 'effect-symbol effect-neutral';
                    symEl.textContent = '·';
                }
            } else {
                var abs = Math.abs(val);
                var symInfo = C.getEffectSymbol(val);
                symEl.className = 'effect-symbol ' + symInfo.cssClass;

                // 零值: 显示灰色 ·
                if (val === 0) {
                    symEl.className = 'effect-symbol effect-neutral';
                    symEl.textContent = '·';
                } else {
                    symEl.textContent = symInfo.symbol;
                }
            }
            item.appendChild(symEl);
            rowEl.appendChild(item);
        }

        // 声望行
        var repVal = mappedEffects['reputation'] || 0;
        var oldRep = d.choiceOverlay.querySelector('.effect-rep-row');
        if (oldRep) oldRep.remove();

        if (repVal !== 0 || isHidden) {
            var repRow = document.createElement('div');
            repRow.className = 'effect-rep-row';

            var repLbl = document.createElement('span');
            repLbl.className = 'effect-label rep-label';
            repLbl.textContent = '声望';
            repRow.appendChild(repLbl);

            var repSym = document.createElement('span');
            if (isHidden) {
                repSym.className = 'effect-symbol effect-hidden';
                repSym.textContent = '?';
            } else if (repVal === 0) {
                repSym.className = 'effect-symbol effect-neutral';
                repSym.textContent = '·';
            } else {
                var repInfo = C.getEffectSymbol(repVal);
                repSym.className = 'effect-symbol ' + repInfo.cssClass;
                repSym.textContent = repInfo.symbol;
            }
            repRow.appendChild(repSym);
            d.effectsContainer.appendChild(repRow);
        }

        d.choiceOverlay.classList.add('visible');
    }

    function hideOverlay() {
        _lastOverlayDir = null;
        dom().choiceOverlay.classList.remove('visible');
    }

    // ==================== 系列进度条 (v2.0 新增) ====================

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

        // 线性 counter: 额外显示正确计数
        if (prog.type === 'linear' && prog.correctCount !== undefined) {
            var countSpan = document.createElement('span');
            countSpan.className = 'series-progress-counter';
            var checks = '';
            for (var i = 0; i < prog.requiredCorrect; i++) {
                checks += i < prog.correctCount ? '✓' : '✗';
            }
            countSpan.textContent = ' ' + checks;
            bar.appendChild(countSpan);
        }

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
