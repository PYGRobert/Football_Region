/**
 * series.js — 系列事件状态机模块 (v2.2)
 * 依赖: State, Constants, Flags
 * 职责: 系列事件的启动/推进/结束、钩子管理(通过Flags模块)、调度查询
 *
 * v2.2: 集成Flags模块 — processHook改用Flags.add(), checkForeshadowTrigger改用Flags.atThreshold()
 *       新增 getSeriesTension() 供调度器使用
 * v2.1: 赛季容量预判
 * v2.0: 全新模块 — 树状/线性/伏笔
 */
window.Game = window.Game || {};

window.Game.Series = (function() {
    'use strict';

    var S = window.Game.State;
    var C = window.Game.Constants;
    var Flags = window.Game.Flags;
    if (!S || !C) throw new Error('[Series] 依赖 Game.State / Game.Constants 未加载');
    if (!Flags) throw new Error('[Series] 依赖 Game.Flags 未加载');

    // ==================== 系列注册表 ====================

    /** @type {object} 系列定义注册表 */
    var _seriesRegistry = {};

    /**
     * 注册系列定义
     * @param {object} seriesDef - 系列定义对象
     */
    function registerSeries(seriesDef) {
        if (!seriesDef || !seriesDef.id) return;
        _seriesRegistry[seriesDef.id] = seriesDef;
    }

    // ==================== 系列生命周期 ====================

    /**
     * 启动系列
     * @param {string} seriesId - 系列ID
     */
    function startSeries(seriesId) {
        var s = S.get();
        var def = _seriesRegistry[seriesId];
        if (!def) {
            console.error('[Series] 未找到系列定义:', seriesId);
            return null;
        }

        // 赛季容量检查
        var remaining = s.eventsPerSeason - s.eventsThisSeason;
        var capacitySufficient = remaining >= def.totalSteps;

        s.activeSeries = {
            type: def.type,
            id: seriesId,
            currentStep: 1,
            totalSteps: def.totalSteps,
            correctCount: 0,
            branchPath: [],
            failedAtKeyNode: false,
            _tension: def.tension || C.TENSION.MODERATE,  // v2.2: 系列张力
            _seasonCapacitySufficient: capacitySufficient
        };

        // 更新赛季计数
        if (def.type === C.SERIES_TYPE.TREE) {
            s.seriesThisSeason.tree++;
        } else if (def.type === C.SERIES_TYPE.LINEAR) {
            s.seriesThisSeason.linear++;
        }

        console.log('[Series] 启动系列:', seriesId,
            '(类型:', def.type, '张力:', s.activeSeries._tension,
            '步数:', def.totalSteps,
            '容量:', capacitySufficient ? '充足' : '不足');
        return s.activeSeries;
    }

    /**
     * v2.2: 获取当前进行中系列的张力
     * @returns {number} 张力值(-1/1/2/4), 无系列返回0
     */
    function getSeriesTension() {
        var s = S.get();
        if (s.activeSeries && s.activeSeries._tension) {
            return s.activeSeries._tension;
        }
        return 0; // 无系列
    }

    /**
     * 获取系列进行中的下一步事件ID
     * @param {string|null} direction - 'left'|'right'
     * @returns {string|null}
     */
    function getNextEventId(direction) {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return null;

        var def = _seriesRegistry[as.id];
        if (!def) return null;

        if (as.failedAtKeyNode && def.failNext) {
            return def.failNext;
        }

        switch (as.type) {
            case C.SERIES_TYPE.TREE:
                return _getTreeNext(as, def, direction);
            case C.SERIES_TYPE.LINEAR:
                return _getLinearNext(as, def, direction);
            case C.SERIES_TYPE.FORESHADOW:
                return _getForeshadowNext(as, def);
            default:
                console.error('[Series] 未知系列类型:', as.type);
                return null;
        }
    }

    // ==================== 路由子方法 ====================

    function _getTreeNext(as, def, direction) {
        if (as.currentStep === 1) {
            return def.step1EventId;
        }
        if (as.currentStep === 2) {
            var branch = as.branchPath[0];
            if (branch === 'left') return as._nextLeft || def.step2aEventId || null;
            if (branch === 'right') return as._nextRight || def.step2bEventId || null;
            return null;
        }
        // step 3: 叶子结局 — 从第二步事件series.nextLeft/nextRight路由
        if (as.currentStep === 3) {
            var step2Dir = as.branchPath[1];
            if (step2Dir === 'left') return as._nextLeft || null;
            if (step2Dir === 'right') return as._nextRight || null;
            return null;
        }
        return null;
    }

    function _getLinearNext(as, def, direction) {
        var stepEvents = def.stepEvents;
        if (!stepEvents || !stepEvents.length) return null;

        // 已失败
        if (as.failedAtKeyNode) return def.failNext || null;

        // 最终步判定
        if (as.currentStep > as.totalSteps) {
            if (def.judgeType === C.JUDGE_TYPE.COUNTER) {
                return as.correctCount >= def.requiredCorrect
                    ? def.successEndingEventId : def.failEndingEventId;
            }
            if (def.judgeType === C.JUDGE_TYPE.KEYNODE) {
                return def.successEndingEventId || null;
            }
            return null;
        }

        var idx = as.currentStep - 1;
        if (idx < 0 || idx >= stepEvents.length) return null;
        return stepEvents[idx];
    }

    function _getForeshadowNext(as, def) {
        var stepEvents = def.stepEvents;
        if (!stepEvents || !stepEvents.length) return null;
        if (as.currentStep > as.totalSteps) return null;
        var idx = as.currentStep - 1;
        if (idx < 0 || idx >= stepEvents.length) return null;
        return stepEvents[idx];
    }

    // ==================== 推进系列 ====================

    /**
     * 推进系列到下一步
     * @param {string} direction - 'left' | 'right'
     * @param {string} [nextLeft] - 树状: 当前事件左分支的下一步事件ID
     * @param {string} [nextRight] - 树状: 当前事件右分支的下一步事件ID
     */
    function advanceStep(direction, nextLeft, nextRight, stepCorrectSide) {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return;

        var def = _seriesRegistry[as.id];

        // 树状: 存储路由信息
        if (def && def.type === C.SERIES_TYPE.TREE && nextLeft !== undefined) {
            as._nextLeft = nextLeft;
            as._nextRight = nextRight;
        }

        // keynode 判定
        if (def && def.judgeType === C.JUDGE_TYPE.KEYNODE && def.keyNodes) {
            var requiredSide = def.keyNodes[as.currentStep];
            if (requiredSide && direction !== requiredSide) {
                as.failedAtKeyNode = true;
                console.log('[Series] 关键节点失败: 步', as.currentStep, '需', requiredSide, '得', direction);
                return;
            }
        }

        // counter 累积: 优先 stepCorrectSide, 回退到系列级
        var cs = stepCorrectSide || (def ? def.correctSide : null);
        if (def && def.judgeType === C.JUDGE_TYPE.COUNTER && cs) {
            if (direction === cs) {
                as.correctCount++;
                console.log('[Series] 正确! 步' + as.currentStep + ' ' + direction + '==' + cs);
            } else {
                console.log('[Series] 错误 步' + as.currentStep + ' ' + direction + '!=' + cs);
            }
        }

        // 记录分支并推进
        as.branchPath.push(direction);
        as.currentStep++;

        console.log('[Series] 推进:', as.id,
            '步', as.currentStep, '/', as.totalSteps,
            '分支:', as.branchPath.join('→'),
            '正确:', as.correctCount);
    }

    function isLastStep() {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return false;
        return as.currentStep > as.totalSteps || as.failedAtKeyNode;
    }

    /**
     * 结束系列
     */
    function endSeries() {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return null;

        if (s.completedSeries.indexOf(as.id) === -1) {
            s.completedSeries.push(as.id);
        }

        var ended = as;
        s.activeSeries = null;

        // v2.2: 累积压力 — 系列结束后一次性累加
        // 使用 as._tension (在 startSeries 时已存入)，而非未定义的 def
        var seriesTension = as._tension || C.TENSION.MODERATE;
        s.pressureLevel += seriesTension;
        s.eventsSinceLastSeries = 0;
        if (s.pressureLevel >= C.PRESSURE_CAP) {
            s.decompressing = true;
            console.log('[Series] 压力 +' + seriesTension + ' → ' + s.pressureLevel + ' [进入减压]');
        } else {
            console.log('[Series] 压力 +' + seriesTension + ' → ' + s.pressureLevel);
        }

        // 赛季容量结算
        if (ended._seasonCapacitySufficient) {
            s.eventsThisSeason += ended.totalSteps;
            if (s.eventsThisSeason >= s.eventsPerSeason) {
                s.pendingSeasonEnd = true;
            }
        } else {
            s.pendingSeasonEnd = true;
        }

        console.log('[Series] 结束:', ended.id,
            '容量' + (ended._seasonCapacitySufficient ? '充足' : '不足'),
            '赛季事件:', s.eventsThisSeason + '/' + s.eventsPerSeason,
            (s.pendingSeasonEnd ? ' [赛季收尾]' : ''));
        return ended;
    }

    // ==================== 钩子管理 (v2.2: 通过Flags模块) ====================

    /**
     * 处理钩子: 日常事件选择后递增伏笔计数器
     * @param {string} counterKey - 计数器标志名
     */
    function processHook(counterKey) {
        if (!counterKey) return;
        Flags.add(counterKey, 1);
    }

    /**
     * 检查是否有伏笔系列达到触发阈值
     * @returns {string|null} 应触发的系列ID
     */
    function checkForeshadowTrigger() {
        var s = S.get();

        for (var seriesId in _seriesRegistry) {
            var def = _seriesRegistry[seriesId];
            if (def.type !== C.SERIES_TYPE.FORESHADOW) continue;
            if (s.completedSeries.indexOf(seriesId) !== -1) continue;

            var counterKey = def.counterKey;
            if (Flags.atThreshold(counterKey)) {
                console.log('[Series] 伏笔触发:', seriesId,
                    '(计数器:', counterKey, '阈值:', def.hookThreshold, ')');
                return seriesId;
            }
        }
        return null;
    }

    // ==================== 调度查询 ====================

    /**
     * 获取可启动的系列列表（树状和线性）
     * @returns {Array}
     */
    function getAvailableSeries() {
        var s = S.get();
        var available = [];

        for (var seriesId in _seriesRegistry) {
            var def = _seriesRegistry[seriesId];
            if (def.type === C.SERIES_TYPE.FORESHADOW) continue;
            if (s.completedSeries.indexOf(seriesId) !== -1) continue;
            if (def.type === C.SERIES_TYPE.TREE &&
                s.seriesThisSeason.tree >= C.SERIES_PER_SEASON_TREE_MAX) continue;
            if (def.type === C.SERIES_TYPE.LINEAR &&
                s.seriesThisSeason.linear >= C.SERIES_PER_SEASON_LINEAR_MAX) continue;
            if (def.conditionFn && !def.conditionFn(s)) continue;

            available.push(def);
        }
        return available;
    }

    /**
     * 获取系列进度信息 (供UI渲染)
     * @returns {object|null}
     */
    function getSeriesProgress() {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return null;

        var def = _seriesRegistry[as.id];
        if (!def) return null;

        var displayStep = Math.min(as.currentStep, as.totalSteps);
        var dots = '';
        for (var i = 1; i <= as.totalSteps; i++) {
            dots += i <= displayStep ? '●' : '○';
        }

        var result = {
            progressText: displayStep + '/' + as.totalSteps,
            progressDots: dots,
            type: as.type,
            seriesId: as.id,
            seriesName: def.name || as.id
        };

        if (as.type === C.SERIES_TYPE.LINEAR && def.judgeType === C.JUDGE_TYPE.COUNTER) {
            result.correctCount = as.correctCount;
            result.requiredCorrect = def.requiredCorrect;
        }

        return result;
    }

    // ==================== 公开 API ====================

    return {
        registerSeries: registerSeries,
        startSeries: startSeries,
        getNextEventId: getNextEventId,
        advanceStep: advanceStep,
        isLastStep: isLastStep,
        endSeries: endSeries,
        processHook: processHook,
        checkForeshadowTrigger: checkForeshadowTrigger,
        getAvailableSeries: getAvailableSeries,
        getSeriesProgress: getSeriesProgress,
        getSeriesTension: getSeriesTension     // v2.2 新增
    };
})();
