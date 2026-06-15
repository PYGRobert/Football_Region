/**
 * timeline.js — 时间线模块 (v2.0)
 * 依赖: State, UI
 * 职责: 记录生涯事件、赛季分割线、渲染结局时间线回顾
 *
 * v2.0: 赛季分割线替代赛季总结条目 —
 *   record() 新增 season 参数
 *   render() 自动在赛季变化时插入分割线
 *   赛季标记条目(type='season_mark')仅用于渲染分割线，不显示文本
 */
window.Game = window.Game || {};

window.Game.Timeline = (function() {
    'use strict';

    var S = window.Game.State;
    var UI = window.Game.UI;
    if (!S || !UI) throw new Error('[Timeline] 依赖 Game.State / Game.UI 未加载');

    /**
     * 记录一条时间线事件
     * @param {string} text - 事件描述 (空字符串 + type='season_mark' 表示赛季分割标记)
     * @param {string} [type='normal'] - 'normal' | 'gold' | 'bad' | 'season_mark'
     * @param {number} [season] - 所属赛季 (用于分割线判定)
     */
    function record(text, type, season) {
        type = type || 'normal';
        var s = S.get();
        var entry = { age: s.age, text: text, type: type };
        if (season !== undefined) entry.season = season;
        else entry.season = s.season;
        s.timeline.push(entry);
    }

    /**
     * 渲染时间线 DOM
     */
    function render() {
        var s = S.get();
        var container = UI.dom().timelineContainer;
        container.innerHTML = '';
        var Icons = window.Game.Icons;

        var lastSeason = 0;

        s.timeline.forEach(function(item, index) {
            // 赛季分割标记
            if (item.type === 'season_mark') {
                var divider = _createSeasonDivider(item.season);
                container.appendChild(divider);
                lastSeason = item.season;
                return;
            }

            // 旧式赛季总结 (兼容): 如有season字段且与上一条不同，插入分割线
            if (item.season && item.season !== lastSeason && item.type === 'normal' &&
                (item.text.indexOf('赛季结束') !== -1 || item.text.indexOf('赛季') !== -1)) {
                // 跳过旧的赛季总结文本条目，改为分割线
                var div2 = _createSeasonDivider(item.season);
                container.appendChild(div2);
                lastSeason = item.season;
                return;
            }

            var el = document.createElement('div');
            el.className = 'timeline-item';

            var isMilestone = item.type === 'gold' || item.type === 'bad';
            var textClass = isMilestone ? 'timeline-milestone' : '';
            var displayText = (Icons && Icons.replaceEmoji) ? Icons.replaceEmoji(item.text, 14) : item.text;

            // 里程碑圆点样式
            var dotClass = 'timeline-dot';
            if (isMilestone) dotClass += ' timeline-milestone-dot';
            if (item.type === 'bad') dotClass += ' timeline-bad-dot';

            el.innerHTML =
                '<div class="' + dotClass + '"></div>' +
                '<div class="timeline-content">' +
                    '<div class="timeline-year">' + item.age + '岁</div>' +
                    '<div class="timeline-text ' + textClass + '">' + displayText + '</div>' +
                '</div>';

            container.appendChild(el);
            if (item.season) lastSeason = item.season;
        });
    }

    /**
     * 创建赛季分割线 DOM
     */
    function _createSeasonDivider(seasonNum) {
        var el = document.createElement('div');
        el.className = 'timeline-season-divider';
        el.innerHTML = '<span>第 ' + seasonNum + ' 赛季</span>';
        return el;
    }

    /**
     * 逐条飞入动画
     */
    function animateShow() {
        var items = document.querySelectorAll('.timeline-item, .timeline-season-divider');
        items.forEach(function(item, index) {
            setTimeout(function() {
                item.classList.add('show');
            }, index * 120);
        });
    }

    /**
     * 清空时间线容器
     */
    function clear() {
        UI.dom().timelineContainer.innerHTML = '';
    }

    return { record: record, render: render, animateShow: animateShow, clear: clear };
})();
