/**
 * card.js — 卡片交互模块 (v1.5)
 * 依赖: State, UI, Utils, Events, Ending, Timeline, Animation, Icons, Constants
 * 职责: 卡片拖拽/滑动手势、应用选择效果、键盘操作、事件加载与刷新
 *
 * v1.5: 版本号更新
 * v1.4 改动:
 *   - 效果键名映射层 (old physical→ability, fame→reputation, mood→ambition)
 *   - reputation 静默更新（不在选择覆盖层显示）
 *   - age decay 影响 ability 而非 physical
 *   - 赛季结束财富自然积累
 *   - _peakReputation 替换 _peakFame
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
    if (!S || !UI || !U || !Evt || !End || !TL || !Ani) {
        throw new Error('[Card] 依赖模块未加载');
    }

    // ==================== 事件刷新 ====================

    /**
     * 加载并显示新事件卡片
     * @param {boolean} isRestore - 是否是恢复存档（不随机生成新事件）
     */
    function loadNewEvent(isRestore) {
        var s = S.get();
        if (s.gameOver) return;

        var event = null;

        // 如果是恢复存档，尝试加载之前的事件
        if (isRestore) {
            var pendingEventId = S.getPendingEventId();
            if (pendingEventId) {
                var allEvents = Evt.getAllEvents();
                for (var i = 0; i < allEvents.length; i++) {
                    if (allEvents[i].id === pendingEventId) {
                        event = allEvents[i];
                        break;
                    }
                }
            }
        }

        // 如果没有找到待恢复的事件，随机生成一个
        if (!event) {
            event = Evt.getRandomEvent();
        }

        s.pendingEvent = event;
        s.recentEventIds.push(event.id);
        if (s.recentEventIds.length > C.RECENT_EVENT_MEMORY) s.recentEventIds.shift();

        var d = UI.dom();

        // 使用本地图标（大尺寸）
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

        card.classList.remove('flying-left', 'flying-right', 'returning', 'grabbed');
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.classList.add('entering');

        // 使用 requestAnimationFrame 优化入场动画
        Ani.animate('card-enter', function(progress) {
            // 入场动画由CSS处理
        }, C.ENTER_ANIMATION_DURATION).then(function() {
            card.classList.remove('entering');
        });

        s.isAnimating = false;
        if (Icons) {
            d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) + '</span> 左右滑动做出选择 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';
        }
        d.swipeHint.style.opacity = '1';
        d.swipeHint.style.display = 'flex';
        UI.hideOverlay();
        UI.updateHeader();

        // 新事件加载完成后保存游戏进度
        S.save();
    }

    // ==================== 应用选择 ====================

    /**
     * 将旧事件效果键名映射为新状态键名
     * physical→ability, fame→reputation, mood→ambition, team→team
     * @param {object} effects - 原始事件effects对象
     * @returns {object} 映射后的effects对象（新键名）
     */
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

    /**
     * 应用玩家的选择效果
     * @param {string} direction - 'left' | 'right'
     */
    function applyChoice(direction) {
        var s = S.get();
        if (s.isAnimating || s.gameOver || s.isEndingPhase || !s.pendingEvent) return;

        var event = s.pendingEvent;

        // 检查锁定选项
        if ((event.lockedChoice === 'left' && direction === 'right') ||
            (event.lockedChoice === 'right' && direction === 'left')) {
            UI.showToast(Icons ? Icons.replaceEmoji('🔒 此选项不可用') : '此选项不可用');
            s.isAnimating = false;
            return;
        }

        s.isAnimating = true;
        var rawEffects = direction === 'left' ? event.effectsLeft : event.effectsRight;
        var effects = _mapEffects(rawEffects);

        // 应用可见属性变化
        C.STAT_KEYS.forEach(function(statKey) {
            if (effects[statKey] !== undefined) {
                s[statKey] = U.clamp(s[statKey] + effects[statKey], C.STAT_MIN, C.STAT_MAX);
            }
        });

        // 应用隐藏声望变化（无上限，下限0）
        if (effects['reputation'] !== undefined) {
            s.reputation = Math.max(0, s.reputation + effects['reputation']);
        }

        // 处理里程碑
        var milestoneData = direction === 'left' ? event.milestoneLeft : event.milestoneRight;
        if (milestoneData && !s.milestoneFlags[milestoneData.id]) {
            s.milestoneFlags[milestoneData.id] = true;
            var milestoneText = (Icons && Icons.replaceEmoji) ? Icons.replaceEmoji(milestoneData.text, 16) : milestoneData.text;
            UI.showToast(milestoneText, 'milestone');
            TL.record(milestoneData.text, 'gold');
        }

        // 更新链式状态
        if (event.chain) {
            if (s.currentChainId === event.chain && s.chainStep === event.step) {
                s.chainStep++;
                var allEvents = Evt.getAllEvents();
                var hasNextStep = allEvents.find(function(e) {
                    return e.chain === event.chain && e.step === s.chainStep + 1;
                });
                if (!hasNextStep) {
                    if (s.completedChains.indexOf(event.chain) === -1) {
                        s.completedChains.push(event.chain);
                    }
                    s.currentChainId = null;
                    s.chainStep = 0;
                }
            } else {
                s.currentChainId = event.chain;
                s.chainStep = event.step;
            }
        } else {
            s.currentChainId = null;
            s.chainStep = 0;
        }

        s._peakReputation = Math.max(s._peakReputation, s.reputation);
        s.eventCount++;
        s.eventsThisSeason++;

        // 赛季结束逻辑
        if (s.eventsThisSeason >= s.eventsPerSeason) {
            s.eventsThisSeason = 0;
            s.season++;
            s.age++;
            s.eventsPerSeason = C.EVENTS_PER_SEASON_MIN + Math.floor(Math.random() * C.EVENTS_PER_SEASON_RANGE);

            // 年龄衰退：影响能力(ability)
            if (s.age >= C.AGE_DECAY_START) {
                s.ability = U.clamp(s.ability - C.AGE_DECAY_MILD_AMOUNT, C.STAT_MIN, C.STAT_MAX);
            }
            if (s.age >= C.AGE_DECAY_SEVERE) {
                s.ability = U.clamp(s.ability - C.AGE_DECAY_SEVERE_AMOUNT, C.STAT_MIN, C.STAT_MAX);
            }

            // 财富自然积累（职业生涯收入）
            var wealthGrowth = 2 + Math.floor(Math.random() * 3); // +2~4 per season
            s.wealth = U.clamp(s.wealth + wealthGrowth, C.STAT_MIN, C.STAT_MAX);

            UI.showToast(Icons ? Icons.replaceEmoji('📅 赛季结束！年龄 +1') : '赛季结束！年龄 +1');

            var seasonSummary = '第' + (s.season - 1) + '赛季结束';
            var repLevel = C.getReputationLevel(s.reputation);
            if (repLevel.key === 'world') {
                seasonSummary += '，世界级球星';
            }
            TL.record(seasonSummary, 'normal');

            // 赛季结束打断所有链
            s.currentChainId = null;
            s.chainStep = 0;
        }

        UI.updateAllStats();
        UI.updateHeader(); // v1.5: 更新声望称呼
        // 更新debug声望显示（如果可见）
        if (UI.updateDebugReputation) UI.updateDebugReputation();

        // 检查结局
        if (End.checkGameOver()) {
            S.save();
            return;
        }

        // 飞出动画
        var d = UI.dom();
        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');
        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'returning');
        UI.hideOverlay();
        s.cardOffsetX = 0;
        s.cardRotation = 0;
        s.pendingEvent = null;

        Ani.animate('card-fly', function(progress) {
            // 飞出动画由CSS处理
        }, C.FLY_ANIMATION_DURATION).then(function() {
            d.card.classList.remove('flying-left', 'flying-right');
            d.card.style.transform = 'translateX(0) rotate(0deg)';
            loadNewEvent();
        });
    }

    // ==================== 手势处理 ====================

    function onStart(e) {
        var s = S.get();
        if (s.isAnimating) return;
        if (s.gameOver && !s.isEndingPhase) return; // 引导卡片阶段禁止拖动
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
            'translateX(' + dx + 'px) translateY(' + (dy * 0.3) + 'px) rotate(' + s.cardRotation + 'deg)';

        // 结局阶段不显示选择 Overlay
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
            if (s.isEndingPhase) {
                End.handleFly('left');
            } else {
                applyChoice('left');
            }
        } else if (dx > threshold) {
            if (s.isEndingPhase) {
                End.handleFly('right');
            } else {
                applyChoice('right');
            }
        } else {
            // 弹回原位
            card.classList.add('returning');
            card.style.transform = 'translateX(0) rotate(0deg)';
            s.cardOffsetX = 0;
            s.cardRotation = 0;

            Ani.animate('card-return', function(progress) {
                // 弹回动画由CSS处理
            }, C.ENTER_ANIMATION_DURATION).then(function() {
                card.classList.remove('returning');
                card.style.transition = 'box-shadow 0.2s';
            });

            UI.dom().swipeHint.style.opacity = '1';
        }
    }

    // ==================== 键盘操作 ====================

    /**
     * 模拟滑动（键盘操作使用）
     * @param {string} dir - 'left' | 'right'
     */
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

    /**
     * 绑定所有卡片交互事件
     */
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
