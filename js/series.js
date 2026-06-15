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

        // 防御性检查: _continueSeries 会在调用 getNextEventId 前处理 failedAtKeyNode,
        // 此分支仅作为独立调用 getNextEventId 时的安全兜底
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

        // v2.3: CONDITIONAL_EXTEND — 动态步骤扩展
        if (def.judgeType === 'conditional_extend') {
            // 基础步骤内
            if (as.currentStep <= as.totalSteps) {
                var idx = as.currentStep - 1;
                if (idx < 0 || idx >= stepEvents.length) return null;
                return stepEvents[idx];
            }
            // 基础步骤结束, 检查是否扩展
            var ec = def.extendCondition;
            if (ec && (as._phase1Correct || 0) >= (ec.phase1Required || 0) &&
                (as._phase2Correct || 0) >= (ec.phase2Required || 0)) {
                // 扩展到加时
                if (!as._extended && def.extendEvents && def.extendEvents.length) {
                    as._extended = true;
                    as._extendedTotal = as.totalSteps + def.extendSteps;
                    as._extendPhaseStart = as.totalSteps;
                    // 重置phase计数用于扩展阶段
                    as._phase1Correct = 0; as._phase2Correct = 0;
                    return def.extendEvents[0];
                }
                // 扩展阶段内
                if (as._extended && as.currentStep <= as._extendedTotal) {
                    var extIdx = as.currentStep - as._extendPhaseStart - 1;
                    if (extIdx >= 0 && def.extendEvents && extIdx < def.extendEvents.length) {
                        return def.extendEvents[extIdx];
                    }
                }
                // 扩展阶段结束 → 判定
                if (as._extended && as.currentStep > as._extendedTotal) {
                    return (as.correctCount || 0) >= (def.extendRequired || 0)
                        ? def.successEndingEventId : def.failEndingEventId;
                }
            }
            // 不满足扩展条件或扩展后失败
            if (as.currentStep > as.totalSteps) {
                // v2.3: secondExtend (世界杯点球)
                if (def.secondExtend && as._extended && as.currentStep > as._extendedTotal) {
                    var se = def.secondExtend;
                    if ((as.correctCount || 0) >= (se.required || 0) && def.secondExtendEvents && def.secondExtendEvents.length) {
                        if (!as._secondExtended) {
                            as._secondExtended = true;
                            as._phase1Correct = 0; as._phase2Correct = 0;
                            return def.secondExtendEvents[0];
                        }
                    }
                }
                return def.failEndingEventId || null;
            }
            return null;
        }

        // 最终步判定
        if (as.currentStep > as.totalSteps) {
            // v2.3: SPLIT_COUNTER
            if (def.judgeType === 'split_counter') {
                var p1ok = (as._phase1Correct || 0) >= (def.phase1Required || 0);
                var p2ok = (as._phase2Correct || 0) >= (def.phase2Required || 0);
                return (p1ok && p2ok) ? def.successEndingEventId : def.failEndingEventId;
            }
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

        // v2.2: 边界守卫 — 防止系列步骤溢出 (currentStep 不应超过 totalSteps)
        if (as.currentStep > as.totalSteps) {
            console.warn('[Series] advanceStep 拒绝: 步骤已超界 (currentStep=' +
                as.currentStep + ' > totalSteps=' + as.totalSteps + ')');
            return;
        }

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

        // counter / split_counter 累积
        var cs = stepCorrectSide || (def ? def.correctSide : null);
        if (def && (def.judgeType === C.JUDGE_TYPE.COUNTER || def.judgeType === 'split_counter' || def.judgeType === 'conditional_extend') && cs) {
            var isCorrect = (direction === cs);
            if (isCorrect) {
                as.correctCount++;
            }
            // v2.3: SPLIT_COUNTER — 分阶段分别计数
            if (def.judgeType === 'split_counter' && def.splitPoint) {
                if (!as._phase1Correct) as._phase1Correct = 0;
                if (!as._phase2Correct) as._phase2Correct = 0;
                if (as.currentStep <= def.splitPoint) {
                    if (isCorrect) as._phase1Correct++;
                } else {
                    if (isCorrect) as._phase2Correct++;
                }
            }
            // v2.3: CONDITIONAL_EXTEND — 同样分阶段
            if (def.judgeType === 'conditional_extend' && def.extendCondition) {
                if (!as._phase1Correct) as._phase1Correct = 0;
                if (!as._phase2Correct) as._phase2Correct = 0;
                // phase1: 半场型事件(奇数步), phase2: 下半场/关键时刻(偶数步)
                if (as.currentStep % 2 === 1) {
                    if (isCorrect) as._phase1Correct++;
                } else {
                    if (isCorrect) as._phase2Correct++;
                }
            }
            console.log('[Series] 正确?', isCorrect, '步' + as.currentStep, direction, (isCorrect ? '==' : '!='), cs);
        }

        // 追踪最后一步的正确性 (用于链式续接判断)
        if (cs) {
            as._lastStepCorrect = (direction === cs);
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
        // v2.3: CONDITIONAL_EXTEND — 已扩展过的步骤视为完成
        if (as._extended && as.currentStep > as._extendedTotal) return true;
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

        // 查找系列定义 (用于 nextSeriesId 和 tension)
        var def = _seriesRegistry[as.id];

        // v2.2: 累积压力 — 系列结束后一次性累加
        var seriesTension = as._tension || (def && def.tension) || C.TENSION.MODERATE;
        s.pressureLevel += seriesTension;

        // 链式续接 + v2.3非连续解锁: 只在阶段成功时触发
        var stageSuccess = true;
        if (def) {
            if (def.judgeType === C.JUDGE_TYPE.COUNTER && def.requiredCorrect) {
                stageSuccess = (as.correctCount || 0) >= def.requiredCorrect;
            } else if (def.judgeType === 'split_counter') {
                var p1ok = (as._phase1Correct || 0) >= (def.phase1Required || 0);
                var p2ok = (as._phase2Correct || 0) >= (def.phase2Required || 0);
                stageSuccess = p1ok && p2ok;
            } else if (def.judgeType === 'conditional_extend') {
                // 扩展阶段成功判定
                if (as._extended && def.extendRequired) {
                    stageSuccess = (as.correctCount || 0) >= def.extendRequired;
                } else if (as._secondExtended && def.secondExtend) {
                    stageSuccess = (as.correctCount || 0) >= (def.secondExtend.required || 0);
                } else {
                    // 基础阶段: 按 extendCondition 判定
                    var ec = def.extendCondition;
                    stageSuccess = ec ? ((as._phase1Correct || 0) >= (ec.phase1Required || 0) && (as._phase2Correct || 0) >= (ec.phase2Required || 0)) : true;
                }
            } else if (def.judgeType === C.JUDGE_TYPE.KEYNODE) {
                stageSuccess = !as.failedAtKeyNode;
            }
        }
        // TREE 类型由最后一步决定
        if (def && def.type === C.SERIES_TYPE.TREE && as._lastStepCorrect !== undefined) {
            stageSuccess = as._lastStepCorrect;
        }

        if (def && def.nextSeriesId && !s._debugNoChain) {
            if (stageSuccess) {
                s.eventsSinceLastSeries = 999;
                s._pendingNextSeries = def.nextSeriesId;
                console.log('[Series] 链式续接: ' + as.id + ' → ' + def.nextSeriesId);
            } else {
                s.eventsSinceLastSeries = 0;
                console.log('[Series] 阶段失败, 不续接: ' + as.id);
            }
        } else if (def && def.boostAfterSuccess && stageSuccess) {
            // v2.3: 非连续解锁 — 成功后调高下一轮概率
            s.eventsSinceLastSeries = 5;
            console.log('[Series] 解锁下一轮 (boostAfterSuccess): ' + as.id);
        } else {
            s.eventsSinceLastSeries = 0;
        }

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
