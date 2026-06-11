/**
 * ending.js — 结局系统模块 (v1.5)
 * 依赖: State, UI, Utils, Timeline, Icons, Constants
 * 职责: 结局判定、结局卡片加载、结局飞出动画处理
 *
 * v1.5 改动:
 *   - 引导卡片→结局卡片 改为淡入替换 (fadeSwapOut/In)，取代翻转
 *
 * v1.4 完全重写:
 *   - 三层结局体系: 8极端 + 3隐藏 + 正常退役
 *   - 13位球星模板映射（基于声望等级）
 *   - 结局卡片翻转动画 + 球星肖像预留
 */
window.Game = window.Game || {};

window.Game.Ending = (function() {
    'use strict';

    var S = window.Game.State;
    var UI = window.Game.UI;
    var U = window.Game.Utils;
    var TL = window.Game.Timeline;
    var Icons = window.Game.Icons;
    if (!S || !UI || !U || !TL) throw new Error('[Ending] 依赖 Game.State/UI/Utils/Timeline 未加载');

    var C = window.Game.Constants;

    /**
     * 球星肖像文件名映射: templateKey → 中文文件名
     * 文件位于 assets/player_icons/ 目录
     */
    var PLAYER_ICON_MAP = {
        'neymar': '内马尔.png',
        'ronaldinho': '小罗.png',
        'beckham': '贝克汉姆.png',
        'mbappe': '姆巴佩.png',
        'ronaldo': 'C罗.png',
        'ali': '阿里.png',
        'park': '朴智星.png',
        'balotelli': '巴洛特利.png',
        'gotze': '格策.png',
        'vardy': '瓦尔迪.png',
        'messi': '梅西.png'
    };

    /**
     * 球星肖像主题色: templateKey → 主题色hex
     * 用于肖像边框光晕和遮罩层背景色
     */
    var PLAYER_COLOR_MAP = {
        'neymar': '#87CEEB',      // 内马尔 — 天蓝色
        'ronaldinho': '#FFF5BA',  // 小罗 — 淡黄色
        'beckham': '#F1C40F',     // 贝克汉姆 — 黄色
        'mbappe': '#2E5E3E',      // 姆巴佩 — 墨绿色
        'ronaldo': '#C41E3A',     // C罗 — 深红色
        'ali': '#A8BED4',         // 阿里 — 淡灰蓝色
        'park': '#A8D870',        // 朴智星 — 淡草绿色
        'balotelli': '#F08080',   // 巴洛特利 — 浅红色
        'gotze': '#9B7FC0',       // 格策 — 紫罗兰色
        'vardy': '#E8922A',       // 瓦尔迪 — 橘黄色
        'messi': '#F5D940'        // 梅西 — 闪耀金色
    };

    /**
     * 球星卡片背景渐变: templateKey → CSS gradient
     * 三阶渐变(浅→主题色→深)，160deg方向，与通用结局卡片风格一致
     */
    var PLAYER_GRADIENT_MAP = {
        'neymar':     'linear-gradient(160deg, #B3E2F5, #87CEEB, #4A9DBF)',   // 内马尔 — 天蓝色渐变
        'ronaldinho': 'linear-gradient(160deg, #FFF9D6, #FFF5BA, #C4B060)',   // 小罗 — 淡黄色渐变
        'beckham':    'linear-gradient(160deg, #F9E668, #F1C40F, #B8960F)',   // 贝克汉姆 — 黄色渐变
        'mbappe':     'linear-gradient(160deg, #5A8A6A, #2E5E3E, #1A3020)',   // 姆巴佩 — 墨绿色渐变
        'ronaldo':    'linear-gradient(160deg, #E8556A, #C41E3A, #8B001F)',   // C罗 — 深红色渐变
        'ali':        'linear-gradient(160deg, #C8D8E8, #A8BED4, #6A8A9F)',   // 阿里 — 淡灰蓝色渐变
        'park':       'linear-gradient(160deg, #C8E89A, #A8D870, #6A9A3E)',   // 朴智星 — 淡草绿色渐变
        'balotelli':  'linear-gradient(160deg, #F5B0B0, #F08080, #B05050)',   // 巴洛特利 — 浅红色渐变
        'gotze':      'linear-gradient(160deg, #BBA8D8, #9B7FC0, #6A5090)',   // 格策 — 紫罗兰色渐变
        'vardy':      'linear-gradient(160deg, #F5B860, #E8922A, #B06018)',   // 瓦尔迪 — 橘黄色渐变
        'messi':      'linear-gradient(160deg, #FFF3C8, #F5D940, #B8860B)'    // 梅西 — 闪耀金黄色渐变
    };

    /**
     * 浅色背景球员集合 (templateKey)
     * 这些球员的卡片背景较浅，白色文字对比度不足，需切换为深色文字
     */
    var PLAYER_IS_LIGHT = {
        'neymar': true,      // 天蓝色 → 浅
        'ronaldinho': true,  // 淡黄色 → 非常浅
        'beckham': true,     // 黄色 → 浅
        'ali': true,         // 淡灰蓝色 → 浅
        'park': true,        // 淡草绿色 → 浅
        'balotelli': true,   // 浅红色 → 中浅
        'vardy': true        // 橘黄色 → 中浅
    };
    // 深色背景球员 (C罗深红、姆巴佩墨绿、格策紫罗兰、梅西金色) 白色文字可读，无需处理

    // ==================== 结局定义 ====================

    /**
     * 极端结局配置: { reason, title, subtitle, timelineText, timelineType }
     */
    /**
     * 8大正常结局（无球星模板时）
     * 朴实描述，四字标题
     */
    var EXTREME_ENDINGS = {
        wealth_0: {
            reason: 'wealth_min',
            title: '一贫如洗',
            subtitle: '职业生涯积累的财富化为乌有。豪宅、跑车、投资——最后只剩下债务与悔恨。',
            tlText: '财富化为乌有，足球生涯随之终结',
            tlType: 'bad'
        },
        wealth_100: {
            reason: 'wealth_max',
            title: '初心蒙尘',
            subtitle: '金钱和名声让你远离了球场。你成了一个精明的商人，却不再是那个热爱足球的少年。',
            tlText: '商业帝国让你拥有了一切，唯独失去了踢球的快乐',
            tlType: 'bad'
        },
        ability_0: {
            reason: 'ability_min',
            title: '力不从心',
            subtitle: '岁月和伤病夺走了你的速度与力量。你再也跟不上比赛的节奏。是时候承认了。',
            tlText: '竞技状态断崖式下滑，再难在顶级联赛立足',
            tlType: 'bad'
        },
        ability_100: {
            reason: 'ability_max',
            title: '众矢之的',
            subtitle: '对手发现了对付你的唯一方法——犯规。一次，两次，十次，直到你再也站不起来。',
            tlText: '天才招来了嫉妒，和无休止的恶意犯规',
            tlType: 'bad'
        },
        team_0: {
            reason: 'team_min',
            title: '团队毒瘤',
            subtitle: '你把个人利益置于团队之上。队友疏远你，教练放弃你。俱乐部终于失去了耐心。',
            tlText: '没有人愿意再和他并肩作战',
            tlType: 'bad'
        },
        team_100: {
            reason: 'team_max',
            title: '工兵改造',
            subtitle: '你服从了每一个战术安排，踢遍了场上每一个位置。你变成了对谁都「好用」的球员。仅此而已。',
            tlText: '为团队牺牲了一切，从球星变成了万能零件',
            tlType: 'gold'
        },
        ambition_0: {
            reason: 'ambition_min',
            title: '无人在意',
            subtitle: '你失去了对足球的热情。训练敷衍，比赛懒散。没有人再对你抱有期待——包括你自己。',
            tlText: '他不再在乎，世界也不再在乎他',
            tlType: 'bad'
        },
        ambition_100: {
            reason: 'ambition_max',
            title: '众叛亲离',
            subtitle: '野心让你登上了顶峰，也让你在顶峰上发现，身边早已空无一人。',
            tlText: '偏执成就了他，也让他失去了一切',
            tlType: 'gold'
        }
    };

    /**
     * 11个球星结局（有模板匹配时）
     * 二字标题 + 球星特征描述，让球迷闭眼也能认出是谁
     */
    var TEMPLATE_ENDINGS = {
        // ---- 世界级 ----
        neymar: {
            title: '折翼飞鸟',
            subtitle: '他们说你是绿茵场上的飞鸟——直到每次起飞，都有人想要折断你的翅膀。脚踝上缠着第13层绷带，你永远是对手下脚的对象。折了翼的鸟，该如何飞翔？'
        },
        ronaldinho: {
            title: '落魄精灵',
            subtitle: '你曾经是绿茵场上的精灵——是诺坎普十万观众的宠儿。现在你坐在空荡荡的公寓里，手机上是催债的来电显示。派对结束了。精灵跌入凡尘，就只是个凡人。'
        },
        beckham: {
            title: '亿元弧线',
            subtitle: '人们不再讨论你那条价值亿元的右脚。他们讨论你的西装品牌、你的香水、你下一次的红毯。那条曾让全国屏息的弧线，现在只记得价值1亿英镑了。'
        },
        mbappe: {
            title: '法兰西王',
            subtitle: '你加冕得很快。快到整个法兰西都跪在你脚下。但王座上的视野其实很窄——你只能看见自己的影子。转会窗那天你亲自打给体育总监：“国王不需要队友，国王需要臣民。”但你忘记了，法兰西国王的下场。'
        },
        ronaldo: {
            title: '一念成魔',
            subtitle: '凌晨三点，训练基地的灯还亮着，你早习惯了这样的生活。手机亮了：生日。你默默划掉。「完美」这个词像毒药渗进你的血液。你做到了完美，也做到了独自一人。'
        },
        // ---- 大洲级 ----
        ali: {
            title: '江郎才尽',
            subtitle: '不是轰然倒塌。是一点一点地，像沙漏里的沙，无声流失。你最清楚——因为每一次流失你都在场上感到了。最后一个赛季，你连大名单都没进。江郎才尽，说的就是你。'
        },
        park: {
            title: '豪门代价',
            subtitle: '你从亚洲跑到了欧洲豪门。他们需要你——不是需要你的名字上头条，是需要你跑满九十分钟。你做到了。球迷给你起了绰号——不是赞美射门，而是感叹你真能跑。你不是巨星，你是一颗齿轮，齿轮是不会发光的。'
        },
        balotelli: {
            title: '何必认真',
            subtitle: '训练迟到，比赛散步。球迷批评你的态度，你耸耸肩：何必认真？是啊，何必，反正有天赋给你兜底。直到没人记得你，关注你，包括你自己。'
        },
        // ---- 隐藏结局 ----
        gotze: {
            title: '惊鸿一瞥',
            subtitle: '马拉卡纳的夜风记得，第113分钟47秒，那一刻——7万人同时屏住了呼吸。22岁，世界杯决赛，绝杀进球，全世界都在呼喊你的名字。现在，夏天回来了，世界杯也回来了，而你，再也没有回来过。'
        },
        vardy: {
            title: '凡人图腾',
            subtitle: '工厂流水线上的工人到万分之二的英超冠军。你是每个平凡人都梦想过的剧本：从第八级联赛爬上来，然后举起那个遥不可及的奖杯。你不是天才，你是最不肯认命的凡人，是俱乐部立起的雕像，是球迷心中永远的图腾。'
        },
        messi: {
            title: '球王加冕',
            subtitle: '一千多个参与进球，四十七座冠军，八座金球，一座大力神杯。人们试图用数字定义你——但数字太廉价了。真正让人记住的是你轻松摧毁的后防线，是你的马修斯沉肩。那不是技术，是魔法。球王加冕，身披蓝白色的10号球衣。'
        }
    };

    /**
     * 球星模板映射: templateKey → { playerName, playerIcon }
     *   - 世界级(reputation>=81): 内马尔/小罗/贝克汉姆/姆巴佩/C罗
     *   - 大洲级(reputation>=49): 阿里/朴智星/巴洛特利
     */
    function _getPlayerTemplate(statKey, isMax, repLevel) {
        // 只有大洲级以上才有球星模板
        if (repLevel < 49) return null;

        var isWorld = repLevel >= 81;

        if (statKey === 'wealth') {
            if (isMax && isWorld) return { key: 'beckham', name: '贝克汉姆', icon: 'beckham' };
            if (!isMax && isWorld) return { key: 'ronaldinho', name: '罗纳尔迪尼奥', icon: 'ronaldinho' };
        }
        if (statKey === 'ability') {
            if (isMax && isWorld) return { key: 'neymar', name: '内马尔', icon: 'neymar' };
            if (!isMax && !isWorld && repLevel >= 49) return { key: 'ali', name: '阿里', icon: 'ali' };
        }
        if (statKey === 'team') {
            if (!isMax && isWorld) return { key: 'mbappe', name: '姆巴佩', icon: 'mbappe' };
            if (isMax && !isWorld && repLevel >= 49) return { key: 'park', name: '朴智星', icon: 'park' };
        }
        if (statKey === 'ambition') {
            if (isMax && isWorld) return { key: 'ronaldo', name: 'C罗', icon: 'ronaldo' };
            if (!isMax && !isWorld && repLevel >= 49) return { key: 'balotelli', name: '巴洛特利', icon: 'balotelli' };
        }
        return null;
    }

    // ==================== 结局判定 ====================

    /**
     * 结局判定（按优先级）
     * 优先级1：极端数值（0或100）
     * 优先级2：年龄相关（>=38岁退役 / 隐藏结局）
     * @returns {boolean} 是否触发结局
     */
    function checkGameOver() {
        var s = S.get();
        var reason = null, title = '', subtitle = '', playerTemplate = null;
        var isExtreme = false;

        // ---- 优先级1：极端数值结局 ----
        // 属性触0（按 STAT_KEYS 顺序）
        var extremeChecks = [
            { key: 'wealth', isMax: false },
            { key: 'ability', isMax: false },
            { key: 'team', isMax: false },
            { key: 'ambition', isMax: false },
            { key: 'wealth', isMax: true },
            { key: 'ability', isMax: true },
            { key: 'team', isMax: true },
            { key: 'ambition', isMax: true }
        ];

        for (var i = 0; i < extremeChecks.length; i++) {
            var check = extremeChecks[i];
            var val = s[check.key];
            var triggered = check.isMax ? (val >= 100) : (val <= 0);

            if (triggered) {
                isExtreme = true;
                var endingKey = check.key + (check.isMax ? '_100' : '_0');
                var ending = EXTREME_ENDINGS[endingKey];
                if (ending) {
                    reason = ending.reason;
                    title = ending.title;
                    subtitle = ending.subtitle;
                    TL.record(ending.tlText, ending.tlType);

                    // 获取球星模板，有匹配则用球星标题和描述覆盖
                    playerTemplate = _getPlayerTemplate(check.key, check.isMax, s.reputation);
                    if (playerTemplate) {
                        var tpl = TEMPLATE_ENDINGS[playerTemplate.key];
                        if (tpl) { title = tpl.title; subtitle = tpl.subtitle; }
                    }
                }
                break; // 只触发第一个匹配的极端结局
            }
        }

        // ---- 优先级2：年龄退役 / 隐藏结局 ----
        if (!isExtreme && s.age >= C.RETIREMENT_AGE) {
            var repLevel = s.reputation;
            var allAbove60 = s.wealth >= C.HIDDEN_ENDING_THRESHOLD &&
                             s.ability >= C.HIDDEN_ENDING_THRESHOLD &&
                             s.team >= C.HIDDEN_ENDING_THRESHOLD &&
                             s.ambition >= C.HIDDEN_ENDING_THRESHOLD;

            // 球王: age>=36, 世界级, 四属性>=60, 三大赛事全完成
            if (s.age >= 36 && repLevel >= 81 && allAbove60 &&
                s.milestoneFlags.leagueChampion &&
                s.milestoneFlags.championsLeagueWinner &&
                s.milestoneFlags.worldCupWinner) {
                reason = 'ballon_dor';
                playerTemplate = { key: 'messi', name: '梅西', icon: 'messi' };
                var tMessi = TEMPLATE_ENDINGS['messi'];
                title = tMessi.title; subtitle = tMessi.subtitle;
                TL.record('他是足球的终极答案', 'gold');
            }
            // 一人一城: age>=36, 大洲级+, 四属性>=60, 未触发极端
            else if (s.age >= 36 && repLevel >= 49 && allAbove60) {
                reason = 'club_legend';
                playerTemplate = { key: 'vardy', name: '瓦尔迪', icon: 'vardy' };
                var tVardy = TEMPLATE_ENDINGS['vardy'];
                title = tVardy.title; subtitle = tVardy.subtitle;
                TL.record('他不是天才，他只是比所有人都更晚放弃', 'gold');
            }
            // 终章 — 正常退役，朴实无华
            else {
                reason = 'age';
                var levelName = C.getReputationLevel(repLevel).name;
                title = '终章';
                subtitle = '储物柜清空了。你最后摸了一下那个贴着你名字的格子——指尖有一点凉。二十年的汗水与泪水，最后只剩下这一点凉意。你关上门。走廊尽头有光。';
                TL.record('他带着一个时代的记忆，平静退役', 'normal');
            }
        }
        // ---- 额外检查：惊鸿（age<=26 + 极端触发 + 大洲级 + 无特定模板）----
        else if (isExtreme && s.age <= 26 && s.reputation >= 49 && !playerTemplate) {
            reason = 'wonderkid';
            playerTemplate = { key: 'gotze', name: '格策', icon: 'gotze' };
            var tGotze = TEMPLATE_ENDINGS['gotze'];
            title = tGotze.title; subtitle = tGotze.subtitle;
            TL.record('一颗流星划过天际——最耀眼，也最短暂', 'bad');
        }

        if (reason) {
            _loadEndingCard(reason, title, subtitle, playerTemplate);
            return true;
        }
        return false;
    }

    /**
     * 引导卡片配置 (特殊结局翻转前展示)
     * @param {string} playerKey - 球星模板key
     * @returns {{title, bg, textColor, textGlow, glow}} 引导卡片样式配置
     */
    function _getTeaserConfig(playerKey) {
        if (playerKey === 'messi') {
            return {
                title: '最终结局',
                bg: 'linear-gradient(160deg, #FFF3C8, #F5D940, #B8860B)',
                textColor: '#1a0800',
                textGlow: '0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3)',
                glow: '0 0 60px rgba(245,217,64,0.7), 0 0 120px rgba(245,217,64,0.3)'
            };
        }
        if (playerKey === 'vardy') {
            return {
                title: '隐藏结局',
                bg: 'linear-gradient(160deg, #FFFFFF, #F0F0F0, #D0D0D0)',
                textColor: '#1a1a2e',
                textGlow: '0 0 12px rgba(0,0,0,0.08)',
                glow: '0 0 60px rgba(212,168,67,0.7), 0 0 100px rgba(212,168,67,0.3)'
            };
        }
        // 普通特殊结局: 8极端 + 格策
        return {
            title: '特殊结局',
            bg: 'linear-gradient(160deg, #1a1a2e, #0a0a0a, #000000)',
            textColor: '#ffffff',
            textGlow: '0 0 20px rgba(255,255,255,0.25)',
            glow: '0 0 50px rgba(220,40,40,0.7), 0 0 100px rgba(200,30,30,0.3)'
        };
    }

    /**
     * 渲染结局卡片的正面内容（肖像 + 标题 + 描述）
     * 供 _loadEndingCard 和 _showTeaserSequence 共用
     */
    function _renderEndingContent(playerTemplate, reason, fullTitle, subtitle, templateName) {
        var d = UI.dom();
        if (playerTemplate) {
            var portraitColor = PLAYER_COLOR_MAP[playerTemplate.key] || 'rgba(255,255,255,0.35)';
            d.cardIcon.style.width = '';
            d.cardIcon.style.height = '';
            d.cardIcon.innerHTML =
                '<div class="ending-portrait-wrap">' +
                    '<div class="ending-portrait" style="border-color:rgba(255,255,255,0.6);box-shadow:0 0 36px ' + portraitColor + ';">' +
                        '<img src="assets/player_icons/' + (PLAYER_ICON_MAP[playerTemplate.key] || (playerTemplate.key + '.png')) + '" alt="' + templateName +
                        '" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<span style=font-size:3.5rem>⚽</span>\';">' +
                    '</div>' +
                '</div>';
        } else {
            d.cardIcon.style.width = '';
            d.cardIcon.style.height = '';
            if (Icons) {
                d.cardIcon.innerHTML = '<div class="ending-portrait ending-portrait-icon">' +
                    Icons.getEndingIcon(reason, 48) + '</div>';
            }
        }
        d.cardTitle.textContent = '职业生涯结束';
        var descHTML =
            '<div class="ending-title-wrapper">' +
                '<div class="ending-glow-title">' + fullTitle + '</div>' +
                '<div class="ending-draft-text">' + subtitle + '</div>';
        if (templateName) {
            descHTML += '<div class="player-name-tag">「' + templateName + '」</div>';
        }
        descHTML += '</div>';
        d.cardDesc.innerHTML = descHTML;
    }

    /**
     * 设置结局遮罩层内容（隐藏，在 handleFly 后显示）
     */
    function _setupEndingOverlay(playerTemplate, reason, fullTitle, subtitle) {
        var s = S.get();
        var d = UI.dom();
        if (playerTemplate) {
            var portraitFile = PLAYER_ICON_MAP[playerTemplate.key];
            if (portraitFile) {
                var overlayColor = PLAYER_COLOR_MAP[playerTemplate.key] || 'rgba(255,255,255,0.12)';
                d.endingIcon.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:' + overlayColor + ';display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px ' + overlayColor + ';"><img src="assets/player_icons/' + portraitFile + '" alt="' + playerTemplate.name + '" style="border-radius:50%;object-fit:cover;width:88%;height:88%;" onerror="var p=this.parentElement; p.innerHTML=\'<span style=font-size:2.5rem>⚽</span>\';"></div>';
            } else if (Icons) {
                d.endingIcon.innerHTML = Icons.getEndingIcon(playerTemplate.icon, 64);
            }
        } else if (Icons) {
            d.endingIcon.innerHTML = Icons.getEndingIcon(reason, 64);
        }
        d.endingTitle.textContent = fullTitle;
        d.endingSubtitle.textContent = subtitle;
        d.finalStats.textContent = '赛季数：' + (s.season - 1) + ' | 事件数：' + s.eventCount +
            ' | 声望：' + C.getReputationLevel(s.reputation).name;
    }

    /**
     * 引导卡片 → 点击翻转 → 结局卡片时序 (特殊结局专用)
     * 玩家点击引导卡片后才触发翻转，非自动播放
     * 普通结局(8极端+格策): 黑卡+红光+白字"特殊结局"
     * 瓦尔迪: 白卡+金光+黑字"隐藏结局"
     * 梅西: 天蓝卡+金光+金字"最终结局"
     */
    function _showTeaserSequence(playerTemplate, reason, title, subtitle) {
        var s = S.get();
        var d = UI.dom();
        var card = d.card;
        var teaser = _getTeaserConfig(playerTemplate.key);
        var fullTitle = title;
        var templateName = playerTemplate.name;

        // ---- 阶段1: 引导卡片 ----
        s.gameOver = true;
        s.isTeaserPhase = true;
        s._peakReputation = Math.max(s._peakReputation, s.reputation);
        s.isAnimating = false;

        // v1.5: 启用全屏结局布局（引导卡/结局卡占满上下区域）
        var gc = document.querySelector('.game-container');
        if (gc) gc.classList.add('game-ending-active');
        d.swipeHint.style.opacity = '0';

        card.className = 'card ending-card teaser-card';
        card.style.background = teaser.bg;
        card.style.boxShadow = teaser.glow;

        d.cardIcon.style.width = '';
        d.cardIcon.style.height = '';
        d.cardIcon.innerHTML = '';
        d.cardTitle.textContent = '';
        d.cardDesc.innerHTML =
            '<div class="teaser-content">' +
                '<div class="teaser-title" style="color:' + teaser.textColor + ';text-shadow:' + teaser.textGlow + ';">' +
                    teaser.title +
                '</div>' +
                '<div class="teaser-hint" style="color:' + teaser.textColor + ';">点击翻看结局</div>' +
            '</div>';

        // 预设置遮罩层 + 时间线
        _setupEndingOverlay(playerTemplate, reason, fullTitle, subtitle);
        TL.render();

        // 入场动画
        card.style.transform = 'translateY(30px) scale(0.92)';
        card.style.opacity = '0';
        card.classList.remove('flying-left', 'flying-right', 'grabbed');
        void card.offsetWidth;
        card.classList.add('entering');
        setTimeout(function() {
            card.classList.remove('entering');
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.opacity = '1';
        }, C.ENTER_ANIMATION_DURATION);

        // ---- 阶段2: 等待玩家点击 → 淡入替换 ----
        function onTeaserClick() {
            if (s.isAnimating) return;
            s.isAnimating = true;

            // 移除点击监听，防止重复触发
            card.removeEventListener('click', onTeaserClick);
            card.removeEventListener('touchend', onTeaserClick);

            // 淡出引导卡片
            card.classList.add('fade-swap-out');

            // 淡出完成后(~0.5s) → 切换内容 → 淡入结局卡片
            setTimeout(function() {
                var playerGradient = PLAYER_GRADIENT_MAP[playerTemplate.key];
                if (playerGradient) {
                    card.style.background = playerGradient;
                }
                card.style.boxShadow = '';
                card.classList.remove('teaser-card', 'fade-swap-out');
                if (PLAYER_IS_LIGHT[playerTemplate.key]) {
                    card.classList.add('player-light-bg');
                }
                _renderEndingContent(playerTemplate, reason, fullTitle, subtitle, templateName);

                // 淡入结局卡片
                void card.offsetWidth;
                card.classList.add('fade-swap-in');
            }, 500);

            // 淡入完成(~1.1s) → 允许滑动
            setTimeout(function() {
                card.classList.remove('fade-swap-in');
                card.style.opacity = '1';
                s.isAnimating = false;
                s.isTeaserPhase = false;
                s.isEndingPhase = true;

                // v1.5: 显示滑动提示（属性面板和底栏保持隐藏）
                d.swipeHint.style.opacity = '1';
                if (Icons) {
                    d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) +
                        '</span> 滑动查看生涯回顾 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';
                }
            }, 1100);
        }

        card.addEventListener('click', onTeaserClick);
        card.addEventListener('touchend', function(e) { e.preventDefault(); onTeaserClick(); });
    }

    /**
     * 加载结局卡片（更新主卡片为结局样式）
     * @param {string} reason - 结局原因标识
     * @param {string} title - 结局标题
     * @param {string} subtitle - 结局描述
     * @param {object|null} playerTemplate - 球星模板 {key, name, icon}
     */
    function _loadEndingCard(reason, title, subtitle, playerTemplate) {
        var s = S.get();
        var d = UI.dom();
        var card = d.card;

        var fullTitle = title;
        var templateName = playerTemplate ? playerTemplate.name : '';

        // ---- 特殊结局 → 引导卡片翻转流程 ----
        if (playerTemplate) {
            _showTeaserSequence(playerTemplate, reason, title, subtitle);
            return;
        }

        // ---- 普通结局 (无球星模板) → 直接展示 ----
        s.gameOver = true;
        s.isEndingPhase = true;
        s._peakReputation = Math.max(s._peakReputation, s.reputation);
        s.isAnimating = false;

        card.className = 'card ending-card';
        card.style.background = '';
        card.style.boxShadow = '';
        card.classList.remove('player-light-bg');

        var colorMap = {
            'wealth_min': 'wealth-min', 'wealth_max': 'wealth-max',
            'ability_min': 'ability-min', 'ability_max': 'ability-max',
            'team_min': 'team-min', 'team_max': 'team-max',
            'ambition_min': 'ambition-min', 'ambition_max': 'ambition-max',
            'ballon_dor': 'ballon-dor', 'club_legend': 'club-legend',
            'wonderkid': 'wonderkid', 'age': 'age'
        };
        var colorClass = colorMap[reason] || 'age';
        card.classList.add(colorClass);

        _renderEndingContent(null, reason, fullTitle, subtitle, templateName);
        _setupEndingOverlay(null, reason, fullTitle, subtitle);

        card.style.transform = 'translateY(40px) scale(0.9)';
        card.style.opacity = '0';
        card.classList.remove('flying-left', 'flying-right', 'grabbed');
        void card.offsetWidth;
        card.classList.add('entering');
        setTimeout(function() {
            card.classList.remove('entering');
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.opacity = '1';
        }, C.ENTER_ANIMATION_DURATION);

        d.swipeHint.style.opacity = '1';
        if (Icons) {
            d.swipeHint.innerHTML = '<span class="arrow left">' + Icons.getArrowLeft(18) +
                '</span> 滑动查看生涯回顾 <span class="arrow right">' + Icons.getArrowRight(18) + '</span>';
        }

        TL.render();
    }

    /**
     * 处理结局卡片滑动 → 卡片飞出 → 全屏遮罩和时间线
     * 简单左右滑动逻辑，不翻转
     * @param {string} direction - 'left' | 'right'
     */
    function handleFly(direction) {
        var s = S.get();
        var d = UI.dom();

        s.isAnimating = true;

        d.card.style.setProperty('--fly-start-x', s.cardOffsetX + 'px');
        d.card.style.setProperty('--fly-start-r', s.cardRotation + 'deg');

        d.card.classList.add(direction === 'left' ? 'flying-left' : 'flying-right');
        d.card.classList.remove('grabbed', 'entering');
        UI.hideOverlay();

        // 卡片飞出后 → 直接显示全屏遮罩 + 时间线
        setTimeout(function() {
            d.endingOverlay.classList.add('visible');
            d.resultScreen.style.display = 'block';
            TL.animateShow();

            var totalTimelineTime = s.timeline.length * 150 + 500;
            setTimeout(function() {
                d.restartBtn.classList.add('visible');
            }, totalTimelineTime);
        }, C.FLY_ANIMATION_DURATION);
    }

    return {
        checkGameOver: checkGameOver,
        handleFly: handleFly
    };
})();
