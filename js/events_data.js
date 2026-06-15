/**
 * events_data.js — 事件数据 (v2.3)
 * v2.3: 杯赛/欧冠/世界杯 按设计规格完全重写
 */
window.Game = window.Game || {};

// ==================== 系列定义 ====================
window.Game.SeriesDefs = {

    // ═══════════════════════════════════════════════
    //  国内杯赛 (5轮链: 非连续解锁, SF和Final内部连续)
    //  入口: rep>=30, ability>=40
    // ═══════════════════════════════════════════════
    cup_r1: {
        type: 'linear', id: 'cup_r1', name: '杯赛·第一轮', totalSteps: 1,
        judgeType: 'counter', requiredCorrect: 0,
        stepEvents: ['cup_r1_ev'],
        correctSide: 'left',
        successEndingEventId: 'cup_r1_pass',
        tension: 2,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.reputation >= 30 && s.ability >= 40 && s.age <= 34; }
    },
    cup_r2: {
        type: 'linear', id: 'cup_r2', name: '杯赛·第二轮', totalSteps: 1,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['cup_r2_ev'],
        correctSide: 'left',
        successEndingEventId: 'cup_r2_pass',
        failEndingEventId: 'cup_r2_fail',
        tension: 2,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('cup_r1') !== -1; }
    },
    cup_sf: {
        type: 'linear', id: 'cup_sf', name: '杯赛·半决赛', totalSteps: 2,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['cup_sf_1', 'cup_sf_2'],
        correctSide: 'left',
        successEndingEventId: 'cup_sf_pass',
        failEndingEventId: 'cup_sf_fail',
        tension: 4,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('cup_r2') !== -1; }
    },
    cup_final: {
        type: 'linear', id: 'cup_final', name: '杯赛·决赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['cup_f_1', 'cup_f_2', 'cup_f_3'],
        correctSide: 'left',
        successEndingEventId: 'cup_champion',
        failEndingEventId: 'cup_final_fail',
        tension: 4,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('cup_sf') !== -1; }
    },

    // ═══════════════════════════════════════════════
    //  欧冠 (名额→小组→淘汰链)
    // ═══════════════════════════════════════════════
    ucl_spot: {
        type: 'linear', id: 'ucl_spot', name: '欧冠名额', totalSteps: 1,
        judgeType: 'counter', requiredCorrect: 0,
        stepEvents: ['ucl_spot_ev'],
        correctSide: 'left',
        successEndingEventId: 'ucl_spot_pass',
        tension: 1,
        conditionFn: function(s) { return s.completedSeries.indexOf('cup_final') !== -1 && s.completedSeries.indexOf('ucl_spot') === -1; }
    },
    ucl_group: {
        type: 'linear', id: 'ucl_group', name: '欧冠·小组赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['ucl_g1', 'ucl_g2', 'ucl_g3'],
        correctSide: 'left',
        successEndingEventId: 'ucl_group_pass2',
        failEndingEventId: 'ucl_group_fail',
        tension: 2,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('ucl_spot') !== -1; }
    },
    ucl_r16: {
        type: 'linear', id: 'ucl_r16', name: '欧冠·16强', totalSteps: 2,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['ucl_r16_1', 'ucl_r16_2'],
        correctSide: 'left',
        successEndingEventId: 'ucl_r16_pass',
        failEndingEventId: 'ucl_r16_fail',
        tension: 4,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('ucl_group') !== -1; }
    },
    ucl_qf: {
        type: 'linear', id: 'ucl_qf', name: '欧冠·八强', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['ucl_qf1', 'ucl_qf2', 'ucl_qf3'],
        correctSide: 'left',
        successEndingEventId: 'ucl_qf_pass',
        failEndingEventId: 'ucl_qf_fail',
        tension: 4,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('ucl_r16') !== -1; }
    },
    ucl_sf: {
        type: 'linear', id: 'ucl_sf', name: '欧冠·半决赛', totalSteps: 4,
        judgeType: 'split_counter',
        splitPoint: 2, phase1Required: 1, phase2Required: 1,
        stepEvents: ['ucl_sf1', 'ucl_sf2', 'ucl_sf3', 'ucl_sf4'],
        correctSide: 'left',
        successEndingEventId: 'ucl_sf_pass',
        failEndingEventId: 'ucl_sf_fail',
        tension: 4,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('ucl_qf') !== -1; }
    },
    ucl_final: {
        type: 'linear', id: 'ucl_final', name: '欧冠·决赛', totalSteps: 3,
        judgeType: 'conditional_extend',
        extendCondition: { phase1Required: 1, phase2Required: 1 },
        extendSteps: 2, extendRequired: 1,
        stepEvents: ['ucl_fn1', 'ucl_fn2', 'ucl_fn3'],
        extendEvents: ['ucl_et1', 'ucl_et2'],
        correctSide: 'left',
        successEndingEventId: 'ucl_champion',
        failEndingEventId: 'ucl_final_fail',
        tension: 4,
        conditionFn: function(s) { return s.completedSeries.indexOf('ucl_sf') !== -1; }
    },

    // ═══════════════════════════════════════════════
    //  世界杯 (选拔→预选→正赛链)
    // ═══════════════════════════════════════════════
    wc_selection: {
        type: 'linear', id: 'wc_selection', name: '国家队选拔', totalSteps: 4,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['wc_sel1', 'wc_sel2', 'wc_sel3', 'wc_sel4'],
        correctSide: 'left',
        successEndingEventId: 'wc_select_pass',
        failEndingEventId: 'wc_select_fail',
        tension: 2,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.reputation >= 50 && s.age <= 34 && s.completedSeries.indexOf('wc_selection') === -1; }
    },
    wc_qualifier: {
        type: 'linear', id: 'wc_qualifier', name: '世界杯·预选赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['wc_qual1', 'wc_qual2', 'wc_qual3'],
        correctSide: 'left',
        successEndingEventId: 'wc_qual_pass',
        failEndingEventId: 'wc_qual_fail',
        tension: 2,
        boostAfterSuccess: true,
        conditionFn: function(s) { return s.completedSeries.indexOf('wc_selection') !== -1 && s.completedSeries.indexOf('wc_qualifier') === -1; }
    },
    wc_group: {
        type: 'linear', id: 'wc_group', name: '世界杯·小组赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['wc_g1', 'wc_g2', 'wc_g3'],
        correctSide: 'left',
        nextSeriesId: 'wc_r16',
        successEndingEventId: 'wc_group_pass2',
        failEndingEventId: 'wc_group_fail',
        tension: 4,
        conditionFn: function(s) { return s.completedSeries.indexOf('wc_qualifier') !== -1 && s.completedSeries.indexOf('wc_group') === -1; }
    },
    wc_r16: {
        type: 'linear', id: 'wc_r16', name: '世界杯·16强', totalSteps: 2,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['wc_r16_1', 'wc_r16_2'],
        correctSide: 'left',
        nextSeriesId: 'wc_qf',
        successEndingEventId: 'wc_r16_pass',
        failEndingEventId: 'wc_r16_fail',
        tension: 4,
        condition: 's.age<=0'
    },
    wc_qf: {
        type: 'linear', id: 'wc_qf', name: '世界杯·八强', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['wc_qf1', 'wc_qf2', 'wc_qf3'],
        correctSide: 'left',
        nextSeriesId: 'wc_sf',
        successEndingEventId: 'wc_qf_pass',
        failEndingEventId: 'wc_qf_fail',
        tension: 4,
        condition: 's.age<=0'
    },
    wc_sf: {
        type: 'linear', id: 'wc_sf', name: '世界杯·半决赛', totalSteps: 4,
        judgeType: 'split_counter',
        splitPoint: 2, phase1Required: 1, phase2Required: 1,
        stepEvents: ['wc_sf1', 'wc_sf2', 'wc_sf3', 'wc_sf4'],
        correctSide: 'left',
        nextSeriesId: 'wc_final',
        successEndingEventId: 'wc_sf_pass',
        failEndingEventId: 'wc_sf_fail',
        tension: 4,
        condition: 's.age<=0'
    },
    wc_final: {
        type: 'linear', id: 'wc_final', name: '世界杯·决赛', totalSteps: 3,
        judgeType: 'conditional_extend',
        extendCondition: { phase1Required: 1, phase2Required: 1 },
        extendSteps: 2, extendRequired: 1,
        secondExtend: { required: 1 },
        stepEvents: ['wc_fn1', 'wc_fn2', 'wc_fn3'],
        extendEvents: ['wc_et1', 'wc_et2'],
        secondExtendEvents: ['wc_pk'],
        correctSide: 'left',
        successEndingEventId: 'wc_champion',
        failEndingEventId: 'wc_final_fail',
        tension: 4,
        condition: 's.age<=0'
    },

    // ── 豪门邀约 (树状) ──
    transfer_saga: {
        type: 'tree', id: 'transfer_saga', name: '豪门邀约', totalSteps: 3,
        step1EventId: 'trans_big_offer',
        step2aEventId: 'trans_big_2a',
        step2bEventId: 'trans_big_2b',
        tension: 4,
        condition: 's.reputation>=30&&s.age<=32'
    },

    // ── 更衣室风暴 (伏笔) ──
    locker_crisis: {
        type: 'foreshadow', id: 'locker_crisis', name: '更衣室风暴', totalSteps: 3,
        counterKey: 'locker_tension', hookThreshold: 3,
        stepEvents: ['locker_storm_1', 'locker_storm_2', 'locker_storm_3'],
        tension: 2
    }
};
// ==================== 事件数据 ====================
window.Game.RawEvents = [

    // ════════════════════════════════════════════════════════
    //  青训期 (tutorial_1~9) — 保持不变
    // ════════════════════════════════════════════════════════
    {
        id: 'tutorial_1', category: 'on_field', tension: -2,
        icon: 'camp', color: '',
        title: '青训营 · 第一天',
        description: '你背着包站在青训营门口。铁栅栏后面的训练场上有人在跑圈——比你大两三岁的球员。一个教练模样的人朝你招了招手："新来的？进来吧。"你的手心在出汗。',
        choices: {
            left:  { label: '观察四周', effects: { team: 2, ability: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你在场边站了十分钟，看清楚了每个人的位置。然后你走到最安静的那个球门前开始颠球。教练看着你——他在心里记了一笔。"这孩子不急。"' },
            right: { label: '主动上前', effects: { ambition: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '"教练好，我叫——"话没说完，教练指了指场上："先去跑五圈。"你放下包就跑。第一印象不靠嘴巴——靠腿。你跑得比所有人都快。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_2', category: 'on_field', tension: -2,
        icon: 'soccer', color: '',
        title: '第一次触球',
        description: '分组对抗。球第一次滚到你脚下——一个比你高半头的后卫正冲过来。你听到了场边有人喊"传！"。但你也有射门的角度。时间好像慢下来了。',
        choices: {
            left:  { label: '传球给队友', effects: { team: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你脚弓一推——球精准地找到了边路的队友。他传中，前锋头球破门。没人注意是你发起的进攻。但你不在乎——你知道球是怎么进的。' },
            right: { label: '自己突破', effects: { ability: 3, ambition: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你假动作一晃过了他——他甚至没反应过来。你继续带球，又过了一个。射门被扑出——但场边安静了两秒。有人吹了声口哨。那个高个子后卫下次遇到你时会记住的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_3', category: 'locker_room', tension: -2,
        icon: 'wave', color: '',
        title: '更衣室的邻座',
        description: '训练结束后你在更衣室里解鞋带。旁边座位的男孩跟你同龄——他今天训练时摔了一跤，膝盖破了。他正一个人擦着鞋上的泥。你们的目光在镜子里碰了一下。',
        choices: {
            left:  { label: '主动搭话', effects: { team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '"你刚才那个长传很准。"他抬起头——先是惊讶，然后笑了。"真的？我以为没人看到。"从那天起你们成了训练场上的一对搭档。' },
            right: { label: '各自收拾', effects: { ability: 2, ambition: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你低头继续擦鞋。足球是一项团队运动——但每个人都要先做好自己的部分。你没有交到朋友，但你多练了二十分钟的核心力量。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_4', category: 'coach_tactics', tension: 1,
        icon: 'teacher', color: '',
        title: '教练的指点',
        description: '教练把你叫到一边。"你的天赋不错，"他说，"但你知道你现在最大的问题是什么吗？"你摇了摇头。他递给你一瓶水——这是要长谈的信号。',
        choices: {
            left:  { label: '虚心听', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '教练讲了十五分钟——关于跑位、关于节奏、关于什么时候该拿球什么时候该放手。你每一个字都听进去了。后来的训练里他开始单独给你加练。' },
            right: { label: '表达自己的想法', effects: { ambition: 4, ability: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '"我觉得我的位置应该更靠前。"教练挑了挑眉毛——不是生气，是意外。"有想法是好事。但想法需要用表现来证明。"他记住了你这句话。以后你们还会有很多这样的对话。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_5', category: 'media_fans', tension: 1,
        icon: 'telescope', color: '',
        title: '看台上的陌生人',
        description: '今天的训练赛看台上多了一个穿西装的人——拿着笔记本，不像家长。他看完了整场训练。队友们都在议论："他是球探。一线队的球探。"轮到你了。',
        choices: {
            left:  { label: '平常心', effects: { ability: 2, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你深吸一口气，像往常一样踢。有一个传球失误了——但你立刻回追把球抢了回来。球探在本子上记了什么。后来有人告诉你他写的是："心态成熟。"' },
            right: { label: '全力发挥', effects: { ability: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把所有本事都拿了出来——踩单车、远射、飞铲。有一次你因为太想表现而没有传给位置更好的队友。球探在本子上记了什么。后来有人告诉你他写的是："有天赋，但是太想证明自己。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_6', category: 'locker_room', tension: -2,
        icon: 'book', color: '',
        title: '父亲的电话',
        description: '晚上父亲打来电话。他从来没看过你的比赛——他在外地工作。今天他问了一句："那边怎么样？"语气和往常一样平淡。但你听出了他没有说出口的话。',
        choices: {
            left:  { label: '详细分享', effects: { ambition: 1, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你讲了训练、讲了教练、讲了你的邻座队友。父亲在电话那头"嗯"了几声。挂断前他说："好好踢。"这是他第一次说这三个字。你挂了电话在床边坐了很久。' },
            right: { label: '简短回复', effects: { ambition: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '"挺好的。"你说。父亲也没追问。挂了电话你盯着天花板——你不想让他担心，也不想让他觉得你不够坚定。有些路注定是一个人的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_7', category: 'on_field', tension: 1,
        icon: 'star', color: 'special',
        title: '青训毕业赛',
        description: '青训营的最后一场比赛。对手是另一个城市的青训队。看台上坐了很多人——俱乐部的人、球探、还有几个一线队的球员。这是你在青训营的最后90分钟。',
        choices: {
            left:  { label: '为团队而战', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你满场跑动——不是为进球，是为队友拉开空间。你助攻了两个球，第三个是你抢断后发起的。赛后教练说了一句话你永远不会忘："你是这支球队的心脏。"' },
            right: { label: '展示自己', effects: { ability: 3, ambition: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你进了两个球。第一个是任意球直接破门——人墙和门将都没反应过来。但赛后队友们庆祝的时候你注意到有人在角落里看了你一眼——不是羡慕，是距离。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_8', category: 'transfer', tension: 2,
        icon: 'memo', color: 'gold',
        title: '第一份合同',
        description: '青训营的走廊尽头是俱乐部的行政办公室。今天你被叫进去。桌上放着一份职业合同——年限、薪水、条款。你的父母坐在旁边。你的手悬在笔上方。这一刻标志着：你是一名职业球员了。',
        choices: {
            left:  { label: '签长约', effects: { team: 3, wealth: 3, ambition: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你签了字。笔尖划过纸面的声音比你想象的要轻。这意味着五年——你把最黄金的五年交给了这支队徽。走出办公室时阳光很好。你看着训练场——它现在是你的了。' },
            right: { label: '签短约', effects: { ambition: 3, wealth: 1, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '"两年。"你说。经纪人看了你一眼——他知道你的意思。你想证明自己，然后让市场决定你的价值。签完字你走出办公室。未来是开放的——你要自己去填。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_9', category: 'business', tension: -2,
        icon: 'money', color: 'gold',
        title: '第一笔工资',
        description: '签约后的第二周，你的银行账户里多了一笔数字。比青训营的津贴多了好几个零。你盯着手机屏幕上的余额——这是你作为职业球员的第一笔工资。你打算怎么用？',
        choices: {
            left:  { label: '全部存下', effects: { wealth: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把大部分转进了储蓄账户。不是小气——是你见过太多球员退役后一无所有的故事。第一笔工资，你给自己买了双新球鞋。剩下的，留给了未来。' },
            right: { label: '请青训队友吃一顿', effects: { wealth: 3, team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你包下了青训营附近那家你们总路过但从没进去过的餐厅。所有人都在——你的邻座、教练、甚至那个总板着脸的体能师。账单上的数字让你挑了挑眉。但你看着满桌的笑声——值了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // ════════════════════════════════════════════════════════
    //  国内杯赛 · 第一轮 — 对阵低级别球队, 轻松取胜
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_r1_ev', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'cup_r1', step: 1, totalSteps: 1, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'cup',
        title: '杯赛 · 第一轮',
        description: '抽签结果：第四级别联赛球队。教练轮换了五个主力，拍了拍你的肩："去享受比赛。"',
        choices: {
            left:  { label: '以赛代练', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你把90分钟当成战术演练。三角传递、第三人跑位——一遍遍地试。3-0终场。赛后教练对助教说："他把训练场的东西带到了场上。"' },
            right: { label: '全力以赴', effects: { ability: 3, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有因为对手弱而放松。从第一分钟全力奔跑，第70分钟抽筋了仍咬牙踢完。3-0。对手教练赛后说："尊重对手的最好方式，就是全力以赴。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'cup_r1_pass', isLeaf: true, category: 'on_field', tension: 2, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 3 }, choiceLeftLabel: '进入下一轮',
      title: '轻松晋级', timelineText: '杯赛首轮：轻松过关', timelineType: 'gold',
      description: '队友们已在讨论下一轮对手。教练在战术板上写了几个字："保持专注。"你点了点头。杯赛进入淘汰赛——每一场都是决赛。' },

    // ════════════════════════════════════════════════════════
    //  国内杯赛 · 第二轮 — 实力相当的对手, 焦灼比赛
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_r2_ev', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'cup_r2', step: 1, totalSteps: 1, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'cup',
        title: '杯赛 · 第二轮',
        description: '对手摆出铁桶阵——两个后腰始终站在后卫线前。你们控球75%但射正为零。传中全被第一点顶出。教练在叫你做决定。',
        choices: {
            left:  { label: '短传渗透', effects: { team: 2, ability: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你来回倒脚等待缝隙。但对手纪律极好——两条线始终八米间距。终于你塞出一脚直传——前锋慢了半拍，球出底线。第78分钟对手反击得手。0-1。面对铁桶阵，需要的是锤子，不是针。' },
            right: { label: '增加远射', effects: { ability: 3, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让队友拉开宽度。第72分钟，禁区弧顶接球直接起脚——球如炮弹砸向球门，门将碰到了但力量太大。球进了。你狂奔向角旗——面对铁桶阵，最锋利的不是手术刀，是大锤。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'cup_r2_pass', isLeaf: true, category: 'on_field', tension: 2, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 4 }, choiceLeftLabel: '继续前进',
      title: '关键一击', timelineText: '杯赛第二轮：关键远射制胜', timelineType: 'gold',
      description: '那个进球会被回放很多遍——不是因为漂亮，是因为果断。半决赛。下一个对手是谁不重要——杯赛到了这个阶段，每一个对手都是你必须跨过去的。' },
    { id: 'cup_r2_fail', isLeaf: true, category: 'on_field', tension: 2, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '杯赛出局', timelineText: '杯赛：第二轮出局', timelineType: 'bad',
      description: '你坐在草坪上看着对手庆祝。杯赛结束了。他们的门将是全场最佳——你创造的机会够赢三场球。但那堵墙需要的是锤子，不是针。下次你会记住的。' },

    // ════════════════════════════════════════════════════════
    //  国内杯赛 · 半决赛 (2事件连续)
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_sf_1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_sf', step: 1, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'cup',
        title: '杯赛 · 半决赛',
        description: '半决赛。对手高位压迫极凶——前锋追着你们后卫抢。队友开始慌了，后场传球差点被断。你挥手示意压上——需要有人不怕。',
        choices: {
            left:  { label: '长传打身后', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你精准长传找对方身后的空档。一次传递找到边锋，他趟过门将推空门。教练朝你点头。面对高压，最优雅的解法不是硬碰硬——是绕过防线，让他们追着球跑。' },
            right: { label: '短传出球', effects: { team: 2, ability: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你试图短传出球——但对手逼抢太密了。第35分钟回传被断，单刀破门。你弯下腰。传控是美的——但被围猎时，美最先被撕碎。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'cup_sf_2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_sf', step: 2, totalSteps: 2, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'cup',
        title: '杯赛 · 半决赛下半场',
        description: '下半场。对手体力下降——高位压迫的代价。他们退守了。队友在看你——你需要让他们相信比赛还没结束。看台在唱你的名字。',
        choices: {
            left:  { label: '个人突破', effects: { ability: 3, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始单干——但对手用三个人盯你。第78分钟你撕开防线，射门偏出门柱。终场哨响。队友眼里有失望。英雄主义赢得掌声——赢不了半决赛。' },
            right: { label: '指挥跑位', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有一个人解决。你不停跑动拉扯防线——每一次跑动带走一个防守者。第83分钟你回撤带走中卫，队友插上破门。你没有助攻数据——但教练赛后说："最佳球员没有进球，他创造了进球。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'cup_sf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 6, ambition: 3 }, choiceLeftLabel: '走向决赛',
      title: '决赛门票', timelineText: '杯赛：杀入决赛', timelineType: 'gold',
      description: '终场哨响。你跪在草坪上。教练只说了一句话："还有一场。"决赛。你从八岁起就在梦里踢的比赛——现在它真的在等你。' },
    { id: 'cup_sf_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '半决赛之憾', timelineText: '杯赛：止步半决赛', timelineType: 'bad',
      description: '终场哨响。半决赛——离决赛只差一步。上半场的决策是致命的：高压下需要绕过防线，不是硬碰。更衣室里没有人说话。下次你会更聪明。' },

    // ════════════════════════════════════════════════════════
    //  国内杯赛 · 决赛 (3事件连续, 需要2个正确)
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_f_1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'cup',
        title: '杯赛 · 决赛',
        description: '决赛。八万人的声浪推着你的背。对手是去年亚军——经验比你们多。队长把所有人叫到一起："不要管比分。就踢我们的足球。"他的手在抖。所有人都在紧张。',
        choices: {
            left:  { label: '深呼吸', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你深呼吸三次，然后把球传给最近的队友——让所有人碰球，让心跳慢下来。节奏渐渐稳住了。决赛最大的敌人不是对手——是肾上腺素。你控制住了它。' },
            right: { label: '开场猛攻', effects: { ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你从第一秒全速奔跑。前十分钟压制对手——但第15分钟老练的对手抓住压上空档，反击得分。0-1。决赛中热情不加控制，就会变成对手的武器。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'cup_f_2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'cup',
        title: '杯赛 · 决赛下半场',
        description: '下半场。对手开始频繁从边路起高球，试图用身体砸开防线。中卫搭档眼角在流血，他朝队医摇头——决赛，血可以等。你需要破解。',
        choices: {
            left:  { label: '收缩中路', effects: { team: 2, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让全队退守。对手传中一波接一波。第70分钟角球混战——球进了。你跪在地上。当你放弃进攻，就把命运交给了概率。' },
            right: { label: '反压边路', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你反而推高防线，让边锋盯住对方边后卫——不让他们起脚。对手边路被掐断，中锋孤立无援。反击中你们进球。最好的防守不是退——是让对手退。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'cup_f_3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'cup',
        title: '杯赛 · 关键时刻',
        description: '最后五分钟。小腿在抽搐。教练用完换人名额了——只能靠你们。看台上有人在祈祷。所有训练和牺牲——都在这一刻。',
        choices: {
            left:  { label: '抢点', effects: { ability: 4, ambition: 3 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你冲向禁区——不是用腿，是用心脏。球擦过额头，然后你听到了这辈子最大的声音。落地时队友把你埋在身下。杯赛冠军。你把奖杯举过头顶——阳光穿透金属。你是冠军。' },
            right: { label: '冷静传切', effects: { team: 2, ambition: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你选择传球——合理的选择。但球被拦截了。终场哨响。你站在中圈，腿在抖。走到了决赛——但最关键的时刻你没有迈出那一步。合理的足球能赢大多数比赛——决赛需要的不只是合理。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'cup_champion', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 8, ambition: 4 }, choiceLeftLabel: '举起奖杯',
      title: '杯赛冠军', milestone: { id: 'firstTrophy', text: '杯赛冠军！' },
      timelineText: '杯赛冠军：举起了奖杯', timelineType: 'gold',
      description: '奖杯冰凉而沉重。你把它举过头顶，漫天彩带。你想起第一次踢球的下午——那时你只想把球踢进门。现在你做到了更多。第一个冠军。它会改变一切。',
      unlocks: ['cup_bbq'] },
    { id: 'cup_final_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -2 }, choiceLeftLabel: '沉默离场',
      title: '决赛之憾', timelineText: '杯赛：倒在决赛', timelineType: 'bad',
      description: '终场哨响。对手在庆祝。你走到了决赛——但在最关键的两个瞬间没有做出正确选择。队长把袖标放在桌上。明年——如果你还有明年——你会记住今天的一切。' },

    // ════════════════════════════════════════════════════════
    //  赛后庆祝 — 烤肉派对
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_bbq', category: 'locker_room', tension: -2, consequenceOnly: true,
        icon: 'confetti', color: 'cup',
        title: '冠军之夜',
        description: '教练包下了一家烤肉店。所有人都在——球员、教练组、队医，主席也来了。他举起酒杯："这个奖杯是你们每一个人做出的每一个正确决定的总和。干杯。"',
        choices: {
            left:  { label: '举杯致敬全队', effects: { team: 4, reputation: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你站起来："这个奖杯不是我赢的——是你们。"更衣室炸了。教练在角落擦了擦眼角——他以为没人看见。你看见了。有些东西比奖杯更重。' },
            right: { label: '安静享受', effects: { reputation: 2, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你坐在角落看着队友疯。你笑了——深沉的满足。烤肉味、香槟泡沫、那些笑脸。第一个冠军。不是最后一个。你知道的。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // ════════════════════════════════════════════════════════
    //  欧冠名额事件 — 赢得国内杯赛后触发
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_spot_ev', category: 'media_fans', tension: 1,
        series: { type: 'linear', id: 'ucl_spot', step: 1, totalSteps: 1, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠名额',
        description: '主席在办公室给你看了欧足联的确认函——下赛季欧冠资格。经纪人的消息亮了："更大的舞台在等你。"新赛季，新的竞争。',
        choices: {
            left:  { label: '低调备战', effects: { ability: 2, ambition: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始额外体能训练——比所有人早一小时到基地。教练看到了："你在为欧冠做准备。"你点头。有些准备不需要宣言。' },
            right: { label: '公开表态', effects: { ambition: 3, reputation: 2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [],
                     narrative: '你在体育节目上说："我们不是去凑数的。"第二天上了头条。有人鼓掌，有人冷笑。有时候你需要先宣告，再兑现。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'ucl_spot_pass', isLeaf: true, category: 'media_fans', tension: 1, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 3 }, choiceLeftLabel: '迎接新赛季',
      title: '欧冠来了', timelineText: '获得下赛季欧冠资格', timelineType: 'gold',
      description: '欧冠主题曲在脑中响起——小时候在电视前听了一百遍，现在你要站在那个舞台上了。欧洲。你要去欧洲了。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 · 小组赛 (3场不连续, 2胜晋级)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_g1', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'ucl_group', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠 · 小组赛首战',
        description: '欧冠之夜。灯光比联赛亮一倍。对手是葡萄牙球队——传球像织布机。走出通道，欧冠主题曲从通道里听是完全不同的东西。',
        choices: {
            left:  { label: '防守反击', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你们收紧防线。葡萄牙人控球65%——但大多在中圈。第65分钟反击三脚传球破门。1-0。对手教练赛后说："他们让我们控球，然后让我们付了代价。"控球率是数据，比分是事实。' },
            right: { label: '对攻', effects: { ability: 3, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你跟他们对攻——脚后跟传球引来全场惊呼。但葡萄牙人技术更精细，一次纵向渗透打穿防线。1-1。欧冠不是表演赛——好看的不一定得分。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_g2', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'ucl_group', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'ucl',
        title: '欧冠 · 小组赛次战',
        description: '东欧客场。看台离草皮很近，能听到每个骂声。对手五后卫——不打算踢球，打算破坏。队友被激怒了——粗暴铲球后有人推搡，裁判哨子快磨平了。',
        choices: {
            left:  { label: '保持耐心', effects: { team: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你不断转移球。第80分钟仍是0-0——对手防线像会自我修复的墙。终场平局。耐心是美德——但当11个人都在球后面时，耐心只是在帮他们消耗时间。' },
            right: { label: '远射破局', effects: { ability: 3, ambition: 2 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你从25码外起脚。第一脚横梁，第二脚折射入网。你在泥泞的客场滑跪。欧冠客场需要的不是艺术——是结果。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_g3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_group', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠 · 小组赛生死战',
        description: '最后一轮。你必须赢。战术板上画着对手弱点：右后卫转身慢，中卫间空档大。欧冠主题曲在窗外循环——今晚的背景音乐。',
        choices: {
            left:  { label: '针对弱点', effects: { ability: 4, team: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你们集中攻击右路。第55分钟突破传中——前锋破门。终场哨响，大屏幕上你的名字在晋级区。欧冠淘汰赛。你们留在了欧洲。' },
            right: { label: '全面压制', effects: { ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你试图全面压制——但对手反击几乎得手。终场平局。差一分。全面压制很强大——但真正强大的是一拳打在最脆弱的地方。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'ucl_group_pass2', isLeaf: true, category: 'on_field', tension: 2, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 6, wealth: 3 }, choiceLeftLabel: '进军淘汰赛',
      title: '小组第一出线', timelineText: '欧冠：小组第一晋级', timelineType: 'gold',
      description: '积分榜定格——小组第一。16强。名字旁边是你从小听说过的俱乐部。小时候贴在墙上的海报——现在你是海报里的人了。' },
    { id: 'ucl_group_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '欧冠小组出局', timelineText: '欧冠：止步小组赛', timelineType: 'bad',
      description: '大屏幕不会说谎——你的名字不在晋级区。你最后一个离开更衣室。铁桶阵需要重炮——耐心有时候只是另一种放弃。下一次。会有下一次的。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 · 16强 (2事件连续, 1个正确通过)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_r16_1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_r16', step: 1, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'ucl',
        title: '欧冠 · 16强',
        description: '淘汰赛。意大利球队——防守如堡垒。前二十分钟零射门，每次拿球两人围抢。教练已站了起来。你需要找到裂缝。',
        choices: {
            left:  { label: '横向调度', effects: { ability: 3, team: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你大范围转移——左到右，右到左。每次调度迫使防线移动。第35分钟连续横传后中路空隙出现——直塞穿透整条防线。进球。堡垒不是砸开的——是摇开的。' },
            right: { label: '纵向冲击', effects: { ability: 3, ambition: 3, team: -2 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你试图用速度硬闯——但意大利人永远站在正确位置。被铲翻在地，哨子没响。用蛮力撞墙只会伤害自己——你正在用身体学习这一点。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_r16_2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_r16', step: 2, totalSteps: 2, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠 · 16强下半场',
        description: '下半场。意大利人开始反击——前锋速度极快。门将出击扑救撞到门柱，队医冲了上去。你挥手让队友压上。',
        choices: {
            left:  { label: '退守保胜', effects: { team: 2, ambition: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让全队退守。第88分钟角球混战——球进了。你撑着膝盖。守住优势听起来安全——但放弃主动权从来就不安全。你失去了晋级的机会。' },
            right: { label: '继续施压', effects: { ability: 3, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你继续压上。意大利人不习惯——持续施压迫使他们回传失误，你断球直塞进球。终场哨响——八强。保住胜利的最好方式不是守住它——是让它变得更大。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'ucl_r16_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 8, wealth: 4 }, choiceLeftLabel: '进军八强',
      title: '欧冠八强', timelineText: '欧冠：挺进八强', timelineType: 'gold',
      description: '终场哨响。八强。你朝看台举起拳头——球迷的声浪像海啸。更衣室里有人在唱歌。你看着镜子里的自己——眼睛通红。八强。整个欧洲还有七支球队。但今晚——今晚你们是其中之一。' },

    { id: 'ucl_r16_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '16强出局', timelineText: '欧冠：止步16强', timelineType: 'bad',
      description: '终场哨响。你弯着腰——不是因为累，是因为空。欧冠淘汰赛。一个瞬间就够。今天那个瞬间不属于你。对手的球员在你身旁庆祝。你拍掉膝盖上的草。下一次。你知道会有下一次。但今晚——让失望占据你。这是它应得的空间。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 · 八强 (3事件连续, 2通过)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_qf1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_qf', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'ucl',
        title: '欧冠 · 八强',
        description: '八强。英格兰冠军——踢得像飓风。球几乎没离开过你们的半场。教练打手势让你稳住——你需要先冷静下来。',
        choices: {
            left:  { label: '回撤接球', effects: { team: 3, ability: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你频繁回撤接球，故意慢下来——让全队心率降下来。渐渐传球连接上，压迫出现缝隙。球场上最重要的不是跑得快——是让对手慢下来。' },
            right: { label: '以快制快', effects: { ability: 3, ambition: 3, team: -2 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你跟他们对飙速度。半场结束你已喘不过气——而英格兰人还能跑。和飓风比速度不是好主意——飓风不会累，但你会。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_qf2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_qf', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠 · 八强下半场',
        description: '下半场。英格兰人换了个快马前锋，第一脚触球就差点破门。你赛前看过他的录像——他喜欢从左路内切后右脚射门。用上这个信息。',
        choices: {
            left:  { label: '贴身盯防', effects: { team: 2, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你紧贴着他——但他太快。一次假动作晃开你，球飞入死角。盯防比你快的人意味着你永远在追——追的人看不到球。' },
            right: { label: '封堵内切', effects: { ability: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你每一次都站位稍微偏他的右侧——逼他往左边走。他被迫用弱势脚传中——质量差了很多。一次他强行内切——你正好在那里把球断下。反击进球。录像分析的意义不在于看——在于用。你知道他的习惯，利用了他的习惯。足球是身体和身体的对抗——更是信息和信息的对抗。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_qf3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_qf', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'ucl',
        title: '欧冠 · 关键时刻',
        description: '比赛尾声。任意球——禁区边缘。人墙五人，门将在跳。全场安静。这一刻属于你。',
        choices: {
            left:  { label: '弧线球绕过人墙', effects: { ability: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你助跑——脚内侧弧线绕过人墙，绕过门将指尖，飞入上角。球场爆炸。欧冠四强。那道弧线会被回放一百万次——但你只会记住球在空中旋转时，整个世界屏住了呼吸。' },
            right: { label: '战术任意球', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你短传队友——战术任意球。队友射门飞向看台。你双手抱头。在最紧张的时刻，最简单的往往最有效。那个人墙上角在等你——但你绕了远路。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'ucl_qf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 10, wealth: 5 }, choiceLeftLabel: '进军半决赛',
      title: '欧冠四强', timelineText: '欧冠：杀入四强', timelineType: 'gold',
      description: '终场哨响。四强。你跪在草坪上——不是因为疲惫，是因为感动。欧冠半决赛。更衣室里教练说了一句话你永远不会忘："你们证明了足球不只是跑和踢——是思考和勇气。"还有一个对手。还有一场。' },
    { id: 'ucl_qf_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -3 }, choiceLeftLabel: '离开球场',
      title: '八强梦碎', timelineText: '欧冠：止步八强', timelineType: 'bad',
      description: '终场哨响。八强——到此为止。你和英格兰前锋交换了球衣。他拍了拍你的肩膀。欧冠的主题曲结束了。你学到了视频分析的价值——但你学到的是在失败之后。下一次。你知道会有下一次。' },
    // ════════════════════════════════════════════════════════
    //  欧冠 · 半决赛 (4事件连续, SPLIT: 前2需≥1 + 后2需≥1)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_sf1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_sf', step: 1, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'left' },
        icon: 'swords', color: 'ucl',
        title: '欧冠 · 半决赛上半场',
        description: '半决赛。西班牙巨人——欧洲最强中场。前十五分钟你几乎没碰到球。教练手指敲着战术板——不耐烦的信号。你举手要球。',
        choices: {
            left:  { label: '压缩中场', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让中场和后卫线保持最窄距离——像闭合的老虎钳。西班牙人不习惯——传球开始偏差。半场平局。传控的命门不是抢到球——是不给他们思考的时间。' },
            right: { label: '高位逼抢', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你带前锋压上逼抢——但西班牙人一脚出球太快。一次穿透传球打穿防线。逼抢西班牙人就像用网捉水——他们会从你指间流走。需要阻断路径，不是追逐影子。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_sf2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_sf', step: 2, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠 · 半决赛下半场',
        description: '下半场。西班牙人换了个矮个前腰——在两条线间接球，那是软肋。每次转身防线后退。教练大喊——让你决定谁盯他。',
        choices: {
            left:  { label: '区域协防', effects: { team: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你们区域协防——但每次交接就是他摆脱的瞬间。第65分钟转身直塞进球。责任分摊意味着没有人真正负起责任。' },
            right: { label: '指定专人盯防', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你走到教练旁："我来。"接下来三十分钟你是他的影子——他去哪你去哪。西班牙核心被锁死。最简单的战术："这个人，我来。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_sf3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_sf', step: 3, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'left' },
        icon: 'swords', color: 'ucl',
        title: '欧冠 · 半决赛加时',
        description: '加时。腿已不属于你。大屏幕——还有十五分钟。十五分钟去欧冠决赛，或一切归零。',
        choices: {
            left:  { label: '压上进攻', effects: { ability: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你挥手压上——把自己当额外前锋。第110分钟角球抢到第一点，头球破门。欧冠决赛。不是用腿——是用心脏。你做到了。' },
            right: { label: '保留体力', effects: { team: 2, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始节省体力，接受点球大战。但最后三分钟对手进球了。点球不会有了——你提前放弃了这一秒，这一秒放弃了你。决赛门票属于拼到最后一秒的人。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_sf4', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_sf', step: 4, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'right' },
        icon: 'trophy', color: 'ucl',
        title: '欧冠 · 最后一搏',
        description: '最后几分钟。快速反击——你带球向前。面前一个后卫，门将出击。队友远端无人盯防。但你也有射门角度。半秒钟。决定。',
        choices: {
            left:  { label: '自己射门', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你起脚——门将扑出，球擦柱偏出。你选择了相信自己。队友在远端举着手——他的手还没放下。英雄主义能让你成为主角——但足球是十一个人的运动。' },
            right: { label: '传给队友', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你脚弓一推——球精准滚到队友脚下。空门。他跪在地上哭了。不是你进的——但全场都知道是谁创造了它。最伟大的传球是最正确的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'ucl_sf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 12, wealth: 6 }, choiceLeftLabel: '走向决赛',
      title: '欧冠决赛门票', timelineText: '欧冠：杀入决赛', timelineType: 'gold',
      description: '终场哨响。欧冠决赛。你躺在草坪上——天上的星星比任何时候都亮。更衣室里香槟喷得到处都是——但你只是坐在角落里。决赛。这两个字在你的脑海里反复播放。你想起那个在电视前熬夜看欧冠的小孩——现在你是电视里的人了。还有一场。最盛大的一场。' },
    { id: 'ucl_sf_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4 }, choiceLeftLabel: '心碎离场',
      title: '半决赛之壁', timelineText: '欧冠：止步半决赛', timelineType: 'bad',
      description: '终场哨响。你跪在草坪上。欧冠决赛——不是你。你和西班牙人交换了球衣。他低声用口音很重的英语说:"You were the hardest."你点头——但这一点安慰都没有。半决赛是一堵墙。今年你没有翻过去。但你知道墙的高度了。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 · 决赛 (3+2 CONDITIONAL_EXTEND)
    //  前3事件需phase1≥1+phase2≥1才进入加时2事件
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_fn1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 1, totalSteps: 3, judgeType: 'conditional_extend', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'ucl',
        title: '欧冠 · 决赛',
        description: '欧冠决赛。奖杯就在入口处——银色，比你想象的大。主题曲响起，你把手放在胸口。不是因为仪式——是心跳在那里。你的舞台。',
        choices: {
            left:  { label: '稳稳控制', effects: { team: 3, ability: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让球留在脚下——每次触球都轻柔。渐渐找到节奏。决赛最大的对手不是对面——是自己的紧张。你驯服了它。' },
            right: { label: '燃烧到底', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你从第一秒全力冲刺。半场结束已喘不过气。决赛有90分钟——前45分钟燃尽自己，后45分钟你用什么赢？' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_fn2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 2, totalSteps: 3, judgeType: 'conditional_extend', stepCorrectSide: 'right' },
        icon: 'swords', color: 'ucl',
        title: '欧冠 · 决赛下半场',
        description: '下半场。对手核心频繁换位拉扯防线。教练疯狂打手势。中卫搭档在喘——你需要做决定。',
        choices: {
            left:  { label: '保持原有战术', effects: { team: 2, ambition: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你坚持原战术。但对手找到了空档——换位后中场缺口，球传进去了。坚持是美德——但对手已适应时，不变就是退步。' },
            right: { label: '即时调整', effects: { ability: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你立刻调整——边锋回收，中场收紧。对手换位被你的预判化解。欧冠决赛最被低估的能力不是蛮力或速度——是理解。你理解了，然后改变了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_fn3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 3, totalSteps: 3, judgeType: 'conditional_extend', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'ucl',
        title: '欧冠 · 最后时刻',
        description: '最后一分钟。球飞入禁区——在空中旋转。它正飞向你。职业生涯最重要的一次触球。不会再来了。',
        choices: {
            left:  { label: '头球攻门', effects: { ability: 4, ambition: 3 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你腾空而起。球砸入网窝。终场哨响。欧冠冠军。你躺在草坪上看夜空——做到了。奖杯比想象的重——那是梦想的重量。' },
            right: { label: '头球摆渡', effects: { team: 3, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你选择摆渡——门将出击摘走。进入加时。欧冠决赛给你半秒钟——你选择了把命运交给别人。最安全的选项，有时最危险。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // 加时赛事件 (仅当 CONDITIONAL_EXTEND 条件满足时触发)
    {
        id: 'ucl_et1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 4, totalSteps: 5, judgeType: 'conditional_extend', stepCorrectSide: 'left' },
        icon: 'hourglass', color: 'ucl',
        title: '欧冠 · 加时赛',
        description: '加时。腿在燃烧。教练没换人名额了。队医举着冰袋——你摇头。这些年每个凌晨的训练——都是为了这三十分钟。',
        choices: {
            left:  { label: '榨干自己', effects: { ability: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你强迫双腿移动。一次冲刺超越三人——不是因为快，是没放弃。球进了。你跪在地上——不是因为累，是终于可以停下来了。' },
            right: { label: '保存体力', effects: { team: 2, ambition: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始节省体力——走而不是跑。上半场无进球。加时赛不会等你。伟大的人从来不计算——只是去做。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'ucl_et2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 5, totalSteps: 5, judgeType: 'conditional_extend', stepCorrectSide: 'right' },
        icon: 'trophy', color: 'ucl',
        title: '欧冠 · 加时下半场',
        description: '最后五分钟。小腿抽搐——每次跑动像踩刀尖。角球。最后一个机会。',
        choices: {
            left:  { label: '冲抢前点', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你冲前点——被两人夹住。角球飞向后点，无人碰到。终场。勇气需要方向——无目标的冲锋只是浪费最后的体力。' },
            right: { label: '埋伏后点', effects: { ability: 4, team: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你埋伏后点——不在人群最密处。球飞来——预判正确。头球。欧冠冠军。奖杯举过头顶——欧洲之王。这个头衔没有人能拿走。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'ucl_champion', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 16, wealth: 10, ambition: 4 }, choiceLeftLabel: '举起大耳朵杯',
      title: '欧洲之王', milestone: { id: 'championsLeagueWinner', text: '欧冠之巅！' },
      timelineText: '欧冠冠军：登顶欧洲之巅', timelineType: 'gold',
      description: '银色的奖杯被你举过头顶。漫天彩带。主题曲在放——但这次是为你放的。你看着奖杯上倒映出的自己的脸——和多年前那个在电视前熬夜的孩子一模一样。欧洲之王。你做到了。这个头衔没有人能拿走。',
      unlocks: ['ucl_parade_ev'] },
    { id: 'ucl_final_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: 4, ambition: -3 }, choiceLeftLabel: '仰望夜空',
      title: '一步之巅', timelineText: '欧冠：倒在决赛', timelineType: 'bad',
      description: '你站在草坪上看着对手捧杯。欧冠的主题曲是他们的背景音乐。一步——你离登顶只差一步。但这一步是用每一个正确决定铺成的。今晚你没有铺完。但你能闻到山顶的空气——那会让你下一次爬得更快。' },

    // 欧冠夺冠庆祝
    {
        id: 'ucl_parade_ev', category: 'media_fans', tension: -2, consequenceOnly: true,
        icon: 'confetti', color: 'ucl',
        title: '全城欢庆',
        description: '敞篷大巴驶过城市主干道——但街道已经不存在了，只有人群。有人爬上了路灯，有人站在车顶。一个小男孩被父亲扛在肩上，手里举着纸板——上面用歪歪扭扭的字写着"你是我的英雄"。',
        choices: {
            left:  { label: '抱起小男孩', effects: { reputation: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你示意大巴停下。弯腰把小男孩抱上车。他呆了——然后紧紧抱住你的脖子。闪光灯疯了一样闪。但他在你耳边小声说"我以后也要踢欧冠"。你笑了——"我相信你。"这座奖杯属于全城——但这个瞬间属于你们两个人。' },
            right: { label: '举杯致意', effects: { reputation: 3, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你高举大耳朵杯——阳光穿透银色照亮了整条街。人群的声浪像海啸。你看到老人抹眼泪、年轻人嘶吼、情侣拥吻。欧冠让这座城市疯掉了——而你站在疯掉的中心。欧洲之王。这座城市之王。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // ════════════════════════════════════════════════════════
    //  世界杯 · 国家队选拔 (4事件不连续, 3考察+1宣布, ≥2入选)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_sel1', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_selection', step: 1, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'wc',
        title: '国家队 · 考察第一场',
        description: '国家队主教练今天在看台上。一个戴眼镜的人，第三排，拿着笔记本。你的每一次触球，他都在记录。他的笔记本决定了你的世界杯。',
        choices: {
            left:  { label: '踢自己的比赛', effects: { ability: 2, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你跑位、传球、防守——和平时一模一样。赛后得知，那个笔记本上写的是："可靠。不会在压力下变形。"聚光灯下，你变成了最好的自己。' },
            right: { label: '展示全部武器', effects: { ability: 3, ambition: 2, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你把所有本事都秀了出来——踩单车、远射、飞铲。但忽略了防守位置。笔记本上写的是："有天赋，但需要学会什么时候不展示。"主教练看的是你会不会做不该做的事。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_sel2', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_selection', step: 2, totalSteps: 4, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'wc',
        title: '国家队 · 考察第二场',
        description: '第二场考察。对手以身体对抗著称。上半场已被背后铲了两次，裁判哨子很松。队友开始抱怨——你知道抱怨只会让对手更兴奋。',
        choices: {
            left:  { label: '以硬碰硬', effects: { ambition: 3, team: -1 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '你撞回去了。黄牌。笔记本上写的是："有血性，但血性需要被控制。"战斗精神是武器——但武器可以伤到自己。' },
            right: { label: '用技术回应', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有撞回去——让球更快离开脚下。第70分钟最凶的后卫追你追到抽筋。笔记本上写的是："用脑子解决了身体的问题。"最优雅的复仇——让他们碰不到你的衣角。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_sel3', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_selection', step: 3, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'wc',
        title: '国家队 · 考察第三场',
        description: '最后一场考察。听说竞争对手上一场进了两个球。队友拍你肩膀："你已经足够了。"但真的够吗？最后一次机会。',
        choices: {
            left:  { label: '享受比赛', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你不再试图证明什么——只是踢球。第55分钟送出漂亮助攻。笔记本最后一句话："这个人准备好了。"不是因为完美——是在压力下他还是他自己。' },
            right: { label: '奋力拼搏', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你拼命想进球——第75分钟终于进了，但错过两次传球机会。笔记本上写的不是进球数："太想证明自己的人，会忘记自己在球队里的位置。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_sel4', category: 'media_fans', tension: 2,
        series: { type: 'linear', id: 'wc_selection', step: 4, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'memo', color: 'wc',
        title: '国家队 · 大名单公布',
        description: '名单公布日。全家人围在电视机前。屏幕上名字一个个跳出来——然后你看到了自己的名字。母亲哭了，父亲差点把你拍倒。世界杯——从你会走路起就在梦里的两个字。',
        choices: {
            left:  { label: '致电恩师', effects: { team: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你拨通了青训教练的电话。"教练，我入选了。"沉默三秒，然后这辈子最深的一声叹息。"我知道你会。"有些人的信念造就了今天的你。' },
            right: { label: '立即投入训练', effects: { ability: 2, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你挂了电话就开始训练。世界杯不会等任何一个人。入选是开始——不是终点。没有人会问你选拔赛进了几个球——只会问你在世界杯上做了什么。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_select_pass', isLeaf: true, category: 'on_field', tension: 2, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 8, ambition: 3 }, choiceLeftLabel: '穿上国家队球衣',
      title: '国脚', milestone: { id: 'firstNationalTeam', text: '入选国家队！' },
      timelineText: '入选国家队，出征世界杯', timelineType: 'gold',
      description: '第一次穿上国家队球衣。胸前是国旗——比任何俱乐部队徽都重。预选赛在等着。记住这一天。' },
    { id: 'wc_select_fail', isLeaf: true, category: 'on_field', tension: 2, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4, reputation: -2 }, choiceLeftLabel: '继续俱乐部生涯',
      title: '遗憾落选', timelineText: '未能入选国家队', timelineType: 'bad',
      description: '名单结束了。你的名字不在上面。父亲什么都没说——这比任何话都重。你走到院子里对着墙踢球。足球不会因为一次失败而结束——除非你让它结束。下一次，会有你的名字。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 · 预选赛 (3事件不连续, 1个正确通过)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_qual1', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_qualifier', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'wc',
        title: '世界杯 · 预选赛首战',
        description: '预选赛第一场。不是大球场——一个叫不出名字的小城，更衣室瓷砖缺了一角。窗外球迷在唱国歌。世界杯之路从这里开始——在尘土里。',
        choices: {
            left:  { label: '稳扎稳打', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有做任何特别的事——传球、跑位、防守，追求效率。终场赢了。预选赛不奖励华丽，奖励结果。三分到手。' },
            right: { label: '打出气势', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你试图打华丽足球——但草皮不平，对手粗暴有效。终场平局。预选赛不是用来宣告的——是用来晋级的。漂亮留到正赛——前提是你先到那里。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_qual2', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_qualifier', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'wc',
        title: '世界杯 · 预选赛次战',
        description: '客场。时差让腿像灌铅。客队看台一小撮国旗在飘扬——他们飞了八千公里来。不能让他们失望。但身体在抗议。',
        choices: {
            left:  { label: '拼尽全力', effects: { ability: 3, ambition: 3 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你咬牙坚持，第80分钟抽筋仍拒绝下场。终场赢了——但赛后躺了两小时。身体不是无限的——为一场透支，下一场你可能就不在了。' },
            right: { label: '智慧分配体能', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你减少不必要跑动，用传球和预判替代冲刺。第75分钟送出助攻——不是快，是站在了正确位置。赛后把球衣扔给了远征球迷。智慧比热血更持久。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_qual3', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_qualifier', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 预选赛关键战',
        description: '最后一轮。赢了就去世界杯。更衣室里有人紧张得干呕。老队长拉他到一边——你看到那个年轻球员的背挺直了。国家队：不是十一个人，是一个国家。',
        choices: {
            left:  { label: '稳住队友', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有做英雄——走到每个队友面前，拍拍肩膀。平静会传染，就像恐慌。终场哨响——世界杯。最好的领导力不是说——是存在。' },
            right: { label: '一个人扛', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你试图一个人解决一切——带球、射门、抢断。第70分钟失误，传球被断。队友眼里有担忧——英雄主义有时候是负担。你不是一个人，从来都不是。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_qual_pass', isLeaf: true, category: 'on_field', tension: 2, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 10, ambition: 4 }, choiceLeftLabel: '世界杯，我们来了',
      title: '晋级世界杯', timelineText: '预选赛突围，进军世界杯', timelineType: 'gold',
      description: '终场哨响。世界杯。队友们叠成一堆——大哭大笑。你躺在最上面看天空。梦想成真。你的世界杯——即将开始。' },
    { id: 'wc_qual_fail', isLeaf: true, category: 'on_field', tension: 2, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4, reputation: -3 }, choiceLeftLabel: '沉默离开',
      title: '预选赛折戟', timelineText: '世界杯预选赛：未能晋级', timelineType: 'bad',
      description: '终场哨响。你站着看对手庆祝。四年一次的梦想——你的名字不在名单上。回程大巴没人说话。有些比赛需要智慧，有些需要热血。最重要的是知道什么时候用哪一种。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 · 小组赛 (3场连续, 2胜晋级, 不同结局卡)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_g1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_group', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'wc',
        title: '世界杯 · 小组赛首战',
        description: '世界杯第一场。烟花味还在空气里。球员通道里，摄像机在拍——全世界几亿人在看。国歌响起，你把手放在胸口。从八岁就在等的时刻。',
        choices: {
            left:  { label: '感受这一刻', effects: { team: 3, ability: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你笑着踢完第一场。快乐传递全队——踢得像街头踢球的孩子。终场赢了。对着镜头飞吻——给在家看直播的母亲。永远不会忘记。' },
            right: { label: '严肃以待', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你踢得极其严肃——进球也不庆祝。赛后看照片——表情很凶。世界杯不只一场战役——也该是庆典。紧张可以赢球，快乐可以赢下整届赛事。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_g2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_group', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'wc',
        title: '世界杯 · 小组赛次战',
        description: '第二场。非洲冠军——速度和力量让人窒息。教练提醒注意左边锋："他跑起来像猎豹。"第一次被过你就知道了——他太快了。每次他拿球，防线后退三步。需要改变。',
        choices: {
            left:  { label: '贴身紧逼', effects: { ability: 3, ambition: 2, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你紧贴着他——但他爆发时你只看到背影。突破后助攻得分。贴身防比你快的人就像在高速公路上步行——永远到不了他去的方向。' },
            right: { label: '提前预判', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你不再追他——开始封堵接球线路。下一次传球你已在线上——断走。猎豹没有球就像没有腿。对付速度——让他根本拿不到球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_g3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_group', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 小组赛生死战',
        description: '最后一场。看台上球迷涂着国旗色，举着牌子："带我们去淘汰赛。"他们请了假、花了积蓄、飞了半个地球。现在轮到你了。',
        choices: {
            left:  { label: '为球迷而战', effects: { team: 4, ability: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你踢了这辈子最拼命的一场。为那些涂着国旗的脸。终场哨响——晋级。走向看台鞠躬。那些脸——今晚他们会庆祝到天亮。你是原因之一。' },
            right: { label: '为荣耀而战', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你踢得像最后一场。进球，全场最佳。但赛后看那些球迷——有人哭了。世界杯不只是证明自己的舞台——是让一个国家团结在一起的理由。下次，你会记得那些脸。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_group_pass2', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 12, ambition: 3 }, choiceLeftLabel: '进军16强',
      title: '世界杯16强', timelineText: '世界杯：从小组赛突围', timelineType: 'gold',
      description: '积分榜定格。你的国旗在晋级区。你看着看台上那些涂着国旗的脸——今晚这个国家会为你庆祝。世界杯淘汰赛。还有四场。但今晚——今晚先喘口气。16强的对手明天才知道。' },
    { id: 'wc_group_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4, reputation: -3 }, choiceLeftLabel: '告别世界杯',
      title: '小组出局', timelineText: '世界杯：止步小组赛', timelineType: 'bad',
      description: '终场哨响。你蹲在中圈——不想起来。那些涂着国旗的脸在看台上——他们还在唱。即使输了他们还在唱。你站起来朝看台鼓掌——眼泪混着汗水。世界杯。四年一次的梦想。你的第一次世界杯在这里结束了。但不是最后一次。那些脸——你欠他们下一次。' },
    // ════════════════════════════════════════════════════════
    //  世界杯 · 16强 (2事件连续)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_r16_1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_r16', step: 1, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'wc',
        title: '世界杯 · 16强',
        description: '淘汰赛。没有"如果"。南美劲旅——技术像桑巴舞。但淘汰赛不是表演——是生存。教练写了两个字：冷静。南美人在跳舞，你在思考。',
        choices: {
            left:  { label: '打乱节奏', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你用犯规和界外球打断他们的节奏——不是粗暴，是聪明。南美人开始烦躁。足球不只是技术——是节奏。半场结束，他们不跳舞了。在担心。' },
            right: { label: '以技对技', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你跟他们比脚法——穿裆引来惊呼。但南美人穿裆的历史更长。半场结束你气喘吁吁，他们刚热身完。和舞者比跳舞不是好主意——你要关掉音乐。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_r16_2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_r16', step: 2, totalSteps: 2, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'wc',
        title: '世界杯 · 16强下半场',
        description: '下半场。南美人动作越来越大。看台上国旗飘扬——你们的颜色更多。队友双腿抽筋拒绝下场。你在看他——然后做决定。',
        choices: {
            left:  { label: '扛起进攻', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始单干——但太累了。第85分钟射门被扑出。聚光灯很诱人——但最亮的光照出你最疲惫的样子。你不是一个人——是十一人。' },
            right: { label: '为队友创造', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始传球——让体力更好的队友突破。第88分钟直塞找到前锋——进球。你跪在地上。世界杯英雄不是进球者——是所有人累了时做最聪明选择的那个人。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_r16_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 12, wealth: 3 }, choiceLeftLabel: '进军八强',
      title: '世界杯八强', timelineText: '世界杯：挺进八强', timelineType: 'gold',
      description: '终场哨响。八强。你跪在地上——不是因为累，是因为这一刻的重量。世界杯八强。你的国家在屏幕上打出了你的名字。球员通道里有记者等着——但你走向了看台。那些涂着国旗的脸——今晚他们是最幸福的。' },
    { id: 'wc_r16_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -3, reputation: -2 }, choiceLeftLabel: '告别世界杯',
      title: '16强出局', timelineText: '世界杯：止步16强', timelineType: 'bad',
      description: '终场哨响。世界杯结束了。你坐在草坪上——不想起来。南美人在庆祝。你想起那些涂着国旗的脸——对不起。这个词卡在喉咙里。但球迷还在唱。他们的歌声是你今晚唯一的安慰。下一次——你会关掉音乐。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 · 八强 (3事件连续, 2通过)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_qf1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_qf', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'wc',
        title: '世界杯 · 八强',
        description: '八强。卫冕冠军——穿着星标球衣。小时候在电视上看他们夺冠，现在站在他们对面的半场。一个你敬佩十年的传奇在你防区——你的考验。',
        choices: {
            left:  { label: '尊重但不畏惧', effects: { team: 3, ability: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有退缩——但没有一次恶意。半场结束时你对传奇做了个手势——不是挑衅，是认可。他看了看你，点了头。尊重是赢得的——不是因为你是粉丝，是你是值得的对手。' },
            right: { label: '挑战他', effects: { ambition: 4, ability: 2, team: -1 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你从第一分钟狠狠对抗他。撞倒了他，哨子没响。他站起来拍土——没看你。挑战传奇最好的方式不是让他知道你来了——是让他知道你不走了。用表现说话。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_qf2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_qf', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'right', stepCorrectSide: 'right' },
        icon: 'swords', color: 'wc',
        title: '世界杯 · 八强下半场',
        description: '下半场。卫冕冠军换上速度型边锋——20岁，比所有人都快。教练大喊让你想办法。速度是天赋无法改变——但可以改变他接球的位置。',
        choices: {
            left:  { label: '双人夹击', effects: { team: 3, ambition: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你叫队友夹击——但每次夹击，别处就多一个空位。第70分钟他的传球撕开防线。更多人不代表更安全——尤其面对比你快的人。' },
            right: { label: '压迫传球者', effects: { ability: 3, team: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你没有追他——去追了传球者。紧贴中场，不让出球。年轻人回撤越来越深——只能在四十码外拿球。他的速度还在——但离球门四十码的速度没有意义。最好的防守是让武器够不到你。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_qf3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_qf', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 八强关键时刻',
        description: '尾声。角球——最后机会。周围是汗水和祈祷。球飞入禁区——慢动作。世界杯的重量在这个球上。',
        choices: {
            left:  { label: '勇往直前', effects: { ability: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你跳起来了——比所有人高。不是因为弹跳，是渴望。头球入网。世界杯四强。你会告诉你的孙子——面对传奇和天才，你跳得比他们所有人都高。' },
            right: { label: '战术角球', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你示意短传——战术角球。卫冕冠军预判了解围。终场——加时。战术大多数时候是对的——但在最后一分钟，最简单的就是把球踢进禁区然后跳得比所有人高。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_qf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 14, ambition: 4 }, choiceLeftLabel: '走向半决赛',
      title: '世界杯四强', timelineText: '世界杯：挺进四强', timelineType: 'gold',
      description: '终场哨响。四强。你跪在地上。卫冕冠军被你淘汰了。更衣室里你收到了那个传奇的球衣——他在上面签了名，写了一行字："下一个是你。"你还不知道这行字会在你心里留多久。还有两场。世界杯半决赛。' },
    { id: 'wc_qf_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -3, reputation: -2 }, choiceLeftLabel: '告别世界杯',
      title: '八强梦碎', timelineText: '世界杯：止步八强', timelineType: 'bad',
      description: '终场哨响。八强——到此为止。你和卫冕冠军的球员交换了球衣。那个传奇拍了拍你的肩膀。你没有晋级——但你赢得了尊重。八强已经很远了——但这让你更想要更远。下一次。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 · 半决赛 (4事件连续, SPLIT: 前2需≥1 + 后2需≥1)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_sf1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 1, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'wc',
        title: '世界杯 · 半决赛',
        description: '半决赛。离决赛一步。首发名单上你的名字——几十亿人在看。国歌响起眼眶湿了。那个在院子里对墙踢球的小孩——走到了世界杯半决赛。',
        choices: {
            left:  { label: '享受比赛', effects: { team: 3, ability: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让快乐充盈双脚。跑得自由——不是不重视，是相信自己。半场时你笑了。在最顶级舞台做最爱的事。紧张不会让你更好——快乐会。' },
            right: { label: '极度专注', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你绷紧每根神经。半场结束精疲力竭——精神消耗。队友需要冷静的领袖，不是随时会崩断的弦。专注是武器——焦虑不是。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_sf2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 2, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'right' },
        icon: 'swords', color: 'wc',
        title: '世界杯 · 半决赛下半场',
        description: '下半场。对手核心在你和后卫之间接球——每次转身防线紧张。教练喊你——他是发动机，你要关掉发动机。',
        choices: {
            left:  { label: '区域盯防', effects: { team: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你试图和后卫夹击——但每次交接都是他的机会。第65分钟转身远射进球。区域盯防弱点不在人——在交接。他是利用交接的大师。' },
            right: { label: '人盯人', effects: { ability: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你走到教练旁："我来。"接下来三十分钟他的影子——他去哪你去哪。他烦躁了，失误了。最简单的战术：这个人，我来。不需要沟通——只有你和他。今天你更想要。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_sf3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 3, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'left' },
        icon: 'hourglass', color: 'wc',
        title: '世界杯 · 加时',
        description: '加时。腿在燃烧——跑动像在胶水里。教练不会换你。还有十五分钟——要么决赛，要么什么都没有。',
        choices: {
            left:  { label: '豁出去', effects: { ability: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你用心脏跑。第110分钟从自家禁区冲到对方禁区——球进了。跪在地上。世界杯决赛。不是因为天赋——是拒绝放弃。加时关于谁更想要。' },
            right: { label: '保存体力', effects: { team: 2, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始走，接受点球大战。最后两分钟对手进球了。遗憾比任何疲惫都重——你提前放弃了这一秒，这一秒放弃了你。决赛属于拼到最后的人。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_sf4', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 4, totalSteps: 4, judgeType: 'split_counter', stepCorrectSide: 'right' },
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 最后机会',
        description: '最后一分钟。球在脚下——禁区边缘。队友远端无人盯防。全场起立。半秒钟。世界杯决赛在球门另一边。',
        choices: {
            left:  { label: '射门', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你起脚——门将扑出，球擦柱偏出。队友在远端——他的手还没放下。相信自己是勇气，相信队友是更大的勇气。你的队友也在那里——他的手还在举着。' },
            right: { label: '传球', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你脚弓一推——球精准滚到队友脚下。空门。他跪地哭了——你跑过去抱住他。最伟大的触球不是你射门时——是你传球的瞬间。你选择了相信别人——他没有辜负你。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_sf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 16, ambition: 5 }, choiceLeftLabel: '走向决赛',
      title: '世界杯决赛门票', timelineText: '世界杯：杀入决赛', timelineType: 'gold',
      description: '终场哨响。世界杯决赛。你躺在草坪上——不是因为累，是因为你不敢相信。整个国家今晚不会睡觉。你的手机亮了——几百条消息。你没有看任何一条。你只是躺在那儿——看着天空。还有一场。最后一场。你的最后一场世界杯比赛——会是你的最后一场比赛吗？你不知道。但你知道你会把一切都留在场上。一切。' },
    { id: 'wc_sf_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -5, reputation: -3 }, choiceLeftLabel: '心碎离场',
      title: '半决赛之憾', timelineText: '世界杯：止步半决赛', timelineType: 'bad',
      description: '终场哨响。决赛——不是你的。你跪在草坪上。眼泪流进嘴里——咸的。世界杯半决赛——你离决赛只有一步。但这一步是用所有正确选择铺成的。你没有走完。下一次？下一次是四年后——那时你还会在吗？你不知道。但你知道你会记住今晚——记住每一个错误和每一个教训。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 · 决赛 (3+2+1 CONDITIONAL_EXTEND + secondExtend)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_fn1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 1, totalSteps: 3, judgeType: 'conditional_extend', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 决赛',
        description: '世界杯决赛。大力神杯在入口处——金色。你克制住摸它的冲动。国歌响起，手放国旗上。二十亿人在看。那个光脚踢球的小孩在你心里说：去吧。',
        choices: {
            left:  { label: '稳定军心', effects: { team: 4, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你深呼吸——把球传给每个队友，让心跳和球一起滚动。节奏渐渐稳下来。决赛最大的对手不是对面——是自己的紧张。你驯服了它。' },
            right: { label: '开场震慑', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你从第一秒全力冲刺。但决赛有90分钟——可能更长。前十分钟泼出去的体力，后八十分钟怎么办？震慑之后需要有东西留下来。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_fn2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 2, totalSteps: 3, judgeType: 'conditional_extend', stepCorrectSide: 'right' },
        icon: 'swords', color: 'wc',
        title: '世界杯 · 决赛下半场',
        description: '下半场。对手边后卫疯狂前插，试图用人数压垮边路。边锋体力下降。教练指着你的方向——让你解决。',
        choices: {
            left:  { label: '协防边路', effects: { team: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你退到边路帮忙——守住一边，另一边被打穿。防守可以拖延时间——不能改变局势。' },
            right: { label: '以攻代守', effects: { ability: 3, team: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你反而在对方半场更多拿球。边后卫犹豫了——每次前插身后都是空档。第70分钟反击进球。最好的防守是让对方不敢离开自己的半场。不在于防了多少——在于让对方害怕了多少。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_fn3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 3, totalSteps: 3, judgeType: 'conditional_extend', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'wc',
        title: '世界杯 · 决赛关键时刻',
        description: '最后一分钟。球飞入禁区——正飞向你的头顶。生命中最重要的一次触球。不会再有了。',
        choices: {
            left:  { label: '绝杀', effects: { ability: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你腾空而起。球入网角。落地时世界已不同。大力神杯。跪在地上——眼泪汗水流进嘴里。世界杯冠军。这个头衔没有人能拿走。' },
            right: { label: '摆渡', effects: { team: 3, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你选择摆渡——门将出击摘走。进入加时。没有时间后悔——忘掉刚才半秒钟。接下来三十五分钟才是你能控制的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // ── 加时赛 (CONDITIONAL_EXTEND) ──
    {
        id: 'wc_et1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 4, totalSteps: 5, judgeType: 'conditional_extend', stepCorrectSide: 'left' },
        icon: 'hourglass', color: 'wc',
        title: '世界杯 · 加时赛',
        description: '加时。身体在尖叫。教练没换人名额了。父亲在看台上——他从没错过你的重要比赛。你会让他怎么记住这场？',
        choices: {
            left:  { label: '榨干自己', effects: { ability: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你强迫双腿移动——它们已不是你的。一次冲刺超越三人——不因为速度，是拒绝输。球进了。你抬头看向父亲的方向。他不知道你在看他——但你知道他在。' },
            right: { label: '保留体力', effects: { team: 2, ambition: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始节省体力。上半场无进球。还有十五分钟。你已开始计算——真正伟大的人不计算。有时候需要不再思考——只是去做。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'wc_et2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 5, totalSteps: 5, judgeType: 'conditional_extend', stepCorrectSide: 'right' },
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 加时下半场',
        description: '最后三分钟。角球。心跳每分钟两百下。大力神杯在场边——金色在灯光下闪烁。最后一个机会。',
        choices: {
            left:  { label: '前点争抢', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你冲前点——被两人夹住。角球飞向后点，无人碰到。终场。勇气需要方向——最勇敢的选择不是去最拥挤的地方，是去没人去的地方。' },
            right: { label: '后点埋伏', effects: { ability: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你埋伏后点——不在人群最密处。球飞来——预判正确。头球。大力神杯。举起的那一刻金光映脸——也映亮了父亲的眼。世界冠军。没有人能拿走。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // ── 点球大战 (secondExtend) ──
    {
        id: 'wc_pk', category: 'on_field', tension: 4,
        icon: 'trophy', color: 'wc',
        title: '世界杯 · 点球大战',
        description: '点球大战。走向十二码——每步像踩钉子。门将在跳，看台上有人祈祷。球放白点。整个世界的重量。深呼吸——就是现在。',
        choices: {
            left:  { label: '果断推射', effects: { ability: 4 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你助跑——没有犹豫。脚内侧，球入上角。门将猜错方向。转身狂奔——整个国家在尖叫。大力神杯举起——世界变成国旗的颜色。世界冠军。你是世界冠军。' },
            right: { label: '勺子点球', effects: { ambition: -4, reputation: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你决定用勺子。全世界屏息。球搓起——门将没动——抱在怀里。世界在旋转。勺子——最勇敢也最残忍。不是每个大胆都值得执行。有些时刻需要稳妥，不是传奇。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    { id: 'wc_champion', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 20, wealth: 12, ambition: 5 }, choiceLeftLabel: '举起大力神杯',
      title: '世界冠军', milestone: { id: 'worldCupWinner', text: '国家英雄！' },
      timelineText: '世界杯冠军：登顶世界之巅', timelineType: 'gold',
      description: '大力神杯被你举过头顶。金色的。比想象中重。漫天金色纸屑飘落——全世界在为你庆祝。你想起那个在后院踢球的小孩——踢到天黑，母亲喊回家吃饭。那个小孩梦想过这一刻——但现实比梦想更美。世界冠军。你是世界冠军。',
      unlocks: ['wc_hero_ev'] },
    { id: 'wc_final_fail', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: 5, ambition: -4 }, choiceLeftLabel: '仰望大力神杯',
      title: '一步之遥', timelineText: '世界杯：倒在决赛', timelineType: 'normal',
      description: '终场。大力神杯被对手举起来了。你站着——看着金色的光。你走到了世界杯决赛。只差一步。但这一步是用无数正确选择铺成的。今晚你没有走完。你看着大力神杯——它的光还在。下一次——如果还有下一次——你会记住今晚的一切。' },

    // 世界杯夺冠庆祝
    {
        id: 'wc_hero_ev', category: 'media_fans', tension: -2, consequenceOnly: true,
        icon: 'trophy', color: 'wc',
        title: '英雄归来',
        description: '飞机降落时你从舷窗看到跑道两侧全是人——不是来接机的，是来朝圣的。车队驶过首都大道——人群从机场一直铺到市中心。街道上挂满了国旗。有人举着你小时候的照片——你穿着校队球衣，膝盖上全是泥。那个小孩现在坐在敞篷车里——大力神杯在你怀里。',
        choices: {
            left:  { label: '回到童年的球场', effects: { reputation: 5, team: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让车队改道——去了你小时候踢球的泥地。球门还在——锈迹斑斑。你穿着西装坐在草地上——把大力神杯放在身边。一群孩子围过来了——他们不知道你是谁，但他们认识你怀里的奖杯。"可以摸摸吗？"一个男孩问。你点了点头。他摸了一下——然后尖叫着跑开了。那个男孩就是你。三十年前。' },
            right: { label: '发表全国演讲', effects: { reputation: 4, ambition: 4 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你拿起话筒——声音通过喇叭传遍整条大道。"这个奖杯——不是我的，是你们的。"人群的欢呼声盖过了后面所有的话。几亿人在直播里看着你。你说完放下了话筒——看着人群。世界冠军。你的国家因为你而骄傲。这个头衔——没有人能拿走。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // ── 独立场上事件 ──
    {
        id: 'field_derby', category: 'on_field', tension: 2,
        icon: 'swords', color: '',
        title: '德比之战',
        description: '德比日。球场的声浪像一堵墙。对手的队长从第5分钟就在用小动作挑衅——肘子、拉球衣、裁判转身时顶你的胸口。他会一直这样。你会——',
        choices: {
            left:  { label: '撞回去',   effects: { ambition: 3, reputation: -4 },
                     flagsSet: {}, flagsAdd: { locker_tension: 1, media_heat: 1 }, flagsClear: [],
                     narrative: '你肩膀一沉撞了回去。裁判吹哨——黄牌。看台炸了锅。但对手收敛了——他知道你不是软柿子。代价是一张黄牌和无数赛后评论。' },
            right: { label: '保持冷静', effects: { ability: 4, team: 3, reputation: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你深吸一口气，转身跑回位置。十分钟后你用一记世界波让整个球场安静下来。最好的报复不是撞回去——是让对方的球网颤动。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { min: 25 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'field_last_minute', category: 'on_field', tension: 2,
        icon: 'hourglass', color: '',
        title: '第89分钟',
        description: '1:1。第89分钟。球落到你脚下——禁区边缘，半个空门。你的队友在远端无人盯防，张开了双臂。全场八万人站了起来。这个决定只有半秒。',
        choices: {
            left:  { label: '自己射',   effects: { ability: 4, ambition: 4, reputation: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你闭眼抽射。球钻入死角。队友们冲向你——但你注意到那个在远端等球的队友没有跑过来。他只是在原地鼓了两下掌。英雄和自私之间的那条线，比球门线还细。' },
            right: { label: '横传队友', effects: { team: 4, ability: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你轻轻一推，球滚到队友脚下。他轻松推进空门。庆祝时他第一个抱住的不是球门——是你。"兄弟，那是你的进球。我只是碰到了。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { min: 35 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'field_goal_drought', category: 'on_field', tension: 1,
        icon: 'cactus', color: '',
        title: '进球荒',
        description: '六场没进球了。社交媒体上球迷开始怀疑。训练场上你每次射门都用力过猛——好像要把球踢穿球网。教练给了你一天休息。',
        choices: {
            left:  { label: '加练射门', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsStartTimers: { form_slump: 3 }, flagsClear: [],
                     narrative: '你留下来加练了两个小时。球门后的草皮都被你踢秃了一块。保安来关灯的时候你还在练。汗水流进眼睛——你不在乎。下次比赛，你会准备好的。' },
            right: { label: '休整一天', effects: { team: 3, ability: 1, ambition: -2 },
                     flagsStartTimers: {}, flagsClear: ['form_slump'],
                     narrative: '你去了海边。坐在沙滩上看着海浪，什么都不想。第二天训练时你发现自己的射门不再那么用力了——球自然就进了。有时候松手才是答案。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { max: 70 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'field_training_highlight', category: 'on_field', tension: -2,
        icon: 'soccer', color: '',
        title: '训练闪光',
        description: '训练赛上你今天状态奇好。一个脚后跟传球让教练吹响了哨子——不是因为犯规，是因为他不敢相信。队友们围过来揉你的头发。',
        choices: {
            left:  { label: '分享技巧', effects: { team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你拉着几个年轻球员，一遍遍地演示。有人做出来了——欢呼声响彻训练场。教练在场边点了点头，在本子上记了一笔。' },
            right: { label: '保持专注', effects: { ability: 2, ambition: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你笑了笑继续训练。好状态不值得炫耀——值得珍惜。你用剩下的时间又进了两个球。一个影子前锋在远处看着，也在学。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'none'
    },

    // ════════════════════════════════════════════════════════
    //  类别2: 教练战术 (coach_tactics) — 因果链
    //  触发链: 新阵型→公开批评→被换下 / 要求转会
    // ════════════════════════════════════════════════════════
    {
        id: 'coach_new_formation', category: 'coach_tactics', tension: 1,
        icon: 'shuffle', color: 'coach',
        title: '变阵',
        description: '教练在战术板上画了新阵型。你的位置要从攻击型中场后撤到后腰——更少的射门，更多的防守。他说"这是为了球队"。你觉得这是在浪费你的天赋。',
        choices: {
            left:  { label: '接受', effects: { team: 3, ability: -2, ambition: -3 },
                     flagsAdd: {}, flagsClear: ['coach_anger'],
                     narrative: '你点了点头。头几周你踢得很别扭——丢球、失位、被过。但第三个月，你的拦截数据排进联赛前三。你开始理解这个位置的美——不是在聚光灯下，是在阴影里。' },
            right: { label: '坚持', effects: { ambition: 3, team: -2 },
                     flagsSet: {}, flagsAdd: { coach_disrespect: 1 },
                     flagsClear: [], unlocks: ['coach_public_criticize'],
                     narrative: '你敲了教练的门。"我不认为那是我的位置。"教练看了你很久。下一场大名单里你的名字后面跟着那个你不想要的位置。他用行动回答了你的请求。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['challenged_coach'], requireStats: { ability: { min: 30 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'coach_public_criticize', category: 'coach_tactics', tension: 2, consequenceOnly: true,
        icon: 'mic', color: 'coach',
        title: '公开批评',
        description: '赛后发布会上教练当着所有记者的面说你"最近态度有问题"。更衣室里每个人都听到了——有人低下了头，有人偷偷看你。手机在口袋里震个不停。',
        choices: {
            left:  { label: '公开回击', effects: { ambition: 4, team: -7, reputation: -3 },
                     flagsSet: { challenged_coach: true, publicly_criticized: true },
                     flagsAdd: { coach_disrespect: 2, media_heat: 2 },
                     flagsClear: [], unlocks: ['trans_unhappy', 'coach_bench'],
                     narrative: '你在社交媒体上发了一条："输球就找替罪羊的人不配带队。"点赞瞬间破万。但第二天训练场的气氛冷得能冻住呼吸。有些话说出口就收不回了。' },
            right: { label: '私下谈', effects: { team: 4, ambition: -2, reputation: 2 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['coach_anger', 'coach_disrespect'],
                     narrative: '你等记者散了，走进教练办公室。你们谈了四十分钟——关于战术、关于期望、关于尊重。出来时教练拍了拍你的肩膀。有些事只能关上门说，而关上门需要勇气。' }
        },
        hideEffects: true,
        settlementTextLeft:  '你的手机亮了一整夜。经纪人说五个媒体想采访你。你选了转发最多的一条回了。队友们在群聊里沉默——没有人敢第一个说话。',
        settlementTextRight: '你们谈了四十分钟。从战术分歧到个人期望。教练说他骂你是因为对你有更高的期望——这句话他不会在发布会上说。你关上门时走廊只剩一盏灯。',
        conditions: { requireFlags: [], forbidFlags: ['challenged_coach'], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'coach_bench', category: 'coach_tactics', tension: 2,
        icon: 'pensive', color: 'coach',
        title: '被换下',
        description: '第55分钟，场边举起了你的号码。你愣住了——没有受伤，表现也不算差。替补席上那个年轻人已经在场边热身。走过教练身边时他没有抬头。',
        choices: {
            left:  { label: '径直回更衣室', effects: { ambition: 3, team: -8, reputation: -3 },
                     flagsSet: {}, flagsAdd: { coach_disrespect: 1, media_heat: 1 },
                     flagsClear: [], unlocks: ['trans_unhappy'],
                     narrative: '你没看教练，直接走进球员通道。摄像机追着你。赛后记者问教练他只说了四个字："战术选择。"那天晚上你盯着天花板——这里你还想待下去吗？' },
            right: { label: '坐到替补席上', effects: { team: 3, ambition: -3, reputation: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['coach_anger'],
                     narrative: '你坐在替补席上为队友鼓掌。换下你的人进球了——你第一个站起来。教练赛后说："谢谢。"有时候最硬的骨头不是对抗，是弯下腰还能微笑。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },

    // ════════════════════════════════════════════════════════
    //  类别3: 更衣室 (locker_room) — 独立 + 风暴系列
    // ════════════════════════════════════════════════════════
    {
        id: 'locker_new_teammate', category: 'locker_room', tension: -2,
        icon: 'wave', color: '',
        title: '新援到来',
        description: '转会窗最后一天签了个年轻中场。他坐在更衣室角落，抱着新球鞋，手指在鞋面上来回摩挲。老队员们各忙各的——没人在看他。',
        choices: {
            left:  { label: '主动招呼', effects: { team: 4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你走过去伸出手。"嘿，你吃了吗？我带你去。"他笑了——那种松了一口气的笑。一周后他在训练场第一次铲球成功，第一个看向你。' },
            right: { label: '点头示意', effects: { ambition: 1, team: -1 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [], narrative: '你点了点头算是打招呼。他花了更长时间融入——有些晚上他一个人在健身房待到很晚。不是加练，是不知道去哪。孤独在更衣室里会传染。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },
    {
        id: 'locker_captain_vote', category: 'locker_room', tension: 2,
        icon: 'medal', color: 'locker',
        title: '队长投票',
        description: '老队长要转会了。教练组织新队长投票。两个候选人——你和队里的头号射手。他有数据，你有威望。更衣室分成了两派。',
        choices: {
            left:  { label: '主动竞争', effects: { ambition: 4, team: -2, reputation: 3 },
                     flagsSet: { gave_captain_speech: true },
                     flagsAdd: {}, flagsClear: [], unlocks: ['locker_veteran_retire'],
                     narrative: '你在投票前站起来说了一段话——关于球队的未来，关于你想创造的文化。投票结果：你以两票优势胜出。袖标很轻，但戴上的那一刻你的肩膀沉了一下。' },
            right: { label: '退让', effects: { team: 3, ambition: -4, reputation: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你站起来说："我觉得他比我更适合。"会议室安静了两秒。后来有人告诉你，那两秒让你赢得了比袖标更多的东西——尊重。不争的领袖，有时候比争来的更强大。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { team: { min: 40 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_veteran_retire', category: 'locker_room', tension: 1,
        icon: 'old', color: 'locker',
        title: '老将退役',
        description: '更衣室里最老的那个队友宣布退役。清理储物柜时他从里面翻出一张泛黄的球队合照——2006年的。他看着照片上年轻的自己，笑了。二十年。',
        choices: {
            left:  { label: '组织全队告别', effects: { team: 4, reputation: 3, wealth: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你组织了一个小仪式。每人都说了一句关于老将的回忆。说到第十个人时他哭了——二十年，第一次有人在更衣室看到他哭。不是难过，是被记住。你用自己的钱订了一个纪念框。' },
            right: { label: '私下告别', effects: { team: 2, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你在停车场等到他。两个人坐在后备箱上喝啤酒。他说："小子，你还有十年——别浪费。"你记住了。有时候一罐啤酒比一百句场面话更重。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { age: { min: 23 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_team_dinner', category: 'locker_room', tension: -2,
        icon: 'plate', color: '',
        title: '球队聚餐',
        description: '有人提议赛后去烤肉。账单来了——服务生把它放在你面前。中卫一个人吃了三份和牛。全桌安静了两秒。',
        choices: {
            left:  { label: '爽快买单', effects: { team: 4, wealth: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你把卡递过去。全队欢呼。中卫拍着肚子说下次他请——你知道他不会，但没关系。回训练基地的车上有人在唱歌。这笔钱买到了比分牌上永远看不到的东西。' },
            right: { label: 'AA吧', effects: { wealth: 1, team: -2 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '"AA。"你说。气氛冷了一拍。没人反对。但你注意到几个年轻球员摸了摸口袋——你知道他们的薪水只有你的十分之一。公平有时候是另一种不公平。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { wealth: { min: 20 } } },
        cooldown: 'once_per_season'
    },
    // ── 更衣室风暴 (伏笔) ──
    {
        id: 'locker_storm_1', category: 'locker_room', tension: 2,
        series: { type: 'foreshadow', id: 'locker_crisis', step: 1, totalSteps: 3 },
        icon: 'speaking', color: 'locker',
        title: '更衣室的裂痕',
        description: '训练后在角落里几个球员在低声议论教练的安排。有人觉得某人总被特殊对待。你听到了自己的名字——有人说你是"教练的宠儿"。你要介入吗？',
        choices: {
            left:  { label: '直面问题', effects: { ambition: 4, team: -2 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '"如果你们有意见，应该在更衣室里说，不是在背后。"几双眼睛看向你。气氛更僵了——但至少话说开了。诚实有时候让人不舒服，但它比谎言干净。' },
            right: { label: '假装没听见', effects: { team: 1, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你戴上耳机走出更衣室。但问题不会因为假装没听见就消失——它只是换了种方式发酵。第二天有人在训练场上故意不给你传球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_storm_2', category: 'locker_room', tension: 2,
        series: { type: 'foreshadow', id: 'locker_crisis', step: 2, totalSteps: 3 },
        icon: 'swords', color: 'locker',
        title: '裂痕扩大',
        description: '训练赛上两队人马互不传球。教练吹停了三次——不是因为战术，是因为火气。更糟的是：有人把更衣室的事泄露给了媒体。头条写着：《内战》。',
        choices: {
            left:  { label: '揪出泄密者', effects: { ambition: 3, team: -8, ability: 2 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '你挨个问。问到第三个人时他红了脸。泄密者被内部停训。更衣室安静了——安静得像图书馆。秩序恢复了，但温度也降了。没有人再开玩笑。' },
            right: { label: '召集所有人', effects: { team: 3, ambition: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: ['locker_tension'],
                     narrative: '你把所有人叫到一起。"有什么话现在说——不要让外面的人替我们写故事。"沉默。然后一个老将站起来说了第一句。之后每个人都说了。问题没有消失——但它不再是炸弹，只是问题了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_storm_3', category: 'locker_room', tension: 2,
        series: { type: 'foreshadow', id: 'locker_crisis', step: 3, totalSteps: 3 },
        icon: 'shuffle', color: 'locker',
        title: '重建秩序',
        description: '高层介入。他们问你意见：清洗闹事的球员重建纪律，还是由你出面把更衣室重新凝聚起来？这个决定会影响这支球队很多年。',
        choices: {
            left:  { label: '支持清洗', effects: { ambition: 3, team: -12, ability: 3, reputation: -3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['locker_tension'],
                     narrative: '你点了点头。转会窗关闭时三个人离开了。更衣室安静了——静得能听到空调声。没有人再吵架，也没有人再开玩笑。秩序恢复了，但温度降到了冰点。这是你要的更衣室吗？' },
            right: { label: '亲自调解', effects: { team: 3, ambition: 3, reputation: 4 },
                     flagsSet: { became_captain: true }, flagsAdd: {}, flagsClear: ['locker_tension'],
                     narrative: '你花了一个月挨个谈话。有人嫌你多管闲事，有人说你救了这支球队。赛季末最后一轮，全队在你进更衣室时一起鼓掌。不是因为进球——是因为你没有放弃任何一个人。俱乐部把袖标交给了你。' }
        },
        hideEffects: true,
        settlementTextLeft:  '三个储物柜空了。球队的工资单轻了，走廊里的笑声也轻了。秩序不是重建的——是清空后留下的寂静。你站在空了的柜子前，想起他们第一天来时的样子。',
        settlementTextRight: '赛季最后一轮，全队等你进更衣室。你进去时他们一起鼓掌。不是因为进球——是因为你没有放弃任何一个人。袖标很轻——但为什么你的肩膀有点沉？',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },

    // ════════════════════════════════════════════════════════
    //  类别4: 媒体球迷 (media_fans) — 5个
    // ════════════════════════════════════════════════════════
    {
        id: 'media_trap_question', category: 'media_fans', tension: 1,
        icon: 'mic', color: 'media',
        title: '记者陷阱',
        description: '话筒递过来："有传言说你和主教练关系紧张——你对此有什么回应？"录音笔的红灯亮了。周围突然安静——所有人都在等你的嘴。这是一颗精心布置的地雷。',
        choices: {
            left:  { label: '直言', effects: { reputation: -3, team: -2 },
                     flagsSet: { publicly_criticized: true },
                     flagsAdd: { media_heat: 2, coach_disrespect: 1 },
                     flagsClear: [], unlocks: ['coach_public_criticize'],
                     narrative: '第二天的头版是你的原话——断章取义的那种。但你给了他们刀子，怎么捅是他们的专业。教练一整天没跟你说话。' },
            right: { label: '回避', effects: { reputation: 4, team: 2 },
                     flagsAdd: {}, flagsClear: ['media_heat'],
                     narrative: '"教练和我的目标一样——赢球。其他是你们记者编的。"记者笑了一下关掉录音笔。他不是放弃了——是今天钓不到鱼。你保住了脸面，也保住了更衣室的温度。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 10 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_transfer_rumor', category: 'media_fans', tension: 1,
        icon: 'newspaper', color: 'media',
        title: '转会传闻',
        description: '报纸头版：你的照片旁边是一个豪门的队徽。队友们开始拿你开玩笑——"大球星别忘了我们啊"。经纪人发来消息：那家俱乐部确实在关注你。',
        choices: {
            left:  { label: '公开否认', effects: { team: 4, reputation: 2 },
                     flagsStartTimers: {}, flagsClear: ['transfer_rumor'],
                     narrative: '"我在这里很开心。"你在社交媒体上发了一张穿母队球衣庆祝的老照片。球迷放心了。队友不开玩笑了——至少暂时。经纪人发了一个😐。' },
            right: { label: '保持暧昧', effects: { ambition: 4, team: -2, wealth: 3 },
                     flagsStartTimers: { transfer_rumor: 5 }, flagsClear: [], unlocks: ['trans_agent_call'],
                     narrative: '你笑了笑没有回应。沉默是最聪明的语言——它让每个人都按自己的愿望解读。经纪人发来👍。你的电话在未来几周会响个不停。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 15 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_fan_banner', category: 'media_fans', tension: -2,
        icon: 'heart', color: 'media',
        title: '球迷横幅',
        description: '今天看台上多了一条横幅——上面是你的名字。写着："他从这里走出去的。"落款是你少年时踢球的社区球场。那个破球场。你很久没回去过了。',
        choices: {
            left:  { label: '回去看看', effects: { reputation: 3, team: 2, wealth: -1 },
                     flagsAdd: {}, flagsClear: ['fan_outrage'],
                     narrative: '你开车去了那个旧球场。球门还是一样的锈迹，草坪还是一样的坑洼。几个孩子正在踢球——看到你时尖叫起来。你和他们踢了半小时。开车回家时你发现自己笑得像个八岁的孩子。' },
            right: { label: '转发感谢', effects: { reputation: 2, ambition: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你拍了横幅的照片发上网。十万点赞。但手机屏幕熄灭后你盯着天花板——你是不是很久没回去过了？点赞很容易，开车回去很难。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_social_post', category: 'media_fans', tension: -2,
        icon: 'phone', color: 'media',
        title: '社交媒体',
        description: '你的账号涨了不少粉。品牌方私信你——营养品、手表、电竞椅。经纪人说要经营形象。教练说过少玩手机。你刚发的训练照下面两派人在吵架。',
        choices: {
            left:  { label: '用心经营', effects: { wealth: 2, reputation: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你花了一小时回复评论。有人被你翻牌激动得连发三条。品牌方又多来了两个私信。人气是一种资产——你很早就懂了。' },
            right: { label: '放下手机', effects: { ability: 2, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你关掉手机，去了健身房。空无一人。练到天黑——没人拍照没人点赞。但你的身体在感谢你。最好的训练往往是没有观众的那一次。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 8 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_press_conference', category: 'media_fans', tension: 1,
        icon: 'tv', color: 'media',
        title: '赛后发布会',
        description: '镜头闪着红光。第一排那个女记者是你的老熟人了——她写过一篇关于你的尖刻评论。"你对自己今天的表现满意吗？"',
        choices: {
            left:  { label: '坦诚', effects: { reputation: 3, team: 2 },
                     flagsAdd: {}, flagsClear: ['media_heat'],
                     narrative: '"不满意。我踢得不好——但我从不逃避批评。"记者们安静了。他们习惯了球员找借口。诚实是最好的公关——只是很少有人敢用。' },
            right: { label: '转移话题', effects: { team: 4, reputation: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"今天我们整体都不够好，不只是我。"你把话题引向战术和团队。教练在旁边微微点头——他知道你在保护他。有时候最好的个人回答是不回答个人。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 15 } } },
        cooldown: 'once_per_season'
    },

    // ════════════════════════════════════════════════════════
    //  类别5: 商业 (business) — 4个
    //  核心: 财富↑→能力↓或团队↓
    // ════════════════════════════════════════════════════════
    {
        id: 'biz_endorsement', category: 'business', tension: 1,
        icon: 'diamond', color: 'business',
        title: '品牌代言',
        description: '运动品牌邀请你做代言人。合同金额是你年薪的一半——但需要拍摄和商业活动，占用训练时间。经纪人眼睛在发光。"这是商业帝国的第一步。"',
        choices: {
            left:  { label: '签约', effects: { wealth: 3, reputation: 3, ability: -4 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '摄影棚、化妆师、绿幕——你在里面待了两天。广告牌上的你很帅。但回到训练场时体能数据下降了。金钱能买到很多东西——买不到的是你花在摄影棚的那两天训练。' },
            right: { label: '拒绝', effects: { ability: 3, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"现在我只想在球场上证明自己。"经纪人的脸色很精彩。但你走回训练场时草皮的味道比任何香水都好闻。品牌方说"理解"——其实他们不理解。但你不欠解释。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 20 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_investment', category: 'business', tension: 2,
        icon: 'chart', color: 'business',
        title: '投资机会',
        description: '队友递来投资计划书——高档餐厅，三个分店，预期回报很高。他已经投了，说"就差你一份"。金额不小——差不多是你半年的薪水。但你知道多少球员退役后破产的故事。钱放在银行最安全——但也最不会生长。',
        choices: {
            left:  { label: '投资', effects: { wealth: -10, ambition: 4 },
                     flagsSet: { invested_restaurant: true }, flagsAdd: {}, flagsClear: [],
                     unlocks: ['biz_investment_result'],
                     narrative: '你签了支票。金额后面的零让你挑了挑眉——但你知道钱不流动就只是纸。开业那天人满为患。一个月后餐厅还在排队。也许你比队友更懂商业——也许你只是运气好。时间会告诉你。' },
            right: { label: '婉拒', effects: { wealth: 2, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"谢了兄弟。"你推开计划书。一年后他的餐厅因为经营不善关门了——合伙人不知所踪。队友在你面前骂了三个小时。你递给他一瓶啤酒——没有说"我早说过"。有时候不做决定就是最好的决定。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['invested_restaurant'], requireStats: { wealth: { min: 25 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_investment_result', category: 'business', tension: 1,
        icon: 'chart', color: 'business',
        title: '投资回报',
        description: '一年了。餐厅生意火爆——门口排队的人比球场售票处还长。合伙人递来新计划：开第二家分店，扩大品牌，需要追加投资。但他也给了另一个选项——有人想收购你手里的股份。价格翻倍。你投入的十万现在值二十万。卖还是不卖？',
        choices: {
            left:  { label: '追加投资', effects: { wealth: -25, ambition: 5 },
                     flagsAdd: {}, flagsClear: [],
                     unlocks: ['biz_investment_final'],
                     narrative: '"再来。"你说。合伙人笑了。你又签了一张支票——这次是二十五万，你几乎掏空了积蓄。走出会议室时你在玻璃门上看到自己的倒影——你穿着定制西装，看起来像个商人。但你知道你只是一个会踢球的年轻人。商业世界不会因为你会踢弧线球就对你温柔。' },
            right: { label: '卖出套现', effects: { wealth: 20, ambition: -3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['invested_restaurant'],
                     narrative: '"够了。"你说。合伙人脸垮了——但收购方的支票是真的。十万进去，二十万出来。走出餐厅时你回头看了一眼招牌——上面没有你的名字。但你的银行账户知道你来过。翻倍了——知足是商业里最被低估的美德。' }
        },
        conditions: { requireFlags: ['invested_restaurant'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // 投资链第三步 — 贪婪的代价 (叶子事件, 固定结局)
    {
        id: 'biz_investment_final', isLeaf: true, category: 'business', tension: 2, consequenceOnly: true,
        icon: 'ghost', cardStyle: 'dark',
        effectsLeft: { ambition: -8, reputation: -3 },
        flagsClear: ['invested_restaurant'],
        choiceLeftLabel: '沉默', choiceRightLabel: '沉默',
        title: '血本无归',
        description: '餐厅连锁垮了。供应链断裂、卫生检查没过、合伙人带着剩下的钱消失了——电话成了空号。你投进去的每一分钱都没了。那个"队友"——他现在不接你电话了。不是朋友。是利用你名字的生意人。商业没你想的那么简单。足球场上你掌控一切——但在球场外你只是一个数字比别人大一点的普通人。这个教训很贵。希望你能记住。',
        timelineText: '投资失败：商业帝国梦碎', timelineType: 'bad',
        conditions: { requireFlags: ['invested_restaurant'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_charity_event', category: 'business', tension: -2,
        icon: 'heart', color: 'business',
        title: '社区慈善',
        description: '儿童医院邀请你参加慈善活动。你的出现能帮他们筹到远超义卖本身的善款——因为你是明星。组织者说孩子们等了很久。但今天下午有战术课。',
        choices: {
            left:  { label: '亲自去', effects: { reputation: 3, wealth: -2, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你在医院待了一下午。一个戴呼吸机的男孩问你："踢球痛吗？"你握着他的手说："痛。但痛过之后就是进球。"他笑了。你出门后在车上坐了很久——不是因为累。' },
            right: { label: '捐款了事', effects: { wealth: -4, reputation: 2, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你写了张支票。数额不小——够他们为你准备感谢牌了。但你寄了支票就去了训练场。你错过了和那个男孩的对话。但你怎么会知道呢？钱能解决的问题从来不是最难的问题。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { wealth: { min: 15 } } },
        cooldown: 'once_per_season'
    },

    // ════════════════════════════════════════════════════════
    //  类别6: 转会 (transfer) — 8个 (树状系列 + 因果)
    // ════════════════════════════════════════════════════════
    {
        id: 'trans_big_offer', category: 'transfer', tension: 4,
        series: { type: 'tree', id: 'transfer_saga', step: 1, totalSteps: 3, nextLeft: 'trans_big_2a', nextRight: 'trans_big_2b' },
        icon: 'briefcase', color: 'mystery',
        title: '豪门邀约',
        description: '一份顶级豪门的合同放在面前。薪资是你现在的三倍。经纪人眼睛发光——他的佣金也翻了三倍。母队球迷在社交媒体刷屏挽留。转会窗还有48小时。这是你职业生涯最大的决定。',
        choices: {
            left:  { label: '接受合同', effects: { wealth: 12, ambition: 4, reputation: 3, team: -2 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [], unlocks: [],
                     narrative: '你在合同上签了字。数字后面的零比你的球衣号码还多。母亲打来电话——她看到了新闻。"你自己选的路，好好走。"窗外母队的训练场灯还亮着。' },
            right: { label: '婉拒', effects: { team: 3, ability: 2, reputation: 4, ambition: -4 },
                     flagsSet: { rejected_big_transfer: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你把合同推了回去。经纪人脸都绿了。走出办公室时训练场外球迷的横幅还在——上面是你的名字。你停下来拍了张照。有些东西转会窗永远买不到。' }
        },
        hideEffects: true,
        settlementTextLeft:  '你在合同上签了字。经纪人笑得很灿烂——他的佣金数字也很灿烂。窗外母队的训练场灯还亮着，有人还在练。你不知道是谁——但你不会再和他们一起练了。',
        settlementTextRight: '你把合同推了回去。经纪人三个小时没跟你说话。训练场外球迷的横幅还在飘。这座城市不大——但它是你的。转会窗里最好的决定有时候是不开窗。',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 30 }, age: { max: 32 } } },
        cooldown: 'once_per_career'
    },
    // 分支A: 加盟
    {
        id: 'trans_big_2a', category: 'transfer', tension: 4,
        series: { type: 'tree', id: 'transfer_saga', step: 2, totalSteps: 3, nextLeft: 'trans_end1', nextRight: 'trans_end2' },
        icon: 'swords', color: 'mystery',
        title: '豪门生存',
        description: '新更衣室里全是世界级球星。第一堂训练赛上你被轻易过掉——两次。教练在记着什么。一个老将走过来说："在这儿，没人会把位置让给你。"他说得对。',
        choices: {
            left:  { label: '拼尽全力', effects: { ability: 3, ambition: 3, reputation: 4 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你每天早上六点到训练基地。三周后教练在首发名单写了你的名字。豪门不相信眼泪——但他们尊重汗水。那个老将赛前拍了拍你的背："准备好了？"' },
            right: { label: '接受轮换', effects: { wealth: 4, ambition: -3, reputation: -3, team: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '替补席的座椅是真皮的——比大多数球队的更衣室还舒服。只是每到比赛日你坐在上面总觉得哪里不对。账户数字在涨，心里的什么东西在萎缩。' }
        },
        hideEffects: true,
        settlementTextLeft:  '第三周教练在首发名单上写了你的名字。你盯着那张纸看了很久——它比合同上的数字更让你心跳加速。汗水是真的。首发位置也是。',
        settlementTextRight: '替补席的座椅是真皮的。但每次你站起来热身——不是为了上场，只是为了不让腿凉掉。账户数字涨得很好看。但你知道足球不是用银行账户踢的。',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // 分支B: 留守
    {
        id: 'trans_big_2b', category: 'transfer', tension: 4,
        series: { type: 'tree', id: 'transfer_saga', step: 2, totalSteps: 3, nextLeft: 'trans_end3', nextRight: 'trans_end4' },
        icon: 'crown', color: 'mystery',
        title: '母队之光',
        description: '留下的消息传开了。球迷自发在训练场外拉了一条新横幅："他留下了。"俱乐部把队长袖标交给了你。但球队成绩在下滑——工资单太高，年轻人顶不上来。肩上的不是袖标，是重量。',
        choices: {
            left:  { label: '扛起重建', effects: { team: 3, ambition: 3, reputation: 3, ability: -2 },
                     flagsSet: { became_captain: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你带着一群年轻人拼了一整个赛季。输了五场——球迷没有骂你。因为你在每一场都拼了命。第六场赢了——全场起立为你唱歌。你终于理解"一人一城"的重量。' },
            right: { label: '后悔了', effects: { ambition: -3, team: -10, reputation: -15 },
                     flagsSet: { asked_for_transfer: true }, flagsAdd: {}, flagsClear: [], unlocks: ['trans_unhappy'],
                     narrative: '你递交了转会申请。这一次没有豪门敲门——只有一家中游球队愿意接手。走的时候更衣室里没人看你的眼睛。球迷撤掉了那条横幅。' }
        },
        hideEffects: true,
        settlementTextLeft:  '最后一轮结束后你没有走——站在中圈看着四面看台。有人喊："谢谢你没有走。"你举起手——不是告别。是承诺。',
        settlementTextRight: '你递交了转会申请。球迷撤掉了那条横幅。开车离开时你经过了社区那个旧球场——锈迹斑斑的球门还在。你加速驶过了。后视镜里的球门越来越小。',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // 叶子结局
    { id: 'trans_end1', isLeaf: true, category: 'transfer', tension: 4, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { wealth: 18, reputation: 3, ability: 3, ambition: 3 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '豪门核心',
      description: '你成了球队不可或缺的一部分。欧冠之夜你在八万人面前打进制胜球。那个质疑你"不值三倍薪水"的评论员，现在在解说席上喊你的名字。不是每个转会豪门的人都能成功——但你做到了。汗水和凌晨的灯光不会背叛你。',
      timelineText: '转会豪门：从质疑到核心', timelineType: 'gold',
      unlocks: ['media_newclub_pressure'] },
    { id: 'trans_end2', isLeaf: true, category: 'transfer', tension: 4, icon: 'money', cardStyle: 'special',
      effectsLeft: { wealth: 4, reputation: -3, ambition: -10 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '镀金生涯',
      description: '你的账户余额是你的球衣号码后面加了好多零。但你打开手机——发现自己被移出了国家队名单。一个替补球员的位置换来了后半生的安逸。你有了钱，但失去了比赛。这个交易——你愿意再做一次吗？',
      timelineText: '转会豪门：高薪替补，失去光芒', timelineType: 'normal',
      unlocks: ['media_newclub_pressure'] },
    { id: 'trans_end3', isLeaf: true, category: 'transfer', tension: 4, icon: 'house', cardStyle: 'gold',
      effectsLeft: { reputation: 3, team: 15, wealth: -3 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '一人一城',
      description: '十年。一座城。你带着袖标从第一场踢到最后一场。你没有赢下所有冠军——但终场哨响时整个球场只有一个声音：你的名字。这是转会窗永远找不到的东西。足球界最罕见的成就：一个人，一座城，一个故事。',
      timelineText: '留守母队：一人一城', timelineType: 'gold',
      unlocks: ['locker_fan_gratitude'] },
    { id: 'trans_end4', isLeaf: true, category: 'transfer', tension: 4, icon: 'ghost', cardStyle: 'dark',
      effectsLeft: { reputation: -4, ambition: -3 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '悔棋之痛',
      description: '你去了一个新球队——不是豪门，只是一个中游球队。球迷对你的到来反应冷淡。坐在新的更衣室里看着陌生面孔——你想起了那个有横幅的球场。"早知如此"——这四个字是最没用的真理。',
      timelineText: '叛离母队：两头落空', timelineType: 'bad',
      unlocks: ['trans_regret_talk'] },

    // ── 转会因果链 ──
    {
        id: 'trans_agent_call', category: 'transfer', tension: 1,
        icon: 'phone', color: 'coach',
        title: '经纪人来电',
        description: '经纪人深夜来电，语气兴奋："我帮你在那边搭上线了。冬窗就能走——只等你点头。"窗外是训练基地的灯光。你从床上坐起来。',
        choices: {
            left:  { label: '让他推进', effects: { ambition: 4, wealth: 2, team: -2 },
                     flagsStartTimers: { transfer_rumor: 5 }, flagsAdd: {}, flagsClear: [], unlocks: ['trans_big_offer'],
                     narrative: '"去看看吧。"你挂了电话。窗外训练场的灯还亮着——不知道是谁忘了关。转会窗的风开始吹了。空气里有种说不清的味道——是机会还是告别？' },
            right: { label: '拒绝', effects: { team: 3, ambition: -2, reputation: 3 },
                     flagsStartTimers: {}, flagsAdd: {}, flagsClear: ['transfer_rumor'],
                     narrative: '"不用了。"经纪人沉默了。你挂掉电话躺回床上。很奇怪——说"不"的感觉比说"好"更让你安心。窗外训练场的灯灭了。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['rejected_big_transfer'], requireStats: { reputation: { min: 25 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'trans_unhappy', category: 'transfer', tension: 2, consequenceOnly: true,
        icon: 'arrows', color: 'coach',
        title: '想要离开',
        description: '你受够了。教练不信任你，队友不理解你，球迷开始嘘你。更衣室里你坐在角落——第一次觉得自己不属于这里。经纪人发来消息："想走的话我可以找下家。"',
        choices: {
            left:  { label: '递交转会申请', effects: { ambition: 4, team: -8, reputation: -3 },
                     flagsSet: { asked_for_transfer: true }, flagsAdd: {}, flagsClear: ['coach_disrespect', 'coach_anger'],
                     narrative: '体育总监接过转会申请时没有惊讶——他可能在等你这句话。离开不代表失败。有时候留下才是。你需要一个重新呼吸的地方。' },
            right: { label: '咬牙坚持', effects: { ability: 3, ambition: 3, team: 4, reputation: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['coach_disrespect', 'coach_anger', 'fan_outrage'],
                     narrative: '你删了经纪人的消息。接下来三个月你没抱怨没解释——你只是在场上踢球。然后有一天——你也不知道哪一天——看台上的嘘声变成了掌声。最难的不是离开，是留下。' }
        },
        hideEffects: true,
        settlementTextLeft:  '体育总监接过转会申请时面无表情。走廊很长——但每一步都比进来时更轻。你不确定这是自由还是放弃。但你知道这是你的决定。',
        settlementTextRight: '接下来三个月你什么都没说。只是在场上踢球。然后有一天嘘声变成了掌声。不是因为你变了一个人——是因为你没有变。留下比离开更需要勇气。',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ambition: { min: 35 } } },
        cooldown: 'once_per_career'
    },
    // 转会余波
    {
        id: 'media_newclub_pressure', category: 'media_fans', tension: 1, consequenceOnly: true,
        icon: 'tv', color: 'media',
        title: '新俱乐部发布会',
        description: '转会后的首次官方亮相。记者席坐满了人——他们想看你是什么表情。闪光灯像暴雨。第一排那个记者站起来问："你在这里能复制以前的表现吗？"',
        choices: {
            left:  { label: '充满信心', effects: { reputation: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你直视镜头。"我是来这里赢的。"第二天头版用了你的照片——下面写着"新王的宣言"。高标准设下了。现在你得去兑现它。' },
            right: { label: '谦虚谨慎',   effects: { team: 3, reputation: 2, ambition: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '"我需要时间适应。但我会为这件球衣付出一切。"记者们点了点头。教练在后台对你竖起大拇指。他没有要你立军令状——他要你踢好球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_fan_gratitude', category: 'locker_room', tension: -2, consequenceOnly: true,
        icon: 'heart', color: 'gold',
        title: '球迷的感谢',
        description: '今天训练场外聚了一群人——不是来抗议的，是来自发感谢你的。有人举着手绘的牌子："谢谢你没有走。"几个孩子在栅栏外喊你的名字——嗓子都哑了。',
        choices: {
            left:  { label: '走出去签名', effects: { team: 4, reputation: 3, wealth: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你在栅栏边签了一个半小时。保安说"差不多行了"——你说"等一下，还有两个"。最后一个孩子举着你的球衣——已经签过三次了。你又签了一次。他跑回去时几乎在飞。' },
            right: { label: '挥手示意', effects: { reputation: 2, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你挥了挥手，向训练场走去。一个孩子喊"下次再来啊！"你回头笑了笑。职业球员的时间很贵——但有些东西很便宜，比如微笑。' }
        },
        conditions: { requireFlags: ['rejected_big_transfer'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'trans_regret_talk', category: 'locker_room', tension: 1, consequenceOnly: true,
        icon: 'pensive', color: 'coach',
        title: '老队友的消息',
        description: '深夜。手机亮了——是母队的老队友。"兄弟，这边更衣室少了你感觉不太一样了。"你盯着这条消息看了很久。窗外是陌生的城市、陌生的灯光。',
        choices: {
            left:  { label: '回复', effects: { team: 2, ambition: -4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"我也怀念。"你打了又删，删了又打。最后只发了四个字。三秒后他回了——一个拥抱的emoji。有些东西是转会费永远算不出来的。' },
            right: { label: '已读不回', effects: { ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你按下电源键。屏幕黑了。过去的归过去——这是你自己选的路。但手机再亮起时，壁纸还是那张训练场的老照片。你忘了换。还是不想换？' }
        },
        conditions: { requireFlags: ['asked_for_transfer'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },

    // ════════════════════════════════════════════════════════
    //  类别7: 伤病 (injury) — 4个因果链
    //  核心: 能力 vs 身体, 没有纯正面选项
    // ════════════════════════════════════════════════════════
    {
        id: 'injury_minor_scare', category: 'injury', tension: 1,
        icon: 'bandage', color: 'injury',
        title: '小伤预警',
        description: '训练后膝盖酸痛。队医检查后说是轻微拉伤——建议休两周。但接下来三场包括一场德比。教练还没公布大名单。你觉得还能跑。',
        choices: {
            left:  { label: '主动休息', effects: { ability: -2, team: 4 },
                     flagsAdd: {}, flagsClear: ['injury_risk'],
                     narrative: '"我去养伤。"教练点了点头——他宁愿失去你两周，也不想失去你半个赛季。你看着队友训练，膝盖上敷着冰袋。养伤比训练更难——因为它需要耐心。' },
            right: { label: '隐瞒', effects: { ability: 3, ambition: 3 },
                     flagsSet: { played_through_injury: true }, flagsAdd: { injury_risk: 2 }, flagsClear: [],
                     unlocks: ['injury_play_through'],
                     narrative: '你没说实话。队医看着你——"你确定？"你点了点头。封闭针打进去——冷，然后是麻木。你上场了。腿不疼了。但身体有记忆——它会的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { max: 80 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'injury_play_through', category: 'injury', tension: 2,
        icon: 'leg', color: 'injury',
        title: '旧伤复发',
        description: '第67分钟。一次冲刺后你突然停了下来——膝盖传来了熟悉的刺痛。队医跑进场时你已经在摇头。瞒了这么久的伤，现在瞒不住了。担架过来了。看台上安静了。',
        choices: {
            left:  { label: '接受现实', effects: { ability: -8, team: 3 },
                     flagsAdd: {}, flagsClear: ['injury_risk', 'played_through_injury'],
                     narrative: 'MRI结果：半月板撕裂。赛季报销。你坐在医生办公室里听他解释手术方案。窗外训练场上队友们正在热身——你从来没有从这个角度看过。接受现实是足球里最难的技术动作。' },
            right: { label: '再打一针', effects: { ability: 3, ambition: 3, reputation: -3 },
                     flagsSet: {}, flagsAdd: { injury_risk: 2 }, flagsClear: [],
                     narrative: '你又打了一针。下半场你拖着一条腿踢了二十分钟——赛后几乎走不下场。球迷在鼓掌，但你听不见。你只听到膝盖里什么东西在响。那是代价的声音。' }
        },
        hideEffects: true,
        settlementTextLeft:  '医生说了"手术"那个词。赛季报销。你坐在车里很久没发动。训练场的灯亮了——晚班训练时间。你第一次不是往里走。有时候最勇敢的选择是停下来。',
        settlementTextRight: '你又撑了一场。但每一场之后膝盖的响声更大了一点。浴室镜子里你的眼睛——那里面有一种你不认识的东西。是恐惧吗？还是不肯认输？两者之间的线比草皮上的白线还细。',
        conditions: { requireFlags: ['played_through_injury'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'injury_recovery', category: 'injury', tension: 1,
        icon: 'hospital', color: 'injury',
        title: '康复之路',
        description: '手术后。康复室是你的新主场。墙上有一面镜子——你每次做抬腿训练时都能看到自己咬着牙的样子。康复师说需要三个月。但你心里有个数字：两个月。',
        choices: {
            left:  { label: '循序渐进', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: ['played_through_injury', 'injury_risk'],
                     narrative: '你按计划一天天恢复。第三个月的第一天你第一次慢跑——心跳不是因为运动，是因为喜悦。耐心不是等待，是在等待时仍然相信自己。' },
            right: { label: '加速复出', effects: { ability: -3, ambition: 3 },
                     flagsSet: {}, flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你比计划提前了一个月复出。第一场你进了球——但赛后膝盖又肿了。康复师摇头："你之前三个月的努力——白费了一半。"你抱着冰袋说不出话。' }
        },
        conditions: { requireFlags: ['played_through_injury'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'injury_specialist', category: 'injury', tension: 2,
        icon: 'telescope', color: 'injury',
        title: '顶级团队',
        description: '康复进度不如预期。队医手段有限。经纪人推荐了一个德国顶级康复团队——但费用高昂，俱乐部只愿承担一小部分。你自己的钱也得掏一大块。',
        choices: {
            left:  { label: '自费请德国团队', effects: { wealth: -15, ability: 4 },
                     flagsAdd: {}, flagsClear: ['played_through_injury', 'injury_risk'],
                     narrative: '你提了一大笔储蓄。德国团队两周内拿出了全新的康复方案——比俱乐部的先进了至少五年。两个月后你跑得比受伤前还快。最好的投资是对自己的身体——这是你最有价值的资产。' },
            right: { label: '靠队医慢慢来', effects: { ability: 2, wealth: 2 },
                     flagsAdd: {}, flagsClear: ['played_through_injury'],
                     narrative: '你选择信任队医。恢复得慢一些——但你在康复室里学会了比任何时候都更了解自己的身体。不是最快的路，但每一步都踏实。钱省下来了——时间花了。' }
        },
        conditions: { requireFlags: ['played_through_injury'], forbidFlags: [], requireStats: { wealth: { min: 20 } } },
        cooldown: 'once_per_career'
    }
];