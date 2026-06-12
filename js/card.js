/**
 * card.js — 卡片交互模块 (v2.0)
 * 依赖: State, UI, Utils, Events, Ending, Timeline, Animation, Icons, Constants, Series
 * 职责: 卡片拖拽/滑动手势、应用选择效果、系列事件处理、赛季管理、键盘操作
 *
 * v2.0: 事件系统重构 —
 *   新增系列事件处理(钩子/计数器/关键节点/advanceStep)
 *   赛季结束改用 pendingSeasonEnd 标记(系列结束后检查容量)
 *   叶节点事件(isLeaf)仅展示，无实际选择
 *   移除旧 chain 链式逻辑
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
    if (!S || !UI || !U || !Evt || !End || !TL || !Ani || !Series) {
        throw new Error('[Card] 依赖模块未加载');
    }

    // ==================== 事件刷新 ====================

    function loadNewEvent(isRestore) {
        var s = S.get();
        if (s.gameOver) return;

        // ── 赛季结束标记检查 ──
        if (s.pendingSeasonEnd) {
            s.pendingSeasonEnd = false;
            _applySeasonEnd();
        }

        var event = null;

        // 存档恢复: 尝试加载之前的事件
        if (isRestore) {
            var pendingEventId = S.getPendingEventId();
            if (pendingEventId) {
                event = Evt.findEventById(pendingEventId);
            }
        }

        // 无待恢复事件: 调度下一个
        if (!event) {
            event = Evt.getRandomEvent();
        }

        s.pendingEvent = event;
        s.recentEventIds.push(event.id);
        if (s.recentEventIds.length > C.RECENT_EVENT_MEMORY) s.recentEventIds.shift();

        var d = UI.dom();

        // 图标
        if (Icons && Icons.getEventIconById) {
            d.cardIcon.innerHTML = Icons.getEventIconById(event.id, 96);
        } else {
            d.cardIcon.innerHTML = '';
        }

        d.cardTitle.textContent = event.title || '职业生涯';
        d.cardDesc.textContent = event.description;

        // 重置卡片样式
        var card = d.card;
        card.className = 'card';
        if (event.color) {
            card.classList.add(event.color);
        }
        // 叶节点样式
        if (event.cardStyle) {
            card.classList.add(event.cardStyle);
        }
        card.classList.remove('flying-left', 'flying-right', 'returning', 'grabbed');
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.classList.add('entering');

        Ani.animate('card-enter', function(progress) {}, C.ENTER_ANIMATION_DURATION).then(function() {
            card.classList.remove('entering');
            // 入场动画完成后再渲染进度条，避免被动画覆盖
            _renderSeriesProgress();
        });

        s.isAnimating = false;

        // 叶节点: 滑动提示改为单方向
        if (event.isLeaf) {
            d.swipeHint.innerHTML = '<span class="arrow left">' +
                (Icons ? Icons.getArrowLeft(18) : '') + '</span> 滑动继续 ' +
                '<span class="arrow right">' + (Icons ? Icons.getArrowRight(18) : '') + '</span>';
        } else if (Icons) {
            d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) +
                '</span> 左右滑动做出选择 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';
        }
        d.swipeHint.style.opacity = '1';
        d.swipeHint.style.display = 'flex';
        UI.hideOverlay();
        UI.updateHeader();

        S.save();
    }

    // ==================== 赛季管理 ====================

    function _applySeasonEnd() {
        var s = S.get();
        s.eventsThisSeason = 0;
        s.season++;
        s.age++;
        s.eventsPerSeason = C.EVENTS_PER_SEASON_MIN + Math.floor(Math.random() * C.EVENTS_PER_SEASON_RANGE);
        s.seriesThisSeason = { tree: 0, linear: 0 };

        // 年龄衰退
        if (s.age >= C.AGE_DECAY_START) {
            s.ability = U.clamp(s.ability - C.AGE_DECAY_MILD_AMOUNT, C.STAT_MIN, C.STAT_MAX);
        }
        if (s.age >= C.AGE_DECAY_SEVERE) {
            s.ability = U.clamp(s.ability - C.AGE_DECAY_SEVERE_AMOUNT, C.STAT_MIN, C.STAT_MAX);
        }
        // 财富自然积累
        var wealthGrowth = 2 + Math.floor(Math.random() * 3);
        s.wealth = U.clamp(s.wealth + wealthGrowth, C.STAT_MIN, C.STAT_MAX);

        // 时间线赛季分割标记
        TL.record('', 'season_mark', s.season);

        UI.updateAllStats();
        UI.updateHeader();
    }

    // ==================== 系列进度渲染 ====================

    function _renderSeriesProgress() {
        var prog = Series.getSeriesProgress();
        if (UI.renderSeriesProgress) {
            UI.renderSeriesProgress(prog);
        }
    }

    // ==================== 应用选择 ====================

    function _mapEffects(effects) {
        if (!effects) return {};
        var mapped = {};
        var KEY_MAP = C.STAT_KEY_MAP;
        for (var key in effects) {
            if (effects.hasOwnProperty(key)) {
                var newKey = KEY_MAP[key] || key;
                mapped[newKey] = (mapped[newKey] || 0) + effects[key];
            }
        }
        return mapped;
    }

    function applyChoice(direction) {
        var s = S.get();

        // 结局阶段必须优先处理 — gameOver 为 true 时其他守卫不能拦截
        if (s.isEndingPhase) {
            _flyCardEndingPhase(direction);
            return;
        }

        if (s.isAnimating || s.gameOver || !s.pendingEvent) return;

        var event = s.pendingEvent;

        // 锁定选项检查 (仅非叶节点)
        if (!event.isLeaf) {
            if ((event.lockedChoice === 'left' && direction === 'right') ||
                (event.lockedChoice === 'right' && direction === 'left')) {
                UI.showToast(Icons ? Icons.replaceEmoji('🔒 此选项不可用') : '此选项不可用');
                s.isAnimating = false;
                return;
            }
        }

        s.isAnimating = true;

        // 叶节点: 两侧效果完全相同，方向无关
        var rawEffects;
        if (event.isLeaf) {
            rawEffects = event.effectsLeft; // 统一用左侧效果
        } else {
            rawEffects = direction === 'left' ? event.effectsLeft : event.effectsRight;
        }
        var effects = _mapEffects(rawEffects);

        // 应用属性变化
        C.STAT_KEYS.forEach(function(statKey) {
            if (effects[statKey] !== undefined) {
                s[statKey] = U.clamp(s[statKey] + effects[statKey], C.STAT_MIN, C.STAT_MAX);
            }
        });
        if (effects['reputation'] !== undefined) {
            s.reputation = Math.max(0, s.reputation + effects['reputation']);
        }

        // 里程碑
        var milestoneData = event.milestone;
        if (milestoneData && !s.milestoneFlags[milestoneData.id]) {
            s.milestoneFlags[milestoneData.id] = true;
            var msText = (Icons && Icons.replaceEmoji) ? Icons.replaceEmoji(milestoneData.text, 16) : milestoneData.text;
            UI.showToast(msText, 'milestone');
            TL.record(milestoneData.text, 'gold', s.season);
        }

        // ── 系列事件处理 ──
        if (event.series) {
            // 钩子推进
            if (event.hook) {
                Series.processHook(event.hook.counterKey);
            }

            // counter/keynode 判定已前移到 Series.advanceStep() 内部
            Series.advanceStep(direction);
        } else {
            // 日常事件: 可能有钩子
            if (event.hook) {
                Series.processHook(event.hook.counterKey);
            }
        }

        // 时间线记录 (叶节点)
        if (event.isLeaf && event.timelineText) {
            TL.record(event.timelineText, event.timelineType || 'normal', s.season);
        }

        s._peakReputation = Math.max(s._peakReputation, s.reputation);
        s.eventCount++;

        // 系列事件不增加 eventsThisSeason
        if (!event.series && !event.isLeaf) {
            s.eventsThisSeason++;
        }

        // 赛季结束检查 (仅非系列事件)
        if (!event.series && !event.isLeaf && s.eventsThisSeason >= s.eventsPerSeason) {
            s.pendingSeasonEnd = true;
        }

        UI.updateAllStats();
        UI.updateHeader();
        if (UI.updateDebugReputation) UI.updateDebugReputation();

        // ── 结局判定 (所有事件，包括叶子和系列事件) ──
        var endingTriggered = End.checkGameOver();
        if (endingTriggered) {
            _flyOutAndShowEnding(direction);
            return;
        }

        // ── 飞出动画 → 加载下一个事件 ──
        _flyOutAndContinue(direction);
    }

    // ==================== 飞出动画 ====================

    function _flyOutAndContinue(direction) {
        var s = S.get();
        var d = UI.dom();

        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'returning');
        UI.hideOverlay();
        // 飞出时清理系列进度条（兜底防御）
        UI.renderSeriesProgress(null);
        s.cardOffsetX = 0;
        s.cardRotation = 0;
        s.pendingEvent = null;

        Ani.animate('card-fly', function(progress) {}, C.FLY_ANIMATION_DURATION).then(function() {
            d.card.classList.remove('flying-left', 'flying-right');
            d.card.style.transition = '';
            d.card.style.transform = 'translateX(0) rotate(0deg)';
            loadNewEvent();
        });
    }

    function _flyOutAndShowEnding(direction) {
        var s = S.get();
        var d = UI.dom();

        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'returning');
        UI.hideOverlay();
        // 飞出时清理系列进度条
        UI.renderSeriesProgress(null);
        s.cardOffsetX = 0;
        s.cardRotation = 0;
        s.pendingEvent = null;
        S.save();

        Ani.animate('card-fly-ending', function(progress) {}, C.FLY_ANIMATION_DURATION).then(function() {
            // 清理进行中的系列状态（如果结局在系列中间触发）
            if (s.activeSeries) {
                window.Game.Series.endSeries();
            }
            d.card.classList.remove('flying-left', 'flying-right');
            d.card.style.transition = '';
            d.card.style.transform = 'translateX(0) rotate(0deg)';
            d.card.style.opacity = '1';
            End.flushPendingEnding();
        });
    }

    function _flyCardEndingPhase(direction) {
        End.handleFly(direction);
    }

    // ==================== 手势处理 ====================

    function onStart(e) {
        var s = S.get();
        if (s.isAnimating) return;
        if (s.gameOver && !s.isEndingPhase) return;
        var p = U.getPos(e);
        s.isDragging = true;
        s.startX = p.x;
        s.startY = p.y;
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
        var dx = p.x - s.startX;
        var dy = p.y - s.startY;
        s.cardOffsetX = dx;
        s.cardRotation = dx * 0.07;

        var card = UI.dom().card;
        card.style.transform =
            'translateX(' + dx + 'px) translateY(' + (dy * 0.3) + 'px) rotate(' + s.cardRotation + 'deg) scale(1.02)';

        if (s.isEndingPhase) return;

        var threshold = card.offsetWidth * C.SWIPE_THRESHOLD_RATIO;
        if (dx < -threshold) { UI.renderOverlay('left'); }
        else if (dx > threshold) { UI.renderOverlay('right'); }
        else { UI.hideOverlay(); }
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

        if (dx < -threshold) {
            applyChoice('left');
        } else if (dx > threshold) {
            applyChoice('right');
        } else {
            card.classList.add('returning');
            card.style.transform = 'translateX(0) rotate(0deg)';
            s.cardOffsetX = 0;
            s.cardRotation = 0;

            Ani.animate('card-return', function(progress) {}, C.ENTER_ANIMATION_DURATION).then(function() {
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
        s.cardOffsetX = off;
        s.cardRotation = off * 0.07;
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

        if (e.key === 'ArrowLeft' || e.key === 'a') {
            e.preventDefault();
            simulateSwipe('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            e.preventDefault();
            simulateSwipe('right');
        }
    }

    // ==================== 事件绑定 ====================

    function bindEvents() {
        var card = UI.dom().card;

        card.addEventListener('touchstart', onStart, { passive: false });
        card.addEventListener('touchmove', onMove, { passive: false });
        card.addEventListener('touchend', onEnd);
        card.addEventListener('touchcancel', onEnd);
        card.addEventListener('mousedown', onStart);

        window.addEventListener('mousemove', function(e) {
            if (S.get().isDragging) { e.preventDefault(); onMove(e); }
        });
        window.addEventListener('mouseup', function(e) {
            if (S.get().isDragging) onEnd(e);
        });

        card.addEventListener('touchmove', function(e) {
            if (S.get().isDragging) e.preventDefault();
        }, { passive: false });

        window.addEventListener('keydown', onKeyDown);
    }

    return {
        loadNewEvent: loadNewEvent,
        applyChoice: applyChoice,
        simulateSwipe: simulateSwipe,
        bindEvents: bindEvents
    };
})();
