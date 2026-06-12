/**
 * series.js — 系列事件状态机模块 (v2.0)
 * 依赖: State, Constants
 * 职责: 系列事件的启动/推进/结束、钩子计数器管理、调度查询
 *
 * v2.0: 全新模块 — 支持树状(tree)/线性(linear)/伏笔(foreshadow)三种系列类型
 */
window.Game = window.Game || {};

window.Game.Series = (function() {
    'use strict';

    var S = window.Game.State;
    var C = window.Game.Constants;
    if (!S || !C) throw new Error('[Series] 依赖 Game.State / Game.Constants 未加载');

    // ==================== 系列注册表 ====================

    /**
     * 系列定义注册表 (在 events_data.js 加载后由 events.js 填充)
     * { seriesId: { type, id, totalSteps, judgeType?, requiredCorrect?, ... } }
     */
    var _seriesRegistry = {};

    /**
     * 注册系列定义（events.js 解析事件数据时调用）
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

        s.activeSeries = {
            type: def.type,
            id: seriesId,
            currentStep: 1,
            totalSteps: def.totalSteps,
            correctCount: 0,
            branchPath: [],
            failedAtKeyNode: false
        };

        // 更新赛季计数
        if (def.type === C.SERIES_TYPE.TREE) {
            s.seriesThisSeason.tree++;
        } else if (def.type === C.SERIES_TYPE.LINEAR) {
            s.seriesThisSeason.linear++;
        }
        // 伏笔系列不计数（通过钩子自然触发）

        console.log('[Series] 启动系列:', seriesId, '(类型:', def.type, '步数:', def.totalSteps, ')');
        return s.activeSeries;
    }

    /**
     * 获取系列进行中的下一步事件ID
     * @param {string|null} direction - 玩家选择方向 'left'|'right' (仅树状和最终判定需要)
     * @returns {string|null} 下一步事件ID
     */
    function getNextEventId(direction) {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return null;

        var def = _seriesRegistry[as.id];
        if (!def) return null;

        // 如果已标记失败，返回 failNext 事件
        if (as.failedAtKeyNode && def.failNext) {
            return def.failNext;
        }

        // 根据类型路由
        switch (as.type) {
            case C.SERIES_TYPE.TREE:
                return _getTreeNext(as, def, direction);
            case C.SERIES_TYPE.LINEAR:
                return _getLinearNext(as, def, direction);
            case C.SERIES_TYPE.FORESHADOW:
                return _getForeshadowNext(as, def, direction);
            default:
                console.error('[Series] 未知系列类型:', as.type);
                return null;
        }
    }

    /**
     * 树状系列路由
     */
    function _getTreeNext(as, def, direction) {
        // 第一步从 series.step1EventId 开始
        if (as.currentStep === 1) {
            return def.step1EventId;
        }

        // 第二步: 从第一步的分支路由
        if (as.currentStep === 2) {
            // as.branchPath[0] 存储了第一步的选择方向
            var branch = as.branchPath[0];
            if (branch === 'left') return def.step2aEventId;
            if (branch === 'right') return def.step2bEventId;
            // 兜底: 查事件数据
            return branch === 'left' ? def.step2aEventId : def.step2bEventId;
        }

        // 第三步 (叶子): 从第二步的分支路由
        if (as.currentStep === 3) {
            var step2Dir = as.branchPath[1];
            if (step2Dir === 'left') return def.step3aL;
            if (step2Dir === 'right') return def.step3aR;
            // branchPath[1] 可能由第二步事件的 series.nextLeft/nextRight 指定
        }

        return null;
    }

    /**
     * 线性系列路由
     */
    function _getLinearNext(as, def, direction) {
        var stepEvents = def.stepEvents;
        if (!stepEvents || !stepEvents.length) return null;

        // keynode 制: 判定已前移到 advanceStep()
        // 此处仅处理路由
        if (def.judgeType === C.JUDGE_TYPE.KEYNODE) {
            if (as.failedAtKeyNode) {
                return def.failNext;
            }
            if (as.currentStep >= as.totalSteps) {
                return def.successEndingEventId;
            }
        }

        // counter 制: 正确数已在 advanceStep() 中累计
        // 此处仅处理最终判定
        if (def.judgeType === C.JUDGE_TYPE.COUNTER) {
            if (as.currentStep >= as.totalSteps) {
                return as.correctCount >= def.requiredCorrect
                    ? def.successEndingEventId
                    : def.failEndingEventId;
            }
        }

        // 非最终步: 返回下一步事件
        var idx = as.currentStep - 1;
        if (idx < 0 || idx >= stepEvents.length) return null;
        return stepEvents[idx] || null;
    }

    /**
     * 伏笔系列路由
     */
    function _getForeshadowNext(as, def, direction) {
        var stepEvents = def.stepEvents;
        if (!stepEvents || !stepEvents.length) return null;

        // 最终步: 返回结束标记
        if (as.currentStep > as.totalSteps) {
            return null;
        }

        var idx = as.currentStep - 1;
        if (idx < 0 || idx >= stepEvents.length) return null;
        return stepEvents[idx] || null;
    }

    /**
     * 推进系列到下一步 (在 applyChoice 中调用)
     * @param {string} direction - 'left' | 'right'
     */
    function advanceStep(direction) {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return;

        var def = _seriesRegistry[as.id];
        var curStep = as.currentStep; // 即将完成的选择步

        // keynode 判定 (在推进前检查，此时 direction 已知)
        if (def && def.judgeType === C.JUDGE_TYPE.KEYNODE && def.keyNodes) {
            var requiredSide = def.keyNodes[curStep];
            if (requiredSide && direction !== requiredSide) {
                as.failedAtKeyNode = true;
                console.log('[Series] 关键节点失败: 步', curStep,
                    '需要', requiredSide, '实际', direction);
                // 不推进 currentStep，直接返回
                return;
            }
        }

        // counter 制: 累积正确数 (在推进前判定当前步)
        if (def && def.judgeType === C.JUDGE_TYPE.COUNTER && def.correctSide) {
            if (direction === def.correctSide) {
                as.correctCount++;
            }
        }

        // 记录分支路径并推进
        as.branchPath.push(direction);
        as.currentStep++;

        console.log('[Series] 系列推进:', as.id,
            '步', as.currentStep, '/', as.totalSteps,
            '分支:', as.branchPath.join('→'),
            '正确数:', as.correctCount);
    }

    /**
     * 检查当前系列是否已到最后一步
     * @returns {boolean}
     */
    function isLastStep() {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return false;
        return as.currentStep >= as.totalSteps || as.failedAtKeyNode;
    }

    /**
     * 结束系列 (清理 activeSeries)
     */
    function endSeries() {
        var s = S.get();
        var as = s.activeSeries;
        if (!as) return null;

        // 标记为已完成
        if (s.completedSeries.indexOf(as.id) === -1) {
            s.completedSeries.push(as.id);
        }

        var ended = as;
        s.activeSeries = null;

        // 检查赛季容量: 系列事件不增加 eventsThisSeason
        // 但需要检查剩余事件是否足够
        if (s.eventsThisSeason >= s.eventsPerSeason) {
            s.pendingSeasonEnd = true;
        }

        console.log('[Series] 系列结束:', ended.id,
            '已完成系列:', s.completedSeries.length);
        return ended;
    }

    // ==================== 钩子管理 ====================

    /**
     * 处理钩子事件 (日常事件选择后调用)
     * @param {string} counterKey - 钩子计数器键名
     */
    function processHook(counterKey) {
        if (!counterKey) return;
        var s = S.get();
        if (s.hookCounters[counterKey] === undefined) {
            s.hookCounters[counterKey] = 1;
        } else {
            s.hookCounters[counterKey]++;
        }
        console.log('[Series] 钩子计数:', counterKey, '=', s.hookCounters[counterKey]);
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
            var threshold = def.hookThreshold || 3;
            var count = s.hookCounters[counterKey] || 0;

            if (count >= threshold) {
                console.log('[Series] 伏笔触发:', seriesId,
                    '(计数器:', counterKey, '=', count, '阈值:', threshold, ')');
                return seriesId;
            }
        }
        return null;
    }

    // ==================== 调度查询 ====================

    /**
     * 获取可启动的系列列表（树状和线性）
     * @returns {Array} 可启动的系列定义列表
     */
    function getAvailableSeries() {
        var s = S.get();
        var available = [];

        for (var seriesId in _seriesRegistry) {
            var def = _seriesRegistry[seriesId];

            // 只检查树状和线性（伏笔仅通过钩子触发）
            if (def.type === C.SERIES_TYPE.FORESHADOW) continue;
            // 每个生涯只触发一次
            if (s.completedSeries.indexOf(seriesId) !== -1) continue;
            // 赛季限制
            if (def.type === C.SERIES_TYPE.TREE &&
                s.seriesThisSeason.tree >= C.SERIES_PER_SEASON_TREE_MAX) continue;
            if (def.type === C.SERIES_TYPE.LINEAR &&
                s.seriesThisSeason.linear >= C.SERIES_PER_SEASON_LINEAR_MAX) continue;
            // 条件检查 (如果有 conditionFn 则评估)
            if (def.conditionFn && !def.conditionFn(s)) continue;
            // 赛季容量检查
            if (def.totalSteps > (s.eventsPerSeason - s.eventsThisSeason)) continue;

            available.push(def);
        }
        return available;
    }

    /**
     * 获取系列进度信息 (供 UI 渲染)
     * @returns {{ progressText: string, progressDots: string }|null}
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

        // 线性 counter 制额外信息
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
        getSeriesProgress: getSeriesProgress
    };
})();
