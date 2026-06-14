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

    // ── 线性 counter: 国内杯赛征途 (4步→成功/失败) ──
    cup_run: {
        type: 'linear', id: 'cup_run', name: '杯赛征途', totalSteps: 4,
        judgeType: 'counter', requiredCorrect: 3,
        stepEvents: ['field_cup_1', 'field_cup_2', 'field_cup_3', 'field_cup_4'],
        correctSide: 'left',
        successEndingEventId: 'field_cup_win',
        failEndingEventId: 'field_cup_lose',
        tension: 4,
        condition: 's.reputation>=20&&s.age<=34'
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
            left:  { label: '为团队而战 — 让每个人都发光', effects: { team: 6, ability: 2, reputation: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你满场跑动——不是为进球，是为队友拉开空间。你助攻了两个球，第三个是你抢断后发起的。赛后教练说了一句话你永远不会忘："你是这支球队的心脏。"' },
            right: { label: '展示自己 — 这是你的毕业演出', effects: { ability: 6, ambition: 5, reputation: 3 },
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
            left:  { label: '签长约 — 把未来交给这家俱乐部', effects: { team: 5, wealth: 3, ambition: -2, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你签了字。笔尖划过纸面的声音比你想象的要轻。这意味着五年——你把最黄金的五年交给了这支队徽。走出办公室时阳光很好。你看着训练场——它现在是你的了。' },
            right: { label: '签短约 — 保留更多选择权', effects: { ambition: 5, wealth: 1, team: -2 },
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
            left:  { label: '全部存下 — 为未来打算', effects: { wealth: 15 },
                     flagsAdd: {}, flagsClear: [], narrative: '你把大部分转进了储蓄账户。不是小气——是你见过太多球员退役后一无所有的故事。第一笔工资，你给自己买了双新球鞋。剩下的，留给了未来。' },
            right: { label: '请青训队友吃一顿 — 不忘来时路', effects: { wealth: 10, team: 4 },
                     flagsAdd: {}, flagsClear: [], narrative: '你包下了青训营附近那家你们总路过但从没进去过的餐厅。所有人都在——你的邻座、教练、甚至那个总板着脸的体能师。账单上的数字让你挑了挑眉。但你看着满桌的笑声——值了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },

    // ════════════════════════════════════════════════════════
    //  类别1: 场上决策 (on_field) — 10个
    // ════════════════════════════════════════════════════════

    // ── 杯赛征途 4步 ──
    {
        id: 'field_cup_1', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_run', step: 1, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold',
        title: '杯赛 · 小组赛',
        description: '小组赛最后一轮。打平即可出线，对手是去年的四强。教练的战术板上写着"稳守反击"——但你觉得对手的防线有弱点。',
        choices: {
            left:  { label: '执行战术 — 稳守反击', effects: { ability: 3, team: 6, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你回撤到中场，每一次抢断后迅速出球。第78分钟，你送出的直塞穿透了整条防线。2:0。队友们扑向你——纪律赢得了比赛。' },
            right: { label: '无视战术 — 抓住弱点猛攻', effects: { ability: 6, ambition: 5, team: -3 },
                     flagsAdd: { coach_disrespect: 1 }, flagsClear: [], narrative: '你不断前插。第34分钟头球破门。但教练在场边脸色铁青——防线因为你压得太靠上被打穿了两次。终场3:2。赢了比赛，输了信任。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'field_cup_2', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_run', step: 2, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'swords', color: 'gold',
        title: '杯赛 · 淘汰赛',
        description: '淘汰赛第一轮。对手的铁桶阵密不透风——70分钟了还是0:0。小腿开始抽筋。场边的第四官员举起了补时牌。',
        choices: {
            left:  { label: '耐心传导 — 用脑踢球',   effects: { ability: 4, team: 5, reputation: 3 },
                     flagsAdd: {}, flagsClear: [], narrative: '你不断回撤接球，一脚一脚地拉扯着对手的防线。第88分钟，你在禁区弧顶起脚——弧线球挂入死角。聪明地赢比用力地赢更难。' },
            right: { label: '强行突破 — 用身体撞开防线', effects: { ability: 7, ambition: 6, team: -3 },
                     flagsAdd: { injury_risk: 1 }, flagsClear: [], narrative: '你一次次带球冲进人堆。被踢倒了九次。第十次，你终于挤开一条缝隙捅射破门。球进了，但赛后你脚踝上的冰袋比足球还大。队医摇了摇头。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'field_cup_3', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_run', step: 3, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'right' },
        icon: 'glowing_star', color: 'gold',
        title: '杯赛 · 半决赛',
        description: '半决赛前夜。对手的头号射手赛前放话："我已经在研究决赛对手了。"更衣室里有人低头不语，有人拍着桌子要反击。所有目光转向了你——你要怎么回应？',
        choices: {
            left:  { label: '"我们一起赢" — 凝聚所有人',   effects: { team: 10, ambition: 3, reputation: 6 },
                     flagsAdd: {}, flagsClear: [], narrative: '你没回应对手的挑衅。你把每个人叫到一起，一个一个说他们的优点。第二天你们用一场3:0让那个射手闭上了嘴。这才是足球。' },
            right: { label: '"我来让他闭嘴" — 独自扛旗', effects: { ability: 10, ambition: 8, team: -5, reputation: 5 },
                     flagsAdd: { media_heat: 1 }, flagsClear: [], narrative: '你当着媒体的面反击："让他来试试。"第二天你梅开二度。但赢球后更衣室里很安静——有人觉得风头被你一个人抢光了。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'field_cup_4', category: 'on_field', tension: 4,
        series: { type: 'linear', id: 'cup_run', step: 4, totalSteps: 4, judgeType: 'counter', correctSide: 'left', stepCorrectSide: 'left' },
        icon: 'trophy', color: 'gold',
        title: '杯赛 · 决赛',
        description: '决赛。阳光刺眼。你走出球员通道时听到了八万人的声浪。所有的凌晨训练、所有放弃的假期、所有的选择——都指向了这90分钟。哨声响了。',
        choices: {
            left:  { label: '燃烧一切 — 不留任何遗憾', effects: { ability: 12, team: 8, ambition: 8, reputation: 15 },
                     flagsSet: { won_tournament: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你跑到了双腿失去知觉。第93分钟你拖着抽筋的腿追了40米回防。终场哨响，你跪在草坪上——不是疲惫，是无悔。' },
            right: { label: '冷静计算 — 用智慧掌控节奏', effects: { ability: 7, team: 6, ambition: 4, reputation: 10 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你让情绪沉下去。每一个决定都经过计算。队友说你像场上的棋手——冷静得不像在踢决赛。也许不够热血，但你带领球队走到了最后。' }
        },
        hideEffects: true,
        settlementTextLeft:  '终场哨响。你跪在草坪上，不是因为疲惫——是因为你知道自己付出了一切。无论比分如何，这一刻没有遗憾。你听到了看台上有人在哭。',
        settlementTextRight: '你控制着节奏，像一个棋手在场上落子。也许不够热血——但这才是你的方式。足球不止一种踢法。聪明有时候比拼命更持久。',
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    // 杯赛结局
    {
        id: 'field_cup_win', isLeaf: true, category: 'on_field', tension: 4,
        icon: 'trophy', cardStyle: 'gold',
        effectsLeft: { reputation: 25, wealth: 8 }, effectsRight: {},
        choiceLeftLabel: '举起奖杯', choiceRightLabel: '举起奖杯',
        title: '冠军',
        description: '奖杯的金属冰凉而沉重。你把它举过头顶，漫天彩带飘落。看台上有人在哭，有人在笑。你想起第一次踢球的那个下午——那时你只想把球踢进球门。现在，你做到了更多。',
        timelineText: '杯赛冠军：举起了奖杯', timelineType: 'gold',
        milestone: { id: 'firstTrophy', text: '🏆 首个冠军！' },
        unlocks: ['field_trophy_parade']
    },
    {
        id: 'field_cup_lose', isLeaf: true, category: 'on_field', tension: 4,
        icon: 'pensive', cardStyle: 'special',
        effectsLeft: { reputation: 5, ambition: 3 }, effectsRight: {},
        choiceLeftLabel: '沉默离场', choiceRightLabel: '沉默离场',
        title: '一步之遥',
        description: '终场比分定格。你的队友倒在草坪上。你站着，看着对手捧杯。这就是足球——有人赢就有人输。但站在决赛场上本身，已足够骄傲。你会的，下次你会赢。',
        timelineText: '杯赛：倒在决赛', timelineType: 'normal',
        unlocks: ['locker_post_defeat']
    },
    // 杯赛余波
    {
        id: 'field_trophy_parade', category: 'on_field', tension: -2,
        icon: 'confetti', color: 'gold',
        title: '夺冠游行',
        description: '敞篷大巴缓缓驶过城市的主干道。街道两侧挤满了人——他们穿着你的球衣，举着你的海报。一个小女孩被父亲举在肩上，手里拿着一张纸，上面歪歪扭扭写着你的号码。',
        choices: {
            left:  { label: '抱起小女孩 — 让这一天被记住', effects: { reputation: 4, team: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你示意司机停车。你弯腰把那个小女孩抱上了大巴。她愣了两秒，然后紧紧抱住你的脖子。闪光灯闪成一片——但你只听到了她在你耳边说"我以后也要踢球"。' },
            right: { label: '挥手致意 — 保持职业形象',   effects: { reputation: 2, ambition: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你向人群挥手，微笑——标准的冠军表情。大巴继续向前。一个完美的职业球员的一天。但你后来在手机上看到那个小女孩的照片时，你想——你本可以停下来。' }
        },
        conditions: { requireFlags: ['won_tournament'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_post_defeat', category: 'locker_room', tension: 1, consequenceOnly: true,
        icon: 'pensive', color: 'dark',
        title: '失利之后',
        description: '决赛失利后的更衣室安静得像图书馆。有人在角落蒙着毛巾，有人盯着地板。你坐在自己的位置上——球衣还湿着。队长先开了口。',
        choices: {
            left:  { label: '第一个发言 — "明年我们会回来"', effects: { team: 6, ambition: 3, reputation: 2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你站起来，声音不大，但在安静的更衣室里足够了。"这不是结束。记住今天的感觉——明年我们让对手感受它。"有人抬起了头。' },
            right: { label: '沉默 — 让时间消化一切',   effects: { team: 1, ambition: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '你什么都没说。有时候沉默是最好的尊重——给失败留出它需要的空间。你披上外套，最后一个离开更衣室。走廊很长，但你知道这不是终点。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },

    // ── 独立场上事件 ──
    {
        id: 'field_derby', category: 'on_field', tension: 2,
        icon: 'swords', color: 'special',
        title: '德比之战',
        description: '德比日。球场的声浪像一堵墙。对手的队长从第5分钟就在用小动作挑衅——肘子、拉球衣、裁判转身时顶你的胸口。他会一直这样。你会——',
        choices: {
            left:  { label: '撞回去 — 不吃哑巴亏',   effects: { ambition: 6, reputation: -4 },
                     flagsSet: {}, flagsAdd: { locker_tension: 1, media_heat: 1 }, flagsClear: [],
                     narrative: '你肩膀一沉撞了回去。裁判吹哨——黄牌。看台炸了锅。但对手收敛了——他知道你不是软柿子。代价是一张黄牌和无数赛后评论。' },
            right: { label: '保持冷静 — 用进球让对手闭嘴', effects: { ability: 4, team: 3, reputation: 5 },
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
            left:  { label: '自己射 — 做英雄',   effects: { ability: 8, ambition: 8, reputation: 6, team: -5 },
                     flagsAdd: {}, flagsClear: [], narrative: '你闭眼抽射。球钻入死角。队友们冲向你——但你注意到那个在远端等球的队友没有跑过来。他只是在原地鼓了两下掌。英雄和自私之间的那条线，比球门线还细。' },
            right: { label: '横传队友 — 做正确的选择', effects: { team: 8, ability: 2, reputation: 4 },
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
            left:  { label: '接受 — 为团队做出牺牲', effects: { team: 6, ability: -2, ambition: -3 },
                     flagsAdd: {}, flagsClear: ['coach_anger'],
                     narrative: '你点了点头。头几周你踢得很别扭——丢球、失位、被过。但第三个月，你的拦截数据排进联赛前三。你开始理解这个位置的美——不是在聚光灯下，是在阴影里。' },
            right: { label: '坚持 — 找教练谈自己的位置', effects: { ambition: 5, team: -3 },
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
            left:  { label: '公开回击 — 不当替罪羊', effects: { ambition: 8, team: -7, reputation: -5 },
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
            left:  { label: '径直回更衣室 — 这口气咽不下', effects: { ambition: 6, team: -8, reputation: -3 },
                     flagsSet: {}, flagsAdd: { coach_disrespect: 1, media_heat: 1 },
                     flagsClear: [], unlocks: ['trans_unhappy'],
                     narrative: '你没看教练，直接走进球员通道。摄像机追着你。赛后记者问教练他只说了四个字："战术选择。"那天晚上你盯着天花板——这里你还想待下去吗？' },
            right: { label: '坐到替补席上 — 体面地接受', effects: { team: 5, ambition: -3, reputation: 3 },
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
            left:  { label: '主动竞争 — 说出你的愿景', effects: { ambition: 8, team: -3, reputation: 3 },
                     flagsSet: { gave_captain_speech: true },
                     flagsAdd: {}, flagsClear: [], unlocks: ['locker_veteran_retire'],
                     narrative: '你在投票前站起来说了一段话——关于球队的未来，关于你想创造的文化。投票结果：你以两票优势胜出。袖标很轻，但戴上的那一刻你的肩膀沉了一下。' },
            right: { label: '退让 — 公开支持对手', effects: { team: 6, ambition: -4, reputation: 5 },
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
            left:  { label: '组织全队告别 — 让每个人说一句话', effects: { team: 7, reputation: 3, wealth: -2 },
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
            right: { label: 'AA吧 — 公平最重要', effects: { wealth: 1, team: -3 },
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
            left:  { label: '直面问题 — "有意见当面说"', effects: { ambition: 4, team: -4 },
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
            left:  { label: '揪出泄密者 — 整顿纪律', effects: { ambition: 6, team: -8, ability: 2 },
                     flagsAdd: { locker_tension: 1 }, flagsClear: [],
                     narrative: '你挨个问。问到第三个人时他红了脸。泄密者被内部停训。更衣室安静了——安静得像图书馆。秩序恢复了，但温度也降了。没有人再开玩笑。' },
            right: { label: '召集所有人 — "今天把话说开"', effects: { team: 6, ambition: 2, reputation: 4 },
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
            left:  { label: '支持清洗 — 长痛不如短痛', effects: { ambition: 10, team: -12, ability: 5, reputation: -5 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['locker_tension'],
                     narrative: '你点了点头。转会窗关闭时三个人离开了。更衣室安静了——静得能听到空调声。没有人再吵架，也没有人再开玩笑。秩序恢复了，但温度降到了冰点。这是你要的更衣室吗？' },
            right: { label: '亲自调解 — "一个都不能少"', effects: { team: 12, ambition: 3, reputation: 8 },
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
            left:  { label: '直言 — "我们确实有分歧"', effects: { reputation: -6, team: -4 },
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
            right: { label: '保持暧昧 — 增加谈判筹码', effects: { ambition: 4, team: -3, wealth: 3 },
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
            left:  { label: '赛后开车回去看看那个球场', effects: { reputation: 6, team: 2, wealth: -1 },
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
            left:  { label: '签约 — 拓展商业价值', effects: { wealth: 10, reputation: 3, ability: -4 },
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
        description: '队友递来投资计划书——高档餐厅，三个分店，预期回报很高。他已经投了，说"就差你一份"。金额不小。但你知道餐饮业的失败率——和点球命中率差不多。',
        choices: {
            left:  { label: '投资 — 高风险高回报', effects: { wealth: -10, ambition: 4 },
                     flagsSet: { invested_restaurant: true }, flagsAdd: {}, flagsClear: [],
                     unlocks: ['biz_investment_result'],
                     narrative: '你签了支票。开业那天人满为患。但餐厅的利润率和足球比赛的赢球率一样不可预测。时间会告诉你答案——但不是现在。' },
            right: { label: '婉拒 — "我踢好球就够了"', effects: { wealth: 1, team: 1 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '"谢了兄弟，我还是专注踢球吧。"他耸耸肩。一年后他的餐厅因为经营不善关门了。你没有说"我早说过"——但你确实想过。有时候不做决定就是最好的决定。' }
        },
        conditions: { requireFlags: [], forbidFlags: ['invested_restaurant'], requireStats: { wealth: { min: 25 } } },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_investment_result', category: 'business', tension: 1,
        icon: 'chart', color: 'special',
        title: '投资回报',
        description: '餐厅运营一年。合伙人发来报表——数字有好有坏。现在有个"机会"：开第二家分店，需追加投资。或者你可以保本退出。合伙人催你明天给答复。',
        choices: {
            left:  { label: '追加投资 — 做大做强', effects: { wealth: -8, ambition: 5 },
                     flagsAdd: {}, flagsClear: [],
                     narrative: '你又签了一张支票。合伙人拍胸脯保证这次一定成。走出会议室时你手机屏幕上映出了自己的脸——你看起来像一个商人。不太像一个球员了。' },
            right: { label: '保本退出 — 及时止损', effects: { wealth: 8, ambition: -3 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: ['invested_restaurant'],
                     narrative: '"够了。"你说。合伙人的脸垮了。最后你拿回了本金还小赚一点。这不是一场大胜——但你知道多少球员的投资打了水漂。知足是最被低估的资产。' }
        },
        conditions: { requireFlags: ['invested_restaurant'], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'biz_charity_event', category: 'business', tension: -2,
        icon: 'heart', color: '',
        title: '社区慈善',
        description: '儿童医院邀请你参加慈善活动。你的出现能帮他们筹到远超义卖本身的善款——因为你是明星。组织者说孩子们等了很久。但今天下午有战术课。',
        choices: {
            left:  { label: '亲自去 — 花一个下午的时间', effects: { reputation: 6, wealth: -2, team: 1 },
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
            left:  { label: '接受合同 — 追逐更伟大的舞台', effects: { wealth: 12, ambition: 8, reputation: 10, team: -5 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [], unlocks: [],
                     narrative: '你在合同上签了字。数字后面的零比你的球衣号码还多。母亲打来电话——她看到了新闻。"你自己选的路，好好走。"窗外母队的训练场灯还亮着。' },
            right: { label: '婉拒 — "这里还有我要完成的事"', effects: { team: 10, ability: 2, reputation: 8, ambition: -4 },
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
            left:  { label: '拼尽全力 — 每天最早到场', effects: { ability: 10, ambition: 3, reputation: 8 },
                     flagsSet: {}, flagsAdd: {}, flagsClear: [],
                     narrative: '你每天早上六点到训练基地。三周后教练在首发名单写了你的名字。豪门不相信眼泪——但他们尊重汗水。那个老将赛前拍了拍你的背："准备好了？"' },
            right: { label: '接受轮换 — 安心等机会', effects: { wealth: 8, ambition: -6, reputation: -5, team: 3 },
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
            left:  { label: '扛起重建 — 带着年轻人从头来', effects: { team: 12, ambition: 5, reputation: 10, ability: -2 },
                     flagsSet: { became_captain: true }, flagsAdd: {}, flagsClear: [],
                     narrative: '你带着一群年轻人拼了一整个赛季。输了五场——球迷没有骂你。因为你在每一场都拼了命。第六场赢了——全场起立为你唱歌。你终于理解"一人一城"的重量。' },
            right: { label: '后悔了 — 要求转会离开', effects: { ambition: -5, team: -10, reputation: -15 },
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
      effectsLeft: { wealth: 18, reputation: 18, ability: 12, ambition: 5 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '豪门核心',
      description: '你成了球队不可或缺的一部分。欧冠之夜你在八万人面前打进制胜球。那个质疑你"不值三倍薪水"的评论员，现在在解说席上喊你的名字。不是每个转会豪门的人都能成功——但你做到了。汗水和凌晨的灯光不会背叛你。',
      timelineText: '转会豪门：从质疑到核心', timelineType: 'gold',
      unlocks: ['media_newclub_pressure'] },
    { id: 'trans_end2', isLeaf: true, category: 'transfer', tension: 4, icon: 'money', cardStyle: 'special',
      effectsLeft: { wealth: 15, reputation: -5, ambition: -10 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '镀金生涯',
      description: '你的账户余额是你的球衣号码后面加了好多零。但你打开手机——发现自己被移出了国家队名单。一个替补球员的位置换来了后半生的安逸。你有了钱，但失去了比赛。这个交易——你愿意再做一次吗？',
      timelineText: '转会豪门：高薪替补，失去光芒', timelineType: 'normal',
      unlocks: ['media_newclub_pressure'] },
    { id: 'trans_end3', isLeaf: true, category: 'transfer', tension: 4, icon: 'house', cardStyle: 'gold',
      effectsLeft: { reputation: 20, team: 15, wealth: -3 }, effectsRight: {},
      choiceLeftLabel: '继续旅程', choiceRightLabel: '继续旅程',
      title: '一人一城',
      description: '十年。一座城。你带着袖标从第一场踢到最后一场。你没有赢下所有冠军——但终场哨响时整个球场只有一个声音：你的名字。这是转会窗永远找不到的东西。足球界最罕见的成就：一个人，一座城，一个故事。',
      timelineText: '留守母队：一人一城', timelineType: 'gold',
      unlocks: ['locker_fan_gratitude'] },
    { id: 'trans_end4', isLeaf: true, category: 'transfer', tension: 4, icon: 'ghost', cardStyle: 'dark',
      effectsLeft: { reputation: -8, ambition: -5 }, effectsRight: {},
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
            left:  { label: '让他推进 — 看看有什么选择', effects: { ambition: 4, wealth: 2, team: -3 },
                     flagsStartTimers: { transfer_rumor: 5 }, flagsAdd: {}, flagsClear: [], unlocks: ['trans_big_offer'],
                     narrative: '"去看看吧。"你挂了电话。窗外训练场的灯还亮着——不知道是谁忘了关。转会窗的风开始吹了。空气里有种说不清的味道——是机会还是告别？' },
            right: { label: '拒绝 — "这里我还要完成一件事"', effects: { team: 5, ambition: -2, reputation: 3 },
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
            left:  { label: '递交转会申请 — 去一个需要你的地方', effects: { ambition: 8, team: -8, reputation: -5 },
                     flagsSet: { asked_for_transfer: true }, flagsAdd: {}, flagsClear: ['coach_disrespect', 'coach_anger'],
                     narrative: '体育总监接过转会申请时没有惊讶——他可能在等你这句话。离开不代表失败。有时候留下才是。你需要一个重新呼吸的地方。' },
            right: { label: '咬牙坚持 — 用表现让所有人闭嘴', effects: { ability: 6, ambition: 5, team: 4, reputation: 3 },
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
            left:  { label: '充满信心 — "我来这里是为了赢"', effects: { reputation: 4, ambition: 5 },
                     flagsAdd: {}, flagsClear: [], narrative: '你直视镜头。"我是来这里赢的。"第二天头版用了你的照片——下面写着"新王的宣言"。高标准设下了。现在你得去兑现它。' },
            right: { label: '谦虚谨慎 — "一步一步来"',   effects: { team: 3, reputation: 2, ambition: -2 },
                     flagsAdd: {}, flagsClear: [], narrative: '"我需要时间适应。但我会为这件球衣付出一切。"记者们点了点头。教练在后台对你竖起大拇指。他没有要你立军令状——他要你踢好球。' }
        },
        conditions: { requireFlags: [], forbidFlags: [], requireStats: {} },
        cooldown: 'once_per_career'
    },
    {
        id: 'locker_fan_gratitude', category: 'locker_room', tension: -2,
        icon: 'heart', color: 'gold',
        title: '球迷的感谢',
        description: '今天训练场外聚了一群人——不是来抗议的，是来自发感谢你的。有人举着手绘的牌子："谢谢你没有走。"几个孩子在栅栏外喊你的名字——嗓子都哑了。',
        choices: {
            left:  { label: '走出去签名 — 直到最后一个孩子', effects: { team: 4, reputation: 5, wealth: -1 },
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
        id: 'trans_regret_talk', category: 'locker_room', tension: 1,
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
            right: { label: '隐瞒 — 打封闭坚持上场', effects: { ability: 3, ambition: 6 },
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
            left:  { label: '接受现实 — 停下来全面检查', effects: { ability: -8, team: 5 },
                     flagsAdd: {}, flagsClear: ['injury_risk', 'played_through_injury'],
                     narrative: 'MRI结果：半月板撕裂。赛季报销。你坐在医生办公室里听他解释手术方案。窗外训练场上队友们正在热身——你从来没有从这个角度看过。接受现实是足球里最难的技术动作。' },
            right: { label: '再打一针 — 就算废了也要踢完', effects: { ability: 3, ambition: 10, reputation: -3 },
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
            left:  { label: '循序渐进 — 相信康复师的计划', effects: { ability: 5, team: 2 },
                     flagsAdd: {}, flagsClear: ['played_through_injury', 'injury_risk'],
                     narrative: '你按计划一天天恢复。第三个月的第一天你第一次慢跑——心跳不是因为运动，是因为喜悦。耐心不是等待，是在等待时仍然相信自己。' },
            right: { label: '加速复出 — "我两个月就够了"', effects: { ability: -3, ambition: 5 },
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
            left:  { label: '自费请德国团队 — 对自己投资', effects: { wealth: -15, ability: 8 },
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
