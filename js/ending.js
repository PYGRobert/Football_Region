/**
 * ending.js — 结局系统模块
 * 依赖: State, UI, Utils, Timeline, Icons
 * 职责: 结局判定、结局卡片加载、结局飞出动画处理
 */
window.Game = window.Game || {};

window.Game.Ending = (function() {
    'use strict';

    var S = window.Game.State;
    var UI = window.Game.UI;
    var U = window.Game.Utils;
    var TL = window.Game.Timeline;
    var Icons = window.Game.Icons;
    if (!S || !UI || !U || !TL) throw new Error('[Ending] 依赖 Game.State/UI/Utils/Timeline 未加载');

    var C = window.Game.Constants;

    // 结局图标映射（使用SVG图标名称）
    var ENDING_ICONS = {
        'physical_min': 'injury',
        'team_min': 'team',
        'fame_min': 'media',
        'mood_min': 'mood',
        'physical_max': 'training',
        'fame_max': 'media',
        'team_max': 'team',
        'mood_max': 'party',
        'legend': 'worldcup',
        'star': 'legacy',
        'loyal_end': 'team',
        'ambition_end': 'continental',
        'age': 'training'
    };

    /**
     * 结局判定（按优先级）
     * 优先级1：极端数值 → 优先级2：极端满值 → 优先级3：年龄与成就
     * @returns {boolean} 是否触发结局
     */
    function checkGameOver() {
        var s = S.get();
        var reason = null, title = '', subtitle = '';

        // 优先级1：极端数值导致的立即死亡/退役
        if (s.physical <= 0) {
            reason = 'physical_min'; title = '伤病缠身';
            subtitle = '反复伤病，你不得不提前退役';
            TL.record('你再也无法像以前一样奔跑，不得不离开绿茵场', 'bad');
        } else if (s.team <= 0) {
            reason = 'team_min'; title = '更衣室毒瘤';
            subtitle = '什么叫格林公式？我周一还要领金球呢！';
            TL.record('你成了更衣室的毒瘤，队友不愿再配合你演戏', 'bad');
        } else if (s.fame <= 0) {
            reason = 'fame_min'; title = '默默无闻';
            subtitle = '你在低级别联赛中结束了自己的生涯';
            TL.record('你自我安慰道："小俱乐部也有小俱乐部的乐趣"', 'normal');
        } else if (s.mood <= 0) {
            reason = 'mood_min'; title = '抑郁患者';
            subtitle = '你失去了对足球的热爱。';
            TL.record('太过思乡，玉玉了，难以发挥出球王球技', 'bad');
        }
        // 优先级2：极端满值结局
        else if (s.physical >= 100) {
            reason = 'physical_max'; title = '魔鬼筋肉人';
            subtitle = '头顶开始变得尖尖的...那我问你！';
            TL.record('药物依赖影响了你的运动能力与球技，可能健美更适合你', 'gold');
        } else if (s.fame >= 100) {
            reason = 'fame_max'; title = '大明星';
            subtitle = '场下围满了狗仔队与小报记者，你的私生活被无限曝光。';
            TL.record('心力交瘁，选择退役，转行商业与影视', 'gold');
        } else if (s.team >= 100) {
            reason = 'team_max'; title = '老好人';
            subtitle = '你为战术牺牲太多，失去了自我';
            TL.record('虽然没有退役，但已经成了工具人', 'gold');
        } else if (s.mood >= 100) {
            reason = 'mood_max'; title = '花花公子';
            subtitle = '夜夜笙歌让你状态下滑，最终因生活不检点被俱乐部除名。';
            TL.record('你迷失在灯红酒绿的喧嚣中，足球离你越来越远了', 'bad');
        }
        // 优先级3：年龄与成就结局
        else if (s.age >= C.RETIREMENT_AGE) {
            if (s.milestoneFlags.worldCup) {
                reason = 'legend'; title = '球王加冕';
                subtitle = '你的名字将被永远刻在足球史册上。';
                TL.record('正式宣布光荣退役', 'gold');
            } else if (s.fame > 80) {
                reason = 'star'; title = '名宿';
                subtitle = '你享受了成功的职业生涯，备受尊敬。';
                TL.record('举办退役告别赛', 'gold');
            } else if (s.milestoneFlags.loyaltyAward) {
                reason = 'loyal_end'; title = '城市英雄';
                subtitle = '你用一生守护了一座城市的荣耀。';
                TL.record('在主场完成谢幕战', 'gold');
            } else if (s.milestoneFlags.ambitionAward) {
                reason = 'ambition_end'; title = '冒险家';
                subtitle = '你的勇气和决心激励了无数后来者。';
                TL.record('在最高水平的联赛中退役', 'gold');
            } else {
                reason = 'age'; title = '岁月不饶人';
                subtitle = '到了告别的年纪。';
                TL.record('平静地宣布退役', 'normal');
            }
        }

        if (reason) {
            _loadEndingCard(reason, title, subtitle);
            return true;
        }
        return false;
    }

    /**
     * 加载结局卡片（更新主卡片为结局样式）
     * @param {string} reason - 结局原因标识
     * @param {string} title
     * @param {string} subtitle
     */
    function _loadEndingCard(reason, title, subtitle) {
        var s = S.get();
        var d = UI.dom();
        var card = d.card;

        s.gameOver = true;
        s.isEndingPhase = true;
        s._peakFame = Math.max(s._peakFame, s.fame);
        s.isAnimating = false;

        // 1. 设置结局卡片基础样式
        card.className = 'card ending-card';

        // 2. 根据结局原因添加具体颜色样式
        if (reason.indexOf('physical') !== -1) {
            card.classList.add(reason.indexOf('max') !== -1 ? 'physical-max' : 'physical-min');
        } else if (reason.indexOf('fame') !== -1) {
            card.classList.add(reason.indexOf('max') !== -1 ? 'fame-max' : 'fame-min');
        } else if (reason.indexOf('team') !== -1) {
            card.classList.add(reason.indexOf('max') !== -1 ? 'team-max' : 'team-min');
        } else if (reason.indexOf('mood') !== -1) {
            card.classList.add(reason.indexOf('max') !== -1 ? 'mood-max' : 'mood-min');
        } else if (reason.indexOf('legend') !== -1 || reason.indexOf('star') !== -1) {
            card.classList.add('gold');
        } else {
            card.classList.add('special');
        }

        // 3. 更新卡片内容（使用Twemoji）
        if (Icons) {
            d.cardIcon.innerHTML = Icons.getEndingIcon(reason, 64);
        }
        d.cardTitle.textContent = '职业生涯结束';
        d.cardDesc.innerHTML =
            '<div class="ending-title-wrapper">' +
                '<div class="ending-glow-title">' + title + '</div>' +
                '<div class="ending-draft-text">' + subtitle + '</div>' +
            '</div>';

        // 4. 更新遮罩层中的内容（使用Twemoji）
        if (Icons) {
            d.endingIcon.innerHTML = Icons.getEndingIcon(reason, 64);
        }
        d.endingTitle.textContent = title;
        d.endingSubtitle.textContent = subtitle;
        d.finalStats.textContent = '赛季数：' + (s.season - 1) + ' | 事件数：' + s.eventCount;

        // 5. 重置位置并进入入场动画
        card.style.transform = 'translateY(40px) scale(0.9)';
        card.style.opacity = '0';
        card.classList.remove('flying-left', 'flying-right', 'grabbed');
        void card.offsetWidth; // 强制重绘

        card.classList.add('entering');
        setTimeout(function() {
            card.classList.remove('entering');
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.opacity = '1';
        }, C.ENTER_ANIMATION_DURATION);

        // 6. 更新滑动提示
        d.swipeHint.style.opacity = '1';
        d.swipeHint.innerHTML = '<span class="arrow left">👈</span> 滑动查看生涯回顾 <span class="arrow right">👉</span>';

        // 7. 渲染时间线
        TL.render();
    }

    /**
     * 处理结局卡片的飞出逻辑 → 显示全屏遮罩和时间线
     * @param {string} direction - 'left' | 'right'
     */
    function handleFly(direction) {
        var s = S.get();
        var d = UI.dom();

        s.isAnimating = true;

        // 设置飞出动画起始点
        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');

        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'entering');
        UI.hideOverlay();

        // 动画结束后显示全屏遮罩
        setTimeout(function() {
            d.endingOverlay.classList.add('visible');
            d.resultScreen.style.display = 'block';

            // 触发时间线逐条显示
            TL.animateShow();

            // 显示重启按钮
            var totalTimelineTime = s.timeline.length * 150 + 500;
            setTimeout(function() {
                d.restartBtn.classList.add('visible');
            }, totalTimelineTime);
        }, C.FLY_ANIMATION_DURATION);
    }

    return {
        checkGameOver: checkGameOver,
        handleFly: handleFly
    };
})();
