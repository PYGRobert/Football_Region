/**
 * constants.js — 常量定义模块
 * 无外部依赖，仅定义游戏用到的所有常量
 */
window.Game = window.Game || {};

window.Game.Constants = (function() {
    'use strict';

    // --- 四维属性标签 ---
    const STAT_LABELS = {
        physical: '体质',
        fame: '名望',
        team: '团队',
        mood: '情绪'
    };

    const STAT_KEYS = ['physical', 'fame', 'team', 'mood'];

    // --- 稀有度权重（用于随机事件选择） ---
    const RARITY_WEIGHTS = {
        common: 6,
        uncommon: 3,
        rare: 1,
        epic: 1
    };

    // --- 游戏初始状态模板 ---
    const INITIAL_STATE = {
        physical: 60,
        fame: 28,
        team: 45,
        mood: 50,
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
        _peakFame: 28,
        currentChainId: null,
        chainStep: 0,
        completedChains: [],
        timeline: [{ age: 18, text: '开启职业生涯，加入青训营', type: 'normal' }],
        isEndingPhase: false,
        // 所有 milestoneFlags 统一为 false，由 state.js 初始化
    };

    // --- 里程碑模板（用于重置） ---
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
        heroTrophy: false
    };

    // --- 数值边界 ---
    const STAT_MIN = 0;
    const STAT_MAX = 100;
    const DANGER_LOW_THRESHOLD = 16;
    const DANGER_HIGH_THRESHOLD = 88;
    const RETIREMENT_AGE = 35;
    const AGE_DECAY_START = 30;      // 30岁开始体质自然衰退
    const AGE_DECAY_SEVERE = 34;     // 34岁衰退加剧
    const AGE_DECAY_MILD_AMOUNT = 2;
    const AGE_DECAY_SEVERE_AMOUNT = 3;
    const EVENTS_PER_SEASON_MIN = 8;
    const EVENTS_PER_SEASON_RANGE = 6;
    const RECENT_EVENT_MEMORY = 15;
    const SWIPE_THRESHOLD_RATIO = 0.3; // 卡片宽度的30%作为滑动阈值

    // --- 动画时长（ms） ---
    const FLY_ANIMATION_DURATION = 350;
    const ENTER_ANIMATION_DURATION = 400;
    const SWIPE_SIMULATE_DELAY = 180;
    const TOAST_DEFAULT_DURATION = 1500;
    const TOAST_MILESTONE_DURATION = 2500;

    // --- 粒子数量 ---
    const PARTICLE_COUNT = 22;

    // --- 公开 API ---
    return {
        STAT_LABELS,
        STAT_KEYS,
        RARITY_WEIGHTS,
        INITIAL_STATE,
        MILESTONE_FLAGS_TEMPLATE,
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
        SWIPE_THRESHOLD_RATIO,
        FLY_ANIMATION_DURATION,
        ENTER_ANIMATION_DURATION,
        SWIPE_SIMULATE_DELAY,
        TOAST_DEFAULT_DURATION,
        TOAST_MILESTONE_DURATION,
        PARTICLE_COUNT
    };
})();
