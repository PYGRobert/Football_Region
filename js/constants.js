/**
 * constants.js — 常量定义模块 (v1.4)
 * 无外部依赖，仅定义游戏用到的所有常量
 *
 * v1.4 改动:
 *   - 四属性重制: 财富/能力/团队/野心（双刃剑体系）
 *   - 新增隐藏声望系统（玩家不可见，仅结局判定使用）
 *   - 平方增长阈值: 1→9→25→49→81
 *   - 退役年龄提升至38岁
 */
window.Game = window.Game || {};

window.Game.Constants = (function() {
    'use strict';

    // --- 新四维属性标签 ---
    const STAT_LABELS = {
        wealth: '财富',
        ability: '能力',
        team: '团队',
        ambition: '野心'
    };

    const STAT_KEYS = ['wealth', 'ability', 'team', 'ambition'];

    // --- 旧→新属性键名映射（用于事件兼容层） ---
    // 事件数据暂时保留旧键名(physical/fame/mood/team)
    // 运行时通过此映射转换为新状态键名
    const STAT_KEY_MAP = {
        physical: 'ability',
        fame: 'reputation',     // 隐藏声望
        mood: 'ambition',
        team: 'team'            // 保持不变
    };

    // --- 声望等级体系 ---
    // 平方增长阈值: 1²→3²→5²→7²→9²
    // 越往上越难爬升，世界级需要长期积累
    const REPUTATION_LEVELS = [
        { key: 'unknown',   name: '默默无闻', min: 0,  max: 8 },
        { key: 'minor',     name: '小有名气', min: 9,  max: 24 },
        { key: 'national',  name: '国内享誉', min: 25, max: 48 },
        { key: 'continental', name: '扬名大洲', min: 49, max: 80 },
        { key: 'world',     name: '世界级',   min: 81, max: Infinity }
    ];

    // --- 稀有度权重（用于随机事件选择） ---
    const RARITY_WEIGHTS = {
        common: 6,
        uncommon: 3,
        rare: 1,
        epic: 1
    };

    // --- 游戏初始状态模板 ---
    const INITIAL_STATE = {
        wealth: 30,
        ability: 25,
        team: 50,
        ambition: 35,
        reputation: 1,            // 隐藏声望，初始1
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
        _peakReputation: 1,
        currentChainId: null,
        chainStep: 0,
        completedChains: [],
        timeline: [{ age: 18, text: '开启职业生涯，加入青训营', type: 'normal' }],
        isEndingPhase: false
    };

    // --- 里程碑模板（用于重置） ---
    const MILESTONE_FLAGS_TEMPLATE = {
        // 旧事件兼容的里程碑（保持不变）
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
        // v1.4 新增三大赛事冠军里程碑（用于球王结局判定）
        leagueChampion: false,
        championsLeagueWinner: false,
        worldCupWinner: false
    };

    // --- 数值边界 ---
    const STAT_MIN = 0;
    const STAT_MAX = 100;
    const DANGER_LOW_THRESHOLD = 16;
    const DANGER_HIGH_THRESHOLD = 88;
    const RETIREMENT_AGE = 38;
    const AGE_DECAY_START = 32;      // 32岁能力开始自然衰退
    const AGE_DECAY_SEVERE = 36;     // 36岁衰退加剧
    const AGE_DECAY_MILD_AMOUNT = 2;
    const AGE_DECAY_SEVERE_AMOUNT = 3;
    const EVENTS_PER_SEASON_MIN = 8;
    const EVENTS_PER_SEASON_RANGE = 6;
    const RECENT_EVENT_MEMORY = 15;
    const SWIPE_THRESHOLD_RATIO = 0.1; // 卡片宽度的10%作为滑动阈值

    // --- 结局判定阈值 ---
    const HIDDEN_ENDING_THRESHOLD = 60;  // 球队名宿/球王：四属性全部>=60

    // --- 调试开关 ---
    const DEBUG_SHOW_REPUTATION = false;  // 开发时设为true可在UI上看到声望值

    // --- 动画时长（ms） ---
    const FLY_ANIMATION_DURATION = 350;
    const ENTER_ANIMATION_DURATION = 400;
    const SWIPE_SIMULATE_DELAY = 180;
    const TOAST_DEFAULT_DURATION = 1500;
    const TOAST_MILESTONE_DURATION = 2500;

    // --- 粒子数量 ---
    const PARTICLE_COUNT = 22;

    // --- 声望等级辅助函数 ---
    /**
     * 根据声望值获取当前等级信息
     * @param {number} rep - 声望值
     * @returns {{ key:string, name:string, min:number, max:number }}
     */
    function getReputationLevel(rep) {
        for (var i = REPUTATION_LEVELS.length - 1; i >= 0; i--) {
            if (rep >= REPUTATION_LEVELS[i].min) {
                return REPUTATION_LEVELS[i];
            }
        }
        return REPUTATION_LEVELS[0];
    }

    // --- 公开 API ---
    return {
        STAT_LABELS,
        STAT_KEYS,
        STAT_KEY_MAP,
        REPUTATION_LEVELS,
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
        HIDDEN_ENDING_THRESHOLD,
        DEBUG_SHOW_REPUTATION,
        FLY_ANIMATION_DURATION,
        ENTER_ANIMATION_DURATION,
        SWIPE_SIMULATE_DELAY,
        TOAST_DEFAULT_DURATION,
        TOAST_MILESTONE_DURATION,
        PARTICLE_COUNT,
        getReputationLevel: getReputationLevel
    };
})();
