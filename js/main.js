/**
 * main.js — 游戏入口 (v2.2)
 * 依赖: 所有 Game.* 模块
 * 职责: 粒子背景、模块初始化、Flags初始化、全局 restartGame 绑定、存档管理
 *
 * v2.2: 事件系统重建 — 新增Flags模块初始化、张力调度、标志位系统
 * v2.1: 移除 _peakReputation 初始化
 * v2.0: 事件系统重构 — 新增 Series 模块
 */
(function() {
    'use strict';

    // 等待 DOM 和所有模块就绪
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // 验证所有模块已加载
        var modules = ['Constants', 'State', 'Utils', 'Flags', 'UI', 'Series', 'Events', 'Timeline', 'Ending', 'Card'];
        var missing = modules.filter(function(m) { return !window.Game || !window.Game[m]; });
        if (missing.length > 0) {
            console.error('[Main] 缺少模块:', missing.join(', '));
            alert('游戏初始化失败：缺少模块 ' + missing.join(', '));
            return;
        }

        var C = window.Game.Constants;
        var S = window.Game.State;
        var UI = window.Game.UI;
        var Evt = window.Game.Events;
        var Card = window.Game.Card;
        var Icons = window.Game.Icons;

        // ---- 预加载所有图标 ----
        if (Icons && Icons.preloadIcons) {
            Icons.preloadIcons();
        }

        // ---- 粒子背景（颜色与景深分层） ----
        var particlesEl = UI.dom().particles;
        var particleColors = [
            'rgba(255,255,255,0.02)',           // 纯白（多数）
            'rgba(255,255,255,0.02)',
            'rgba(255,255,255,0.02)',
            'rgba(201,168,76,0.025)',           // 金色微粒
            'rgba(46,204,113,0.02)',            // 绿色微粒
        ];
        for (var i = 0; i < C.PARTICLE_COUNT; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            var size = Math.random() * 3 + 1;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 13 + 9) + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            // 大粒子更低透明度（景深效果），小粒子稍高
            var depthOpacity = size > 3 ? 0.015 : (size < 2 ? 0.03 : 0.02);
            var color = particleColors[Math.floor(Math.random() * particleColors.length)];
            p.style.background = color.replace(/[\d.]+\)$/, depthOpacity + ')');
            particlesEl.appendChild(p);
        }

        // ---- 绑定全局 restartGame ----
        window.restartGame = function() {
            S.deleteSave(); // 删除存档
            var s = S.reset();
            // v2.2: 清除可能残留的结局暂存数据
            if (window.Game.Ending && window.Game.Ending.clearPendingEnding) {
                window.Game.Ending.clearPendingEnding();
            }
            var d = UI.dom();

            // 隐藏结局界面
            d.endingOverlay.classList.remove('visible');
            d.restartBtn.classList.remove('visible');
            d.resultScreen.style.display = 'none';

            // 清空时间线
            window.Game.Timeline.clear();

            // 重置主游戏卡片
            var card = d.card;
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.background = '';
            card.style.boxShadow = '';
            card.style.opacity = '';
            card.style.animation = '';
            card.classList.remove(
                'flying-left', 'flying-right', 'returning', 'grabbed',
                'gold', 'special', 'dark', 'ending-card', 'ending-flip', 'player-template-card',
                'teaser-card', 'player-light-bg', 'fade-swap-out', 'fade-swap-in', 'flip-out', 'flip-in', 'slam-flip', 'landing'
            );
            // 移除结局颜色变体 (v1.4)
            var endingVariants = [
                'wealth-max', 'wealth-min', 'ability-max', 'ability-min',
                'team-max', 'team-min', 'ambition-max', 'ambition-min',
                'wonderkid', 'club-legend', 'ballon-dor', 'age'
            ];
            endingVariants.forEach(function(cls) { card.classList.remove(cls); });

            // 恢复上下显示条
            d.statsPanel.style.display = '';
            d.header.style.display = '';
            var gc = document.querySelector('.game-container');
            if (gc) gc.classList.remove('game-ending-active');

            // 重置卡片图标内联尺寸（修复特殊结局后图标变大bug）
            d.cardIcon.style.width = '';
            d.cardIcon.style.height = '';

            UI.hideOverlay();
            // 清除系列进度条
            d.cardArea.classList.remove('series-active');
            var oldProgress = d.cardArea.querySelector('.series-progress-bar');
            if (oldProgress) oldProgress.remove();
            d.swipeHint.style.opacity = '1';

            // v2.2: 重新初始化 flags
            window.Game.Flags.ensure();

            UI.updateAllStats();
            UI.updateHeader();
            UI.updateDebugReputation();
            Card.loadNewEvent();

            console.log('[Main] 游戏已重启！(v2.2)');
        };

        // ---- Debug: 反引号键切换由 debug.js 管理 ----
        // 详见 js/debug.js

        // ---- 启动游戏 ----
        startGame();

        function startGame() {
            // 检查是否有存档
            if (S.hasSave()) {
                var saveInfo = S.getSaveInfo();
                showContinueDialog(saveInfo);
            } else {
                initNewGame();
            }
        }

        function showContinueDialog(saveInfo) {
            // 创建继续游戏对话框
            var overlay = document.createElement('div');
            overlay.id = 'continueOverlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:300;display:flex;align-items:center;justify-content:center;';

            var dialog = document.createElement('div');
            dialog.style.cssText = 'background:#1a1a2e;border-radius:20px;padding:30px;text-align:center;max-width:320px;width:90%;border:1px solid rgba(255,255,255,0.1);';

            var title = document.createElement('h2');
            title.style.cssText = 'color:#fff;margin-bottom:15px;font-size:1.3rem;';
            title.textContent = '欢迎回来！';

            var info = document.createElement('p');
            info.style.cssText = 'color:#ccc;margin-bottom:25px;font-size:0.9rem;line-height:1.5;';
            var date = new Date(saveInfo.timestamp);
            var repName = saveInfo.reputation ? C.getReputationLevel(saveInfo.reputation).name : '默默无闻';
            info.innerHTML = '发现存档<br>' +
                '<span style="color:#c9a84c;">年龄: ' + saveInfo.age + '岁 | 赛季: ' + saveInfo.season + '</span><br>' +
                '<span style="font-size:0.8rem;color:#888;">声望: ' + repName + '</span><br>' +
                '<span style="font-size:0.8rem;color:#888;">' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '</span>';

            var btnContainer = document.createElement('div');
            btnContainer.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

            var continueBtn = document.createElement('button');
            continueBtn.style.cssText = 'padding:14px;background:linear-gradient(135deg,#c9a84c,#d4a82a);color:#1a1a2e;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;';
            continueBtn.textContent = '继续游戏';
            continueBtn.onclick = function() {
                document.body.removeChild(overlay);
                loadSavedGame();
            };

            var newGameBtn = document.createElement('button');
            newGameBtn.style.cssText = 'padding:14px;background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;';
            newGameBtn.textContent = '开始新游戏';
            newGameBtn.onclick = function() {
                document.body.removeChild(overlay);
                S.deleteSave();
                initNewGame();
            };

            btnContainer.appendChild(continueBtn);
            btnContainer.appendChild(newGameBtn);

            dialog.appendChild(title);
            dialog.appendChild(info);
            dialog.appendChild(btnContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
        }

        function loadSavedGame() {
            if (S.load()) {
                var s = S.get();
                // v2.2: 确保 flagStore 存在(兼容旧存档)
                window.Game.Flags.ensure();
                UI.updateAllStats();
                UI.updateHeader();
                UI.updateDebugReputation();
                Card.bindEvents();
                Card.loadNewEvent(true);
                console.log('[Main] 已加载存档继续游戏');
            } else {
                console.warn('[Main] 加载存档失败，开始新游戏');
                initNewGame();
            }
        }

        function initNewGame() {
            // v2.2: 初始化 flagStore
            window.Game.Flags.ensure();
            var s = S.get();
            UI.updateAllStats();
            UI.updateHeader();
            UI.updateDebugReputation();
            Card.bindEvents();
            Card.loadNewEvent();
            console.log('[Main] 游戏初始化完成 - 足球生涯：抉择与传承 v2.2');
        }
    }
})();
