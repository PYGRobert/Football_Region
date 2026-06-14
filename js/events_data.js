/**
 * events_data.js — 事件数据 (v2.2)
 * 定义所有系列定义(Game.SeriesDefs)和事件数据(Game.RawEvents)
 *
 * v2.2: 事件系统重建 —
 *   四级张力: LIGHT(-1)/MILD(1)/MODERATE(2)/HEAVY(4)
 *   七大类别: on_field/coach_tactics/locker_room/media_fans/business/transfer/injury
 *   标志位因果网络: flagsSet/flagsAdd/flagsClear/unlocks
 *   每个选择自带代价 — 野心↑→团队↓, 财富↑→能力↓或团队↓
 *
 * Series: 杯赛征途(linear) / 豪门邀约(tree) / 更衣室风暴(foreshadow)
 * Chains: 教练分歧 / 伤病恶化 / 转会因果
 */
window.Game = window.Game || {};

// ==================== 系列定义 ====================
window.Game.SeriesDefs = {

    // ═══════════════════════════════════════════════
    //  国内杯赛 (4个独立阶段 — 不同赛季的不同杯赛经历)
    // ═══════════════════════════════════════════════
    cup_group: {
        type: 'linear', id: 'cup_group', name: '杯赛·小组赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['cup_g1', 'cup_g2', 'cup_g3'],
        correctSide: 'left',
        successEndingEventId: 'cup_group_pass',
        failEndingEventId: 'cup_fail_group',
        tension: 3,
        condition: 's.reputation>=15&&s.age<=34'
    },
    cup_ko: {
        type: 'linear', id: 'cup_ko', name: '杯赛·淘汰赛', totalSteps: 2,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['cup_ko1', 'cup_ko2'],
        correctSide: 'left',
        successEndingEventId: 'cup_ko_pass',
        failEndingEventId: 'cup_fail_ko',
        tension: 3,
        condition: 's.reputation>=25&&s.age<=34'
    },
    cup_semi: {
        type: 'linear', id: 'cup_semi', name: '杯赛·半决赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['cup_s1', 'cup_s2', 'cup_s3'],
        correctSide: 'left',
        successEndingEventId: 'cup_semi_pass',
        failEndingEventId: 'cup_fail_semi',
        tension: 4,
        condition: 's.reputation>=35&&s.age<=34'
    },
    cup_final: {
        type: 'linear', id: 'cup_final', name: '杯赛·决赛', totalSteps: 4,
        judgeType: 'keynode',
        stepEvents: ['cup_f1', 'cup_f2', 'cup_f3', 'cup_f4'],
        keyNodes: { 1: 'left', 2: 'left', 3: 'right', 4: 'left' },
        failNextByStep: { 1: 'cup_fail_final', 2: 'cup_fail_final', 3: 'cup_fail_final', 4: 'cup_fail_final' },
        successEndingEventId: 'cup_champion',
        tension: 4,
        condition: 's.reputation>=45&&s.age<=34'
    },

    // ═══════════════════════════════════════════════
    //  欧冠 (4个独立阶段 — 更高声望门槛)
    // ═══════════════════════════════════════════════
    ucl_group: {
        type: 'linear', id: 'ucl_group', name: '欧冠·小组赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['ucl_g1', 'ucl_g2', 'ucl_g3'],
        correctSide: 'left',
        successEndingEventId: 'ucl_group_pass',
        failEndingEventId: 'ucl_fail_group',
        tension: 3,
        condition: 's.reputation>=40&&s.age<=34'
    },
    ucl_ko: {
        type: 'linear', id: 'ucl_ko', name: '欧冠·淘汰赛', totalSteps: 2,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['ucl_ko1', 'ucl_ko2'],
        correctSide: 'left',
        successEndingEventId: 'ucl_ko_pass',
        failEndingEventId: 'ucl_fail_ko',
        tension: 4,
        condition: 's.reputation>=50&&s.age<=34'
    },
    ucl_semi: {
        type: 'linear', id: 'ucl_semi', name: '欧冠·半决赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['ucl_s1', 'ucl_s2', 'ucl_s3'],
        correctSide: 'left',
        successEndingEventId: 'ucl_semi_pass',
        failEndingEventId: 'ucl_fail_semi',
        tension: 4,
        condition: 's.reputation>=60&&s.age<=34'
    },
    ucl_final: {
        type: 'linear', id: 'ucl_final', name: '欧冠·决赛', totalSteps: 5,
        judgeType: 'keynode',
        stepEvents: ['ucl_f1', 'ucl_f2', 'ucl_f3', 'ucl_f4', 'ucl_f5'],
        keyNodes: { 1: 'left', 2: 'left', 3: 'right', 4: 'left', 5: 'left' },
        failNextByStep: { 1: 'ucl_fail_final', 2: 'ucl_fail_final', 3: 'ucl_fail_final', 4: 'ucl_fail_final', 5: 'ucl_fail_final' },
        successEndingEventId: 'ucl_champion',
        tension: 4,
        condition: 's.reputation>=70&&s.age<=34'
    },

    // ═══════════════════════════════════════════════
    //  世界杯 (7阶段Flag链式长链)
    // ═══════════════════════════════════════════════
    wc_selection: {
        type: 'linear', id: 'wc_selection', name: '世界杯·入选', totalSteps: 1,
        judgeType: 'keynode',
        stepEvents: ['wc_sel'],
        keyNodes: { 1: 'left' },
        failNextByStep: { 1: 'wc_fail_select' },
        nextSeriesId: 'wc_qualifier',
        successEndingEventId: 'wc_select_pass',
        tension: 2,
        condition: 's.reputation>=30&&s.age<=34'
    },
    wc_qualifier: {
        type: 'linear', id: 'wc_qualifier', name: '世界杯·预选赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['wc_q1', 'wc_q2', 'wc_q3'],
        correctSide: 'left',
        nextSeriesId: 'wc_group',
        successEndingEventId: 'wc_qual_pass',
        failEndingEventId: 'wc_fail_qual',
        tension: 2
    },
    wc_group: {
        type: 'linear', id: 'wc_group', name: '世界杯·小组赛', totalSteps: 5,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['wc_g1', 'wc_g2', 'wc_g3', 'wc_g4', 'wc_g5'],
        correctSide: 'left',
        nextSeriesId: 'wc_r16',
        successEndingEventId: 'wc_group_pass',
        failEndingEventId: 'wc_fail_group',
        tension: 3
    },
    wc_r16: {
        type: 'linear', id: 'wc_r16', name: '世界杯·16强', totalSteps: 2,
        judgeType: 'counter', requiredCorrect: 1,
        stepEvents: ['wc_r16_1', 'wc_r16_2'],
        correctSide: 'left',
        nextSeriesId: 'wc_qf',
        successEndingEventId: 'wc_r16_pass',
        failEndingEventId: 'wc_fail_r16',
        tension: 3
    },
    wc_qf: {
        type: 'linear', id: 'wc_qf', name: '世界杯·八强', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['wc_qf1', 'wc_qf2', 'wc_qf3'],
        correctSide: 'left',
        nextSeriesId: 'wc_sf',
        successEndingEventId: 'wc_qf_pass',
        failEndingEventId: 'wc_fail_qf',
        tension: 4
    },
    wc_sf: {
        type: 'linear', id: 'wc_sf', name: '世界杯·半决赛', totalSteps: 3,
        judgeType: 'counter', requiredCorrect: 2,
        stepEvents: ['wc_sf1', 'wc_sf2', 'wc_sf3'],
        correctSide: 'left',
        nextSeriesId: 'wc_final',
        successEndingEventId: 'wc_sf_pass',
        failEndingEventId: 'wc_fail_sf',
        tension: 4
    },
    wc_final: {
        type: 'linear', id: 'wc_final', name: '世界杯·决赛', totalSteps: 6,
        judgeType: 'keynode',
        stepEvents: ['wc_f1', 'wc_f2', 'wc_f3', 'wc_f4', 'wc_f5', 'wc_f6'],
        keyNodes: { 1: 'left', 2: 'left', 3: 'right', 4: 'left', 5: 'left', 6: 'left' },
        failNextByStep: { 1: 'wc_fail_final', 2: 'wc_fail_final', 3: 'wc_fail_final', 4: 'wc_fail_final', 5: 'wc_fail_final', 6: 'wc_fail_final' },
        successEndingEventId: 'wc_champion',
        tension: 4
    },

    // ── 树状系列: 豪门邀约 (2步选择→4叶子结局) ──
    transfer_saga: {
        type: 'tree', id: 'transfer_saga', name: '豪门邀约', totalSteps: 3,
        step1EventId: 'trans_big_offer',
        step2aEventId: 'trans_big_2a',
        step2bEventId: 'trans_big_2b',
        tension: 4,
        condition: 's.reputation>=30&&s.age<=32'
    },

    // ── 伏笔系列: 更衣室风暴 (3步, 钩子: locker_tension ≥ 3) ──
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
    //  青训期 (tutorial_1~8) — 固定顺序，教学+世界观建立
    //  不参与压力系统，不进入随机池
    // ════════════════════════════════════════════════════════
    {
        id: 'tutorial_1', category: 'on_field', tension: -2,
        icon: 'camp', color: '',
        title: '青训营 · 第一天',
        description: '你背着包站在青训营门口。铁栅栏后面的训练场上有人在跑圈——比你大两三岁的球员。一个教练模样的人朝你招了招手："新来的？进来吧。"你的手心在出汗。',
        choices: {
            left:  { label: '观察四周 — 先看看情况', effects: { team: 2, ability: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你在场边站了十分钟，看清楚了每个人的位置。然后你走到最安静的那个球门前开始颠球。教练看着你——他在心里记了一笔。"这孩子不急。"' },
            right: { label: '主动上前 — 跟教练打招呼', effects: { ambition: 3, ability: 1 },
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
            left:  { label: '传球给队友 — 安全第一', effects: { team: 3, ability: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你脚弓一推——球精准地找到了边路的队友。他传中，前锋头球破门。没人注意是你发起的进攻。但你不在乎——你知道球是怎么进的。' },
            right: { label: '自己突破 — 试试身手', effects: { ability: 3, ambition: 2 },
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
            left:  { label: '主动搭话 — "你刚才那个传球不错"', effects: { team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '"你刚才那个长传很准。"他抬起头——先是惊讶，然后笑了。"真的？我以为没人看到。"从那天起你们成了训练场上的一对搭档。' },
            right: { label: '各自收拾 — 专注自己的事', effects: { ability: 2, ambition: 1 },
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
            left:  { label: '虚心听 — "请教练指教"', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '教练讲了十五分钟——关于跑位、关于节奏、关于什么时候该拿球什么时候该放手。你每一个字都听进去了。后来的训练里他开始单独给你加练。' },
            right: { label: '表达自己的想法 — "我觉得我可以踢更靠前"', effects: { ambition: 4, ability: 1 },
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
            left:  { label: '平常心 — 照常踢', effects: { ability: 2, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你深吸一口气，像往常一样踢。有一个传球失误了——但你立刻回追把球抢了回来。球探在本子上记了什么。后来有人告诉你他写的是："心态成熟。"' },
            right: { label: '全力发挥 — 这是你的机会', effects: { ability: 4, ambition: 3 },
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
            left:  { label: '详细分享 — 让他知道一切都好', effects: { ambition: 1, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你讲了训练、讲了教练、讲了你的邻座队友。父亲在电话那头"嗯"了几声。挂断前他说："好好踢。"这是他第一次说这三个字。你挂了电话在床边坐了很久。' },
            right: { label: '简短回复 — "挺好的"', effects: { ambition: 3 },
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
            left:  { label: '为团队而战 — 让每个人都发光', effects: { team: 3, ability: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你满场跑动——不是为进球，是为队友拉开空间。你助攻了两个球，第三个是你抢断后发起的。赛后教练说了一句话你永远不会忘："你是这支球队的心脏。"' },
            right: { label: '展示自己 — 这是你的毕业演出', effects: { ability: 3, ambition: 3, reputation: 3 },
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
            left:  { label: '签长约 — 把未来交给这家俱乐部', effects: { team: 3, wealth: 3, ambition: -2, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你签了字。笔尖划过纸面的声音比你想象的要轻。这意味着五年——你把最黄金的五年交给了这支队徽。走出办公室时阳光很好。你看着训练场——它现在是你的了。' },
            right: { label: '签短约 — 保留更多选择权', effects: { ambition: 3, wealth: 1, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '"两年。"你说。经纪人看了你一眼——他知道你的意思。你想证明自己，然后让市场决定你的价值。签完字你走出办公室。未来是开放的——你要自己去填。' }
        },
        hideEffects: true,
        settlementTextLeft:  '笔尖划过纸面——比想象的要轻。五年。你把最黄金的五年交给了这支队徽。走出办公室，阳光很好。训练场上的草皮泛着光——它现在是你的了。',
        settlementTextRight: '"两年。"经纪人在你耳边说"聪明"。签完字你走出办公室。训练场还是那个训练场——但你看它的眼神不一样了。这是你的起点，不是终点。未来是开放的路，你要自己去走。',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'tutorial_9', category: 'business', tension: -2,
        icon: 'money', color: 'gold',
        title: '第一笔工资',
        description: '签约后的第二周，你的银行账户里多了一笔数字。比青训营的津贴多了好几个零。你盯着手机屏幕上的余额——这是你作为职业球员的第一笔工资。你打算怎么用？',
        choices: {
            left:  { label: '全部存下 — 为未来打算', effects: { wealth: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把大部分转进了储蓄账户。不是小气——是你见过太多球员退役后一无所有的故事。第一笔工资，你给自己买了双新球鞋。剩下的，留给了未来。' },
            right: { label: '请青训队友吃一顿 — 不忘来时路', effects: { wealth: 3, team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你包下了青训营附近那家你们总路过但从没进去过的餐厅。所有人都在——你的邻座、教练、甚至那个总板着脸的体能师。账单上的数字让你挑了挑眉。但你看着满桌的笑声——值了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },

    // ════════════════════════════════════════════════════════
    //  类别1: 场上决策 (on_field) — 10个
    // ════════════════════════════════════════════════════════

    // ════════════════════════════════════════════════════════
    //  国内杯赛 — 小组赛 (3事件, COUNTER 2/3)
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_g1', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'cup_group', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '杯赛 · 小组赛首战',
        description: '小组赛第一场。对手是去年的四强——他们比你想象的要快。教练的白板上画了两套方案：稳扎稳打控制节奏，或者开场就提速打他们一个措手不及。你站在球员通道里，能听到看台上的鼓声。',
        choices: {
            left:  { label: '稳扎稳打 — 先摸清对手的底', effects: { team: 3, ability: 2, reputation: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '前二十分钟你们像在下一盘棋。你在中场来回调度，把对手的防线拉拉扯扯。第三十分钟一次反击中你送出直塞——前锋没有浪费。稳住，然后一击致命。' },
            right: { label: '开场猛攻 — 闪电战击垮他们', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你从第一分钟就压上。对手显然没料到——前十分钟你创造了三次机会。但你们的中场暴露了太多空档，对手的反击几乎得手。一场大开大合的比赛——观众喜欢，教练不太喜欢。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_g2', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'cup_group', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '杯赛 · 小组赛次战',
        description: '第二场。对手摆出了铁桶阵——五个中场平行站位。他们不想赢，只想不让你们赢。看台上开始有嘘声——不是给你的，是给这种反足球的。但你必须在场上找到缝隙。',
        choices: {
            left:  { label: '耐心传导 — 用传球撕开防线', effects: { ability: 4, team: 4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你不断回撤接球，一脚一脚地拉扯着对手的阵型。第78分钟，你在禁区弧顶找到了一丝缝隙——弧线球挂入死角。耐心比蛮力更让对手绝望。' },
            right: { label: '远射轰炸 — 用力量撞开大门', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [], narrative: '你在禁区外放了四脚远射。第三脚砸在横梁上——整个球场倒吸一口气。第四脚终于进了。但你的脚踝在一次次对抗中被踢得发麻。进球了，代价是冰袋。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_g3', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'cup_group', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '杯赛 · 小组赛生死战',
        description: '最后一场。出线形势微妙——你必须拿下。更衣室里有人紧张得系了三次鞋带。教练只说了四个字："做好自己。"你点头了——但心里知道这90分钟有多重。',
        choices: {
            left:  { label: '做好自己 — 执行整个赛季练的战术', effects: { team: 4, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有试图做任何特别的事。你跑位、传球、补防——每一个动作都像训练场上练过一百遍的那样。终场哨响，记分牌说明一切。最可靠的武器从来不是超常发挥——是不变形。' },
            right: { label: '孤注一掷 — 把所有筹码押上', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你做了三次平时不会做的冒险——一次后脚跟传球、一次门线救险、一次半场奔袭。观众疯了。教练在场边心脏病快犯了。你赌赢了——但赌博不是每次都赢。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'cup_group_pass', isLeaf: true, category: 'on_field', tension: 3, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 6, wealth: 3 }, choiceLeftLabel: '继续征程',
      title: '小组出线', timelineText: '杯赛：从小组赛突围', timelineType: 'gold',
      description: '积分榜定格。你的名字在上面——排在前两位。更衣室里有人开了汽水，泡沫喷得到处都是。你靠在墙上看着这一切。小组赛只是开始——但每一个开始都值得庆祝。' },
    { id: 'cup_fail_group', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: -2, ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '小组赛折戟', timelineText: '杯赛：止步小组赛', timelineType: 'bad',
      description: '终场哨响。你蹲在中圈——草皮是湿的。积分榜不会说谎。你们差了一分。这一分可能是因为一次传球失误、一次门柱、一次你没有做出的正确选择。杯赛结束了。明年来过——如果你还有明年。' },

    // ════════════════════════════════════════════════════════
    //  国内杯赛 — 淘汰赛 (2事件 TREE, 上半场→领先版/僵局版下半场)
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_ko1', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'cup_ko', step: 1, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'mystery', title: '杯赛 · 淘汰赛上半场',
        description: '单场淘汰。没有第二回合，没有退路。对手的边路很快——教练让你注意右路。上半场的风向着你们这边吹。站在中圈开球时你深吸了一口气——四十五分钟，足够改变一切。',
        choices: {
            left:  { label: '控制节奏 — 不让对手起速', effects: { team: 3, ability: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把球控在脚下，不给他们冲刺的空间。半场结束前的反击中你们撕开了防线——带着优势走进更衣室。队友们互相拍了拍头。四十五分钟，还剩四十五分钟。' },
            right: { label: '高位压迫 — 在前场解决问题', effects: { ability: 4, ambition: 3 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [], narrative: '你们把防线推得很高。对手被压得喘不过气——但也有一次长传几乎打穿了身后。半场结束，比分没有变化。你喝着水听教练布置下半场——一切还有机会。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_ko2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_ko', step: 2, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '杯赛 · 淘汰赛下半场',
        description: '下半场。对手换了一个前锋——更高、更快。他们开始长传冲吊。你的中卫搭档在喘粗气。看台上的助威声此起彼伏——所有人都在紧张。教练在场边比划着战术。',
        choices: {
            left:  { label: '稳守反击 — 守住优势再找机会', effects: { team: 3, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你回撤得更深了。每一次解围你都追到底线。最后十分钟对手全线压上——你们利用反击再下一城。终场哨响，你弯腰撑着膝盖。守住比攻破更难。你做到了。' },
            right: { label: '继续进攻 — 最好的防守是进攻', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有退守——你继续前压。这个决定让教练席上一片惊呼。但你的逼抢迫使对手后卫犯错——你断球后直接面对门将。足球有时候最简单的道理是对的：进攻赢得比赛。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_ko2b', category: 'on_field', tension: 4,
        series: { type: 'tree', id: 'cup_ko', step: 2, totalSteps: 2, stepCorrectSide: 'left' },
        icon: 'swords', color: 'mystery', title: '杯赛 · 淘汰赛下半场',
        description: '比分没有变化。你坐在更衣室里——毛巾盖在头上。教练的声音像从很远的地方传来。四十五分钟。你需要一个进球。对手看起来越来越自信。',
        choices: {
            left:  { label: '耐心寻找机会 — 不让焦虑支配自己', effects: { ability: 3, team: 4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有让急躁控制双脚。你继续传导，等待那个唯一的缝隙。第84分钟——它出现了。你的直塞像一把手术刀。前锋没有错过。迟到的进球最甜——因为它考验了你的每一个神经。' },
            right: { label: '个人突破 — 把球队扛在肩上', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你开始带球——一次又一次。你像在踢街头足球。第八次突破后你终于挤开了防线——但射门擦着门柱偏出。终场哨响。你躺在草坪上看着天空。差一点——但这正是淘汰赛的残忍。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'cup_ko_pass', isLeaf: true, category: 'on_field', tension: 3, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 8, wealth: 4 }, choiceLeftLabel: '继续征程',
      title: '晋级', timelineText: '杯赛：杀入半决赛', timelineType: 'gold',
      description: '终场哨响。你举起双臂——不是庆祝，是释放。淘汰赛的残酷在于没有如果。但今天不需要"如果"——你站在了获胜的一方。更衣室里的音乐很响。下一轮的对手明天才知道——今晚先享受。' },
    { id: 'cup_fail_ko', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: -3, ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '淘汰赛出局', timelineText: '杯赛：止步淘汰赛', timelineType: 'bad',
      description: '你坐在草坪上不想起来。淘汰赛——一个瞬间就够。今天那个瞬间不属于你。对手的球员在你身旁庆祝。你最后站起来，拍掉膝盖上的草。明年？那是很远的事。' },

    // ════════════════════════════════════════════════════════
    //  国内杯赛 — 半决赛 (3事件 COUNTER 2/3)
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_s1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_semi', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '杯赛 · 半决赛上半场',
        description: '半决赛。球场比之前大了一倍。你走出通道时被声浪推了一下。对手的核心是你国家队队友——你们上周还在同一张餐桌上吃饭。哨声响了。友谊暂停。',
        choices: {
            left:  { label: '战术至上 — 像对待任何一场比赛', effects: { team: 3, ability: 3, reputation: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有因为是朋友就脚下留情——他也没有。你们在中场绞杀得像两头野兽。半场结束交换了一个眼神——没有笑意。这是半决赛。私人感情留在场外。' },
            right: { label: '心理战 — 利用你们的关系扰乱他', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你在一次拼抢后拍了拍他的背——笑着说了一句只有你们懂的玩笑。他愣了一下。这一瞬间的犹豫让你送出了助攻。但对手的教练在场边咆哮——你的小动作没有逃过他的眼睛。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_s2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_semi', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '杯赛 · 半决赛下半场',
        description: '下半场。对手调整了战术——你的国家队队友被移到中路，直接对位你。这是故意的。汗水模糊了视线。小腿在抗议。替补席上有人在热身，但你知道教练不会换你。',
        choices: {
            left:  { label: '接受挑战 — 正面迎击他的冲击', effects: { ability: 3, team: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你咬紧牙关。每一次对抗你都迎上去。他突破——你铲断。他传球——你拦截。这不是友谊——这是战争。赛后你们会握手——但此刻你们都在为同一块草皮拼命。这就是足球最美的样子。' },
            right: { label: '避开锋芒 — 换位让队友分担压力', effects: { team: 3, ability: 1, ambition: -1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你示意队友换位。让他去面对另一个防守者。这不是逃避——这是战术。你的国家队队友皱了下眉头——他准备好了一对一，但你没有给他机会。团队防守让他的威胁降到最低。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_s3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_semi', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '杯赛 · 半决赛关键时刻',
        description: '比赛还剩十分钟。空气稠得像果冻。你听到了自己心跳的声音——每分钟一百八十下。一个角球。禁区里人挤人。替补席上的球员全站了起来。整个球场屏住了呼吸。',
        choices: {
            left:  { label: '亲自终结 — 把命运握在自己手里', effects: { ability: 4, ambition: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '角球开出。你从中场冲刺——跳起——头球。球网颤动的那一刻你听到了这辈子最大的声音。你落地时差点摔倒——但队友已经把你埋在了身下。决赛。你们进决赛了。' },
            right: { label: '信任队友 — 为他拉开空间', effects: { team: 4, ambition: 2, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你冲向近门柱，带走了两个防守者。角球飞向后点——你的队友在那里等着。球进了。不是你进的。但你制造的混乱让进球成为可能。团队足球——有时候最棒的触球是你没有触球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'cup_semi_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 10, wealth: 5 }, choiceLeftLabel: '走向决赛',
      title: '决赛门票', timelineText: '杯赛：杀入决赛', timelineType: 'gold',
      description: '终场哨响时你跪在草坪上。不是受伤——是情绪。你抬头看见家人所在的看台方向。你朝那里挥了挥手。决赛。这两个字足够让每一个加练的凌晨、每一次放弃的假期都值得。还有一场。最后一场。' },
    { id: 'cup_fail_semi', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: -3, ambition: -3 }, choiceLeftLabel: '离开球场',
      title: '半决赛之憾', timelineText: '杯赛：止步半决赛', timelineType: 'bad',
      description: '哨声划破夜空。你站着一动不动。你的国家队朋友走过来——他没有庆祝，只是把手放在你肩上。你点点头，说不出话。半决赛是最残忍的：它离决赛太近了，近到你可以闻到决赛草皮的味道。那不是你的草皮。' },

    // ════════════════════════════════════════════════════════
    //  国内杯赛 — 决赛 (5事件 KEYNODE 5/5)
    // ════════════════════════════════════════════════════════
    {
        id: 'cup_f1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 1, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '杯赛 · 决赛上半场',
        description: '决赛。阳光刺眼。走出球员通道时八万人的声浪变成了物理上能感受到的震动。一个孩子举着你的球衣——上面是你的号码。国歌响起。你闭上眼睛。这是你从八岁起就在梦里踢的那场比赛。',
        choices: {
            left:  { label: '燃烧 — 不留任何余力', effects: { ability: 3, team: 3, ambition: 3, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你跑到了极限。每一次冲刺都像最后一次。半场结束前你在禁区边缘起脚——球飞入网角。你滑向角旗——队友把你埋在身下。还有四十五分钟。但你已经让所有人知道：今天你不会留任何遗憾。' },
            right: { label: '冷静 — 像对待普通比赛一样', effects: { ability: 4, team: 4, ambition: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你让自己沉下来。深呼吸。每一次触球都像训练场上那样——简单、准确、不花哨。半场结束时比分没有变化。你喝着水——心跳平稳。决赛最大的敌人不是对手，是肾上腺素。你控制住了它。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_f2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 2, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '杯赛 · 决赛下半场',
        description: '下半场。对手换了两个人——一个速度型边锋，一个高中锋。他们的战术很明确：长传冲吊，用身体砸开防线。你的中卫搭档眼角在流血——但他拒绝下场。决赛。血可以等。',
        choices: {
            left:  { label: '稳守反击 — 保护防线再找机会', effects: { team: 4, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你撤到防线前面，像一个额外的后卫。每一次头球争顶你都跳得比对手高——不是因为弹跳，是因为决心。你们守住了一波又一波。反击中队友进球了。你跪在地上——不是累，是感激。' },
            right: { label: '以攻代守 — 在前场压制对手', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有退守——你继续推进。这很冒险：一旦丢球身后就是大片空档。但你信任你的速度——在一次断抢后你冲刺了六十米，送出了助攻。教练在场边握紧了拳头。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_f3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 3, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'gold', title: '杯赛 · 决赛关键时刻',
        description: '比赛还剩五分钟。比分胶着。场边的第四官员举起了补时牌。你抽筋了——小腿像被人拧紧。队长把袖标递给你的那一刻摇了摇头——他在保护旧伤。所有人都看着你。不是袖标重——是这一刻重。',
        choices: {
            left:  { label: '接过袖标 — 承担队长的重量', effects: { team: 3, ambition: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把袖标套上。有点松——不是你的尺寸。但责任不分尺寸。你鼓舞了全队——在最后的防守中你回追了五十米铲断了对手的单刀。终场前的一搏不是你一个人的——是整个球队的。' },
            right: { label: '让给更适合的人 — 大局为重', effects: { team: 3, ambition: 0, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把袖标递给副队长——他踢过更多的决赛。这不是放弃——这是明智。你们在最后时刻依靠团队配合打出了致命一击。不是所有光芒都需要来自你——足球是十一个人的运动，你只是踢了其中一个位置。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'cup_f4', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_final', step: 4, totalSteps: 4, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '杯赛 · 关键时刻',
        description: '常规时间最后一分钟。你几乎站不稳了——小腿在抽搐，肺在灼烧。球飞入禁区——像慢动作。所有人在抬头。没有加时，没有重来。这是最后的机会。它不会再来。',
        choices: {
            left:  { label: '拼尽全力 — 这是你最后的燃料', effects: { ability: 4, ambition: 3, reputation: 4 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你跳起来了——不是用腿，是用心脏。头球——球砸入网窝。你落地时整个世界在旋转。终场哨响。你跪在地上——天空很蓝。你做到了。杯赛冠军。' },
            right: { label: '稳住 — 等待更好的机会', effects: { team: 3, ambition: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你犹豫了。只犹豫了一瞬间——球被解围。终场哨响。你站在中圈——腿在抖。你走到了这一步，却在最后关头没有迈出那一步。决赛不会给你第二次机会。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'cup_champion', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 15, wealth: 8, ambition: 5 }, choiceLeftLabel: '举起奖杯',
      title: '杯赛冠军', milestone: { id: 'firstTrophy', text: '🏆 杯赛冠军！' },
      timelineText: '杯赛冠军：举起了奖杯', timelineType: 'gold',
      description: '奖杯的金属冰凉而沉重。你把它举过头顶，漫天彩带飘落。看台上有人在哭，有人在笑。你想起第一次踢球的那个下午——那时你只想把球踢进球门。现在，你做到了更多。这是你的第一个冠军。它会改变一切。',
      unlocks: ['cup_parade'] },
    { id: 'cup_fail_final', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'special',
      effectsLeft: { reputation: 3, ambition: 3 }, choiceLeftLabel: '沉默离场',
      title: '决赛之憾', timelineText: '杯赛：倒在决赛', timelineType: 'normal',
      description: '终场比分定格。你的队友倒在草坪上。你站着，看着对手捧杯。你走到了决赛——只差最后一步。这不是失败——这是告诉你最后一道台阶有多陡。你会记住今天。明年你会更强。',
      unlocks: ['locker_post_defeat'] },

    // ════════════════════════════════════════════════════════
    //  欧冠 — 小组赛 (3事件, COUNTER 2/3)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_g1', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'ucl_group', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'special', title: '欧冠 · 小组赛首战',
        description: '欧冠之夜。赛前灯光秀让草皮变成了舞台。你站在球员通道里听着主题曲——小时候你在电视前听过一百遍，但从通道里听是完全不同的东西。对手是西班牙球队——他们的传球像织布机。教练的白板上画满了箭头。',
        choices: {
            left:  { label: '战术纪律 — 保持阵型完整', effects: { team: 3, ability: 2, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你们像一个整体在移动。每个人都知道自己的位置。西班牙球队最怕的不是速度——是纪律。你让他们的传球找不到缝隙。终场时对手的教练朝你点了点头。欧冠的尊重是用汗水换的。' },
            right: { label: '技术对攻 — 和西班牙人比脚法', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你和他们对攻——像两把剑在交锋。你做了一个平时只在训练场玩的脚后跟传球——全场惊呼。但西班牙球队的传球终究更流畅。一场精彩的比赛——但精彩不代表三分。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_g2', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'ucl_group', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'special', title: '欧冠 · 小组赛次战',
        description: '客场。东欧的球场——看台离草皮很近，你能听到每一个骂声。天气很冷。呼出的气变成白雾。对手摆出了五后卫——他们不打算踢球，打算破坏。欧冠的客场从来没有轻松的。',
        choices: {
            left:  { label: '耐心周旋 — 等待他们的失误', effects: { ability: 4, team: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有急。在客场急躁是最大的敌人。你在中场不断转移球——左右左右。终于防线出现了一条缝。你的传球穿过去了。一个进球。在客场一比零就够了。你朝看台挥了挥拳——骂声更大了。完美。' },
            right: { label: '强势压制 — 用实力让他们闭嘴', effects: { ability: 3, ambition: 3, team: -2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你从开场就压制——高位逼抢、快速传递。对手被压在禁区里。但反击中他们的一次长传几乎得手。客场的风险总是比你预想的大。你赢了——但赢得不够聪明。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_g3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_group', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'special', title: '欧冠 · 小组赛生死战',
        description: '最后一轮。你们需要赢。更衣室里的空气比平时重。有人在祈祷，有人戴着耳机。你没有。你盯着战术板——上面的箭头最终都指向一个方向：晋级。窗外欧冠主题曲还在循环播放。那是你今晚的背景音乐。',
        choices: {
            left:  { label: '沉着应战 — 信任训练场上的千百次重复', effects: { team: 4, ability: 4, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你让肌肉记忆接管身体。每一次跑位、每一次传球——都像训练场上那样。欧冠的灯光很刺眼，但你早已习惯。终场哨响。你跪在草坪上仰望夜空——欧洲。你们留在了欧洲。' },
            right: { label: '放手一搏 — 今晚是创造奇迹的夜晚', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你踢了一场疯狂的比赛——一次倒钩、无数次冲刺、门线上的一脚解围。观众为你起立。但运气不会永远站在冒险者一边。终场哨响你没有跪——你只是站着，看着欧战的灯光慢慢熄灭。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'ucl_group_pass', isLeaf: true, category: 'on_field', tension: 3, icon: 'glowing_star', cardStyle: 'special',
      effectsLeft: { reputation: 8, wealth: 5 }, choiceLeftLabel: '继续征程',
      title: '欧冠出线', timelineText: '欧冠：从小组赛突围', timelineType: 'gold',
      description: '积分榜定格。你的球队排在晋级区。更衣室里有人哭了——不是悲伤，是释放。欧冠的淘汰赛。这几个字本身就够让每一个球员心跳加速。但今晚——今晚先喘口气。淘汰赛的对手明天再想。' },
    { id: 'ucl_fail_group', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: -3, ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '欧冠梦碎', timelineText: '欧冠：止步小组赛', timelineType: 'bad',
      description: '屏幕上的积分表不会说谎。你的名字不在晋级那一栏。欧冠的主题曲还在放——但那是给别人的。你坐在更衣室里最后一个离开。欧洲很大。但今晚你的欧洲之旅到此为止。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 — 淘汰赛 (2事件 TREE 因果)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_ko1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_ko', step: 1, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'mystery', title: '欧冠 · 淘汰赛上半场',
        description: '欧冠淘汰赛。两回合中的第一回合——主场。你需要在主场建立优势。看台上拼出了一幅巨大的tifo——是你的剪影。你深吸一口气。灯光、音乐、八万双眼睛。这就是欧冠。这就是你小时候熬夜看的比赛。',
        choices: {
            left:  { label: '掌控节奏 — 稳稳建立主场优势', effects: { team: 3, ability: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有急于进攻——你控制着球，控制着节奏。欧冠淘汰赛不是百米冲刺，是国际象棋。半场结束前你送出了助攻。主场球迷的欢呼声震耳欲聋。带着优势去客场——这是你能给球队最好的礼物。' },
            right: { label: '全力进攻 — 在主场终结悬念', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你从第一分钟就压上。主场球迷被你的勇气点燃了——看台上的声浪一浪高过一浪。但对手的门将状态神勇。半场结束时比分没有变化。你喘着粗气——但还有四十五分钟。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_ko2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_ko', step: 2, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'special', title: '欧冠 · 淘汰赛下半场',
        description: '下半场。对手不是来旅游的——欧冠淘汰赛没有弱旅。他们换了一个前锋——一个你从未见过的年轻人。他上场后第一脚触球就差点破门。警报响了。教练在场边大喊。',
        choices: {
            left:  { label: '稳守反击 — 保护已有的优势', effects: { team: 3, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你撤得更深了。每一次解围、每一次铲断——都像在保卫一座城。最后时刻反击中你们再进一球。主场球迷起立鼓掌。欧冠淘汰赛的第一回合——你用智慧和纪律拿下了。' },
            right: { label: '以攻代守 — 继续压迫不给喘息', effects: { ability: 4, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有退缩——你继续前压。你的逼抢让对手后卫犯了错——断球后你直接面对门将。主场彻底沸腾。但你的后防线也被打穿了两次。一场疯狂的比赛——但你赢了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_ko2b', category: 'on_field', tension: 4,
        series: { type: 'tree', id: 'ucl_ko', step: 2, totalSteps: 2, stepCorrectSide: 'left' },
        icon: 'swords', color: 'mystery', title: '欧冠 · 淘汰赛下半场',
        description: '比分持平。主场球迷开始安静了——紧张像雾一样降下来。你需要一个进球。欧冠淘汰赛的天平正在向对手倾斜——他们只需要一个客场进球就能让一切变得复杂。',
        choices: {
            left:  { label: '耐心寻找 — 不让焦虑破坏节奏', effects: { ability: 3, team: 4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有让紧张控制你的脚。你继续传导——在全场屏住呼吸时你的传球依然精准。第84分钟机会来了——你没有错过。主场炸了。欧冠淘汰赛的耐心得到了回报。' },
            right: { label: '个人英雄 — 自己来打破僵局', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你开始单干。一次又一次——你像在跟自己较劲。你的技术让观众惊呼——但一个人的欧冠赢不了。终场哨响。主场球迷沉默。你知道问题出在哪里——你只是不想承认。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'ucl_ko_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'glowing_star', cardStyle: 'special',
      effectsLeft: { reputation: 10, wealth: 6 }, choiceLeftLabel: '继续征程',
      title: '杀入八强', timelineText: '欧冠：挺进八强', timelineType: 'gold',
      description: '终场哨响。你朝着主场球迷举起拳头。欧冠八强。这几个字在今晚之前还只是梦想。你环顾球场——tifo还在那里，你的剪影还在。但你已经比那个剪影走得更远了。' },
    { id: 'ucl_fail_ko', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: -3, ambition: -2 }, choiceLeftLabel: '离开球场',
      title: '欧冠出局', timelineText: '欧冠：止步淘汰赛', timelineType: 'bad',
      description: '终场哨响。你弯下腰——不是因为累，是因为空。欧冠的灯光还亮着——但它们照耀的是别人的庆祝。你最后看了一眼看台。下一次。你知道会有下一次。但今晚让失望占据你——这是它应得的空间。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 — 半决赛 (3事件 COUNTER 2/3)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_s1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_semi', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'special', title: '欧冠 · 半决赛上半场',
        description: '欧冠半决赛。灯光更亮了。对手是英格兰冠军——他们踢得像飓风。你的每一次触球都有人紧贴。草皮被踩得翻了起来。这不是足球比赛——这是战争。美丽的战争。',
        choices: {
            left:  { label: '站稳脚跟 — 不让他们的节奏带走你', effects: { team: 3, ability: 2, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有让英格兰人的节奏带着你跑。你慢下来——每一次触球都格外冷静。半场结束时你获得了不错的控球率。欧冠半决赛的秘诀不是快——是在别人快的时候保持自己的节奏。' },
            right: { label: '针锋相对 — 用同样的强度回应', effects: { ability: 3, ambition: 3, team: -2 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [], narrative: '你迎上去了。每一次对抗都像撞上一堵墙——但你站住了。观众的欢呼变成了一种持续的嗡嗡声。半场结束你喘着气——但对手的球员也在喘。这场战争还没有分出胜负。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_s2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_semi', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'special', title: '欧冠 · 半决赛下半场',
        description: '下半场的对抗更加激烈。一个五十对五十的球——你和对手同时放铲。你听到了碰撞的声音，然后是哨声。裁判跑过来。整个球场屏住呼吸。你的队友围住了裁判。',
        choices: {
            left:  { label: '保持冷静 — 不让情绪吞没你', effects: { team: 3, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你站起来，擦了擦嘴角。没有争吵，没有推搡。你把球放好——然后继续跑。冷静在欧冠半决赛是最好的武器——因为对手期望你失控。你没有。你用一次精准的助攻让裁判的哨声变得无关紧要。' },
            right: { label: '据理力争 — 向裁判施压', effects: { ambition: 3, team: -2, reputation: -1 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你冲裁判吼了。队友把你拉开。黄牌——你看着裁判在小本子上记下了你的号码。之后的每一次拼抢裁判都在看你。你让自己变成了焦点——在欧冠半决赛这不是好事。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_s3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_semi', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'special', title: '欧冠 · 半决赛关键时刻',
        description: '比赛进入尾声。紧张让每一次触球都像在钢丝上跳舞。一个任意球——禁区边缘。你站在球前。人墙在面前——五个人，像一堵肉墙。守门员在门线上跳。全场安静。这一刻——属于你。',
        choices: {
            left:  { label: '弧线球 — 绕过人墙，飞入死角', effects: { ability: 3, ambition: 3, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你后退三步。助跑——脚内侧搓出弧线。球绕过人墙——绕过守门员的指尖——飞入上角。球场爆炸了。你狂奔向角旗滑跪——队友把你埋在身下。欧冠决赛。这两个词在你的脑海中爆炸。' },
            right: { label: '战术任意球 — 传向队友，配合破门', effects: { team: 4, ability: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有射门——你传了。人墙预判失误——你的传球找到了后点的队友。球进了。战术胜过个人英雄主义。你举起双臂——不是为自己，是为团队。欧冠决赛在等着你们。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'ucl_semi_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'glowing_star', cardStyle: 'special',
      effectsLeft: { reputation: 12, wealth: 8 }, choiceLeftLabel: '走向决赛',
      title: '欧冠决赛门票', timelineText: '欧冠：杀入决赛', timelineType: 'gold',
      description: '终场哨响。你跪在草坪上——不是因为疲惫，是因为感动。欧冠决赛。你小时候贴在墙上的海报——那些球员，那些夜晚——你即将成为它们的一部分。决赛之夜。你的夜晚。' },
    { id: 'ucl_fail_semi', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { reputation: -4, ambition: -3 }, choiceLeftLabel: '离开球场',
      title: '半决赛之壁', timelineText: '欧冠：止步半决赛', timelineType: 'bad',
      description: '终场哨响。你坐在草坪上——汗水和泪水混在一起。欧冠半决赛是一堵墙。今年你没有翻过去。但墙壁不是终点——它是告诉你还需要多高。你站起来。对手的球员过来和你交换球衣。下一次。' },

    // ════════════════════════════════════════════════════════
    //  欧冠 — 决赛 (5事件 KEYNODE 5/5)
    // ════════════════════════════════════════════════════════
    {
        id: 'ucl_f1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 1, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '欧冠 · 决赛上半场',
        description: '欧冠决赛。你站在球员通道里。奖杯就在入口处——银色的，比你想象的大。每个走过的球员都看了它一眼。欧冠主题曲响起——这一刻你等了整个职业生涯。哨声。比赛开始了。这是你的舞台。',
        choices: {
            left:  { label: '从容应战 — 把决赛当成比赛来踢', effects: { team: 3, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有让"决赛"这两个字压垮你。你踢得像任何一场比赛——传球、跑位、防守。半场结束时你抬头看记分牌——不是因为紧张，是因为确认。决赛只是一个名字。足球是一样的。你踢得很好。' },
            right: { label: '全力以赴 — 这是你的欧冠决赛', effects: { ability: 4, ambition: 4, team: -1, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你从第一秒就全速奔跑——像这是你生命中最后一场比赛。观众被你的能量感染了。半场结束你喘得说不出话——但每一个队友都在看你。他们看到你拼了——所以他们也开始拼。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_f2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 2, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '欧冠 · 决赛下半场',
        description: '下半场。对手调整了策略——他们的核心球员开始频繁换位，试图撕裂你们的防线。教练在场边疯狂打手势。你能感觉到局势在变化——像潮水在转向。你需要做出反应。',
        choices: {
            left:  { label: '战术调整 — 阅读比赛做出应对', effects: { team: 4, ability: 4, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你看到了对手的变化——然后做出了自己的调整。你示意队友收缩中场。对手的换位被你的预判化解了。阅读比赛——这是欧冠决赛需要的智慧。不是蛮力，是理解力。' },
            right: { label: '以不变应万变 — 保持自己的节奏', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你坚持了上半场的战术。但对手不是傻瓜——他们找到了空档。一次传球穿透了你的防线。你转身追——但太晚了。欧冠决赛不会原谅固执。有时候最好的坚持是知道何时改变。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_f3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 3, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'gold', title: '欧冠 · 决赛关键时刻',
        description: '比赛还剩不到十分钟。一个点球——裁判指向十二码。不是给你的——是给对手的。他们的队长站在点球点前。球场里有人开始祈祷。你站在中圈——双手撑着膝盖。这一刻可能改变一切。',
        choices: {
            left:  { label: '干扰对手 — 在他耳边留下心理阴影', effects: { ambition: 3, reputation: -2, team: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你走过去——在他耳边轻声说了一句只有你们能听到的话。他看了你一眼——然后助跑。球飞向看台。他打飞了。你的嘴角动了一下。心理战——在欧冠决赛最有效。' },
            right: { label: '信任门将 — 他为此训练了一生', effects: { team: 4, reputation: 4, ambition: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有走过去。你信任你的门将——他为此训练了二十二年。他猜对了方向——把球扑了出去。你第一个冲向他。不是你的扑救——但你的信任让它发生了。欧冠决赛的信任比技术更难得。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_f4', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 4, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '欧冠 · 加时赛',
        description: '加时。你的腿在燃烧。教练已经没有换人名额了——你必须撑完三十分钟。队医在场边握着冰袋。你朝他摇了摇头。还不是时候。你想起这些年每一个凌晨的训练、每一次拒绝的诱惑。都是为了这三十分钟。',
        choices: {
            left:  { label: '超越极限 — 你的身体不是你的', effects: { ability: 4, team: 3, reputation: 4 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你强迫双腿继续移动。它们已经不是你的——它们属于这一刻。在一次冲刺中你超越了三个对手——不是因为你快，是因为你没有放弃。球进了。你甚至没有听到欢呼——你只听到自己的心跳。欧冠决赛的进球。你的进球。' },
            right: { label: '智慧分配 — 节省体力应对可能的点球', effects: { team: 3, ambition: 1, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始节省体力——走而不是跑。你把希望放在点球大战。但加时赛的最后一分钟对手进了球。你站在中圈——腿突然不累了。因为遗憾的重量比任何疲劳都重。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_f5', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'ucl_final', step: 5, totalSteps: 5, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '欧冠 · 加时关键时刻',
        description: '加时的最后一分钟。球飞入禁区——在空中旋转。所有人都在抬头。时间变慢了。你看到了球的轨迹——它正向你飞来。这是你职业生涯最重要的一次触球。它不会再来。',
        choices: {
            left:  { label: '绝杀 — 用尽你生命中的每一分力量', effects: { ability: 3, ambition: 3, reputation: 4 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你腾空而起。球接触到头顶的那一刻你知道——它进了。你落地时翻滚——草皮和汗水进入嘴里。终场哨响。你躺着——看着夜空。欧冠冠军。你做到了。你真的做到了。' },
            right: { label: '传球 — 信任位置更好的队友', effects: { team: 3, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你把球传了。队友没有准备好——球飞出底线。终场哨响。你没有射门。你传了。你会永远想那个瞬间——如果你选择了射门，会不会不一样？欧冠决赛不会给你第二次答案。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'ucl_champion', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 20, wealth: 12, ambition: 6 }, choiceLeftLabel: '举起大耳朵杯',
      title: '欧冠之巅', milestone: { id: 'championsLeagueWinner', text: '🏆 欧冠之巅！' },
      timelineText: '欧冠冠军：登顶欧洲之巅', timelineType: 'gold',
      description: '银色的奖杯被你举过头顶。漫天彩带。主题曲在放——但这次是为你放的。你看着奖杯上倒映出的自己的脸——和多年前那个在电视前熬夜的孩子一模一样。欧洲之王。这个头衔没有人能拿走。',
      unlocks: ['ucl_parade'] },
    { id: 'ucl_fail_final', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'special',
      effectsLeft: { reputation: 4, ambition: 3 }, choiceLeftLabel: '仰望星空',
      title: '一步之巅', timelineText: '欧冠：倒在决赛', timelineType: 'normal',
      description: '你站在草坪上看着对手捧杯。欧冠的主题曲还在响——它是别人的背景音乐。你离登顶只差一步。但这一步是用每一个正确的决定铺成的。今晚你没有铺完。但你能闻到山顶的空气——那是下一次攀登的理由。',
      unlocks: ['locker_post_defeat'] },
    // ═══════════════════════════════════════════════
    //  夺冠庆祝 (三种冠军各自独特)
    // ═══════════════════════════════════════════════
    {
        id: 'cup_parade', category: 'locker_room', tension: -2, consequenceOnly: true,
        icon: 'trophy', color: 'gold', title: '更衣室庆典',
        description: '杯赛冠军。更衣室里香槟喷得到处都是。主席推门进来了——西装被泡沫溅湿了但他不在乎。他握着你的手说"你是这座球场的灵魂"。队友们把你抬起来往空中抛。这一刻比奖杯本身更重——因为你和这群人一起走到了最后。',
        choices: {
            left:  { label: '举杯致敬全队 — 这奖杯属于所有人', effects: { team: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你站上椅子——香槟还顺着头发往下滴。"这个奖杯——"你环顾每一张脸，"——不是我赢的，是你们。"更衣室炸了。教练在角落里擦了擦眼角——他以为没人看见。你看见了。' },
            right: { label: '安静享受 — 坐在角落看着这一切', effects: { reputation: 2, ambition: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你坐在自己的位置上——就是赛前你系鞋带的那个位置。看着队友们疯。你笑了。不是狂喜——是一种深沉的满足。这座球场、这个更衣室、这些人。你记住了每一张脸。这是你的第一个冠军。不是最后一个。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'ucl_parade', category: 'media_fans', tension: -2, consequenceOnly: true,
        icon: 'confetti', color: 'gold', title: '城市疯狂',
        description: '欧冠冠军。敞篷大巴驶过城市主干道——但街道已经不存在了，只有人群。有人爬上了路灯，有人站在车顶。整个城市变成了你们的颜色。一个小男孩被父亲扛在肩上，手里举着纸板——上面用歪歪扭扭的字写着"你是我的英雄"。纸板上还有油渍——那是早餐时画的。',
        choices: {
            left:  { label: '抱起小男孩 — 让这一刻被永远记住', effects: { reputation: 5, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你示意大巴停下。你弯腰把小男孩抱上车。他呆了——然后紧紧抱住你的脖子。闪光灯疯了一样闪。但他在你耳边小声说"我以后也要踢欧冠"。你笑了——"我相信你。"这个瞬间比大耳朵杯更重。' },
            right: { label: '举起奖杯向全城致意 — 这是我们的城市', effects: { reputation: 3, ambition: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你高举大耳朵杯——阳光穿透银色照亮了整条街。人群的声浪像海啸。你看到老人抹眼泪、年轻人嘶吼、情侣拥吻。欧冠让这座城市疯掉了——而你站在疯掉的中心。欧洲之王。这座城市之王。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_parade', category: 'media_fans', tension: -2, consequenceOnly: true,
        icon: 'trophy', color: 'gold', title: '举国欢庆',
        description: '世界冠军。飞机降落时你从舷窗看到跑道两侧全是人——不是来接机的，是来朝圣的。车队驶过首都大道——人群从机场一直铺到市中心。有人在哭，有人在唱国歌，有人举着你的巨幅画像。整个国家今天放假——因为你们把大力神杯带回家了。',
        choices: {
            left:  { label: '走向人群 — 让他们摸摸奖杯', effects: { reputation: 6, team: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你走下大巴——安保慌了。你把大力神杯递给第一个伸手的老人。他颤巍巍地摸了摸——然后哭了。"我父亲没能看到这一天。"你握住他的手——"他看到了。他在你眼睛里看到了。"整个国家在这一刻变成了一家人。' },
            right: { label: '发表演讲 — 感谢这个国家', effects: { reputation: 4, ambition: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你拿起话筒——声音通过喇叭传遍整条大道。"这个奖杯——不是我的，是你们的。"人群的欢呼声盖过了后面所有的话。你只说了那一句——但那一句够重。世界冠军。你的国家因为你而骄傲。这个头衔没有人能拿走。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'locker_post_defeat', category: 'locker_room', tension: 1, consequenceOnly: true,
        icon: 'pensive', color: 'dark',
        title: '失利之后',
        description: '决赛失利后的更衣室安静得像图书馆。有人在角落蒙着毛巾，有人盯着地板。你坐在自己的位置上——球衣还湿着。队长先开了口。',
        choices: {
            left:  { label: '第一个发言 — "明年我们会回来"', effects: { team: 3, ambition: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你站起来，声音不大，但在安静的更衣室里足够了。"这不是结束。记住今天的感觉——明年我们让对手感受它。"有人抬起了头。' },
            right: { label: '沉默 — 让时间消化一切',   effects: { team: 1, ambition: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你什么都没说。有时候沉默是最好的尊重——给失败留出它需要的空间。你披上外套，最后一个离开更衣室。走廊很长，但你知道这不是终点。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 入选国家队 (1事件 KEYNODE)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_sel', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_selection', step: 1, totalSteps: 1, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 国家队征召',
        description: '名单公布日。你和全家人围在电视机前。屏幕上的名字一个一个跳出来——门将、后卫、中场——你的手指在膝盖上敲。然后你看到了自己的名字。母亲哭了出来。父亲用力拍了拍你的背——差点把你拍倒了。世界杯。这两个字是你从会走路起就梦想的东西。',
        choices: {
            left:  { label: '接受征召 — 义不容辞', effects: { reputation: 3, ambition: 3, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你拨通了主教练的电话。"谢谢您，我不会让您失望。"电话那头传来低沉的笑声："我知道你不会。"你的国家队生涯从这通电话开始了。' },
            right: { label: '犹豫 — 俱乐部赛季太累了', effects: { ambition: -3, reputation: -3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你犹豫了。俱乐部赛季很漫长——你的身体在抗议。但拒绝国家队的代价不是所有人都能承受的。你最后点了头——但那一瞬间的犹豫被媒体捕捉到了。国家队欢迎你，但球迷的掌声里夹杂了一些皱眉。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_select_pass', isLeaf: true, category: 'on_field', tension: 2, icon: 'glowing_star', cardStyle: 'gold',
      effectsLeft: { reputation: 5, ambition: 3 }, choiceLeftLabel: '穿上国家队球衣',
      title: '国脚', timelineText: '入选国家队', timelineType: 'gold',
      description: '你第一次穿上国家队球衣。胸前是国旗——比任何俱乐部队徽都重。你站在镜子前看了很久。不是虚荣——是责任感在沉淀。世界杯预选赛在等着你。但今天是第一天。记住这一天。' },
    { id: 'wc_fail_select', isLeaf: true, category: 'on_field', tension: 2, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -3, reputation: -2 }, choiceLeftLabel: '继续俱乐部生涯',
      title: '落选', timelineText: '未能入选国家队', timelineType: 'bad',
      description: '名单结束了。你的名字不在上面。母亲关掉了电视。父亲什么都没说——这比任何话都重。你走到院子里对着墙壁踢球。一下，两下，三下。下一次名单会有你。你发誓。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 预选赛 (3事件 COUNTER 1/3, 轻松语调)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_q1', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_qualifier', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 预选赛首战',
        description: '预选赛第一场。不是在最大的球场——是一个你叫不出名字的小城。更衣室的瓷砖缺了一角。但窗外有球迷在唱国歌。大巴开进来时孩子们追着跑。世界杯之路从这里开始——不在聚光灯下，在尘土里。',
        choices: {
            left:  { label: '享受比赛 — 为国旗而战是快乐的', effects: { team: 3, reputation: 3, ambition: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你在球场上跑得像回到了小时候。没有天价合同、没有经纪人电话——只有足球和国旗。你助攻了一次，又进了一个。终场时你把球衣扔给了看台上一个赤脚的小孩。预选赛的第一场。你踢得很开心。' },
            right: { label: '严肃对待 — 每一场都是决赛', effects: { ability: 4, ambition: 3, team: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把这场比赛当成了决赛。不是因为对手强——是因为你穿着国家队球衣。任何时候穿着这件球衣都不应该随便。终场你赢了。没有庆祝——只是和队友握了手。路还很长。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_q2', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_qualifier', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 预选赛次战',
        description: '客场。长途飞行后的时差让腿像灌了铅。酒店床太软，早餐太奇怪。但走出大巴时你看到客队看台上有一小撮国旗在飘扬——他们飞了八千公里来看你们。不能让他们失望。',
        choices: {
            left:  { label: '为球迷而战 — 他们比你们更辛苦', effects: { team: 3, reputation: 4, ambition: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你在赛前走向客队看台——朝那一小撮国旗鼓了掌。比赛中每一次拼抢你都在想——他们飞了八千公里。终场后你把自己的球衣扔了上去。一个球迷接住了——他哭了。足球的魔力不在球场里——在那些来看你的人身上。' },
            right: { label: '专注比赛 — 不受环境影响', effects: { ability: 3, ambition: 2, team: 0 },
                     flagsAdd: {}, flagsClear: [], narrative: '你无视了时差和饮食。职业球员——这就是职业的含义。你的表现很稳定。但赛后你看到那些远征球迷在机场等你们。你走过去——签了每一个名。有时候足球不止于足球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_q3', category: 'on_field', tension: 2,
        series: { type: 'linear', id: 'wc_qualifier', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '世界杯 · 预选赛关键战',
        description: '出线形势掌握在你们手里。最后一轮——赢了就去世界杯。更衣室里有人紧张得干呕。老队长把他拉到一边说了几句话——你没有听到内容，但你看到那个年轻球员的背挺直了。这就是国家队：不是十一个人，是一个国家。',
        choices: {
            left:  { label: '扛起责任 — 让队友看到你的决心', effects: { team: 4, ability: 4, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你从第一分钟就全力以赴——不是用技术，是用决心。每一次滑铲、每一次头球争顶——你让全队看到了什么叫渴望。队友跟上来了。终场哨响——世界杯。这两个字现在属于你了。' },
            right: { label: '稳扎稳打 — 冷静才是最大的武器', effects: { ability: 3, team: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你保持着冷静——在所有人紧张时你的传球依然精准。你用技术稳住了节奏。终场——晋级。没有狂喜的庆祝——只是松了一口气。世界杯的门票拿到了。真正的挑战现在开始。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_qual_pass', isLeaf: true, category: 'on_field', tension: 2, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 8, ambition: 4 }, choiceLeftLabel: '世界杯，我们来了',
      title: '晋级世界杯', timelineText: '世界杯预选赛：成功晋级', timelineType: 'gold',
      description: '终场哨响。世界杯。你和队友们在草坪上叠成一堆。有人在大哭，有人在大笑。你躺在最上面——看着天空。梦想成真——这四个字现在有了重量。世界杯，你的世界杯——即将开始。' },
    { id: 'wc_fail_qual', isLeaf: true, category: 'on_field', tension: 3, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4, reputation: -3 }, choiceLeftLabel: '沉默离开',
      title: '预选赛折戟', timelineText: '世界杯预选赛：未能晋级', timelineType: 'bad',
      description: '终场哨响。你没有哭。你只是站着——看着对手庆祝。世界杯。四年一次的梦想。你的名字不在名单上。回程的大巴上没有人说话。四年的等待。下一个四年——那是很远的事。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 小组赛 (5事件 COUNTER 2/5)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_g1', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'wc_group', step: 1, totalSteps: 5, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 小组赛首战',
        description: '世界杯的第一场比赛。开幕式刚结束——烟花的气味还在空气里。你站在球员通道里。摄像机在拍——全世界几亿人在看。国歌响起——你把手放在胸口。不是因为规定，是因为心跳真的在那里。',
        choices: {
            left:  { label: '享受时刻 — 世界杯要快乐地踢', effects: { team: 3, reputation: 4, ambition: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你笑着踢完了第一场世界杯比赛。不是为了取悦观众——是因为你真的很快乐。这种快乐传递给了全队。终场你们赢了。你对着镜头飞吻——那是给在家看直播的母亲。' },
            right: { label: '如临大敌 — 第一场就要立威', effects: { ability: 3, ambition: 4, team: -1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你踢得强硬——从第一分钟就给了对手下马威。世界杯不是来旅游的——是来战斗的。你赢了。但赛后你发现自己的表情在照片里很凶。下次——也许可以松一点。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_g2', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'wc_group', step: 2, totalSteps: 5, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 小组赛次战',
        description: '第二场。对手是非洲冠军——他们的速度和力量让人窒息。教练提醒你注意他们的左边锋——"他跑起来像猎豹。"你点头——然后在场上第一次被过掉时你知道了教练没夸张。',
        choices: {
            left:  { label: '团队防守 — 一个人拦不住就两个人', effects: { team: 4, ability: 2, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你示意队友协防。猎豹跑得再快也跑不过两个人的配合。你们用团队防守限制了他的每一次冲刺。终场后他和你交换了球衣——用生硬的英语说"good game"。你笑了——足球的语言不需要翻译。' },
            right: { label: '以快制快 — 用速度回应速度', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [], narrative: '你跟他对飙速度。每一次他冲刺你都跟着——你们的对抗成了全场焦点。观众在每一次对决时起立。你赢了其中一次——抢断后助攻得手。但赛后你的腿在发抖。猎豹不是白叫的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_g3', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'wc_group', step: 3, totalSteps: 5, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 小组赛第三战',
        description: '第三场。小组形势微妙——每一分都重要。对手摆出了铁桶阵——他们只需要一分。从第十分钟开始他们就倒地拖延。裁判的哨子快被磨平了。你需要耐心——但耐心从来不是你的最强项。',
        choices: {
            left:  { label: '保持冷静 — 不让拖延战术激怒你', effects: { team: 3, ability: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你深呼吸。对手每一次倒地你都转过身去——不看不理。你用传球瓦解了他们的拖延战术——球一直在你们脚下。终场前你找到了缝隙。冷静比愤怒更有穿透力。' },
            right: { label: '施压裁判 — 让比赛回到正轨', effects: { ambition: 3, team: -1, reputation: -1 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你朝裁判吼了——"这是足球不是戏剧！"裁判给了你一张黄牌。但对手的拖延收敛了——他们知道你不是好惹的。终场你们赢了。但那张黄牌意味着你下一场要格外小心。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_g4', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'wc_group', step: 4, totalSteps: 5, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 小组赛第四战',
        description: '第四场。疲劳开始显现——不是身体上的，是精神上的。世界杯的每一天都是高压。你昨晚没睡好——隔壁房间的队友在打电话，声音穿过薄墙。早上在餐厅里你看着咖啡发呆。但在场上——你必须清醒。',
        choices: {
            left:  { label: '依靠训练 — 让肌肉记忆接管身体', effects: { ability: 3, team: 4, reputation: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有试图做任何超出训练范畴的事。传球、跑位、补防——每一个动作都像呼吸一样自然。训练场上的千百次重复在这里得到了回报。终场你赢了。不是最华丽的表现——但是最可靠的。' },
            right: { label: '咖啡因+肾上腺素 — 硬撑过去', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你灌了三杯咖啡。上半场你很猛——像被电击了一样。但下半场能量衰退了。最后十分钟你几乎在走。队友帮你撑住了。赛后你倒在床上——连鞋都没脱就睡着了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_g5', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_group', step: 5, totalSteps: 5, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 小组赛生死战',
        description: '最后一场。出线与否在此一举。大巴开进球场时你看到球迷举着国旗——他们把脸涂成了国旗的颜色。有人举着牌子——"带我们去淘汰赛。"他们请了假、花了积蓄、飞了半个地球。他们做了他们能做的——现在轮到你了。',
        choices: {
            left:  { label: '为球迷而战 — 把他们的梦想扛在肩上', effects: { team: 4, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你踢了这辈子最拼命的一场球。不是因为奖金或合同——是因为那些涂着国旗的脸。终场哨响——晋级。你走向看台深深鞠了一躬。他们飞了半个地球。你用一场胜利回报了他们的旅程。' },
            right: { label: '为荣耀而战 — 世界杯是证明自己的舞台', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你踢得像这是你最后一场比赛。世界杯——这是你向世界展示自己的舞台。你做到了——全场最佳。但赛后你看着那些球迷——他们有人哭了。也许世界杯不止是证明自己。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_group_pass', isLeaf: true, category: 'on_field', tension: 3, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 10, ambition: 4 }, choiceLeftLabel: '杀入淘汰赛',
      title: '小组出线', timelineText: '世界杯：从小组赛突围', timelineType: 'gold',
      description: '积分榜定格。你的国旗在晋级区。你看着看台上那些涂着国旗的脸——他们今晚会庆祝到天亮。世界杯淘汰赛。还有四场。但今晚先庆祝——因为世界杯的每一场胜利都值得被记住。' },
    { id: 'wc_fail_group', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4, reputation: -4 }, choiceLeftLabel: '谢幕',
      title: '小组赛出局', timelineText: '世界杯：止步小组赛', timelineType: 'bad',
      description: '终场哨响。你蹲在中圈——不想起来。那些涂着国旗的脸在看台上——他们还在唱。即使输了他们还在唱。你站起来朝看台鼓掌——眼泪混着汗水。世界杯。四年一次的梦想。你的梦想在这里结束了。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 16强 (2事件 TREE)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_r16_1', category: 'on_field', tension: 3,
        series: { type: 'linear', id: 'wc_r16', step: 1, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'mystery', title: '世界杯 · 16强上半场',
        description: '淘汰赛。从今天起没有"如果"。对手是南美劲旅——他们的技术像桑巴舞。但淘汰赛不是表演——是生存。教练在战术板上写了两个字：冷静。你看着那两个字——然后跑上场。',
        choices: {
            left:  { label: '控制节奏 — 不让桑巴舞跳起来', effects: { team: 3, ability: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你让球留在脚下——不让他们拿到节奏。南美球队最怕的不是身体对抗——是没有球。半场结束时你掌握了主动。带着优势走向更衣室——你知道下半场他们会反扑。但你准备好了。' },
            right: { label: '以技对技 — 用同样的方式回应', effects: { ability: 3, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你跟他们比脚法。一次穿裆——全场惊呼。但南美人穿裆比你更熟练。半场结束你气喘吁吁——比赛是平的，但你已经耗掉了大部分体力。下半场需要更聪明。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_r16_2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_r16', step: 2, totalSteps: 2, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 16强下半场',
        description: '下半场。南美人的动作越来越大——他们的犯规越来越多。看台上的国旗在飘扬——你们的颜色比他们的多。淘汰赛的下半场不是足球——是战争中的最后冲锋。',
        choices: {
            left:  { label: '稳守反击 — 终结他们的希望', effects: { team: 3, ability: 4, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你退守——像一个老练的猎人。南美人压上来了——如你所料。反击中你们一击致命。终场哨响——八强。世界杯八强。这个国家今晚会为你举杯。' },
            right: { label: '扩大优势 — 不给任何翻盘机会', effects: { ability: 4, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你继续进攻——不给对手喘气。第二个进球来了——你助攻的。全场沸腾。但后防线暴露了空档——对手扳回一球。你咬牙坚持到了最后。赢了——但赢得让你心脏快跳出来了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_r16_2b', category: 'on_field', tension: 4,
        series: { type: 'tree', id: 'wc_r16', step: 2, totalSteps: 2, stepCorrectSide: 'left' },
        icon: 'swords', color: 'mystery', title: '世界杯 · 16强下半场',
        description: '比分持平。淘汰赛的天平在晃动。南美人越踢越自信——他们开始做花哨的动作。你需要找到突破口。教练在场边比划——但最终在场上做选择的是你。',
        choices: {
            left:  { label: '耐心寻找 — 坚持比赛计划', effects: { ability: 3, team: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有慌。比赛计划还在——只是需要时间。第82分钟机会来了。你没有错过。世界杯八强。你朝看台挥拳——那些涂着国旗的脸在尖叫。耐心赢得了战争。' },
            right: { label: '个人能力 — 用一次灵光闪现解决战斗', effects: { ability: 4, ambition: 3, team: -2 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你试图一个人解决——用个人能力撕开防线。你突破、起脚——球砸在横梁上弹出。终场前对手反击得手。世界杯结束了。你躺在草坪上——看着天空。个人能力可以赢得掌声——但赢不了淘汰赛。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_r16_pass', isLeaf: true, category: 'on_field', tension: 3, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 10, wealth: 4 }, choiceLeftLabel: '继续征程',
      title: '杀入八强', timelineText: '世界杯：挺进八强', timelineType: 'gold',
      description: '终场哨响。八强。你跪下——不是因为累，是因为这一刻的重量。世界杯八强。你的国家为你骄傲。球员通道里有记者等着——但你先走向了看台。那些涂着国旗的脸。今晚他们是最幸福的。' },
    { id: 'wc_fail_r16', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -3, reputation: -3 }, choiceLeftLabel: '告别世界杯',
      title: '16强出局', timelineText: '世界杯：止步16强', timelineType: 'bad',
      description: '终场哨响。你坐在草坪上——不想起来。世界杯的梦想在16强结束了。你想起那些涂着国旗的脸——对不起。这个词卡在喉咙里。但球迷还在唱。他们的歌声是你今晚唯一的安慰。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 八强 (3事件 COUNTER 2/3)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_qf1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_qf', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 八强上半场',
        description: '八强。对手是卫冕冠军——他们穿着那件星标球衣。你小时候在电视上看过他们夺冠。现在你站在他们对面的半场。球场的灯光比任何时候都亮。全世界在看着。',
        choices: {
            left:  { label: '尊重但不畏惧 — 他们是冠军，你也是', effects: { team: 3, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有退缩。每一次拼抢你都站住了。卫冕冠军不是神——他们是十一个和你一样会流汗会喘气的人。半场结束你让他们吃了一惊。他们看你的眼神变了。尊重——这是你在世界杯赢得的第一个东西。' },
            right: { label: '挑战权威 — 用身体告诉他们你来了', effects: { ability: 3, ambition: 3, team: -1 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [], narrative: '你从第一分钟就给了他们身体对抗。卫冕冠军不习惯——他们习惯被尊重，不习惯被挑战。但挑战的代价是黄牌和体力的巨大消耗。半场结束你喘着粗气——但你让对手记住了你的号码。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_qf2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_qf', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 八强下半场',
        description: '下半场。卫冕冠军换上了他们的王牌——一个你敬佩多年的球员。他上场时全场鼓掌——包括你。但掌声结束后他就是敌人。他在你防区活动。这是你的考验。',
        choices: {
            left:  { label: '贴身防守 — 不让他有转身的空间', effects: { team: 3, ability: 4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你像影子一样跟着他。每一次他接球你都在他身后。他不习惯——在俱乐部没有人这样盯他。他烦躁了——犯了一个不寻常的失误。你断球了。从偶像到对手——世界杯没有偶像。' },
            right: { label: '区域联防 — 用团队限制他的发挥', effects: { team: 4, ability: 1, reputation: 1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你示意队友帮忙。你不是一个人在防他——整条防线都在协作。他被困在你们的网里。一个人可以赢一场比赛——但不能赢一个团队。你们的团队防守让卫冕冠军的王牌黯然失色。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_qf3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_qf', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 八强关键时刻',
        description: '比赛接近尾声。一个角球——最后一次机会。你站在禁区里。周围是汗水、呼吸和祈祷。球飞入禁区——像慢动作。整个世界杯的重量都在这一个球上。',
        choices: {
            left:  { label: '拼尽全力 — 这是你的时刻', effects: { ability: 4, ambition: 3, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你跳起来了——比所有人都高。不是因为弹跳——是因为渴望。头球——球飞入网角。球场爆炸了。四强。世界杯四强。你狂奔向角旗——队友追着你。这一刻——你会告诉你的孙子。' },
            right: { label: '战术角球 — 短传配合制造杀机', effects: { team: 4, ability: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你示意队友短传。人墙散开——你们打出了训练场上练过的战术。球经过三次传递——最后一脚射门。进球了。不是你的头球——但战术设计者比进球者更懂足球。世界杯四强。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_qf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 12, ambition: 5 }, choiceLeftLabel: '走向半决赛',
      title: '杀入四强', timelineText: '世界杯：挺进四强', timelineType: 'gold',
      description: '终场哨响。四强。你跪在地上。卫冕冠军被你淘汰了。更衣室里有人打开了香槟——但你没有喝。还有两场。四强已经创造了历史——但现在你想创造更多。' },
    { id: 'wc_fail_qf', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -3, reputation: -3 }, choiceLeftLabel: '告别世界杯',
      title: '八强梦碎', timelineText: '世界杯：止步八强', timelineType: 'bad',
      description: '终场哨响。八强——到此为止。你和卫冕冠军的球员交换了球衣。他拍了拍你的肩膀——"下一次是你。"你点头——说不出话。八强已经很远了——但这让你更想要更远。下一次。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 半决赛 (3事件 COUNTER 2/3)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_sf1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 1, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 半决赛上半场',
        description: '半决赛。离决赛只差一步。球场比之前更大——或者只是感觉如此。你的名字被列在首发——全世界几亿人看着那份名单。国歌响起时你的眼眶湿了。不是因为紧张——是因为你意识到自己走了多远。',
        choices: {
            left:  { label: '尽情享受 — 你等了这一刻一辈子', effects: { team: 3, ability: 4, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你让快乐充盈双脚。半决赛——不是每个人都有机会踢世界杯半决赛。你跑得自由——传球、突破、创造。半场时你甚至笑了。不是因为轻松——是因为你在最顶级的舞台上做最爱的事。' },
            right: { label: '极度专注 — 一分一秒都不能放松', effects: { ability: 3, ambition: 4, team: -1 },
                     flagsAdd: {}, flagsClear: [], narrative: '你绷紧了每一根神经。半决赛不允许任何失误。你的每一个选择都经过计算。半场结束时你精疲力竭——但没有任何后悔。专注让技术发光。你踢了完美的半场——但完美是有代价的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_sf2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 2, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 半决赛下半场',
        description: '下半场。对手加强了进攻——像潮水一波接一波。你能感觉到防线在弯曲。队友在喊——声音被观众的嘶吼淹没。你挥手示意——"我在这里。"有时候防守需要的不是腿，是领导力。',
        choices: {
            left:  { label: '组织防线 — 用声音和手势稳住全队', effects: { team: 4, ability: 2, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你成了场上的指挥官。每一次对手压上你都调整位置、呼喊队友。防线没有被压垮——因为你没有让任何人低头。世界杯半决赛需要的不只是脚——是声音。你发出了自己的声音。' },
            right: { label: '个人表现 — 用一次关键防守鼓舞士气', effects: { ability: 4, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你在门线上挡出了一次必进球——用脸。球砸在你的额头上弹了出去。你躺在地上——眼前冒星星。但全队看到了——你愿意用身体去挡。这种牺牲比任何战术都更能鼓舞士气。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_sf3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_sf', step: 3, totalSteps: 3, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 半决赛关键时刻',
        description: '最后几分钟。比分还很接近。一次快速反击——你带球向前。面前是最后一个后卫。门将出击了。整个球场站了起来。这是你的时刻。世界杯决赛——在球门的那一边。',
        choices: {
            left:  { label: '冷静推射 — 像训练场上那样', effects: { ability: 4, ambition: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没有慌张。你观察了门将的位置——然后推射。球滚入死角。世界杯决赛。你的进球把你送进了世界杯决赛。你转身狂奔——整个国家的欢呼从看台上倾泻而下。你做到了。你做到了。' },
            right: { label: '传球 — 队友的位置更好', effects: { team: 4, ability: 1, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你看到了队友在更好的位置——然后传了。他没有错过。球进了。不是你进的——但传球和进球同样重要。世界杯决赛。你们一起走到了这里。足球是十一个人的运动——在最关键的时刻你证明了这一点。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_sf_pass', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 15, ambition: 6 }, choiceLeftLabel: '走向决赛',
      title: '世界杯决赛门票', timelineText: '世界杯：杀入决赛', timelineType: 'gold',
      description: '终场哨响。世界杯决赛。你躺在地上——不是因为累，是因为你不敢相信。世界杯决赛。这四个字在你脑海中回荡。整个国家今晚不会睡觉。还有一场。最后一场。你的最后一场世界杯比赛。' },
    { id: 'wc_fail_sf', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'dark',
      effectsLeft: { ambition: -4, reputation: -3 }, choiceLeftLabel: '心碎离场',
      title: '半决赛之憾', timelineText: '世界杯：止步半决赛', timelineType: 'bad',
      description: '终场哨响。决赛——不是你的。你跪在草坪上。眼泪流进嘴里——咸的。世界杯半决赛——你离决赛只有一步。但这一步有时候比整个旅程都长。你站起来。对手的球员拥抱了你。体育精神——在你最心碎的时候它最重要。' },

    // ════════════════════════════════════════════════════════
    //  世界杯 — 决赛 (6事件 KEYNODE 6/6, 含点球大战)
    // ════════════════════════════════════════════════════════
    {
        id: 'wc_f1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 1, totalSteps: 6, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '世界杯 · 决赛上半场',
        description: '世界杯决赛。你站在球员通道里——大力神杯就在入口处。金色的。你克制住去摸它的冲动。国歌响起——你把手放在国旗上，感受着心脏的跳动。全世界二十亿人在看。这是你的决赛。你的世界杯决赛。',
        choices: {
            left:  { label: '镇定自若 — 决赛也是足球比赛', effects: { team: 3, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你深呼吸——然后踢得像任何一场比赛。不是因为不尊重——是因为你准备好了。世界杯决赛是舞台——但足球是同样的足球。半场结束时你没有慌张。控制。这是你在最大的舞台上做到的。' },
            right: { label: '燃烧一切 — 从第一秒就全力冲刺', effects: { ability: 4, ambition: 4, team: -1, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你从第一秒就拼尽全力——像这是你人生中最后四十五分钟。观众被你的能量点燃了。半场结束时你喘得说不出话。但全世界看到了——你在世界杯决赛中燃烧自己。没有保留。没有遗憾。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_f2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 2, totalSteps: 6, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 决赛下半场',
        description: '下半场。对手调整了战术——他们的核心开始往你的区域倾斜。教练示意你盯住他。这是决赛——每一次对位都像一场独立的小战争。汗水模糊了视线。但你不能眨眼。',
        choices: {
            left:  { label: '战术执行 — 完成教练布置的任务', effects: { team: 4, ability: 3, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你严格执行了教练的指示。每一次对位、每一次补防——精准得像教科书。对手的核心被你限制住了——他朝教练席摊手。战术纪律——这是你在世界杯决赛中最强大的武器。' },
            right: { label: '临场应变 — 根据阅读做出调整', effects: { ability: 4, ambition: 4, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你根据比赛的变化做出了调整——偏离了教练的战术板。但比赛是活的——战术板不是。你的应变让对手困惑了几分钟。但偏离战术的代价是防线出现了裂缝。世界杯决赛——自由和纪律之间的平衡是最难的考题。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_f3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 3, totalSteps: 6, judgeType: 'keynode', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 决赛关键时刻',
        description: '比赛还剩不到五分钟。球出界——你们的界外球。队友跑过来——喘着气说小腿抽筋了。教练在场边喊——但声音被观众的嘶吼淹没。你是队长。你需要做决定。现在。',
        choices: {
            left:  { label: '让他坚持 — 世界杯决赛需要英雄', effects: { ambition: 3, team: 0, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '"再撑五分钟。"你拍着他的肩膀。他咬了牙——继续跑。他的坚持让全队感动——但最后时刻他的失误导致了角球。英雄主义在世界杯决赛是双刃剑——它可以鼓舞人，也可以伤害人。' },
            right: { label: '换人 — 保护他，信任替补', effects: { team: 3, reputation: 4, ambition: 0 },
                     flagsAdd: {}, flagsClear: [], narrative: '你朝教练席做了换人的手势。他下来了——不甘心，但你拍了拍他的头。替补上场的球员带来了新鲜的双腿。世界杯决赛中保护队友有时比赢得比赛更需要勇气。你做了正确的选择。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_f4', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 4, totalSteps: 6, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold', title: '世界杯 · 加时赛',
        description: '加时。你的腿已经不属于你了。每次奔跑都在燃烧最后的燃料。教练用完了换人名额——你必须撑完三十分钟。你想起小时候在后院踢球——踢到天黑，母亲喊你回家吃饭。那时的你永远不累。现在的你必须找回那个孩子。',
        choices: {
            left:  { label: '超越极限 — 为大力神杯榨干自己', effects: { ability: 4, team: 3, reputation: 4 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你强迫双腿继续移动。它们已经不听大脑了——它们在听心脏。在一次冲刺中你超越了三个对手——不是因为速度，是因为你不接受失败。球进了。你甚至没有力气庆祝——你只是跪在地上。世界杯决赛的进球。你的名字将刻在历史上。' },
            right: { label: '保留体力 — 为可能的点球大战准备', effects: { team: 3, ambition: 0, ability: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你开始走而不是跑。你提前接受了点球大战。但加时赛最后一分钟——球飞入你们的禁区。你跑不动了——只能看着。球进了。点球大战不会有了。你提前放弃了这一秒——这一秒放弃了你。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_f5', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 5, totalSteps: 6, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'glowing_star', color: 'gold', title: '世界杯 · 加时关键时刻',
        description: '加时的最后一分钟。最后一个角球。球飞入禁区——在空中旋转。所有人都在抬头。时间变慢了。你看到了球的轨迹——它正飞向你的头顶。这是你生命中最重要的一次触球。不会再有了。',
        choices: {
            left:  { label: '绝杀 — 把二十年的梦想顶入球门', effects: { ability: 3, ambition: 4, reputation: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你腾空而起。球接触到头顶的那一刻——世界安静了。球飞入网角。你落地——整个世界重新开始运转——但它是不同的世界了。终场哨响。大力神杯。你跪在地上——眼泪和汗水流进嘴里。你做到了。你真的做到了。' },
            right: { label: '摆渡 — 为队友创造机会', effects: { team: 3, ambition: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你选择摆渡——把球蹭向队友。但对手的门将出击了——把球摘走。终场哨响。没有绝杀。进入点球大战。你走向中圈——心里在想刚才的选择。世界杯决赛不会给你第二次机会——每一次选择都是最终的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    {
        id: 'wc_f6', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'wc_final', step: 6, totalSteps: 6, judgeType: 'keynode', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold', title: '世界杯 · 点球大战',
        description: '点球大战。你走向十二码——每一步像踩在钉子上。门将在门线上跳。看台上有人在祈祷——你能看到他们握紧的手。球放在白点上。整个世界的重量都在这个球上。后退——深呼吸。就是现在。',
        choices: {
            left:  { label: '果断起脚 — 你最擅长的那一侧', effects: { ability: 4, ambition: 3, reputation: 4 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你助跑——没有犹豫。脚内侧——球飞入上角。门将猜错了方向。你转身——狂奔——队友追着你——整个国家在尖叫。大力神杯。你把它举起来的那一刻——金色的光芒照亮了你的脸。世界冠军。这个头衔没有人能拿走。' },
            right: { label: '勺子点球 — 用胆量让世界记住你', effects: { ambition: 3, reputation: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你决定用勺子。全世界屏住了呼吸。球——搓起来——门将没有移动——他把球抱在怀里。你站在点球点——整个世界在旋转。勺子——最勇敢的选择，也是最残忍的。世界杯。你的勺子被记住了——但不是你想要的方式。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} }, cooldown: 'once_per_career'
    },
    { id: 'wc_champion', isLeaf: true, category: 'on_field', tension: 4, icon: 'trophy', cardStyle: 'gold',
      effectsLeft: { reputation: 25, wealth: 15, ambition: 8 }, choiceLeftLabel: '举起大力神杯',
      title: '世界冠军', milestone: { id: 'worldCupWinner', text: '🏆 国家英雄！' },
      timelineText: '世界杯冠军：登顶世界之巅', timelineType: 'gold',
      description: '大力神杯被你举过头顶。金色的。比想象中重。漫天金色纸屑飘落——全世界在为你庆祝。你想起那个在后院踢球的小孩——踢到天黑，母亲喊回家吃饭。那个小孩梦想过这一刻——但现实比梦想更美。世界冠军。你是世界冠军。这个头衔会跟着你进坟墓——没有人能拿走它。',
      unlocks: ['wc_parade'] },
    { id: 'wc_fail_final', isLeaf: true, category: 'on_field', tension: 4, icon: 'pensive', cardStyle: 'special',
      effectsLeft: { reputation: 5, ambition: 4 }, choiceLeftLabel: '仰望大力神杯',
      title: '一步之遥', timelineText: '世界杯：倒在决赛', timelineType: 'normal',
      description: '终场。大力神杯被对手举起来了。你站着——看着金色的光。你走到了世界杯决赛。只差一步。但这一步——是用无数正确选择铺成的。今晚你没有走完。但你能听到世界杯决赛草皮的声音——那是下一次出发的起点。',
      unlocks: ['locker_post_defeat'] },

    // ── 独立场上事件 ──
    {
        id: 'field_derby', category: 'on_field', tension: 2,
        icon: 'swords', color: 'special',
        title: '德比之战',
        description: '德比日。球场的声浪像一堵墙。对手的队长从第5分钟就在用小动作挑衅——肘子、拉球衣、裁判转身时顶你的胸口。他会一直这样。你会——',
        choices: {
            left:  { label: '撞回去 — 不吃哑巴亏',   effects: { ambition: 3, reputation: -4 },
                     flagsSet: {}, flagsAdd: { locker_tension: 1, media_heat: 1 }, flagsClear: [],
                     narrative: '你肩膀一沉撞了回去。裁判吹哨——黄牌。看台炸了锅。但对手收敛了——他知道你不是软柿子。代价是一张黄牌和无数赛后评论。' },
            right: { label: '保持冷静 — 用进球让对手闭嘴', effects: { ability: 4, team: 3, reputation: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你深吸一口气，转身跑回位置。十分钟后你用一记世界波让整个球场安静下来。最好的报复不是撞回去——是让对方的球网颤动。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { min: 25 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'field_last_minute', category: 'on_field', tension: 2,
        icon: 'hourglass', color: 'special',
        title: '第89分钟',
        description: '1:1。第89分钟。球落到你脚下——禁区边缘，半个空门。你的队友在远端无人盯防，张开了双臂。全场八万人站了起来。这个决定只有半秒。',
        choices: {
            left:  { label: '自己射 — 做英雄',   effects: { ability: 4, ambition: 4, reputation: 3, team: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你闭眼抽射。球钻入死角。队友们冲向你——但你注意到那个在远端等球的队友没有跑过来。他只是在原地鼓了两下掌。英雄和自私之间的那条线，比球门线还细。' },
            right: { label: '横传队友 — 做正确的选择', effects: { team: 4, ability: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你轻轻一推，球滚到队友脚下。他轻松推进空门。庆祝时他第一个抱住的不是球门——是你。"兄弟，那是你的进球。我只是碰到了。"' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { min: 35 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'field_goal_drought', category: 'on_field', tension: 1,
        icon: 'cactus', color: 'dark',
        title: '进球荒',
        description: '六场没进球了。社交媒体上球迷开始怀疑。训练场上你每次射门都用力过猛——好像要把球踢穿球网。教练给了你一天休息。',
        choices: {
            left:  { label: '加练射门 — 汗水不会骗人', effects: { ability: 4, ambition: 3, team: -1 },
                     flagsStartTimers: { form_slump: 3 }, flagsClear: [],
                     narrative: '你留下来加练了两个小时。球门后的草皮都被你踢秃了一块。保安来关灯的时候你还在练。汗水流进眼睛——你不在乎。下次比赛，你会准备好的。' },
            right: { label: '休整一天 — 心态比技术重要', effects: { team: 3, ability: 1, ambition: -2 },
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
            left:  { label: '分享技巧 — 教年轻队友', effects: { team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你拉着几个年轻球员，一遍遍地演示。有人做出来了——欢呼声响彻训练场。教练在场边点了点头，在本子上记了一笔。' },
            right: { label: '保持专注 — 继续打磨自己', effects: { ability: 2, ambition: 1 },
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
        icon: 'shuffle', color: 'special',
        title: '变阵',
        description: '教练在战术板上画了新阵型。你的位置要从攻击型中场后撤到后腰——更少的射门，更多的防守。他说"这是为了球队"。你觉得这是在浪费你的天赋。',
        choices: {
            left:  { label: '接受 — 为团队做出牺牲', effects: { team: 3, ability: -2, ambition: -3 },
                     flagsAdd: {}, flagsClear: ['coach_anger'],
                     narrative: '你点了点头。头几周你踢得很别扭——丢球、失位、被过。但第三个月，你的拦截数据排进联赛前三。你开始理解这个位置的美——不是在聚光灯下，是在阴影里。' },
            right: { label: '坚持 — 找教练谈自己的位置', effects: { ambition: 3, team: -2 },
                     flagsSet: {}, flagsAdd: { coach_disrespect: 1 },
                     flagsClear: [], unlocks: ['coach_public_criticize'],
                     narrative: '你敲了教练的门。"我不认为那是我的位置。"教练看了你很久。下一场大名单里你的名字后面跟着那个你不想要的位置。他用行动回答了你的请求。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['challenged_coach'], requireStats: { ability: { min: 30 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'coach_public_criticize', category: 'coach_tactics', tension: 2, consequenceOnly: true,
        icon: 'mic', color: 'dark',
        title: '公开批评',
        description: '赛后发布会上教练当着所有记者的面说你"最近态度有问题"。更衣室里每个人都听到了——有人低下了头，有人偷偷看你。手机在口袋里震个不停。',
        choices: {
            left:  { label: '公开回击 — 不当替罪羊', effects: { ambition: 4, team: -7, reputation: -3 },
                     flagsSet: { challenged_coach: true, publicly_criticized: true },
                     flagsAdd: { coach_disrespect: 2, media_heat: 2 },
                     flagsClear: [], unlocks: ['trans_unhappy', 'coach_bench'],
                     narrative: '你在社交媒体上发了一条："输球就找替罪羊的人不配带队。"点赞瞬间破万。但第二天训练场的气氛冷得能冻住呼吸。有些话说出口就收不回了。' },
            right: { label: '私下谈 — 关上门把话说开', effects: { team: 4, ambition: -2, reputation: 2 },
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
        icon: 'pensive', color: 'dark',
        title: '被换下',
        description: '第55分钟，场边举起了你的号码。你愣住了——没有受伤，表现也不算差。替补席上那个年轻人已经在场边热身。走过教练身边时他没有抬头。',
        choices: {
            left:  { label: '径直回更衣室 — 这口气咽不下', effects: { ambition: 3, team: -8, reputation: -3 },
                     flagsSet: {}, flagsAdd: { coach_disrespect: 1, media_heat: 1 },
                     flagsClear: [], unlocks: ['trans_unhappy'],
                     narrative: '你没看教练，直接走进球员通道。摄像机追着你。赛后记者问教练他只说了四个字："战术选择。"那天晚上你盯着天花板——这里你还想待下去吗？' },
            right: { label: '坐到替补席上 — 体面地接受', effects: { team: 3, ambition: -3, reputation: 3 },
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
            left:  { label: '主动招呼 — "我带你去吃饭"', effects: { team: 4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你走过去伸出手。"嘿，你吃了吗？我带你去。"他笑了——那种松了一口气的笑。一周后他在训练场第一次铲球成功，第一个看向你。' },
            right: { label: '点头示意 — 让他自己适应', effects: { ambition: 1, team: -1 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [], narrative: '你点了点头算是打招呼。他花了更长时间融入——有些晚上他一个人在健身房待到很晚。不是加练，是不知道去哪。孤独在更衣室里会传染。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },
    {
        id: 'locker_captain_vote', category: 'locker_room', tension: 2,
        icon: 'medal', color: 'special',
        title: '队长投票',
        description: '老队长要转会了。教练组织新队长投票。两个候选人——你和队里的头号射手。他有数据，你有威望。更衣室分成了两派。',
        choices: {
            left:  { label: '主动竞争 — 说出你的愿景', effects: { ambition: 4, team: -2, reputation: 3 },
                     flagsSet: { gave_captain_speech: true },
                     flagsAdd: {}, flagsClear: [], unlocks: ['locker_veteran_retire'],
                     narrative: '你在投票前站起来说了一段话——关于球队的未来，关于你想创造的文化。投票结果：你以两票优势胜出。袖标很轻，但戴上的那一刻你的肩膀沉了一下。' },
            right: { label: '退让 — 公开支持对手', effects: { team: 3, ambition: -4, reputation: 3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你站起来说："我觉得他比我更适合。"会议室安静了两秒。后来有人告诉你，那两秒让你赢得了比袖标更多的东西——尊重。不争的领袖，有时候比争来的更强大。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { team: { min: 40 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_veteran_retire', category: 'locker_room', tension: 1,
        icon: 'old', color: '',
        title: '老将退役',
        description: '更衣室里最老的那个队友宣布退役。清理储物柜时他从里面翻出一张泛黄的球队合照——2006年的。他看着照片上年轻的自己，笑了。二十年。',
        choices: {
            left:  { label: '组织全队告别 — 让每个人说一句话', effects: { team: 4, reputation: 3, wealth: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你组织了一个小仪式。每人都说了一句关于老将的回忆。说到第十个人时他哭了——二十年，第一次有人在更衣室看到他哭。不是难过，是被记住。你用自己的钱订了一个纪念框。' },
            right: { label: '私下告别 — 在停车场喝一罐啤酒', effects: { team: 2, ambition: 2 },
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
            left:  { label: '爽快买单 — "甜点谁还要？"', effects: { team: 4, wealth: -3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你把卡递过去。全队欢呼。中卫拍着肚子说下次他请——你知道他不会，但没关系。回训练基地的车上有人在唱歌。这笔钱买到了比分牌上永远看不到的东西。' },
            right: { label: 'AA吧 — 公平最重要', effects: { wealth: 1, team: -2 },
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
        icon: 'speaking', color: 'dark',
        title: '更衣室的裂痕',
        description: '训练后在角落里几个球员在低声议论教练的安排。有人觉得某人总被特殊对待。你听到了自己的名字——有人说你是"教练的宠儿"。你要介入吗？',
        choices: {
            left:  { label: '直面问题 — "有意见当面说"', effects: { ambition: 4, team: -2 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '"如果你们有意见，应该在更衣室里说，不是在背后。"几双眼睛看向你。气氛更僵了——但至少话说开了。诚实有时候让人不舒服，但它比谎言干净。' },
            right: { label: '假装没听见 — 不想火上浇油', effects: { team: 1, ambition: -2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你戴上耳机走出更衣室。但问题不会因为假装没听见就消失——它只是换了种方式发酵。第二天有人在训练场上故意不给你传球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_storm_2', category: 'locker_room', tension: 2,
        series: { type: 'foreshadow', id: 'locker_crisis', step: 2, totalSteps: 3 },
        icon: 'swords', color: 'dark',
        title: '裂痕扩大',
        description: '训练赛上两队人马互不传球。教练吹停了三次——不是因为战术，是因为火气。更糟的是：有人把更衣室的事泄露给了媒体。头条写着：《内战》。',
        choices: {
            left:  { label: '揪出泄密者 — 整顿纪律', effects: { ambition: 3, team: -8, ability: 2 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '你挨个问。问到第三个人时他红了脸。泄密者被内部停训。更衣室安静了——安静得像图书馆。秩序恢复了，但温度也降了。没有人再开玩笑。' },
            right: { label: '召集所有人 — "今天把话说开"', effects: { team: 3, ambition: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: ['locker_tension'],
                     narrative: '你把所有人叫到一起。"有什么话现在说——不要让外面的人替我们写故事。"沉默。然后一个老将站起来说了第一句。之后每个人都说了。问题没有消失——但它不再是炸弹，只是问题了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_storm_3', category: 'locker_room', tension: 2,
        series: { type: 'foreshadow', id: 'locker_crisis', step: 3, totalSteps: 3 },
        icon: 'shuffle', color: 'dark',
        title: '重建秩序',
        description: '高层介入。他们问你意见：清洗闹事的球员重建纪律，还是由你出面把更衣室重新凝聚起来？这个决定会影响这支球队很多年。',
        choices: {
            left:  { label: '支持清洗 — 长痛不如短痛', effects: { ambition: 3, team: -12, ability: 3, reputation: -3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['locker_tension'],
                     narrative: '你点了点头。转会窗关闭时三个人离开了。更衣室安静了——静得能听到空调声。没有人再吵架，也没有人再开玩笑。秩序恢复了，但温度降到了冰点。这是你要的更衣室吗？' },
            right: { label: '亲自调解 — "一个都不能少"', effects: { team: 3, ambition: 3, reputation: 4 },
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
        icon: 'mic', color: 'dark',
        title: '记者陷阱',
        description: '话筒递过来："有传言说你和主教练关系紧张——你对此有什么回应？"录音笔的红灯亮了。周围突然安静——所有人都在等你的嘴。这是一颗精心布置的地雷。',
        choices: {
            left:  { label: '直言 — "我们确实有分歧"', effects: { reputation: -3, team: -2 },
                     flagsSet: { publicly_criticized: true },
                     flagsAdd: { media_heat: 2, coach_disrespect: 1 },
                     flagsClear: [], unlocks: ['coach_public_criticize'],
                     narrative: '第二天的头版是你的原话——断章取义的那种。但你给了他们刀子，怎么捅是他们的专业。教练一整天没跟你说话。' },
            right: { label: '回避 — "目标是一致的——赢球"', effects: { reputation: 4, team: 2 },
                     flagsAdd: {}, flagsClear: ['media_heat'],
                     narrative: '"教练和我的目标一样——赢球。其他是你们记者编的。"记者笑了一下关掉录音笔。他不是放弃了——是今天钓不到鱼。你保住了脸面，也保住了更衣室的温度。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_transfer_rumor', category: 'media_fans', tension: 1,
        icon: 'newspaper', color: '',
        title: '转会传闻',
        description: '报纸头版：你的照片旁边是一个豪门的队徽。队友们开始拿你开玩笑——"大球星别忘了我们啊"。经纪人发来消息：那家俱乐部确实在关注你。',
        choices: {
            left:  { label: '公开否认 — 稳定军心', effects: { team: 4, reputation: 2 },
                     flagsStartTimers: {}, flagsClear: ['transfer_rumor'],
                     narrative: '"我在这里很开心。"你在社交媒体上发了一张穿母队球衣庆祝的老照片。球迷放心了。队友不开玩笑了——至少暂时。经纪人发了一个😐。' },
            right: { label: '保持暧昧 — 增加谈判筹码', effects: { ambition: 4, team: -2, wealth: 3 },
                     flagsStartTimers: { transfer_rumor: 5 }, flagsClear: [], unlocks: ['trans_agent_call'],
                     narrative: '你笑了笑没有回应。沉默是最聪明的语言——它让每个人都按自己的愿望解读。经纪人发来👍。你的电话在未来几周会响个不停。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 15 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_fan_banner', category: 'media_fans', tension: -2,
        icon: 'heart', color: '',
        title: '球迷横幅',
        description: '今天看台上多了一条横幅——上面是你的名字。写着："他从这里走出去的。"落款是你少年时踢球的社区球场。那个破球场。你很久没回去过了。',
        choices: {
            left:  { label: '赛后开车回去看看那个球场', effects: { reputation: 3, team: 2, wealth: -1 },
                     flagsAdd: {}, flagsClear: ['fan_outrage'],
                     narrative: '你开车去了那个旧球场。球门还是一样的锈迹，草坪还是一样的坑洼。几个孩子正在踢球——看到你时尖叫起来。你和他们踢了半小时。开车回家时你发现自己笑得像个八岁的孩子。' },
            right: { label: '转发感谢 — "永远不会忘记"', effects: { reputation: 2, ambition: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你拍了横幅的照片发上网。十万点赞。但手机屏幕熄灭后你盯着天花板——你是不是很久没回去过了？点赞很容易，开车回去很难。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },
    {
        id: 'media_social_post', category: 'media_fans', tension: -2,
        icon: 'phone', color: '',
        title: '社交媒体',
        description: '你的账号涨了不少粉。品牌方私信你——营养品、手表、电竞椅。经纪人说要经营形象。教练说过少玩手机。你刚发的训练照下面两派人在吵架。',
        choices: {
            left:  { label: '用心经营 — 回复有趣评论', effects: { wealth: 2, reputation: 3 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你花了一小时回复评论。有人被你翻牌激动得连发三条。品牌方又多来了两个私信。人气是一种资产——你很早就懂了。' },
            right: { label: '放下手机 — 练到天黑', effects: { ability: 2, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你关掉手机，去了健身房。空无一人。练到天黑——没人拍照没人点赞。但你的身体在感谢你。最好的训练往往是没有观众的那一次。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'none'
    },
    {
        id: 'media_press_conference', category: 'media_fans', tension: 1,
        icon: 'tv', color: '',
        title: '赛后发布会',
        description: '镜头闪着红光。第一排那个女记者是你的老熟人了——她写过一篇关于你的尖刻评论。"你对自己今天的表现满意吗？"',
        choices: {
            left:  { label: '坦诚 — "我踢得不好"', effects: { reputation: 3, team: 2 },
                     flagsAdd: {}, flagsClear: ['media_heat'],
                     narrative: '"不满意。我踢得不好——但我从不逃避批评。"记者们安静了。他们习惯了球员找借口。诚实是最好的公关——只是很少有人敢用。' },
            right: { label: '转移话题 — 谈球队整体', effects: { team: 4, reputation: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"今天我们整体都不够好，不只是我。"你把话题引向战术和团队。教练在旁边微微点头——他知道你在保护他。有时候最好的个人回答是不回答个人。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_season'
    },

    // ════════════════════════════════════════════════════════
    //  类别5: 商业 (business) — 4个
    //  核心: 财富↑→能力↓或团队↓
    // ════════════════════════════════════════════════════════
    {
        id: 'biz_endorsement', category: 'business', tension: 1,
        icon: 'diamond', color: 'special',
        title: '品牌代言',
        description: '运动品牌邀请你做代言人。合同金额是你年薪的一半——但需要拍摄和商业活动，占用训练时间。经纪人眼睛在发光。"这是商业帝国的第一步。"',
        choices: {
            left:  { label: '签约 — 拓展商业价值', effects: { wealth: 3, reputation: 3, ability: -4 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '摄影棚、化妆师、绿幕——你在里面待了两天。广告牌上的你很帅。但回到训练场时体能数据下降了。金钱能买到很多东西——买不到的是你花在摄影棚的那两天训练。' },
            right: { label: '拒绝 — 足球永远是第一位', effects: { ability: 3, ambition: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"现在我只想在球场上证明自己。"经纪人的脸色很精彩。但你走回训练场时草皮的味道比任何香水都好闻。品牌方说"理解"——其实他们不理解。但你不欠解释。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { reputation: { min: 20 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_investment', category: 'business', tension: 2,
        icon: 'chart', color: 'special',
        title: '投资机会',
        description: '队友递来投资计划书——高档餐厅，三个分店，预期回报很高。他已经投了，说"就差你一份"。金额不小——差不多是你半年的薪水。但你知道多少球员退役后破产的故事。钱放在银行最安全——但也最不会生长。',
        choices: {
            left:  { label: '投资 — 风险才有回报', effects: { wealth: -10, ambition: 4 },
                     flagsSet: { invested_restaurant: true }, flagsAdd: {}, flagsClear: [],
                     unlocks: ['biz_investment_result'],
                     narrative: '你签了支票。金额后面的零让你挑了挑眉——但你知道钱不流动就只是纸。开业那天人满为患。一个月后餐厅还在排队。也许你比队友更懂商业——也许你只是运气好。时间会告诉你。' },
            right: { label: '婉拒 — "我只懂踢球"', effects: { wealth: 2, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"谢了兄弟。"你推开计划书。一年后他的餐厅因为经营不善关门了——合伙人不知所踪。队友在你面前骂了三个小时。你递给他一瓶啤酒——没有说"我早说过"。有时候不做决定就是最好的决定。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['invested_restaurant'], requireStats: { wealth: { min: 25 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_investment_result', category: 'business', tension: 1,
        icon: 'chart', color: 'special',
        title: '投资回报',
        description: '一年了。餐厅生意火爆——门口排队的人比球场售票处还长。合伙人递来新计划：开第二家分店，扩大品牌，需要追加投资。但他也给了另一个选项——有人想收购你手里的股份。价格翻倍。你投入的十万现在值二十万。卖还是不卖？',
        choices: {
            left:  { label: '追加投资 — 做大做强，我要更多', effects: { wealth: -25, ambition: 5 },
                     flagsAdd: {}, flagsClear: [],
                     unlocks: ['biz_investment_final'],
                     narrative: '"再来。"你说。合伙人笑了。你又签了一张支票——这次是二十五万，你几乎掏空了积蓄。走出会议室时你在玻璃门上看到自己的倒影——你穿着定制西装，看起来像个商人。但你知道你只是一个会踢球的年轻人。商业世界不会因为你会踢弧线球就对你温柔。' },
            right: { label: '卖出套现 — 翻倍了，够了', effects: { wealth: 20, ambition: -3 },
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
        icon: 'heart', color: '',
        title: '社区慈善',
        description: '儿童医院邀请你参加慈善活动。你的出现能帮他们筹到远超义卖本身的善款——因为你是明星。组织者说孩子们等了很久。但今天下午有战术课。',
        choices: {
            left:  { label: '亲自去 — 花一个下午的时间', effects: { reputation: 3, wealth: -2, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你在医院待了一下午。一个戴呼吸机的男孩问你："踢球痛吗？"你握着他的手说："痛。但痛过之后就是进球。"他笑了。你出门后在车上坐了很久——不是因为累。' },
            right: { label: '捐款了事 — 训练不能耽误', effects: { wealth: -4, reputation: 2, ability: 1 },
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
            left:  { label: '接受合同 — 追逐更伟大的舞台', effects: { wealth: 12, ambition: 4, reputation: 3, team: -2 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [], unlocks: [],
                     narrative: '你在合同上签了字。数字后面的零比你的球衣号码还多。母亲打来电话——她看到了新闻。"你自己选的路，好好走。"窗外母队的训练场灯还亮着。' },
            right: { label: '婉拒 — "这里还有我要完成的事"', effects: { team: 3, ability: 2, reputation: 4, ambition: -4 },
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
            left:  { label: '拼尽全力 — 每天最早到场', effects: { ability: 3, ambition: 3, reputation: 4 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你每天早上六点到训练基地。三周后教练在首发名单写了你的名字。豪门不相信眼泪——但他们尊重汗水。那个老将赛前拍了拍你的背："准备好了？"' },
            right: { label: '接受轮换 — 安心等机会', effects: { wealth: 4, ambition: -3, reputation: -3, team: 3 },
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
            left:  { label: '扛起重建 — 带着年轻人从头来', effects: { team: 3, ambition: 3, reputation: 3, ability: -2 },
                     flagsSet: { became_captain: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你带着一群年轻人拼了一整个赛季。输了五场——球迷没有骂你。因为你在每一场都拼了命。第六场赢了——全场起立为你唱歌。你终于理解"一人一城"的重量。' },
            right: { label: '后悔了 — 要求转会离开', effects: { ambition: -3, team: -10, reputation: -15 },
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
        icon: 'phone', color: '',
        title: '经纪人来电',
        description: '经纪人深夜来电，语气兴奋："我帮你在那边搭上线了。冬窗就能走——只等你点头。"窗外是训练基地的灯光。你从床上坐起来。',
        choices: {
            left:  { label: '让他推进 — 看看有什么选择', effects: { ambition: 4, wealth: 2, team: -2 },
                     flagsStartTimers: { transfer_rumor: 5 }, flagsAdd: {}, flagsClear: [], unlocks: ['trans_big_offer'],
                     narrative: '"去看看吧。"你挂了电话。窗外训练场的灯还亮着——不知道是谁忘了关。转会窗的风开始吹了。空气里有种说不清的味道——是机会还是告别？' },
            right: { label: '拒绝 — "这里我还要完成一件事"', effects: { team: 3, ambition: -2, reputation: 3 },
                     flagsStartTimers: {}, flagsAdd: {}, flagsClear: ['transfer_rumor'],
                     narrative: '"不用了。"经纪人沉默了。你挂掉电话躺回床上。很奇怪——说"不"的感觉比说"好"更让你安心。窗外训练场的灯灭了。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['rejected_big_transfer'], requireStats: { reputation: { min: 25 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'trans_unhappy', category: 'transfer', tension: 2, consequenceOnly: true,
        icon: 'arrows', color: 'dark',
        title: '想要离开',
        description: '你受够了。教练不信任你，队友不理解你，球迷开始嘘你。更衣室里你坐在角落——第一次觉得自己不属于这里。经纪人发来消息："想走的话我可以找下家。"',
        choices: {
            left:  { label: '递交转会申请 — 去一个需要你的地方', effects: { ambition: 4, team: -8, reputation: -3 },
                     flagsSet: { asked_for_transfer: true }, flagsAdd: {}, flagsClear: ['coach_disrespect', 'coach_anger'],
                     narrative: '体育总监接过转会申请时没有惊讶——他可能在等你这句话。离开不代表失败。有时候留下才是。你需要一个重新呼吸的地方。' },
            right: { label: '咬牙坚持 — 用表现让所有人闭嘴', effects: { ability: 3, ambition: 3, team: 4, reputation: 3 },
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
        icon: 'tv', color: 'special',
        title: '新俱乐部发布会',
        description: '转会后的首次官方亮相。记者席坐满了人——他们想看你是什么表情。闪光灯像暴雨。第一排那个记者站起来问："你在这里能复制以前的表现吗？"',
        choices: {
            left:  { label: '充满信心 — "我来这里是为了赢"', effects: { reputation: 4, ambition: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你直视镜头。"我是来这里赢的。"第二天头版用了你的照片——下面写着"新王的宣言"。高标准设下了。现在你得去兑现它。' },
            right: { label: '谦虚谨慎 — "一步一步来"',   effects: { team: 3, reputation: 2, ambition: -2 },
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
            left:  { label: '走出去签名 — 直到最后一个孩子', effects: { team: 4, reputation: 3, wealth: -1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你在栅栏边签了一个半小时。保安说"差不多行了"——你说"等一下，还有两个"。最后一个孩子举着你的球衣——已经签过三次了。你又签了一次。他跑回去时几乎在飞。' },
            right: { label: '挥手示意 — 训练时间到了', effects: { reputation: 2, ability: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你挥了挥手，向训练场走去。一个孩子喊"下次再来啊！"你回头笑了笑。职业球员的时间很贵——但有些东西很便宜，比如微笑。' }
        },
        conditions: { requireFlags: ['rejected_big_transfer'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'trans_regret_talk', category: 'locker_room', tension: 1, consequenceOnly: true,
        icon: 'pensive', color: 'dark',
        title: '老队友的消息',
        description: '深夜。手机亮了——是母队的老队友。"兄弟，这边更衣室少了你感觉不太一样了。"你盯着这条消息看了很久。窗外是陌生的城市、陌生的灯光。',
        choices: {
            left:  { label: '回复 — "我也怀念那里"', effects: { team: 2, ambition: -4, reputation: 2 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"我也怀念。"你打了又删，删了又打。最后只发了四个字。三秒后他回了——一个拥抱的emoji。有些东西是转会费永远算不出来的。' },
            right: { label: '已读不回 — 向前看', effects: { ambition: 4, team: -2 },
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
        icon: 'bandage', color: 'dark',
        title: '小伤预警',
        description: '训练后膝盖酸痛。队医检查后说是轻微拉伤——建议休两周。但接下来三场包括一场德比。教练还没公布大名单。你觉得还能跑。',
        choices: {
            left:  { label: '主动休息 — 听队医的话', effects: { ability: -2, team: 4 },
                     flagsAdd: {}, flagsClear: ['injury_risk'],
                     narrative: '"我去养伤。"教练点了点头——他宁愿失去你两周，也不想失去你半个赛季。你看着队友训练，膝盖上敷着冰袋。养伤比训练更难——因为它需要耐心。' },
            right: { label: '隐瞒 — 打封闭坚持上场', effects: { ability: 3, ambition: 3 },
                     flagsSet: { played_through_injury: true }, flagsAdd: { injury_risk: 2 }, flagsClear: [],
                     unlocks: ['injury_play_through'],
                     narrative: '你没说实话。队医看着你——"你确定？"你点了点头。封闭针打进去——冷，然后是麻木。你上场了。腿不疼了。但身体有记忆——它会的。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: { ability: { max: 80 } } },
        cooldown: 'once_per_season'
    },
    {
        id: 'injury_play_through', category: 'injury', tension: 2,
        icon: 'leg', color: 'dark',
        title: '旧伤复发',
        description: '第67分钟。一次冲刺后你突然停了下来——膝盖传来了熟悉的刺痛。队医跑进场时你已经在摇头。瞒了这么久的伤，现在瞒不住了。担架过来了。看台上安静了。',
        choices: {
            left:  { label: '接受现实 — 停下来全面检查', effects: { ability: -8, team: 3 },
                     flagsAdd: {}, flagsClear: ['injury_risk', 'played_through_injury'],
                     narrative: 'MRI结果：半月板撕裂。赛季报销。你坐在医生办公室里听他解释手术方案。窗外训练场上队友们正在热身——你从来没有从这个角度看过。接受现实是足球里最难的技术动作。' },
            right: { label: '再打一针 — 就算废了也要踢完', effects: { ability: 3, ambition: 3, reputation: -3 },
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
        icon: 'hospital', color: 'dark',
        title: '康复之路',
        description: '手术后。康复室是你的新主场。墙上有一面镜子——你每次做抬腿训练时都能看到自己咬着牙的样子。康复师说需要三个月。但你心里有个数字：两个月。',
        choices: {
            left:  { label: '循序渐进 — 相信康复师的计划', effects: { ability: 3, team: 2 },
                     flagsAdd: {}, flagsClear: ['played_through_injury', 'injury_risk'],
                     narrative: '你按计划一天天恢复。第三个月的第一天你第一次慢跑——心跳不是因为运动，是因为喜悦。耐心不是等待，是在等待时仍然相信自己。' },
            right: { label: '加速复出 — "我两个月就够了"', effects: { ability: -3, ambition: 3 },
                     flagsSet: {}, flagsAdd: { injury_risk: 1 }, flagsClear: [],
                     narrative: '你比计划提前了一个月复出。第一场你进了球——但赛后膝盖又肿了。康复师摇头："你之前三个月的努力——白费了一半。"你抱着冰袋说不出话。' }
        },
        conditions: { requireFlags: ['played_through_injury'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'injury_specialist', category: 'injury', tension: 2,
        icon: 'telescope', color: 'special',
        title: '顶级团队',
        description: '康复进度不如预期。队医手段有限。经纪人推荐了一个德国顶级康复团队——但费用高昂，俱乐部只愿承担一小部分。你自己的钱也得掏一大块。',
        choices: {
            left:  { label: '自费请德国团队 — 对自己投资', effects: { wealth: -15, ability: 4 },
                     flagsAdd: {}, flagsClear: ['played_through_injury', 'injury_risk'],
                     narrative: '你提了一大笔储蓄。德国团队两周内拿出了全新的康复方案——比俱乐部的先进了至少五年。两个月后你跑得比受伤前还快。最好的投资是对自己的身体——这是你最有价值的资产。' },
            right: { label: '靠队医慢慢来 — 省下这笔钱', effects: { ability: 2, wealth: 2 },
                     flagsAdd: {}, flagsClear: ['played_through_injury'],
                     narrative: '你选择信任队医。恢复得慢一些——但你在康复室里学会了比任何时候都更了解自己的身体。不是最快的路，但每一步都踏实。钱省下来了——时间花了。' }
        },
        conditions: { requireFlags: ['played_through_injury'], forbidFlags: [], requireStats: { wealth: { min: 20 } } },
        cooldown: 'once_per_career'
    }
];
