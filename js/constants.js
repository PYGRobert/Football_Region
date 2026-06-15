/**
 * constants.js — 常量定义模块 (v2.2)
 * 无外部依赖，仅定义游戏用到的所有常量
 *
 * v2.2: 事件系统重建 —
 *   新增四级张力系统(TENSION)、七大类别(CATEGORY)、标志位注册表(FLAG_REGISTRY)
 *   移除旧 STAT_KEY_MAP (v1.4遗留兼容)
 *   效果值统一使用绝对值(wealth/ability/team/ambition/reputation)
 * v2.1: 移除未使用的 _peakReputation 字段
 */
window.Game = window.Game || {};

window.Game.Constants = (function() {
    'use strict';

    // ==================== v2.2: 四级张力系统 ====================
    /**
     * 事件张力级别 — 控制叙事节奏
     * LIGHT:  轻松 — 呼吸事件、娱乐花边、场外趣闻
     * MILD:   轻度 — 普通独立事件、小决策
     * MODERATE: 中度 — 小系列、重要决策、因果触发事件
     * HEAVY:  重度 — 大赛系列、生涯转折、树状系列
     */
    const TENSION = {
        LIGHT:    -2,
        MILD:      1,
        MODERATE:  2,
        HEAVY:     4
    };

    /** 张力名称映射 */
    const TENSION_NAMES = { '-2': '轻松', '1': '轻度', '2': '中度', '4': '重度' };

    /**
     * 累积压力表: 事件/系列结束后压力 += tension值
     * 压力达到PRESSURE_CAP时强制LIGHT(-2)事件减压
     * 系列进行中压力不变(子弹时间)
     *
     * 压力效果: 0-3=正常, 4=仅LIGHT/MILD, 5+=强制LIGHT
     */
    const PRESSURE_CAP = 5;

    // ==================== v2.2: 七大事件类别 ====================
    const CATEGORY = {
        ON_FIELD:       'on_field',
        COACH_TACTICS:  'coach_tactics',
        LOCKER_ROOM:    'locker_room',
        MEDIA_FANS:     'media_fans',
        BUSINESS:       'business',
        TRANSFER:       'transfer',
        INJURY:         'injury'
    };

    /** 类别中文名映射 */
    const CATEGORY_NAMES = {
        on_field:       '场上决策',
        coach_tactics:  '教练战术',
        locker_room:    '更衣室',
        media_fans:     '媒体球迷',
        business:       '商业',
        transfer:       '转会',
        injury:         '伤病'
    };

    /** 类别对应的主属性聚焦 */
    const CATEGORY_STATS = {
        on_field:       { primary: 'ability',   secondary: ['team', 'ambition'] },
        coach_tactics:  { primary: 'team',      secondary: ['ability', 'ambition'] },
        locker_room:    { primary: 'team',      secondary: ['ambition'] },
        media_fans:     { primary: 'reputation', secondary: ['ambition', 'team'] },
        business:       { primary: 'wealth',    secondary: ['ambition'] },
        transfer:       { primary: 'ambition',  secondary: ['wealth', 'team', 'ability'] },
        injury:         { primary: 'ability',   secondary: ['team', 'ambition'] }
    };

    // ==================== v2.2: 标志位注册表 ====================
    /**
     * 所有标志位必须在此预定义。
     * 事件通过 flagsSet/flagsAdd/flagsClear 操作标志。
     * 条件通过 requireFlags/forbidFlags 检查标志。
     */
    const FLAG_REGISTRY = {
        // ── 布尔标志 (永久存储，除非主动清除) ──
        challenged_coach:      { type: 'boolean', desc: '公开挑战过教练' },
        rejected_big_transfer: { type: 'boolean', desc: '拒绝过豪门转会' },
        gave_captain_speech:   { type: 'boolean', desc: '作为队长发表过讲话' },
        played_through_injury: { type: 'boolean', desc: '打过封闭/带伤上场' },
        started_locker_fight:  { type: 'boolean', desc: '在更衣室挑起过冲突' },
        invested_restaurant:   { type: 'boolean', desc: '投资了餐厅' },
        took_agent_advice:     { type: 'boolean', desc: '听信了经纪人的建议' },
        publicly_criticized:   { type: 'boolean', desc: '公开批评过队友/教练' },
        transferred_to_big_club:{ type: 'boolean', desc: '转会到豪门俱乐部' },
        asked_for_transfer:    { type: 'boolean', desc: '主动要求过转会' },
        won_tournament:        { type: 'boolean', desc: '赢得过锦标赛' },
        became_captain:        { type: 'boolean', desc: '成为过球队队长' },
        bought_luxury:         { type: 'boolean', desc: '购买过奢侈品' },

        // ── 计数器标志 (累加至阈值触发伏笔系列) ──
        locker_tension:        { type: 'counter', max: 5, threshold: 3, desc: '更衣室张力' },
        coach_disrespect:      { type: 'counter', max: 3, threshold: 2, desc: '教练不满度' },
        media_heat:            { type: 'counter', max: 3, threshold: 2, desc: '媒体舆论压力' },
        injury_risk:           { type: 'counter', max: 3, threshold: 3, desc: '伤病风险累积' },
        agent_greed:           { type: 'counter', max: 5, threshold: 3, desc: '经纪人贪婪度' },

        // ── 计时器标志 (设置后N个事件自动归零) ──
        transfer_rumor:        { type: 'timer', decayAfter: 5, desc: '转会传闻' },
        fan_outrage:           { type: 'timer', decayAfter: 3, desc: '球迷愤怒' },
        form_slump:            { type: 'timer', decayAfter: 4, desc: '状态低谷' },
        coach_anger:           { type: 'timer', decayAfter: 4, desc: '教练怒气' },
        contract_talks:        { type: 'timer', decayAfter: 5, desc: '合同谈判期' },
        media_frenzy:          { type: 'timer', decayAfter: 3, desc: '媒体狂热' }
    };

    // ==================== 四维属性标签 ====================
    const STAT_LABELS = {
        wealth: '财富',
        ability: '能力',
        team: '团队',
        ambition: '野心'
    };

    const STAT_KEYS = ['wealth', 'ability', 'team', 'ambition'];

    // ==================== 声望等级体系 ====================
    const REPUTATION_LEVELS = [
        { key: 'unknown',   name: '默默无闻', min: 0,  max: 8 },
        { key: 'minor',     name: '小有名气', min: 9,  max: 24 },
        { key: 'national',  name: '国内享誉', min: 25, max: 48 },
        { key: 'continental', name: '扬名大洲', min: 49, max: 80 },
        { key: 'world',     name: '世界级',   min: 81, max: Infinity }
    ];

    // ==================== 效果显示级别映射 (v2.0 +/- 符号系统) ====================
    const EFFECT_LEVEL_MAP = [
        { max: 3,    symbol: '+' },
        { max: 6,    symbol: '++' },
        { max: 9,    symbol: '+++' },
        { max: 12,   symbol: '++++' },
        { max: Infinity, symbol: '+++++' }
    ];

    /**
     * 根据效果数值获取 +/- 符号字符串
     * @param {number} val - 效果值 (可为负数)
     * @returns {{symbol: string, cssClass: string}} 符号字符串和颜色类名
     */
    function getEffectSymbol(val) {
        var abs = Math.abs(val);
        var symbol = '';
        for (var i = 0; i < EFFECT_LEVEL_MAP.length; i++) {
            if (abs <= EFFECT_LEVEL_MAP[i].max) {
                symbol = EFFECT_LEVEL_MAP[i].symbol;
                break;
            }
        }
        return {
            symbol: val < 0 ? symbol.replace(/\+/g, '-') : symbol,
            cssClass: val > 0 ? 'effect-pos' : (val < 0 ? 'effect-neg' : 'effect-neutral')
        };
    }

    // ==================== 系列事件常量 ====================
    /** 每赛季系列事件上限 */
    const SERIES_PER_SEASON_TREE_MAX = 2;
    const SERIES_PER_SEASON_LINEAR_MAX = 20;

    /** 系列事件类型 */
    const SERIES_TYPE = {
        TREE: 'tree',
        LINEAR: 'linear',
        FORESHADOW: 'foreshadow'
    };

    /** 线性系列判定方式 */
    const JUDGE_TYPE = {
        COUNTER: 'counter',
        KEYNODE: 'keynode'
    };

    // ==================== 游戏初始状态模板 ====================
    const INITIAL_STATE = {
        wealth: 25,
        ability: 25,
        team: 25,
        ambition: 25,
        reputation: 1,
        age: 18,
        season: 1,
        eventCount: 0,
        eventsThisSeason: 0,
        eventsPerSeason: 10 + Math.floor(Math.random() * 5),
        isDragging: false,
        startX: 0,
        startY: 0,
        cardOffsetX: 0,
        cardOffsetY: 0,
        cardRotation: 0,
        isAnimating: false,
        gameOver: false,
        pendingEvent: null,
        recentEventIds: [],
        recentCategoryIds: [],  // v2.2: 近期出现过的类别(用于多样性惩罚)

        // v2.2: 事件系统
        flagStore: null,              // 由 flags.js init() 填充
        pressureLevel: 0,            // 累积压力, ≥5时强制LIGHT减压到≤0
        tutorialStep: 0,            // 青训期进度: 0=未开始, 1-8=进行中, 9=完成
        decompressing: false,       // 减压模式: true时强制LIGHT直到pressure≤0
        eventsSinceLastSeries: 0,   // 距上次系列的事件数(用于防止系列连发)
        eventCounter: 0,             // 总事件计数(用于timer衰减)
        unlockedEventIds: [],        // 被前置事件解锁的因果事件ID

        // 系列事件系统
        activeSeries: null,
        completedSeries: [],
        pendingSeasonEnd: false,
        seriesThisSeason: { tree: 0, linear: 0 },

        timeline: [{ age: 18, text: '开启职业生涯，加入青训营', type: 'normal', season: 1 }],
        isEndingPhase: false,
        isResultPhase: false
    };

    // ==================== 里程碑模板 ====================
    const MILESTONE_FLAGS_TEMPLATE = {
        firstGoal: false,
        firstTransfer: false,
        firstNationalTeam: false,
        firstTrophy: false,
        firstHatTrick: false,
        firstCaptainBand: false,
        worldCup: false,
        loyaltyAward: false,
        ambitionAward: false,
        peacemaker: false,
        fighter: false,
        teamplayer: false,
        courage: false,
        wisdom: false,
        teamTrophy: false,
        heroTrophy: false,
        derbyHero: false,
        headCoach: false,
        smartInvestor: false,
        championLeague: false,
        clubLegend: false,
        leagueChampion: false,
        championsLeagueWinner: false,
        worldCupWinner: false
    };

    // ==================== 数值边界 ====================
    const STAT_MIN = 0;
    const STAT_MAX = 100;
    const DANGER_LOW_THRESHOLD = 16;
    const DANGER_HIGH_THRESHOLD = 88;
    const RETIREMENT_AGE = 38;
    const AGE_DECAY_START = 32;
    const AGE_DECAY_SEVERE = 36;
    const AGE_DECAY_MILD_AMOUNT = 2;
    const AGE_DECAY_SEVERE_AMOUNT = 3;
    const EVENTS_PER_SEASON_MIN = 8;
    const EVENTS_PER_SEASON_RANGE = 6;
    const RECENT_EVENT_MEMORY = 15;
    const RECENT_CATEGORY_MEMORY = 3;    // v2.2: 类别多样性惩罚窗口
    const SWIPE_THRESHOLD_RATIO = 0.1;

    // ==================== 结局判定阈值 ====================
    const HIDDEN_ENDING_THRESHOLD = 60;

    // ==================== 调试开关 ====================
    const DEBUG_SHOW_REPUTATION = false;

    // ==================== 动画时长（ms） ====================
    const FLY_ANIMATION_DURATION = 350;
    const ENTER_ANIMATION_DURATION = 400;
    const SWIPE_SIMULATE_DELAY = 180;
    const TOAST_DEFAULT_DURATION = 1500;
    const TOAST_MILESTONE_DURATION = 2500;

    // ==================== 粒子数量 ====================
    const PARTICLE_COUNT = 22;

    // ==================== 辅助函数 ====================

    /**
     * 根据声望值获取声望等级
     * @param {number} rep - 声望值
     * @returns {object} 声望等级对象
     */
    function getReputationLevel(rep) {
        for (var i = REPUTATION_LEVELS.length - 1; i >= 0; i--) {
            if (rep >= REPUTATION_LEVELS[i].min) {
                return REPUTATION_LEVELS[i];
            }
        }
        return REPUTATION_LEVELS[0];
    }

    /** 青训期事件数量 */
    const TUTORIAL_EVENT_COUNT = 9;

    return {
        // v2.2 新系统
        TENSION,
        TENSION_NAMES,
        PRESSURE_CAP,
        CATEGORY,
        CATEGORY_NAMES,
        CATEGORY_STATS,
        FLAG_REGISTRY,
        TUTORIAL_EVENT_COUNT,

        // 属性
        STAT_LABELS,
        STAT_KEYS,

        // 声望
        REPUTATION_LEVELS,

        // 效果显示
        EFFECT_LEVEL_MAP,
        getEffectSymbol: getEffectSymbol,

        // 系列
        SERIES_PER_SEASON_TREE_MAX,
        SERIES_PER_SEASON_LINEAR_MAX,
        SERIES_TYPE,
        JUDGE_TYPE,

        // 状态模板
        INITIAL_STATE,
        MILESTONE_FLAGS_TEMPLATE,

        // 数值边界
        STAT_MIN,
        STAT_MAX,
        DANGER_LOW_THRESHOLD,
        DANGER_HIGH_THRESHOLD,
        RETIREMENT_AGE,
        AGE_DECAY_START,
        AGE_DECAY_SEVERE,
        AGE_DECAY_MILD_AMOUNT,
        AGE_DECAY_SEVERE_AMOUNT,
        EVENTS_PER_SEASON_MIN,
        EVENTS_PER_SEASON_RANGE,
        RECENT_EVENT_MEMORY,
        RECENT_CATEGORY_MEMORY,
        SWIPE_THRESHOLD_RATIO,
        HIDDEN_ENDING_THRESHOLD,
        DEBUG_SHOW_REPUTATION,

        // 动画
        FLY_ANIMATION_DURATION,
        ENTER_ANIMATION_DURATION,
        SWIPE_SIMULATE_DELAY,
        TOAST_DEFAULT_DURATION,
        TOAST_MILESTONE_DURATION,

        // 其他
        PARTICLE_COUNT,
        getReputationLevel: getReputationLevel
    };
})();
