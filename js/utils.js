/**
 * utils.js — 工具函数模块
 * 无外部依赖，提供 clamp 数值钳制 和 getPos 触摸/鼠标坐标获取
 */
window.Game = window.Game || {};

window.Game.Utils = (function() {
    'use strict';

    /**
     * 将数值 v 钳制在 [min, max] 区间内
     * @param {number} v
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    /**
     * 从触摸事件或鼠标事件中提取统一的坐标 { x, y }
     * @param {Event} e - 触摸或鼠标事件
     * @returns {{ x: number, y: number }}
     */
    function getPos(e) {
        if (e.touches && e.touches.length) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    return { clamp, getPos };
})();
