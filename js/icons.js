/**
 * icons.js — Twemoji图标管理模块
 * 使用Twitter开源emoji库，确保跨平台一致性
 * 本地存储：assets/icons/
 */
window.Game = window.Game || {};

window.Game.Icons = (function() {
    'use strict';

    // 本地emoji图片路径
    var ICONS_BASE = 'assets/icons/';

    // ==================== 事件emoji映射 ====================
    // 使用系统emoji，通过Twemoji转换为一致的SVG图片

    var EVENT_EMOJI = {
        'youth': '🏕️',
        'transfer': '📰',
        'injury': '🩹',
        'trophy': '🏆',
        'team': '🤝',
        'media': '📸',
        'contract': '📝',
        'training': '⚽',
        'party': '🎊',
        'captain': '🎖️',
        'goal': '⚽',
        'worldcup': '🏆',
        'continental': '🌍',
        'legacy': '👑',
        'financial': '💰',
        'coaching': '📚',
        'derby': '🔥',
        'retirement': '🧓',
        'charity': '❤️',
        'award': '🏅'
    };

    // 事件ID到本地文件名的映射
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

    // 结局图标文件名映射
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

    // ==================== 图片HTML生成 ====================

    /**
     * 创建本地emoji图片HTML
     * @param {string} filename - 图片文件名
     * @param {number} size - 图片大小
     * @returns {string} img标签HTML
     */
    function createLocalImg(filename, size) {
        var url = ICONS_BASE + filename;
        return '<img src="' + url + '" width="' + size + '" height="' + size + '" alt="" style="display:inline-block;vertical-align:middle;">';
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
        // 默认返回足球
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
        // 默认返回奖杯
        return createLocalImg('trophy.png', size);
    }

    /**
     * 获取属性图标（使用系统emoji）
     * @param {string} name - 图标名称
     * @returns {string} emoji字符
     */
    function getStatIcon(name) {
        var statEmojis = {
            'physical': '💪',
            'fame': '⭐',
            'teamwork': '🤝',
            'mood': '❤️'
        };
        return statEmojis[name] || '❓';
    }

    return {
        getEventIconById: getEventIconById,
        getEndingIcon: getEndingIcon,
        getStatIcon: getStatIcon
    };
})();
