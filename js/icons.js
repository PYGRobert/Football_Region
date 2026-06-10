/**
 * icons.js — Twemoji图标管理模块
 * 使用本地存储的Twemoji PNG图片，确保跨平台一致性
 * 职责：图标映射、emoji替换、图标预加载
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
        'international_experience': 'americas.png'
    };

    // ==================== 结局原因 → 本地文件名映射 ====================

    var ENDING_FILE_MAP = {
        'physical_min': 'leg.png',
        'team_min': 'prohibited.png',
        'fame_min': 'ghost.png',
        'mood_min': 'pensive.png',
        'physical_max': 'muscle.png',
        'fame_max': 'camera.png',
        'team_max': 'handshake.png',
        'mood_max': 'wine.png',
        'legend': 'crown.png',
        'star': 'star.png',
        'loyal_end': 'house.png',
        'ambition_end': 'swords.png',
        'age': 'hourglass.png'
    };

    // ==================== Emoji字符 → 本地文件名映射 ====================
    // 覆盖所有代码中使用的emoji字符

    var EMOJI_TO_FILE = {
        // UI元素
        '👈': 'arrow_left.png',   // 👈
        '👉': 'arrow_right.png',  // 👉
        '🔒': 'lock.png',         // 🔒
        '📅': 'calendar.png',     // 📅
        // 属性图标
        '💪': 'muscle.png',       // 💪
        '⭐': 'star.png',               // ⭐
        '🤝': 'handshake.png',    // 🤝
        '❤️': 'heart.png',        // ❤️
        '❤': 'heart.png',              // ❤ (无变体)
        '❓': 'thinking.png',           // ❓
        // 常用图标
        '🏆': 'trophy.png',       // 🏆
        '⚽': 'soccer.png',             // ⚽
        '🏐': 'camp.png',         // 🏠 → house (但这里用camp代替)
        // 里程碑文本中的emoji
        '🏠': 'house.png',        // 🏠
        '🔥': 'confetti.png',     // 🔥
        '🕊️': 'palms.png',        // 🕊️ → 和平鸽用palms替代
        '🕊': 'palms.png',        // 🕊 (无变体)
        '⚔️': 'swords.png',       // ⚔️
        '🌍': 'globe.png',        // 🌍
        '🧠': 'lightbulb.png',    // 🧠
        '🎖': 'medal.png',        // 🎖️
        '🚀': 'airplane.png',     // 🚀
        '🇨🇳': 'china.png', // 🇨🇳
        '🎩': 'top_hat.png',      // 🎩
        '👑': 'crown.png',        // 👑
        '📖': 'book.png',         // 📖
        '🌟': 'glowing_star.png', // 🌟
        '💎': 'diamond.png',      // 💎
        '📢': 'loudspeaker.png',  // 📢
        '🎯': 'dart.png',         // 🎯
        '👨‍🏫': 'teacher.png',     // 👨‍🏫 (ZWJ: 教练)
        '💸': 'money_wings.png',  // 💸
        '📰': 'newspaper.png',    // 📰
        '📞': 'phone.png',        // 📞
        '✈️': 'airplane.png',     // ✈️
        '✈': 'airplane.png',      // ✈
        '🗣️': 'speaking.png',     // 🗣️
        '🗣': 'speaking.png',     // 🗣
        '📈': 'chart.png',        // 📈
        '🏦': 'bank.png',         // 🏦
        '📄': 'document.png',     // 📄
        '🤸': 'muscle.png'        // 🤸 (fallback)
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
            'physical': 'muscle.png',
            'fame': 'star.png',
            'teamwork': 'handshake.png',
            'mood': 'heart.png'
        };
        var filename = statFiles[name] || 'thinking.png';
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

            // 安全超时：最多等3秒
            setTimeout(function() {
                if (loaded < total) {
                    console.warn('[Icons] 预加载超时，已加载 ' + loaded + '/' + total);
                    resolve();
                }
            }, 3000);
        });
    }

    // ==================== 公开 API ====================

    return {
        // 核心图标获取
        getEventIconById: getEventIconById,
        getEndingIcon: getEndingIcon,
        getStatIcon: getStatIcon,
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
