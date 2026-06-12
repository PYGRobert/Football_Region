/**
 * events_data.js — 事件数据 (v2.0)
 * 定义所有系列定义(Game.SeriesDefs)和事件数据(Game.RawEvents)
 *
 * v2.0 事件体系:
 *   树状系列 (tree) — 3步4结局，隐藏数值，?展示
 *   线性系列 (linear) — counter制/keynode制，长因果叙事
 *   伏笔系列 (foreshadow) — 日常钩子触发，逐步升级
 *   日常事件 (daily) — 简单的1-3属性修改，可能携带钩子
 */
window.Game = window.Game || {};

// ==================== 系列定义 ====================
window.Game.SeriesDefs = {

    // ── 树状系列: 教练之路 (3步→4结局) ──
    coaching_path: {
        type: 'tree', id: 'coaching_path', name: '执教之路', totalSteps: 3,
        step1EventId: 'tree_coach_1',
        step2aEventId: 'tree_coach_2a', step2bEventId: 'tree_coach_2b',
        condition: 's.age>=24&&s.age<=34'
    },

    // ── 树状系列: 豪门邀约 (3步→4结局) ──
    transfer_crossroads: {
        type: 'tree', id: 'transfer_crossroads', name: '豪门邀约', totalSteps: 3,
        step1EventId: 'tree_trans_1',
        step2aEventId: 'tree_trans_2a', step2bEventId: 'tree_trans_2b',
        condition: 's.reputation>=25&&s.age<=32'
    },

    // ── 线性 counter制: 世界杯征途 (5步→成功/失败) ──
    worldcup_2026: {
        type: 'linear', id: 'worldcup_2026', name: '世界杯征途', totalSteps: 5,
        judgeType: 'counter', requiredCorrect: 3,
        stepEvents: ['linear_wc_1', 'linear_wc_2', 'linear_wc_3', 'linear_wc_4', 'linear_wc_5'],
        correctSide: 'left',
        successEndingEventId: 'leaf_wc_win',
        failEndingEventId: 'leaf_wc_lose',
        condition: 's.reputation>=35&&s.age<=34'
    },

    // ── 线性 counter制: 欧冠冲冠 (4步→成功/失败) ──
    champions_league_run: {
        type: 'linear', id: 'champions_league_run', name: '欧冠冲冠', totalSteps: 4,
        judgeType: 'counter', requiredCorrect: 3,
        stepEvents: ['linear_ucl_1', 'linear_ucl_2', 'linear_ucl_3', 'linear_ucl_4'],
        correctSide: 'left',
        successEndingEventId: 'leaf_ucl_win',
        failEndingEventId: 'leaf_ucl_lose',
        condition: 's.reputation>=49&&s.age<=33'
    },

    // ── 线性 keynode制: 经纪人摊牌 (4步, 2关键节点) ──
    agent_showdown: {
        type: 'linear', id: 'agent_showdown', name: '经纪人摊牌', totalSteps: 4,
        judgeType: 'keynode',
        keyNodes: { 2: 'left', 3: 'right' },
        stepEvents: ['linear_ag_1', 'linear_ag_2', 'linear_ag_3', 'linear_ag_4'],
        failNext: 'leaf_ag_fail',
        successEndingEventId: 'leaf_ag_win',
        condition: 's.ambition>=40'
    },

    // ── 伏笔系列: 更衣室风暴 (3步, 钩子: locker_tension ≥ 3) ──
    locker_room_crisis: {
        type: 'foreshadow', id: 'locker_room_crisis', name: '更衣室风暴', totalSteps: 3,
        counterKey: 'locker_tension', hookThreshold: 3,
        stepEvents: ['fore_lock_1', 'fore_lock_2', 'fore_lock_3']
    },

    // ── 伏笔系列: 队长袖标 (3步, 钩子: captain_ambition ≥ 3) ──
    captain_armband: {
        type: 'foreshadow', id: 'captain_armband', name: '队长袖标', totalSteps: 3,
        counterKey: 'captain_ambition', hookThreshold: 3,
        stepEvents: ['fore_cap_1', 'fore_cap_2', 'fore_cap_3']
    }
};

// ==================== 事件数据 ====================
window.Game.RawEvents = [

    // ═══════════════════════════════════════
    // 树状系列: 教练之路
    // ═══════════════════════════════════════

    {
        id: 'tree_coach_1',
        series: { type: 'tree', id: 'coaching_path', step: 1, totalSteps: 3,
                  nextLeft: 'tree_coach_2a', nextRight: 'tree_coach_2b' },
        hideEffects: true,
        effectsHintLeft:  { ability: '?', team: '?' },
        effectsHintRight: { ambition: '?', wealth: '?' },
        effectsLeft:  { ability: 8, team: 5 },
        effectsRight: { ambition: 6, wealth: -4 },
        choiceLeftLabel:  '接受助理教练职位',
        choiceRightLabel: '坚持作为球员上场',
        rarity: 'epic',
        title: '执教之路',
        description: '教练组私下找到你，希望你在退役前就兼任助理教练。他说你有战术天赋。但你还想踢球。'
    },
    {
        id: 'tree_coach_2a',
        series: { type: 'tree', id: 'coaching_path', step: 2, totalSteps: 3,
                  nextLeft: 'leaf_coach_end1', nextRight: 'leaf_coach_end2' },
        hideEffects: true,
        effectsHintLeft:  { ability: '?', ambition: '?' },
        effectsHintRight: { team: '?', wealth: '?' },
        effectsLeft:  { ability: 10, ambition: 8 },
        effectsRight: { team: 7, wealth: 3 },
        choiceLeftLabel:  '深耕战术研究',
        choiceRightLabel: '注重球员管理',
        rarity: 'epic',
        title: '执教风格',
        description: '你开始构建自己的战术体系。助手问你是打算成为战术大师，还是球员们的导师？'
    },
    {
        id: 'tree_coach_2b',
        series: { type: 'tree', id: 'coaching_path', step: 2, totalSteps: 3,
                  nextLeft: 'leaf_coach_end3', nextRight: 'leaf_coach_end4' },
        hideEffects: true,
        effectsHintLeft:  { ability: '?', team: '?' },
        effectsHintRight: { wealth: '?', ambition: '?' },
        effectsLeft:  { ability: 6, team: 4 },
        effectsRight: { wealth: 5, ambition: -3 },
        choiceLeftLabel:  '减少出场时间专注带新人',
        choiceRightLabel: '拼尽全力坚守首发',
        rarity: 'epic',
        title: '最后的赛季',
        description: '你的身体不再年轻。教练让你自己决定：是逐渐退居二线带新人，还是燃烧最后的油？'
    },
    // 教练之路 - 叶子结局
    {
        id: 'leaf_coach_end1', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '战术大师',
        description: '你成了俱乐部最年轻的战术分析师。球员们惊叹于你的洞察力——你总能提前三回合看清局势。执教之路，从战术板开始。',
        timelineText: '执教之路：选择成为战术教练，踏上战术大师的道路',
        timelineType: 'gold'
    },
    {
        id: 'leaf_coach_end2', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '球员导师',
        description: '年轻的球员们开始叫你"教父"。你不是战术狂人，但你知道怎么让每个人都成为最好的自己。青训营里多了一块你的铭牌。',
        timelineText: '执教之路：成为球员导师，青训营铭刻了你的名字',
        timelineType: 'gold'
    },
    {
        id: 'leaf_coach_end3', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '传承之火',
        description: '你带着新人们在训练场挥汗如雨。每当有人问起你的职业生涯，你只说一句："看他们就行了。"传承从来不需要言语。',
        timelineText: '执教之路：带出了一批新生代球员，薪火相传',
        timelineType: 'gold'
    },
    {
        id: 'leaf_coach_end4', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '老兵不死',
        description: '你咬着牙又踢了两个赛季。最后一次出场，全场起立鼓掌。你举起手，不是告别——是告诉你自己：够了。',
        timelineText: '执教之路：拼到最后一刻才挂靴，带着全场的敬意离场',
        timelineType: 'normal'
    },

    // ═══════════════════════════════════════
    // 树状系列: 豪门邀约
    // ═══════════════════════════════════════

    {
        id: 'tree_trans_1',
        series: { type: 'tree', id: 'transfer_crossroads', step: 1, totalSteps: 3,
                  nextLeft: 'tree_trans_2a', nextRight: 'tree_trans_2b' },
        hideEffects: true,
        effectsHintLeft:  { wealth: '?', ambition: '?' },
        effectsHintRight: { team: '?', ability: '?' },
        effectsLeft:  { wealth: 12, ambition: 8, reputation: 10 },
        effectsRight: { team: 10, ability: 5, reputation: 3 },
        choiceLeftLabel:  '接受天价合同转会',
        choiceRightLabel: '婉拒，留守母队',
        rarity: 'epic',
        title: '豪门邀约',
        description: '一份来自顶级豪门的合同放在你面前。薪资是你现在的三倍。经纪人眼睛在发光。母队的球迷在看。'
    },
    {
        id: 'tree_trans_2a',
        series: { type: 'tree', id: 'transfer_crossroads', step: 2, totalSteps: 3,
                  nextLeft: 'leaf_trans_end1', nextRight: 'leaf_trans_end2' },
        hideEffects: true,
        effectsHintLeft:  { ability: '?', ambition: '?' },
        effectsHintRight: { wealth: '?', team: '?' },
        effectsLeft:  { ability: 10, ambition: 10, reputation: 15 },
        effectsRight: { wealth: 15, team: -5, reputation: -8 },
        choiceLeftLabel:  '拼尽全力争夺主力位置',
        choiceRightLabel: '安心做高薪替补',
        rarity: 'epic',
        title: '豪门生存',
        description: '新球队的更衣室里全是世界级球星。训练赛上你被轻易过掉。教练给了你两个选择。'
    },
    {
        id: 'tree_trans_2b',
        series: { type: 'tree', id: 'transfer_crossroads', step: 2, totalSteps: 3,
                  nextLeft: 'leaf_trans_end3', nextRight: 'leaf_trans_end4' },
        hideEffects: true,
        effectsHintLeft:  { team: '?', ambition: '?' },
        effectsHintRight: { ability: '?', wealth: '?' },
        effectsLeft:  { team: 12, ambition: 6, reputation: 10 },
        effectsRight: { ability: -5, wealth: -3, reputation: -15 },
        choiceLeftLabel:  '担任队长带领球队',
        choiceRightLabel: '要求转会离开，后悔留下',
        rarity: 'epic',
        title: '母队之光',
        description: '留下后，俱乐部把队长袖标交给了你。球迷唱起了你的名字。但球队成绩正在下滑。'
    },
    // 转会选择 - 叶子结局
    {
        id: 'leaf_trans_end1', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '豪门核心',
        description: '你用汗水赢得了首发位置。欧冠决赛上你打进致胜球。那个说你不值三倍薪水的评论员，现在在解说席上喊你的名字。',
        timelineText: '转会豪门：从质疑到核心，欧冠决赛书写传奇',
        timelineType: 'gold'
    },
    {
        id: 'leaf_trans_end2', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '镀金生涯',
        description: '你的账户余额很高。但你打开手机，发现自己被移出了国家队名单。一个替补球员的位置，换来了你后半生的安逸——值吗？',
        timelineText: '转会豪门：高薪替补，财富自由但光芒褪色',
        timelineType: 'normal'
    },
    {
        id: 'leaf_trans_end3', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '一人一城',
        description: '十年。一座城。你带着袖标从第一场踢到最后一场。终场哨响，整个球场只有一个声音——你的名字。这是转会窗永远买不到的东西。',
        timelineText: '留守母队：一人一城，忠诚写进了俱乐部队史',
        timelineType: 'gold'
    },
    {
        id: 'leaf_trans_end4', isLeaf: true,
        effectsLeft: {}, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '悔棋之痛',
        description: '你递交了转会申请，但已经没有豪门感兴趣。你去了一个中游球队，在替补席上看完了整个赛季。母队的球迷说：早知如此。',
        timelineText: '留守又叛离：后悔留下又要求转会，两头落空',
        timelineType: 'bad'
    },

    // ═══════════════════════════════════════
    // 线性 counter: 世界杯征途 (5步)
    // ═══════════════════════════════════════

    {
        id: 'linear_wc_1',
        series: { type: 'linear', id: 'worldcup_2026', step: 1, totalSteps: 5, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { ability: 5, reputation: 3 },
        effectsRight: { ability: 3, ambition: 2 },
        choiceLeftLabel:  '加练任意球 — 提升战术价值',
        choiceRightLabel: '正常合练 — 保持体能',
        rarity: 'epic', color: 'gold',
        title: '国家队征召 · 集训',
        description: '国家队主帅在大名单中写下了你的名字。世界杯前的集训营，你需要证明自己值得一个首发位置。'
    },
    {
        id: 'linear_wc_2',
        series: { type: 'linear', id: 'worldcup_2026', step: 2, totalSteps: 5, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { team: 8, reputation: 5 },
        effectsRight: { team: 2, ambition: 3 },
        choiceLeftLabel:  '组织团队聚餐 — 凝聚士气',
        choiceRightLabel: '独自研究对手录像',
        rarity: 'epic', color: 'gold',
        title: '小组赛 · 更衣室',
        description: '小组赛第一场打平了。更衣室里气氛压抑。队长看着你，等你先开口打破沉默。'
    },
    {
        id: 'linear_wc_3',
        series: { type: 'linear', id: 'worldcup_2026', step: 3, totalSteps: 5, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { ability: 10, ambition: 8, reputation: 8 },
        effectsRight: { ability: -3, team: -5 },
        choiceLeftLabel:  '带伤上场 — 为国征战',
        choiceRightLabel: '保护身体 — 申请休息',
        rarity: 'epic', color: 'gold',
        title: '淘汰赛 · 抉择',
        description: '你的脚踝在上一场被踢伤了。队医说可以打封闭，但有风险。十六强赛的对手是德国。主帅在等你的答案。'
    },
    {
        id: 'linear_wc_4',
        series: { type: 'linear', id: 'worldcup_2026', step: 4, totalSteps: 5, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { team: 8, ambition: 5, reputation: 6 },
        effectsRight: { ambition: 10, team: -5, reputation: 2 },
        choiceLeftLabel:  '传球给位置更好的队友',
        choiceRightLabel: '自己射门 — 证明自己',
        rarity: 'epic', color: 'gold',
        title: '半决赛 · 关键时刻',
        description: '1:1。第89分钟。你在禁区内接到了球。门将出击，队友在远端招手。全场八万人屏住了呼吸。'
    },
    {
        id: 'linear_wc_5',
        series: { type: 'linear', id: 'worldcup_2026', step: 5, totalSteps: 5, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { ability: 12, ambition: 10, reputation: 20, team: 10 },
        effectsRight: { ability: 5, ambition: 8, reputation: 8 },
        choiceLeftLabel:  '全力以赴 — 不留遗憾',
        choiceRightLabel: '保守策略 — 求稳为主',
        rarity: 'epic', color: 'gold',
        title: '决赛 · 马拉卡纳',
        description: '你站在球员通道。球场上空是璀璨的灯光。这辈子所有凌晨训练的画面都在脑海中闪过。决赛的哨声就要响了。'
    },
    {
        id: 'leaf_wc_win', isLeaf: true,
        effectsLeft: { reputation: 30 }, effectsRight: {},
        choiceLeftLabel: '举起奖杯', choiceRightLabel: '举起奖杯',
        cardStyle: 'gold',
        title: '世界之巅',
        description: '你跪在草坪上，眼泪止不住。大力神杯的金色光芒照在你的脸上。一生的梦想，一生的努力——在这一刻全部兑现。你是世界冠军。',
        timelineText: '世界杯：捧起大力神杯，站在世界之巅',
        timelineType: 'gold',
        milestone: { id: 'worldCupWinner', text: '🏆 世界杯冠军！' }
    },
    {
        id: 'leaf_wc_lose', isLeaf: true,
        effectsLeft: { reputation: 5 }, effectsRight: {},
        choiceLeftLabel: '低头离开', choiceRightLabel: '低头离开',
        cardStyle: 'special',
        title: '一步之遥',
        description: '终场哨响。你的队友倒在草坪上哭泣。你站着，看着对手举杯。这是足球——有人赢就有人输。但你知道，你还会回来的。',
        timelineText: '世界杯：倒在最后一关，距离奖杯只有一步之遥',
        timelineType: 'normal'
    },

    // ═══════════════════════════════════════
    // 线性 counter: 欧冠冲冠 (4步)
    // ═══════════════════════════════════════

    {
        id: 'linear_ucl_1',
        series: { type: 'linear', id: 'champions_league_run', step: 1, totalSteps: 4, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { ability: 6, team: 4, reputation: 5 },
        effectsRight: { ability: 3, ambition: 4 },
        choiceLeftLabel:  '认真备战 — 团队优先',
        choiceRightLabel: '轻敌 — 这只是小组赛',
        rarity: 'epic', color: 'special',
        title: '欧冠开战 · 死亡之组',
        description: '抽签结果出来了——你们在死亡之组。媒体说你们出线概率只有15%。教练在战术板上画满了箭头。'
    },
    {
        id: 'linear_ucl_2',
        series: { type: 'linear', id: 'champions_league_run', step: 2, totalSteps: 4, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { team: 8, ambition: 5, reputation: 6 },
        effectsRight: { team: 2, ability: 3 },
        choiceLeftLabel:  '协调矛盾 — 稳定军心',
        choiceRightLabel: '站队 — 选边支持一方',
        rarity: 'epic', color: 'special',
        title: '更衣室危机',
        description: '锋线核心和中场组织者公开争吵。训练场上两人互不传球。离淘汰赛只有三天。'
    },
    {
        id: 'linear_ucl_3',
        series: { type: 'linear', id: 'champions_league_run', step: 3, totalSteps: 4, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { ability: 10, ambition: 8, reputation: 10 },
        effectsRight: { ability: 4, team: -3 },
        choiceLeftLabel:  '执行战术 — 相信教练',
        choiceRightLabel: '临场发挥 — 无视战术安排',
        rarity: 'epic', color: 'special',
        title: '半决赛 · 安联球场',
        description: '你们打进了半决赛。对手是卫冕冠军。他们的主场——安联球场——从来没有客队赢过半决赛。'
    },
    {
        id: 'linear_ucl_4',
        series: { type: 'linear', id: 'champions_league_run', step: 4, totalSteps: 4, judgeType: 'counter', correctSide: 'left' },
        effectsLeft:  { ability: 12, ambition: 12, reputation: 25, team: 8 },
        effectsRight: { ability: 6, ambition: 10, reputation: 10 },
        choiceLeftLabel:  '拼到最后一刻 — 全力以赴',
        choiceRightLabel: '保守保平 — 拖入加时',
        rarity: 'epic', color: 'gold',
        title: '决赛 · 伊斯坦布尔之夜',
        description: '欧冠决赛。夜空下是7万个闪光灯。你听到欧冠主题曲响起。每一个踢球的孩子都梦想这一刻。'
    },
    {
        id: 'leaf_ucl_win', isLeaf: true,
        effectsLeft: { reputation: 25, wealth: 15 }, effectsRight: {},
        choiceLeftLabel: '举起奖杯', choiceRightLabel: '举起奖杯',
        cardStyle: 'gold',
        title: '欧洲之王',
        description: '大耳朵杯在你手中。你吻了吻奖杯冰冷的金属，上面映照着漫天烟火。欧冠冠军——世界上最好的俱乐部赛事，现在属于你们。',
        timelineText: '欧冠：捧起大耳朵杯，成为欧洲之王',
        timelineType: 'gold',
        milestone: { id: 'championsLeagueWinner', text: '🏆 欧冠冠军！' }
    },
    {
        id: 'leaf_ucl_lose', isLeaf: true,
        effectsLeft: { reputation: 5 }, effectsRight: {},
        choiceLeftLabel: '沉默离场', choiceRightLabel: '沉默离场',
        cardStyle: 'special',
        title: '功亏一篑',
        description: '终场比分定格。伊斯坦布尔的夜空下，有人在庆祝，有人在哭泣。你属于后者。但这不是终点——只是通往巅峰路上的一座山。',
        timelineText: '欧冠：决赛失利，功亏一篑',
        timelineType: 'normal'
    },

    // ═══════════════════════════════════════
    // 线性 keynode: 经纪人摊牌 (4步, 2关键节点)
    // ═══════════════════════════════════════

    {
        id: 'linear_ag_1',
        series: { type: 'linear', id: 'agent_showdown', step: 1, totalSteps: 4, judgeType: 'keynode' },
        effectsLeft:  { wealth: 5, ambition: 3 },
        effectsRight: { team: 5, wealth: -2 },
        choiceLeftLabel:  '听经纪人的 — 签新品牌',
        choiceRightLabel: '拒绝 — 专心踢球',
        rarity: 'rare', color: 'dark',
        title: '经纪人的来电',
        description: '你的经纪人深夜打来电话，语气兴奋："我帮你谈了一个大品牌代言！但你需要明天立刻签约。"你闻到了不对劲的味道。'
    },
    {
        id: 'linear_ag_2',
        series: { type: 'linear', id: 'agent_showdown', step: 2, totalSteps: 4, judgeType: 'keynode' },
        effectsLeft:  { wealth: 10, ambition: 8, reputation: 8 },
        effectsRight: { wealth: -15, ambition: -5, reputation: -10 },
        choiceLeftLabel:  '信任经纪人 — 授权签约',
        choiceRightLabel: '仔细审阅合同 — 保护自己',
        rarity: 'rare', color: 'dark',
        title: '隐藏条款',
        description: '合同里有一条小字：你未来的肖像权和转会决定权归经纪公司所有。助理律师提醒你看清楚。经纪人笑着说"都是标准条款"。'
    },
    {
        id: 'linear_ag_3',
        series: { type: 'linear', id: 'agent_showdown', step: 3, totalSteps: 4, judgeType: 'keynode' },
        effectsLeft:  { wealth: 5, team: 3 },
        effectsRight: { ambition: 10, reputation: 8, wealth: -3 },
        choiceLeftLabel:  '和解 — 保住现状',
        choiceRightLabel: '公开决裂 — 另寻出路',
        rarity: 'rare', color: 'dark',
        title: '摊牌',
        description: '你发现经纪人在背后向俱乐部施压要加薪，同时向其他球队兜售你。他在吃三头。你走进他的办公室。'
    },
    {
        id: 'linear_ag_4',
        series: { type: 'linear', id: 'agent_showdown', step: 4, totalSteps: 4, judgeType: 'keynode' },
        effectsLeft:  { wealth: 8, ambition: 5, reputation: 5 },
        effectsRight: { wealth: 12, ambition: 12, reputation: 12, team: 5 },
        choiceLeftLabel:  '接受新经纪人的优厚条件',
        choiceRightLabel: '自己管理 — 独立决定未来',
        rarity: 'rare', color: 'dark',
        title: '新生',
        description: '摆脱了旧经纪人，你面前摆着几条路。新的经纪人拿着更透明的合同等你。或者——你自己来。'
    },
    {
        id: 'leaf_ag_win', isLeaf: true,
        effectsLeft: { wealth: 20, reputation: 15, ambition: 15 }, effectsRight: {},
        choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
        cardStyle: 'gold',
        title: '自由之身',
        description: '你把命运握在了自己手里。没有中间人抽成，没有隐藏条款。你签下了职业生涯最公平的一份合同。球员们开始向你请教合同问题。',
        timelineText: '经纪人风波：成功独立，成为球员权益的标杆',
        timelineType: 'gold'
    },
    {
        id: 'leaf_ag_fail', isLeaf: true,
        effectsLeft: { wealth: -20, reputation: -15 }, effectsRight: {},
        choiceLeftLabel: '接受现实', choiceRightLabel: '接受现实',
        cardStyle: 'dark',
        title: '被卖的棋子',
        description: '经纪人在你不知情的情况下把你卖给了一个保级队。你的合同锁死了你。真正的代价不是钱——是失去了对自己人生的控制。',
        timelineText: '经纪人风波：被经纪公司出卖，转会陷入泥潭',
        timelineType: 'bad'
    },

    // ═══════════════════════════════════════
    // 伏笔系列: 更衣室风暴 (3步, 钩子触发)
    // ═══════════════════════════════════════

    {
        id: 'fore_lock_1',
        series: { type: 'foreshadow', id: 'locker_room_crisis', step: 1, totalSteps: 3 },
        effectsLeft:  { team: -5, ambition: 3 },
        effectsRight: { team: 3, ability: -3 },
        choiceLeftLabel:  '直言不讳 — 指出问题',
        choiceRightLabel: '保持沉默 — 避免冲突',
        rarity: 'uncommon', color: 'dark',
        title: '更衣室的裂痕',
        description: '训练后几个球员在小声议论战术安排。气氛有些微妙。你听到了不满的声音——有人觉得教练不公平。你要介入吗？'
    },
    {
        id: 'fore_lock_2',
        series: { type: 'foreshadow', id: 'locker_room_crisis', step: 2, totalSteps: 3 },
        effectsLeft:  { team: -12, ambition: 5, ability: -5 },
        effectsRight: { team: 8, ability: 3, ambition: -3 },
        choiceLeftLabel:  '公开批评队友 — 划清界限',
        choiceRightLabel: '私下调解 — 缓和矛盾',
        rarity: 'uncommon', color: 'dark',
        title: '裂痕扩大',
        description: '矛盾升级了。训练赛上两队人马互不配合。教练在场边脸色铁青。有人把更衣室的事情透露给了媒体。'
    },
    {
        id: 'fore_lock_3',
        series: { type: 'foreshadow', id: 'locker_room_crisis', step: 3, totalSteps: 3 },
        effectsLeft:  { team: -20, ambition: 10, ability: 10, reputation: -8 },
        effectsRight: { team: 15, ambition: 5, reputation: 10 },
        choiceLeftLabel:  '要求清洗 — 重建秩序',
        choiceRightLabel: '召集全队 — 化解危机',
        rarity: 'uncommon', color: 'dark',
        title: '更衣室分裂',
        description: '俱乐部高层介入。他们问你的意见——是清洗闹事的球员重建秩序，还是由你出面召集全队化解这场危机？这会影响球队很多年。'
    },

    // ═══════════════════════════════════════
    // 伏笔系列: 队长袖标 (3步, 钩子触发)
    // ═══════════════════════════════════════

    {
        id: 'fore_cap_1',
        series: { type: 'foreshadow', id: 'captain_armband', step: 1, totalSteps: 3 },
        effectsLeft:  { team: 4, ambition: 5 },
        effectsRight: { team: -3, ability: 5 },
        choiceLeftLabel:  '帮助新队友 — 展现领导力',
        choiceRightLabel: '专注自己的表现',
        rarity: 'uncommon', color: 'special',
        title: '队长候选',
        description: '老队长受伤赛季报销。更衣室需要新领袖。有人提到了你的名字。另一个人说你还不够格。'
    },
    {
        id: 'fore_cap_2',
        series: { type: 'foreshadow', id: 'captain_armband', step: 2, totalSteps: 3 },
        effectsLeft:  { team: 10, ambition: 8, reputation: 5 },
        effectsRight: { team: -5, ambition: -3, ability: 5 },
        choiceLeftLabel:  '代表球队发声 — 承担责任',
        choiceRightLabel: '退让 — 支持另一位候选人',
        rarity: 'uncommon', color: 'special',
        title: '袖标之争',
        description: '教练组在投票。你的竞争对手是球队的头号射手——他有数据，你有威望。更衣室里分裂成了两派。'
    },
    {
        id: 'fore_cap_3',
        series: { type: 'foreshadow', id: 'captain_armband', step: 3, totalSteps: 3 },
        effectsLeft:  { team: 18, ambition: 12, reputation: 15, ability: 5 },
        effectsRight: { team: 3, ambition: -10, ability: 10, reputation: 5 },
        choiceLeftLabel:  '接受袖标 — 成为领袖',
        choiceRightLabel: '婉拒 — 专注个人发展',
        rarity: 'uncommon', color: 'gold',
        title: '队长的责任',
        description: '教练把袖标放在桌上。"这是你的——如果你要。"袖标很轻，但你知道戴上它意味着什么。你是这座城市的象征了。'
    },

    // ═══════════════════════════════════════
    // 日常事件 (32个)
    // ═══════════════════════════════════════

    // ── 训练类 ──
    {
        id: 'training',
        rarity: 'common',
        effectsLeft:  { ability: 4, team: 1 },
        effectsRight: { ability: 1, ambition: 3 },
        choiceLeftLabel:  '加练基础技术',
        choiceRightLabel: '提前离开去健身房',
        title: '日常训练',
        description: '今天的训练课是基础技术练习。教练说你的传球精度还有提升空间。'
    },
    {
        id: 'skill_focus',
        rarity: 'common',
        effectsLeft:  { ability: 3, ambition: 2 },
        effectsRight: { team: 3, ability: 1 },
        choiceLeftLabel:  '苦练射门',
        choiceRightLabel: '练习传球组织',
        title: '特训日',
        description: '今天是分组特训。你可以选择强化自己的强项，还是补齐短板。'
    },
    {
        id: 'tactical_drill',
        rarity: 'common',
        effectsLeft:  { ability: 3, team: 2 },
        effectsRight: { ability: 1, team: 1, ambition: 2 },
        choiceLeftLabel:  '认真执行战术',
        choiceRightLabel: '即兴发挥',
        title: '战术演练',
        description: '教练安排了一次战术演练。阵型和跑位很复杂，你需要集中精神。'
    },
    {
        id: 'recovery',
        rarity: 'common',
        condition: 's.ability<=50',
        effectsLeft:  { ability: 5, team: -1 },
        effectsRight: { ability: 2, team: 2 },
        choiceLeftLabel:  '做完整套康复训练',
        choiceRightLabel: '提前结束，参加队内活动',
        title: '康复日',
        description: '理疗师给你安排了额外的康复训练。你的身体状态需要多一点的关注。'
    },
    {
        id: 'weight_room',
        rarity: 'common',
        effectsLeft:  { ability: 3, wealth: -1 },
        effectsRight: { ability: 1, team: 3 },
        choiceLeftLabel:  '加量力量训练',
        choiceRightLabel: '轻量维持，早点休息',
        title: '健身房',
        description: '体能教练说你的对抗力量还需要加强。但今天你已经很累了。'
    },

    // ── 媒体/公众类 ──
    {
        id: 'press_conference',
        rarity: 'common',
        effectsLeft:  { reputation: 3, ambition: 2 },
        effectsRight: { reputation: -2, team: 2 },
        choiceLeftLabel:  '自信发言 — 展示个性',
        choiceRightLabel: '低调回应 — 不惹是非',
        title: '赛后发布会',
        description: '记者们把话筒对准你。"你怎么评价今天的表现？"镜头闪着红光。'
    },
    {
        id: 'social_media',
        rarity: 'common',
        effectsLeft:  { wealth: 3, reputation: 2, ambition: 1 },
        effectsRight: { reputation: -2, team: 2 },
        choiceLeftLabel:  '发训练视频 — 经营形象',
        choiceRightLabel: '不理会 — 专注训练',
        title: '社交媒体',
        description: '你的社交账号涨了不少粉。品牌方开始私信你合作意向。但教练说过少玩手机。'
    },
    {
        id: 'media_trap',
        rarity: 'uncommon',
        effectsLeft:  { reputation: -5, team: -3 },
        effectsRight: { reputation: 5, team: 3 },
        choiceLeftLabel:  '直率回答 — 实话实说',
        choiceRightLabel: '巧妙回避 — 保护球队',
        title: '记者陷阱',
        description: '一个记者递来一句话："有传言说你和主教练关系紧张，你对此有什么回应？"周围安静了下来。'
    },
    {
        id: 'fan_meet',
        rarity: 'common',
        effectsLeft:  { team: 3, reputation: 2 },
        effectsRight: { ambition: 2, wealth: 1 },
        choiceLeftLabel:  '耐心签名合影',
        choiceRightLabel: '简单挥手就走',
        title: '球迷见面',
        description: '训练场外聚了一群球迷。几个孩子举着你的球衣等着签名。天快下雨了。'
    },

    // ── 队内关系类 ──
    {
        id: 'team_dinner',
        rarity: 'common',
        effectsLeft:  { team: 4, wealth: -2 },
        effectsRight: { team: -1, ambition: 3 },
        choiceLeftLabel:  '请全队吃饭',
        choiceRightLabel: '只叫几个好友',
        title: '球队聚餐',
        description: '有人提议赛后一起去吃烤肉。账单通常会落在收入最高的那个人头上。这次是你。'
    },
    {
        id: 'new_teammate',
        rarity: 'common',
        effectsLeft:  { team: 4, reputation: 2 },
        effectsRight: { team: -2, ability: 3 },
        choiceLeftLabel:  '热情欢迎 — 帮他融入',
        choiceRightLabel: '保持距离 — 看他表现',
        title: '新援到来',
        description: '转会窗最后一天俱乐部签了一个年轻中场。他看起来很紧张，一个人坐在更衣室角落。'
    },
    {
        id: 'formation_change',
        rarity: 'uncommon',
        effectsLeft:  { ability: 3, team: -2, ambition: 3 },
        effectsRight: { team: 5, ability: -2 },
        choiceLeftLabel:  '适应新位置 — 挑战自己',
        choiceRightLabel: '和教练沟通 — 坚持原位置',
        title: '变阵',
        description: '教练换了新阵型，你的位置要向后撤。这意味着更少的射门机会，更多的防守责任。'
    },

    // 钩子事件: 更衣室闲聊 → locker_tension +1
    {
        id: 'locker_chat',
        rarity: 'common',
        hook: { counterKey: 'locker_tension' },
        effectsLeft:  { team: 2, ambition: 1 },
        effectsRight: { team: -1, ability: 2 },
        choiceLeftLabel:  '和大家聊聊 — 缓和气氛',
        choiceRightLabel: '戴上耳机 — 不想参与',
        title: '更衣室闲聊',
        description: '训练后队友们在聊昨晚的比赛和教练的安排。有人抱怨出场时间，有人沉默不语。气氛有些微妙。'
    },
    // 钩子事件: 训练摩擦 → locker_tension +1
    {
        id: 'locker_tension',
        rarity: 'uncommon',
        condition: 's.hookCounters.locker_tension>=1',
        hook: { counterKey: 'locker_tension' },
        effectsLeft:  { team: -3, ambition: 3 },
        effectsRight: { team: 2, ability: 2 },
        choiceLeftLabel:  '指出对方的问题',
        choiceRightLabel: '转移话题 — 聊别的',
        title: '训练场摩擦',
        description: '两个队友在训练中发生了身体冲突。教练吹停了比赛。更衣室里的紧张感正在累积。'
    },

    // 钩子事件: 领袖苗头 → captain_ambition +1
    {
        id: 'captain_whisper',
        rarity: 'uncommon',
        condition: 's.age>=22',
        hook: { counterKey: 'captain_ambition' },
        effectsLeft:  { team: 4, ambition: 3 },
        effectsRight: { team: -2, ambition: 2 },
        choiceLeftLabel:  '承担责任 — 带领热身',
        choiceRightLabel: '让别人来 — 不想出头',
        title: '领袖的苗头',
        description: '老队长迟到了。队友们等着有人带头热身。几个人看向了你的方向。'
    },
    // 钩子事件: 中场围圈 → captain_ambition +1
    {
        id: 'team_huddle',
        rarity: 'uncommon',
        condition: 's.hookCounters.captain_ambition>=1',
        hook: { counterKey: 'captain_ambition' },
        effectsLeft:  { team: 5, ambition: 4, reputation: 3 },
        effectsRight: { team: -3, ambition: 3 },
        choiceLeftLabel:  '站出来发言 — 鼓舞士气',
        choiceRightLabel: '保持沉默 — 让教练说',
        title: '中场围圈',
        description: '半场落后两球。教练已经说完了。全队在球员通道围成了一圈。需要一个声音。'
    },

    // ── 合同/财务类 ──
    {
        id: 'contract_renewal',
        rarity: 'uncommon',
        condition: 's.age>=20',
        effectsLeft:  { wealth: 8, ambition: 3 },
        effectsRight: { wealth: 3, team: 5, reputation: 3 },
        choiceLeftLabel:  '争取高薪',
        choiceRightLabel: '接受合理薪资 + 球队选项',
        title: '续约谈判',
        description: '俱乐部递来续约合同。薪水有提升但年限很长。经纪人说可以争取更多。'
    },
    {
        id: 'endorsement',
        rarity: 'uncommon',
        condition: 's.reputation>=15',
        effectsLeft:  { wealth: 8, reputation: 3, ambition: 2 },
        effectsRight: { wealth: 2, reputation: 2, team: 2 },
        choiceLeftLabel:  '签约运动品牌',
        choiceRightLabel: '拒绝 — 不想分心',
        title: '品牌代言',
        description: '一个运动品牌想让你成为代言人。广告拍摄需要占用两天的训练时间。'
    },
    {
        id: 'investment',
        rarity: 'rare',
        condition: 's.wealth>=50',
        effectsLeft:  { wealth: 15, ambition: 5 },
        effectsRight: { wealth: -10, team: 3 },
        choiceLeftLabel:  '投资餐厅 — 高风险高回报',
        choiceRightLabel: '存银行 — 安全第一',
        title: '投资机会',
        description: '一个商人朋友邀请你投资一家高档餐厅。他说其他球员都在做类似的生意。'
    },
    {
        id: 'transfer_rumor',
        rarity: 'uncommon',
        condition: 's.reputation>=20&&s.age<=30',
        effectsLeft:  { ambition: 4, reputation: 3, wealth: 2 },
        effectsRight: { team: 4, reputation: 1 },
        choiceLeftLabel:  '暗示对转会感兴趣',
        choiceRightLabel: '公开表示忠诚于球队',
        title: '转会传闻',
        description: '报纸上出现了你与另一家俱乐部的转会传闻。更衣室里队友们开始和你开玩笑。'
    },

    // ── 个人/生活类 ──
    {
        id: 'charity_event',
        rarity: 'common',
        effectsLeft:  { reputation: 4, wealth: -3, team: 2 },
        effectsRight: { wealth: 1, ambition: 2 },
        choiceLeftLabel:  '组织慈善赛 — 回馈社区',
        choiceRightLabel: '捐款了事',
        title: '社区公益',
        description: '当地的儿童医院邀请你参加一个慈善活动。组织者希望你能组织一场小型慈善赛。'
    },
    {
        id: 'injury_scare',
        rarity: 'uncommon',
        condition: 's.ability<=70',
        effectsLeft:  { ability: -5, ambition: 5 },
        effectsRight: { ability: 2, ambition: -2 },
        choiceLeftLabel:  '带伤坚持 — 不缺席比赛',
        choiceRightLabel: '主动休息 — 养好再说',
        title: '小伤预警',
        description: '你的膝盖在训练后有些酸痛。队医说是轻微拉伤，休息两周就好。但接下来是关键比赛。'
    },
    {
        id: 'goal_celebration',
        rarity: 'common',
        effectsLeft:  { reputation: 3, team: 2, ambition: 2 },
        effectsRight: { reputation: 1, team: 3 },
        choiceLeftLabel:  '设计独特的庆祝动作',
        choiceRightLabel: '简单庆祝 — 指向助攻队友',
        title: '进球之后',
        description: '你进球了！球场在欢呼。你的庆祝动作会被摄像机记录下来。'
    },
    {
        id: 'off_season',
        rarity: 'common',
        condition: 's.eventsThisSeason>=5',
        effectsLeft:  { ability: 3, ambition: 2 },
        effectsRight: { ability: 1, team: 2, wealth: 1 },
        choiceLeftLabel:  '提前归队训练',
        choiceRightLabel: '跟队友去度假',
        title: '休赛期',
        description: '短暂的休赛期。你可以选择加练保持状态，或者和队友一起去海滩放松。'
    },
    {
        id: 'scout_watch',
        rarity: 'rare',
        condition: 's.reputation>=15&&s.age<=28',
        effectsLeft:  { ambition: 5, reputation: 3, ability: 2 },
        effectsRight: { ambition: -2, team: 3 },
        choiceLeftLabel:  '刻意表现 — 吸引注意',
        choiceRightLabel: '正常发挥 — 不在意球探',
        title: '球探来了',
        description: '你注意到看台上坐着几个球探。他们在本子上记着什么。'
    },
    {
        id: 'fan_criticism',
        rarity: 'common',
        effectsLeft:  { ambition: 3, ability: 2 },
        effectsRight: { ambition: -2, team: 3 },
        choiceLeftLabel:  '用表现回应质疑',
        choiceRightLabel: '和球迷交流 — 化解误解',
        title: '球迷批评',
        description: '社交媒体上有些球迷在批评你最近的表现。队友说别在意，但你在意。'
    },
    {
        id: 'new_boots',
        rarity: 'common',
        effectsLeft:  { ability: 2, wealth: -2, reputation: 1 },
        effectsRight: { ability: 1, team: 2 },
        choiceLeftLabel:  '买限量版球鞋',
        choiceRightLabel: '穿旧鞋 — 习惯了',
        title: '新装备',
        description: '赞助商寄来了最新款的球鞋。颜色很亮，但你觉得旧鞋更舒服。'
    },
    {
        id: 'party',
        rarity: 'common',
        effectsLeft:  { team: 3, wealth: -1, reputation: 1 },
        effectsRight: { team: -2, ability: 1 },
        choiceLeftLabel:  '适度参加 — 融入球队',
        choiceRightLabel: '早回 — 保证休息',
        title: '球队派对',
        description: '队友在更衣室传阅一个派对邀请。有DJ、泳池和烤肉。明天是休息日。'
    },
    {
        id: 'team_bonding',
        rarity: 'common',
        effectsLeft:  { team: 5, ambition: 1 },
        effectsRight: { team: -1, ability: 3 },
        choiceLeftLabel:  '参加团建 — 增强默契',
        choiceRightLabel: '请假 — 独自加练',
        title: '团建日',
        description: '俱乐部组织了团队建设活动——真人CS。你端着枪躲在一堵墙后面，身旁是平时和你关系紧张的边后卫。'
    }
];
