/**
 * icons.js — 图标管理模块 (v1.4)
 * 使用本地存储的PNG图片，确保跨平台一致性
 * 职责：图标映射、emoji替换、图标预加载
 *
 * v1.4: 新四属性图标(财富/能力/团队/野心)、结局图标更新、声望等级图标
 */
window.Game = window.Game || {};

window.Game.Icons = (function() {
    'use strict';

    // 本地emoji图片路径
    var ICONS_BASE = 'assets/icons/';

    // ==================== 事件ID → 本地文件名映射 ====================

    var EVENT_ID_TO_FILE = {
        'youth': 'camp.png',
        'transfer_rumor_1': 'newspaper.png',
        'transfer_rumor_2': 'phone.png',
        'transfer_rumor_3': 'plane.png',
        'faction_1': 'speaking.png',
        'faction_2': 'swords.png',
        'worldcup_callup': 'china.png',
        'worldcup_final': 'trophy.png',
        'injury_1': 'bandage.png',
        'injury_2': 'hospital.png',
        'derby_rivalry_1': 'swords.png',
        'derby_rivalry_2': 'swords.png',
        'derby_rivalry_3': 'trophy.png',
        'coaching_1': 'books.png',
        'coaching_2': 'graduation.png',
        'coaching_3': 'teacher.png',
        'financial_1': 'money.png',
        'financial_2': 'chart.png',
        'financial_3': 'bank.png',
        'continental_1': 'globe.png',
        'continental_2': 'star.png',
        'continental_3': 'trophy.png',
        'legacy_1': 'book.png',
        'legacy_2': 'crown.png',
        'legacy_3': 'glowing_star.png',
        'first_contract': 'memo.png',
        'scout_watch': 'telescope.png',
        'training': 'soccer.png',
        'party': 'confetti.png',
        'media_trap': 'mic.png',
        'captain': 'medal.png',
        'goal_scored': 'soccer.png',
        'transfer_offer': 'briefcase.png',
        'national_team': 'glowing_star.png',
        'trophy': 'trophy.png',
        'hat_trick': 'top_hat.png',
        'contract_renewal': 'document.png',
        'fan_club': 'heart.png',
        'endorsement': 'diamond.png',
        'academy': 'baby.png',
        'retirement_talk': 'old.png',
        'training_injury': 'bandage.png',
        'fan_meet': 'handshake.png',
        'media_award': 'sports_medal.png',
        'contract_dispute': 'money_wings.png',
        'charity_event': 'heart.png',
        'new_boots': 'shoe.png',
        'team_dinner': 'plate.png',
        'press_conference': 'tv.png',
        'weight_room': 'weight.png',
        'tactical_change': 'bar_chart.png',
        'international_break': 'airplane.png',
        'derby_defeat': 'pensive.png',
        'transfer_window': 'arrows.png',
        'new_teammate': 'wave.png',
        'goal_drought': 'cactus.png',
        'winter_break': 'skier.png',
        'pre_season': 'sun.png',
        'captain_decision': 'thinking.png',
        'fan_criticism': 'thumbs_down.png',
        'award_ceremony': 'party.png',
        'training_match': 'swords.png',
        'new_formation': 'shuffle.png',
        'international_friend': 'asia.png',
        'media_training': 'movie.png',
        'goal_celebration': 'party.png',
        'training_equipment': 'shield.png',
        'team_bonding': 'handshake.png',
        'injury_prevention': 'shield.png',
        'transfer_target': 'dart.png',
        'community_service': 'palms.png',
        'training_intensity': 'chart.png',
        'new_contract_terms': 'bookmark.png',
        'fan_pressure': 'loudspeaker.png',
        'training_focus': 'dart.png',
        'international_prestige': 'star.png',
        'recovery_session': 'sleeping.png',
        'team_meeting': 'speaking.png',
        'personal_coach': 'teacher.png',
        'training_rest': 'sleeping.png',
        'media_profile': 'newspaper.png',
        'team_strategy': 'puzzle.png',
        'fan_interaction': 'speech.png',
        'training_innovation': 'lightbulb.png',
        'international_experience': 'americas.png',
        'locker_room_1': 'speaking.png',
        'locker_room_2': 'swords.png',
        'brand_deal': 'diamond.png',
        'investment_opp': 'bank.png',
        'skill_training': 'dart.png',
        'social_media_hype': 'phone.png',
        'minor_injury': 'bandage.png',
        'charity_foundation': 'heart.png',
        'agent_demand': 'briefcase.png',
        'offseason_plan': 'sun.png',
        'youth_academy_visit': 'baby.png',
        'tactical_dispute': 'puzzle.png'
    };

    // ==================== 结局原因 → 本地文件名映射 (v1.4) ====================

    var ENDING_FILE_MAP = {
        // 新四属性极端结局
        'wealth_min': 'money_wings.png',      // 一贫如洗
        'wealth_max': 'diamond.png',           // 初心蒙尘
        'ability_min': 'bandage.png',          // 力不从心
        'ability_max': 'dart.png',             // 众矢之的
        'team_min': 'prohibited.png',          // 团队毒瘤
        'team_max': 'handshake.png',           // 工兵改造
        'ambition_min': 'sleeping.png',        // 无人在意
        'ambition_max': 'crown.png',           // 众叛亲离
        // 隐藏结局
        'wonderkid': 'hourglass.png',          // 伤仲永 — 格策
        'club_legend': 'house.png',            // 球队名宿 — 瓦尔迪
        'ballon_dor': 'trophy.png',            // 球王 — 梅西
        // 正常退役
        'age': 'hourglass.png',
        // 球员模板图标（13位）
        'ali': 'pensive.png',                  // 阿里
        'park': 'shield.png',                  // 朴智星
        'balotelli': 'confetti.png',            // 巴洛特利
        'neymar': 'soccer.png',               // 内马尔
        'ronaldinho': 'party.png',             // 罗纳尔迪尼奥
        'beckham': 'star.png',                 // 贝克汉姆
        'mbappe': 'prohibited.png',            // 姆巴佩
        'ronaldo': 'muscle.png',               // C罗
        'gotze': 'pensive.png',                // 格策
        'vardy': 'camp.png',                   // 瓦尔迪
        'messi': 'crown.png'                   // 梅西
    };

    // ==================== Emoji字符 → 本地文件名映射 ====================
    // 覆盖所有代码中使用的emoji字符

    var EMOJI_TO_FILE = {
        // UI元素
        '👈': 'arrow_left.png',
        '👉': 'arrow_right.png',
        '🔒': 'lock.png',
        '📅': 'calendar.png',
        // v1.4 新属性图标
        '💰': 'money.png',        // 💰 财富
        '⚽': 'soccer.png',        // ⚽ 能力
        '🤝': 'handshake.png',    // 🤝 团队
        '🎯': 'dart.png',         // 🎯 野心
        '⭐': 'star.png',         // ⭐ 声望
        '💪': 'muscle.png',
        '❤️': 'heart.png',
        '❤': 'heart.png',
        '❓': 'thinking.png',
        // 常用图标
        '🏆': 'trophy.png',
        '🏐': 'camp.png',
        // 里程碑文本中的emoji
        '🏠': 'house.png',
        '🔥': 'confetti.png',
        '🕊️': 'palms.png',
        '🕊': 'palms.png',
        '⚔️': 'swords.png',
        '🌍': 'globe.png',
        '🧠': 'lightbulb.png',
        '🎖': 'medal.png',
        '🚀': 'airplane.png',
        '🇨🇳': 'china.png',
        '🎩': 'top_hat.png',
        '👑': 'crown.png',
        '📖': 'book.png',
        '🌟': 'glowing_star.png',
        '💎': 'diamond.png',
        '📢': 'loudspeaker.png',
        '👨‍🏫': 'teacher.png',
        '💸': 'money_wings.png',
        '📰': 'newspaper.png',
        '📞': 'phone.png',
        '✈️': 'airplane.png',
        '✈': 'airplane.png',
        '🗣️': 'speaking.png',
        '🗣': 'speaking.png',
        '📈': 'chart.png',
        '🏦': 'bank.png',
        '📄': 'document.png',
        '🤸': 'muscle.png'
    };

    // ==================== 图片HTML生成 ====================

    /**
     * 创建本地emoji图片HTML
     * @param {string} filename - 图片文件名
     * @param {number} size - 图片大小(px)
     * @returns {string} img标签HTML
     */
    function createLocalImg(filename, size) {
        var url = ICONS_BASE + filename;
        return '<img src="' + url + '" width="' + size + '" height="' + size +
               '" alt="" style="display:inline-block;vertical-align:middle;" draggable="false">';
    }

    // ==================== 图标获取 ====================

    /**
     * 根据事件ID获取图标（使用本地文件）
     * @param {string} eventId - 事件ID
     * @param {number} [size=64] - 图标大小
     * @returns {string} img标签HTML
     */
    function getEventIconById(eventId, size) {
        size = size || 64;
        var filename = EVENT_ID_TO_FILE[eventId];
        if (filename) {
            return createLocalImg(filename, size);
        }
        return createLocalImg('soccer.png', size);
    }

    /**
     * 获取结局图标（使用本地文件）
     * @param {string} reason - 结局原因
     * @param {number} [size=64] - 图标大小
     * @returns {string} img标签HTML
     */
    function getEndingIcon(reason, size) {
        size = size || 64;
        var filename = ENDING_FILE_MAP[reason];
        if (filename) {
            return createLocalImg(filename, size);
        }
        return createLocalImg('trophy.png', size);
    }

    /**
     * 获取属性图标（使用本地图片）
     * @param {string} name - 属性名称 'physical'|'fame'|'teamwork'|'mood'
     * @param {number} [size=16] - 图标大小
     * @returns {string} img标签HTML
     */
    function getStatIcon(name, size) {
        size = size || 16;
        var statFiles = {
            'wealth': 'money.png',
            'ability': 'soccer.png',
            'teamwork': 'handshake.png',
            'ambition': 'dart.png'
        };
        var filename = statFiles[name] || 'thinking.png';
        return createLocalImg(filename, size);
    }

    /**
     * 获取声望等级图标
     * @param {string} levelKey - 等级key 'unknown'|'minor'|'national'|'continental'|'world'
     * @param {number} [size=16] - 图标大小
     * @returns {string} img标签HTML
     */
    function getReputationIcon(levelKey, size) {
        size = size || 16;
        var levelIcons = {
            'unknown': 'ghost.png',
            'minor': 'star.png',
            'national': 'glowing_star.png',
            'continental': 'globe.png',
            'world': 'crown.png'
        };
        var filename = levelIcons[levelKey] || 'star.png';
        return createLocalImg(filename, size);
    }

    // ==================== UI便捷方法 ====================

    /**
     * 获取左箭头图标
     * @param {number} [size=18] - 图标大小
     * @returns {string} img标签HTML
     */
    function getArrowLeft(size) {
        return createLocalImg('arrow_left.png', size || 18);
    }

    /**
     * 获取右箭头图标
     * @param {number} [size=18] - 图标大小
     * @returns {string} img标签HTML
     */
    function getArrowRight(size) {
        return createLocalImg('arrow_right.png', size || 18);
    }

    /**
     * 获取锁定图标
     * @param {number} [size=16] - 图标大小
     * @returns {string} img标签HTML
     */
    function getLockIcon(size) {
        return createLocalImg('lock.png', size || 16);
    }

    /**
     * 获取日历图标
     * @param {number} [size=16] - 图标大小
     * @returns {string} img标签HTML
     */
    function getCalendarIcon(size) {
        return createLocalImg('calendar.png', size || 16);
    }

    // ==================== Emoji替换 ====================

    /**
     * 将文本中的emoji字符替换为本地图片
     * @param {string} text - 包含emoji的文本
     * @param {number} [size=16] - 图标大小
     * @returns {string} 替换后的HTML
     */
    function replaceEmoji(text, size) {
        if (!text) return text;
        size = size || 16;

        // 构建匹配所有已知emoji的正则
        // 按长度降序排列，确保多字符emoji（如🇨🇳）先匹配
        var emojiKeys = Object.keys(EMOJI_TO_FILE).sort(function(a, b) {
            return b.length - a.length;
        });

        // 转义正则特殊字符
        var escaped = emojiKeys.map(function(e) {
            return e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        });

        if (escaped.length === 0) return text;

        var regex = new RegExp(escaped.join('|'), 'g');
        return text.replace(regex, function(match) {
            var filename = EMOJI_TO_FILE[match];
            if (filename) {
                return createLocalImg(filename, size);
            }
            return match;
        });
    }

    // ==================== 图标预加载 ====================

    /**
     * 预加载所有图标到浏览器缓存
     * @returns {Promise<void>} 所有图标加载完成后resolve
     */
    function preloadIcons() {
        // 收集所有唯一的文件名
        var fileSet = {};
        var sources = [EVENT_ID_TO_FILE, ENDING_FILE_MAP];

        sources.forEach(function(map) {
            Object.keys(map).forEach(function(key) {
                fileSet[map[key]] = true;
            });
        });

        // 添加EMOJI_TO_FILE中的文件
        Object.keys(EMOJI_TO_FILE).forEach(function(key) {
            fileSet[EMOJI_TO_FILE[key]] = true;
        });

        // 添加球星肖像文件（大文件，移动端需要提前缓存）
        var PLAYER_ICONS = [
            '内马尔.png', '小罗.png', '贝克汉姆.png', '姆巴佩.png', 'C罗.png',
            '阿里.png', '朴智星.png', '巴洛特利.png', '格策.png', '瓦尔迪.png', '梅西.png'
        ];
        PLAYER_ICONS.forEach(function(f) { fileSet[f] = true; });

        var files = Object.keys(fileSet);
        var loaded = 0;
        var total = files.length;

        return new Promise(function(resolve) {
            if (total === 0) {
                resolve();
                return;
            }

            files.forEach(function(filename) {
                var img = new Image();
                img.onload = img.onerror = function() {
                    loaded++;
                    if (loaded >= total) {
                        console.log('[Icons] 预加载完成：' + total + ' 个图标');
                        resolve();
                    }
                };
                img.src = ICONS_BASE + filename;
            });

            // 安全超时：最多等5秒（含球星肖像大文件）
            setTimeout(function() {
                if (loaded < total) {
                    console.warn('[Icons] 预加载超时，已加载 ' + loaded + '/' + total);
                    resolve();
                }
            }, 5000);
        });
    }

    // ==================== 公开 API ====================

    return {
        // 核心图标获取
        getEventIconById: getEventIconById,
        getEndingIcon: getEndingIcon,
        getStatIcon: getStatIcon,
        getReputationIcon: getReputationIcon,
        // UI便捷方法
        getArrowLeft: getArrowLeft,
        getArrowRight: getArrowRight,
        getLockIcon: getLockIcon,
        getCalendarIcon: getCalendarIcon,
        // Emoji处理
        replaceEmoji: replaceEmoji,
        // 预加载
        preloadIcons: preloadIcons,
        // 原始映射（供外部使用）
        EVENT_ID_TO_FILE: EVENT_ID_TO_FILE,
        ENDING_FILE_MAP: ENDING_FILE_MAP
    };
})();
