/**
 * card.js — 卡片交互模块 (v2.2)
 * 依赖: State, UI, Utils, Events, Ending, Timeline, Animation, Icons, Constants, Series, Flags
 * 职责: 卡片拖拽/滑动手势、翻转结果卡、标志位处理、赛季管理、键盘操作
 *
 * v2.2: 翻转结果卡 —
 *   选择后卡片原地变为黑底结果模式(叙事+已揭示效果)
 *   结果卡上任意方向滑动 → 飞出 → 下一个事件
 *   移除旧结算卡机制(飞出→飞入→确认)
 */
window.Game = window.Game || {};

window.Game.Card = (function() {
    'use strict';

    var S = window.Game.State;
    var UI = window.Game.UI;
    var U = window.Game.Utils;
    var Evt = window.Game.Events;
    var End = window.Game.Ending;
    var TL = window.Game.Timeline;
    var Ani = window.Game.Animation;
    var Icons = window.Game.Icons;
    var C = window.Game.Constants;
    var Series = window.Game.Series;
    var Flags = window.Game.Flags;
    if (!S || !UI || !U || !Evt || !End || !TL || !Ani || !Series || !Flags) {
        throw new Error('[Card] 依赖模块未加载');
    }

    // ==================== 事件刷新 ====================

    function loadNewEvent(isRestore) {
        var s = S.get();
        if (s.gameOver) return;

        if (s.pendingSeasonEnd) {
            s.pendingSeasonEnd = false;
            _applySeasonEnd();
        }

        var event = null;
        if (isRestore) {
            var pendingEventId = S.getPendingEventId();
            if (pendingEventId) {
                event = Evt.findEventById(pendingEventId);
                if (!event) console.warn('[Card] 存档事件ID不存在:', pendingEventId);
            }
        }
        if (!event) event = Evt.getRandomEvent();

        s.pendingEvent = event;
        s.recentEventIds.push(event.id);
        if (s.recentEventIds.length > C.RECENT_EVENT_MEMORY) s.recentEventIds.shift();

        if (event.category) {
            s.recentCategoryIds.push(event.category);
            if (s.recentCategoryIds.length > C.RECENT_CATEGORY_MEMORY) s.recentCategoryIds.shift();
        }

        var d = UI.dom();

        if (Icons && Icons.getEventIconById) {
            d.cardIcon.innerHTML = Icons.getEventIconById(event.id, 96);
        } else {
            d.cardIcon.innerHTML = '';
        }

        d.cardTitle.textContent = event.title || '职业生涯';
        d.cardDesc.textContent = event.description;

        // 重置卡片
        var card = d.card;
        card.className = 'card';
        if (event.color) card.classList.add(event.color);
        if (event.cardStyle) card.classList.add(event.cardStyle);
        card.classList.remove('flying-left', 'flying-right', 'returning', 'grabbed', 'flipped');
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.classList.add('entering');

        Ani.animate('card-enter', function() {}, C.ENTER_ANIMATION_DURATION).then(function() {
            card.classList.remove('entering');
            _renderSeriesProgress();
        });

        s.isAnimating = false;
        s.isResultPhase = false;

        if (event.isLeaf) {
            d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) +
                '</span> 滑动继续 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';
        } else {
            d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) +
                '</span> 左右滑动做出选择 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';
        }
        d.swipeHint.style.opacity = '1';
        d.swipeHint.style.display = 'flex';
        UI.hideOverlay();
        UI.updateHeader();
        S.save();
    }

    function _applySeasonEnd() {
        var s = S.get();
        s.eventsThisSeason = 0;
        s.season++;
        s.age++;
        s.eventsPerSeason = C.EVENTS_PER_SEASON_MIN + Math.floor(Math.random() * C.EVENTS_PER_SEASON_RANGE);
        s.seriesThisSeason = { tree: 0, linear: 0 };
        if (s.age >= C.AGE_DECAY_START) s.ability = U.clamp(s.ability - C.AGE_DECAY_MILD_AMOUNT, C.STAT_MIN, C.STAT_MAX);
        if (s.age >= C.AGE_DECAY_SEVERE) s.ability = U.clamp(s.ability - C.AGE_DECAY_SEVERE_AMOUNT, C.STAT_MIN, C.STAT_MAX);
        var wg = 2 + Math.floor(Math.random() * 3);
        s.wealth = U.clamp(s.wealth + wg, C.STAT_MIN, C.STAT_MAX);
        TL.record('', 'season_mark', s.season);
        UI.updateAllStats();
        UI.updateHeader();
    }

    function _renderSeriesProgress() {
        var prog = Series.getSeriesProgress();
        if (UI.renderSeriesProgress) UI.renderSeriesProgress(prog);
    }

    function _applyEffects(effects, milestoneData) {
        if (!effects) return;
        var s = S.get();
        C.STAT_KEYS.forEach(function(k) {
            if (effects[k] !== undefined && effects[k] !== 0) {
                s[k] = U.clamp(s[k] + effects[k], C.STAT_MIN, C.STAT_MAX);
            }
        });
        if (effects['reputation'] !== undefined && effects['reputation'] !== 0) {
            s.reputation = Math.max(0, s.reputation + effects['reputation']);
        }
        if (milestoneData && !s.milestoneFlags[milestoneData.id]) {
            s.milestoneFlags[milestoneData.id] = true;
            var t = (Icons && Icons.replaceEmoji) ? Icons.replaceEmoji(milestoneData.text, 16) : milestoneData.text;
            UI.showToast(t, 'milestone');
            TL.record(milestoneData.text, 'gold', s.season);
        }
    }

    function _getChoiceData(event, direction) {
        if (event.choices) return event.choices[direction] || {};
        if (event.isLeaf) return { label: event.choiceLeftLabel || '继续旅程', effects: event.effectsLeft || {}, flagsClear: event.flagsClear || [] };
        return {
            label: direction === 'left' ? event.choiceLeftLabel : event.choiceRightLabel,
            effects: direction === 'left' ? event.effectsLeft : event.effectsRight
        };
    }

    // ==================== 应用选择 + 翻转结果卡 ====================

    function applyChoice(direction) {
        var s = S.get();

        if (s.isEndingPhase) { _flyCardEndingPhase(direction); return; }
        if (s.isAnimating || s.gameOver || !s.pendingEvent) return;

        var event = s.pendingEvent;

        // ── 结果卡阶段: 任意方向滑动即飞出 ──
        if (s.isResultPhase) {
            _flyOutFromResult(direction);
            return;
        }

        // 锁定选项
        if (!event.isLeaf) {
            if ((event.lockedChoice === 'left' && direction === 'right') ||
                (event.lockedChoice === 'right' && direction === 'left')) {
                UI.showToast(Icons.replaceEmoji('🔒 此选项不可用'));
                s.isAnimating = false;
                return;
            }
        }

        s.isAnimating = true;
        var choiceData = _getChoiceData(event, direction);
        var effects = choiceData.effects || {};

        // 系列推进: 使用 s.activeSeries 而非 event.series 判断 —
        // 树状系列的叶子事件没有 series 属性, 但仍需推进步骤以触发系列结束
        if (s.activeSeries) {
            var seriesInfo = event.series || {};
            Series.advanceStep(direction, seriesInfo.nextLeft, seriesInfo.nextRight,
                seriesInfo.stepCorrectSide || null);
        }

        // 标志位
        if (choiceData.flagsSet || choiceData.flagsAdd || choiceData.flagsClear || choiceData.unlocks) {
            Flags.applyChoiceFlags({
                flagsSet: choiceData.flagsSet, flagsAdd: choiceData.flagsAdd,
                flagsClear: choiceData.flagsClear, unlocks: choiceData.unlocks
            });
        }
        if (event.unlocks && event.unlocks.length) event.unlocks.forEach(function(id) { Flags.unlock(id); });
        if (choiceData.flagsStartTimers) {
            Object.keys(choiceData.flagsStartTimers).forEach(function(k) { Flags.startTimer(k, choiceData.flagsStartTimers[k]); });
        }

        // 计数
        s.eventCount++; s.eventCounter++;
        if (!event.series && !event.isLeaf) {
            s.eventsThisSeason++;
            s.eventsSinceLastSeries = (s.eventsSinceLastSeries || 0) + 1;
        }
        if (event.id.indexOf('tutorial_') === 0 && s.tutorialStep < C.TUTORIAL_EVENT_COUNT) s.tutorialStep++;
        if (!event.series && !event.isLeaf && s.eventsThisSeason >= s.eventsPerSeason) s.pendingSeasonEnd = true;

        // 压力
        if (!event.series && !event.isLeaf) {
            s.pressureLevel += (event.tension || 0);
            if (s.pressureLevel >= C.PRESSURE_CAP) s.decompressing = true;
            if (s.decompressing && event.tension === C.TENSION.LIGHT && s.pressureLevel <= 0) s.decompressing = false;
        }

        Flags.tick();
        Flags.consumeUnlock(event.id);

        // 暂存效果, 结果卡滑走后再应用(避免属性突变跳过结果展示)
        s._pendingResult = { effects: effects, milestone: event.milestone };

        _showResultCard(event, choiceData);
    }

    /**
     * v2.2: 结果卡 — 飞出→切内容→飞入
     * 卡片沿原方向飞出, 切换为结果内容后飞入
     */
    function _showResultCard(event, choiceData) {
        var s = S.get();
        var d = UI.dom();
        var card = d.card;
        var dir = s.cardOffsetX < 0 ? 'left' : 'right';

        // 阶段1: 沿原方向飞出
        card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        card.classList.add(dir === 'left' ? 'flying-left' : 'flying-right');
        card.classList.remove('grabbed');
        UI.hideOverlay();
        UI.renderSeriesProgress(null);
        s.cardOffsetX = 0;
        s.cardRotation = 0;

        // 监听CSS飞出动画结束事件(与动画精确同步，避免setTimeout时间差)
        var _flyOutDone = false;
        var _onFlyEnd = function(e) {
            // 只响应飞出动画(flyLeft/flyRight)，忽略其他动画事件
            if (e.animationName !== 'flyLeft' && e.animationName !== 'flyRight') return;
            if (_flyOutDone) return;
            _flyOutDone = true;
            card.removeEventListener('animationend', _onFlyEnd);
            _showResultPhase2();
        };
        // 兜底: 若animationend因某些原因未触发，350ms后强制执行
        var _fallbackTimer = setTimeout(function() {
            if (_flyOutDone) return;
            _flyOutDone = true;
            card.removeEventListener('animationend', _onFlyEnd);
            _showResultPhase2();
        }, C.FLY_ANIMATION_DURATION + 100);
        card.addEventListener('animationend', _onFlyEnd);

        function _showResultPhase2() {
            clearTimeout(_fallbackTimer);
            // 阶段2: 卡片已飞出 → 回中+隐藏+切内容
            card.classList.remove('flying-left', 'flying-right');
            card.style.transition = 'none';
            card.style.transform = 'translateX(0) rotate(0deg) rotateY(0deg)';
            card.style.opacity = '0';

            d.cardIcon.innerHTML = '';
            d.cardTitle.innerHTML = '<div class="result-label">结果</div>' + (event.title || '');
            var n = choiceData.narrative || (event.isLeaf ? event.description : '');
            var ef = choiceData.effects || {};
            var er = '';
            for (var i = 0; i < C.STAT_KEYS.length; i++) {
                if (i % 2 === 0) er += '<div class="effect-row">';
                var sk = C.STAT_KEYS[i];
                var v = ef[sk] || 0;
                var si = v === 0 ? { symbol: 'O', cssClass: 'effect-neutral' } : C.getEffectSymbol(v);
                er += '<div class="effect-item"><span class="effect-label">' +
                    C.STAT_LABELS[sk] + '</span><span class="effect-symbol ' +
                    si.cssClass + '">' + si.symbol + '</span></div>';
                if (i % 2 === 1) er += '</div>';
            }
            if (ef['reputation']) {
                var ri = C.getEffectSymbol(ef['reputation']);
                er += '<div class="effect-row"><div class="effect-item">' +
                    '<span class="effect-label rep-label">声望</span>' +
                    '<span class="effect-symbol ' + ri.cssClass + '">' + ri.symbol + '</span></div></div>';
            }
            d.cardDesc.innerHTML =
                '<div class="result-narrative">' + n + '</div>' +
                '<div class="result-effects">' + er + '</div>';

            card.classList.add('flipped');
            card.classList.add('entering');
            s.isResultPhase = true;

            d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) +
                '</span> 滑动继续 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';

            // 飞入动画完成后
            setTimeout(function() {
                card.classList.remove('entering');
                card.style.transition = '';
                card.style.opacity = '1';
                s.isAnimating = false;
                d.swipeHint.style.opacity = '1';
            }, C.ENTER_ANIMATION_DURATION);
        }
    }

    function _flyOutFromResult(direction) {
        var s = S.get();
        var d = UI.dom();

        // 防止重入
        if (s.isAnimating) return;
        s.isAnimating = true;
        s.isResultPhase = false;
        s.isDragging = false;

        // 清理所有可能残留的动画类
        d.card.classList.remove('entering', 'returning', 'flip-out', 'flip-in');
        d.card.style.transition = '';

        // ── 应用暂存的效果 ──
        var pr = s._pendingResult;
        if (pr) {
            _applyEffects(pr.effects, pr.milestone);
            s._pendingResult = null;
            UI.updateAllStats();
            UI.updateHeader();
            if (UI.updateDebugReputation) UI.updateDebugReputation();
        }

        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        // 注意: 不移除 'flipped' — 保留深色背景直到动画完成，避免飞出时卡片颜色突变
        d.card.classList.remove('grabbed');
        UI.hideOverlay();
        UI.renderSeriesProgress(null);
        s.cardOffsetX = 0; s.cardRotation = 0;

        if (s.pendingEvent && s.pendingEvent.isLeaf && s.pendingEvent.timelineText) {
            TL.record(s.pendingEvent.timelineText, s.pendingEvent.timelineType || 'normal', s.season);
        }
        s.pendingEvent = null;

        // 监听CSS飞出动画结束 (与动画精确同步)
        var _flyDone2 = false;
        var _onFlyEnd2 = function(e) {
            if (e.animationName !== 'flyLeft' && e.animationName !== 'flyRight') return;
            if (_flyDone2) return;
            _flyDone2 = true;
            d.card.removeEventListener('animationend', _onFlyEnd2);
            _afterFlyOut();
        };
        var _fallbackTimer2 = setTimeout(function() {
            if (_flyDone2) return;
            _flyDone2 = true;
            d.card.removeEventListener('animationend', _onFlyEnd2);
            _afterFlyOut();
        }, C.FLY_ANIMATION_DURATION + 100);
        d.card.addEventListener('animationend', _onFlyEnd2);

        function _afterFlyOut() {
            clearTimeout(_fallbackTimer2);
            // 彻底清洗卡片状态 (包括在动画完成后移除 flipped)
            var allClasses = ['flying-left', 'flying-right', 'flipped', 'entering',
                'returning', 'grabbed', 'flip-out', 'flip-in', 'fade-swap-out', 'fade-swap-in'];
            allClasses.forEach(function(c) { d.card.classList.remove(c); });
            d.card.style.transition = '';
            d.card.style.transform = 'translateX(0) rotate(0deg) rotateY(0deg)';
            d.card.style.opacity = '1';
            s.isAnimating = false;

            if (End.checkGameOver()) {
                End.flushPendingEnding();
                return;
            }
            loadNewEvent();
        }
    }

    function _flyOutAndContinue(direction) {
        var s = S.get(); var d = UI.dom();
        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'returning');
        UI.hideOverlay(); UI.renderSeriesProgress(null);
        s.cardOffsetX = 0; s.cardRotation = 0; s.pendingEvent = null;
        Ani.animate('card-fly', function() {}, C.FLY_ANIMATION_DURATION).then(function() {
            d.card.classList.remove('flying-left', 'flying-right');
            d.card.style.transition = ''; d.card.style.transform = 'translateX(0) rotate(0deg)';
            loadNewEvent();
        });
    }

    function _flyOutAndShowEnding(direction) {
        var s = S.get(); var d = UI.dom();
        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'returning', 'flipped');
        UI.hideOverlay(); UI.renderSeriesProgress(null);
        s.cardOffsetX = 0; s.cardRotation = 0; s.pendingEvent = null; s.isResultPhase = false;
        S.save();
        Ani.animate('card-fly-ending', function() {}, C.FLY_ANIMATION_DURATION).then(function() {
            if (s.activeSeries) window.Game.Series.endSeries();
            d.card.classList.remove('flying-left', 'flying-right');
            d.card.style.transition = ''; d.card.style.transform = 'translateX(0) rotate(0deg)'; d.card.style.opacity = '1';
            End.flushPendingEnding();
        });
    }

    function _flyCardEndingPhase(direction) { End.handleFly(direction); }

    // ==================== 手势处理 ====================

    function onStart(e) {
        var s = S.get();
        if (s.isAnimating) return;
        if (s.gameOver && !s.isEndingPhase) return;
        var p = U.getPos(e);
        s.isDragging = true; s.startX = p.x; s.startY = p.y;
        var card = UI.dom().card;
        card.classList.add('grabbed');
        card.classList.remove('returning', 'entering');
        card.style.transition = 'box-shadow 0.12s';
        UI.dom().swipeHint.style.opacity = '0';
    }

    function onMove(e) {
        var s = S.get();
        if (!s.isDragging || s.isAnimating) return;
        var p = U.getPos(e);
        var dx = p.x - s.startX, dy = p.y - s.startY;
        s.cardOffsetX = dx; s.cardRotation = dx * 0.07;
        var card = UI.dom().card;
        card.style.transform = 'translateX(' + dx + 'px) translateY(' + (dy * 0.3) + 'px) rotate(' + s.cardRotation + 'deg) scale(1.02)';
        if (s.isEndingPhase) return;
        var threshold = card.offsetWidth * C.SWIPE_THRESHOLD_RATIO;

        // 结果卡阶段: 任意方向都显示滑动提示
        if (s.isResultPhase) {
            UI.dom().swipeHint.style.opacity = Math.min(1, Math.abs(dx) / threshold * 0.5);
            return;
        }

        if (dx < -threshold) UI.renderOverlay('left');
        else if (dx > threshold) UI.renderOverlay('right');
        else UI.hideOverlay();
    }

    function onEnd(e) {
        var s = S.get();
        if (!s.isDragging) return;
        s.isDragging = false;
        var card = UI.dom().card;
        card.classList.remove('grabbed');
        card.style.transition = 'transform 0.4s cubic-bezier(0.25,0.8,0.25,1.2), box-shadow 0.2s';
        UI.hideOverlay();
        var dx = s.cardOffsetX;
        var threshold = card.offsetWidth * C.SWIPE_THRESHOLD_RATIO;

        if (Math.abs(dx) > threshold) {
            applyChoice(dx < 0 ? 'left' : 'right');
        } else {
            card.classList.add('returning');
            card.style.transform = 'translateX(0) rotate(0deg)';
            s.cardOffsetX = 0; s.cardRotation = 0;
            Ani.animate('card-return', function() {}, C.ENTER_ANIMATION_DURATION).then(function() {
                card.classList.remove('returning');
                card.style.transition = 'box-shadow 0.2s';
            });
            UI.dom().swipeHint.style.opacity = '1';
        }
    }

    // ==================== 键盘操作 ====================

    function simulateSwipe(dir) {
        var s = S.get();
        if (s.isAnimating || s.gameOver || s.isEndingPhase) return;
        var off = dir === 'left' ? -140 : 140;
        s.cardOffsetX = off; s.cardRotation = off * 0.07;
        var card = UI.dom().card;
        card.style.transition = 'transform 0.22s ease-out, box-shadow 0.2s';
        card.style.transform = 'translateX(' + off + 'px) rotate(' + s.cardRotation + 'deg)';
        card.classList.add('grabbed');
        UI.renderOverlay(dir);
        setTimeout(function() { applyChoice(dir); }, C.SWIPE_SIMULATE_DELAY);
    }

    function onKeyDown(e) {
        var s = S.get();
        if (s.isAnimating || s.gameOver || s.isDragging) return;
        if (s.isEndingPhase) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); simulateSwipe('left'); }
        else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); simulateSwipe('right'); }
    }

    function bindEvents() {
        var card = UI.dom().card;
        card.addEventListener('touchstart', onStart, { passive: false });
        card.addEventListener('touchmove', onMove, { passive: false });
        card.addEventListener('touchend', onEnd);
        card.addEventListener('touchcancel', onEnd);
        card.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', function(e) { if (S.get().isDragging) { e.preventDefault(); onMove(e); } });
        window.addEventListener('mouseup', function(e) { if (S.get().isDragging) onEnd(e); });
        card.addEventListener('touchmove', function(e) { if (S.get().isDragging) e.preventDefault(); }, { passive: false });
        window.addEventListener('keydown', onKeyDown);
    }

    return {
        loadNewEvent: loadNewEvent,
        applyChoice: applyChoice,
        simulateSwipe: simulateSwipe,
        bindEvents: bindEvents
    };
})();
