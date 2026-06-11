/**
 * timeline.js — 时间线模块
 * 依赖: State, UI
 * 职责: 记录生涯事件、渲染结局时间线回顾
 */
window.Game = window.Game || {};

window.Game.Timeline = (function() {
    'use strict';

    var S = window.Game.State;
    var UI = window.Game.UI;
    if (!S || !UI) throw new Error('[Timeline] 依赖 Game.State / Game.UI 未加载');

    /**
     * 向时间线记录中添加一条事件
     * @param {string} text - 事件描述
     * @param {string} [type='normal'] - 'normal' | 'gold' | 'bad'
     */
    function record(text, type) {
        type = type || 'normal';
        var s = S.get();
        s.timeline.push({ age: s.age, text: text, type: type });
    }

    /**
     * 渲染时间线 DOM 到 #timelineContainer
     */
    function render() {
        var s = S.get();
        var container = UI.dom().timelineContainer;
        container.innerHTML = '';
        var Icons = window.Game.Icons;

        s.timeline.forEach(function(item, index) {
            var el = document.createElement('div');
            el.className = 'timeline-item';

            var isMilestone = item.type === 'gold' || item.type === 'bad';
            var textClass = isMilestone ? 'timeline-milestone' : '';
            var displayText = (Icons && Icons.replaceEmoji) ? Icons.replaceEmoji(item.text, 14) : item.text;

            el.innerHTML =
                '<div class="timeline-dot"></div>' +
                '<div class="timeline-content">' +
                    '<div class="timeline-year">' + item.age + '岁</div>' +
                    '<div class="timeline-text ' + textClass + '">' + displayText + '</div>' +
                '</div>';

            container.appendChild(el);
        });
    }

    /**
     * 触发时间线逐条飞入动画
     */
    function animateShow() {
        var items = document.querySelectorAll('.timeline-item');
        items.forEach(function(item, index) {
            setTimeout(function() {
                item.classList.add('show');
            }, index * 150);
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
