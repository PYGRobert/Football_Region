/**
 * animation.js — 动画工具模块
 * 无外部依赖，提供 requestAnimationFrame 封装和动画队列
 */
window.Game = window.Game || {};

window.Game.Animation = (function() {
    'use strict';

    /** @type {Map<string, number>} 动画帧ID映射 */
    var _animationFrames = {};

    /** @type {Map<string, number>} 动画开始时间映射 */
    var _animationStartTimes = {};

    /**
     * 使用 requestAnimationFrame 执行动画
     * @param {string} id - 动画唯一标识
     * @param {Function} callback - 每帧回调，接收 (progress, deltaTime)
     * @param {number} duration - 动画时长（ms）
     * @param {Function} [easingFn] - 缓动函数，默认为 easeOutCubic
     * @returns {Promise<void>} 动画完成时的Promise
     */
    function animate(id, callback, duration, easingFn) {
        // 取消同ID的旧动画
        cancel(id);

        easingFn = easingFn || easeOutCubic;

        return new Promise(function(resolve) {
            var startTime = performance.now();
            _animationStartTimes[id] = startTime;

            function tick(currentTime) {
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var easedProgress = easingFn(progress);

                callback(easedProgress, elapsed);

                if (progress < 1) {
                    _animationFrames[id] = requestAnimationFrame(tick);
                } else {
                    delete _animationFrames[id];
                    delete _animationStartTimes[id];
                    resolve();
                }
            }

            _animationFrames[id] = requestAnimationFrame(tick);
        });
    }

    /**
     * 取消指定动画
     * @param {string} id - 动画唯一标识
     */
    function cancel(id) {
        if (_animationFrames[id]) {
            cancelAnimationFrame(_animationFrames[id]);
            delete _animationFrames[id];
            delete _animationStartTimes[id];
        }
    }

    /**
     * 取消所有动画
     */
    function cancelAll() {
        Object.keys(_animationFrames).forEach(function(id) {
            cancelAnimationFrame(_animationFrames[id]);
        });
        _animationFrames = {};
        _animationStartTimes = {};
    }

    /**
     * 检查动画是否正在运行
     * @param {string} id - 动画唯一标识
     * @returns {boolean}
     */
    function isRunning(id) {
        return _animationFrames[id] !== undefined;
    }

    // ==================== 缓动函数 ====================

    /**
     * 缓出立方 - 开始快，结束慢
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * 缓入立方 - 开始慢，结束快
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    function easeInCubic(t) {
        return t * t * t;
    }

    /**
     * 缓入缓出 - 开始慢，中间快，结束慢
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * 弹性缓出
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    function easeOutElastic(t) {
        var c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    // ==================== 工具函数 ====================

    /**
     * 线性插值
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 进度 (0-1)
     * @returns {number}
     */
    function lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * 延迟执行
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise<void>}
     */
    function delay(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    }

    return {
        animate: animate,
        cancel: cancel,
        cancelAll: cancelAll,
        isRunning: isRunning,
        // 缓动函数
        easing: {
            easeOutCubic: easeOutCubic,
            easeInCubic: easeInCubic,
            easeInOutCubic: easeInOutCubic,
            easeOutElastic: easeOutElastic
        },
        // 工具函数
        utils: {
            lerp: lerp,
            delay: delay
        }
    };
})();
