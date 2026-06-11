/**
 * debug.js — 开发者调试面板 (v1.4)
 * 依赖: 所有 Game.* 模块
 * 职责: 声望显示开关、20种结局一键触发、属性实时监控
 *
 * 快捷键: ` (反引号) 切换面板显示/隐藏
 */
(function() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200); // 等主模块初始化完成
    }

    function init() {
        var G = window.Game;
        if (!G || !G.State || !G.Ending || !G.Constants || !G.UI) {
            console.warn('[Debug] Game模块未就绪，延迟初始化...');
            setTimeout(init, 500);
            return;
        }

        var S = G.State;
        var C = G.Constants;
        var End = G.Ending;
        var UI = G.UI;

        var panel = document.getElementById('debugPanel');
        if (!panel) { console.warn('[Debug] #debugPanel 不存在'); return; }

        // ==================== 构建面板HTML ====================
        buildPanel(panel);

        // ==================== 创建切换按钮 ====================
        var toggleBtn = document.createElement('div');
        toggleBtn.className = 'debug-toggle-btn';
        toggleBtn.textContent = 'D';
        toggleBtn.title = '调试面板 (`键切换)';
        toggleBtn.onclick = function() { togglePanel(); };
        document.body.appendChild(toggleBtn);

        // ==================== 键盘切换 ====================
        window.addEventListener('keydown', function(e) {
            if (e.key === '`' || e.code === 'Backquote') {
                // 只在非输入状态下触发
                if (document.activeElement === document.body || !document.activeElement) {
                    e.preventDefault();
                    togglePanel();
                }
            }
        });

        function togglePanel() {
            var isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'flex' : 'none';
            if (isHidden) refreshRepDisplay();
        }

        // ==================== 刷新声望显示 ====================
        function refreshRepDisplay() {
            var s = S.get();
            var rep = s.reputation;
            var level = C.getReputationLevel(rep);
            var valEl = document.getElementById('debugRepValue');
            var lvlEl = document.getElementById('debugRepLevel');
            if (valEl) valEl.textContent = rep;
            if (lvlEl) lvlEl.textContent = level.name;
        }

        // ==================== 快捷设置状态 ====================
        function resetStateForDebug() {
            var s = S.get();
            // 重置为核心安全值（不触发极端）
            s.wealth = 50;
            s.ability = 50;
            s.team = 50;
            s.ambition = 50;
            s.reputation = 10;
            s.age = 22;
            s.gameOver = false;
            s.isEndingPhase = false;
            s.isAnimating = false;
            s.pendingEvent = null;
            // 清除里程碑
            s.milestoneFlags.leagueChampion = false;
            s.milestoneFlags.championsLeagueWinner = false;
            s.milestoneFlags.worldCupWinner = false;
        }

        function triggerEnding(desc) {
            console.log('[Debug] 触发结局: ' + desc);
            refreshRepDisplay();
            var triggered = End.checkGameOver();
            if (!triggered) {
                console.warn('[Debug] 结局未触发！请检查条件。当前状态:', {
                    wealth: S.get().wealth,
                    ability: S.get().ability,
                    team: S.get().team,
                    ambition: S.get().ambition,
                    reputation: S.get().reputation,
                    age: S.get().age
                });
                alert('结局未触发！请查看Console了解当前状态。');
            } else {
                // 结局触发后刷新UI和debug面板
                UI.updateAllStats();
                UI.updateHeader();
                refreshRepDisplay();
            }
        }

        // ==================== 绑定按钮事件 ====================
        function bindButtons() {
            // ---- 8大极端结局（低声望，无模板） ----
            var extremes = [
                { id: 'wealth_0',  label: '财富→0 一贫如洗',   setup: function(s){ s.wealth=0; } },
                { id: 'wealth_100',label: '财富→100 初心蒙尘',  setup: function(s){ s.wealth=100; } },
                { id: 'ability_0', label: '能力→0 力不从心',    setup: function(s){ s.ability=0; } },
                { id: 'ability_100',label:'能力→100 众矢之的',  setup: function(s){ s.ability=100; } },
                { id: 'team_0',    label: '团队→0 团队毒瘤',    setup: function(s){ s.team=0; } },
                { id: 'team_100',  label: '团队→100 工兵改造',  setup: function(s){ s.team=100; } },
                { id: 'ambition_0',label:'野心→0 无人在意',     setup: function(s){ s.ambition=0; } },
                { id: 'ambition_100',label:'野心→100 众叛亲离', setup: function(s){ s.ambition=100; } }
            ];

            extremes.forEach(function(item) {
                var btn = document.getElementById('btn_' + item.id);
                if (btn) {
                    btn.addEventListener('click', function() {
                        resetStateForDebug();
                        item.setup(S.get());
                        triggerEnding(item.label);
                    });
                }
            });

            // ---- 正常退役 ----
            var btnRetire = document.getElementById('btn_retire');
            if (btnRetire) {
                btnRetire.addEventListener('click', function() {
                    resetStateForDebug();
                    var s = S.get();
                    s.age = 38;
                    s.reputation = 40;
                    triggerEnding('正常退役');
                });
            }

            // ---- 世界级模板(5) ----
            var worldTemplates = [
                { id: 'neymar',    label: '内马尔 · 能力100',  setup: function(s){ s.ability=100; s.reputation=85; } },
                { id: 'ronaldinho',label:'小罗 · 财富0',       setup: function(s){ s.wealth=0; s.reputation=85; } },
                { id: 'beckham',   label: '贝克汉姆 · 财富100', setup: function(s){ s.wealth=100; s.reputation=85; } },
                { id: 'mbappe',    label: '姆巴佩 · 团队0',    setup: function(s){ s.team=0; s.reputation=85; } },
                { id: 'ronaldo',   label: 'C罗 · 野心100',     setup: function(s){ s.ambition=100; s.reputation=85; } }
            ];

            worldTemplates.forEach(function(item) {
                var btn = document.getElementById('btn_' + item.id);
                if (btn) {
                    btn.addEventListener('click', function() {
                        resetStateForDebug();
                        item.setup(S.get());
                        triggerEnding(item.label);
                    });
                }
            });

            // ---- 大洲级模板(3) ----
            var contTemplates = [
                { id: 'ali',       label: '阿里 · 能力0',      setup: function(s){ s.ability=0; s.reputation=60; } },
                { id: 'park',      label: '朴智星 · 团队100',  setup: function(s){ s.team=100; s.reputation=60; } },
                { id: 'balotelli', label: '巴洛特利 · 野心0',  setup: function(s){ s.ambition=0; s.reputation=60; } }
            ];

            contTemplates.forEach(function(item) {
                var btn = document.getElementById('btn_' + item.id);
                if (btn) {
                    btn.addEventListener('click', function() {
                        resetStateForDebug();
                        item.setup(S.get());
                        triggerEnding(item.label);
                    });
                }
            });

            // ---- 隐藏结局(3) ----
            var btnGotze = document.getElementById('btn_gotze');
            if (btnGotze) {
                btnGotze.addEventListener('click', function() {
                    resetStateForDebug();
                    var s = S.get();
                    s.team = 0;        // team=0在洲际级无模板，确保触发伤仲永
                    s.age = 24;
                    s.reputation = 60;
                    triggerEnding('伤仲永 — 格策');
                });
            }

            var btnVardy = document.getElementById('btn_vardy');
            if (btnVardy) {
                btnVardy.addEventListener('click', function() {
                    resetStateForDebug();
                    var s = S.get();
                    s.age = 38;
                    s.reputation = 60;
                    s.wealth = 65;
                    s.ability = 65;
                    s.team = 65;
                    s.ambition = 65;
                    triggerEnding('球队名宿 — 瓦尔迪');
                });
            }

            var btnMessi = document.getElementById('btn_messi');
            if (btnMessi) {
                btnMessi.addEventListener('click', function() {
                    resetStateForDebug();
                    var s = S.get();
                    s.age = 38;
                    s.reputation = 85;
                    s.wealth = 65;
                    s.ability = 65;
                    s.team = 65;
                    s.ambition = 65;
                    s.milestoneFlags.leagueChampion = true;
                    s.milestoneFlags.championsLeagueWinner = true;
                    s.milestoneFlags.worldCupWinner = true;
                    triggerEnding('球王加冕 — 梅西');
                });
            }

            // ---- 事件测试 ----
            var btnLockerRoom = document.getElementById('btn_locker_room');
            if (btnLockerRoom) {
                btnLockerRoom.addEventListener('click', function() {
                    resetStateForDebug();
                    var s = S.get();
                    s.team = 50;
                    s.age = 25;
                    s.reputation = 20;
                    s.currentChainId = null;
                    s.chainStep = 0;
                    s.recentEventIds = [];
                    s.gameOver = false;
                    s.isEndingPhase = false;
                    s.isAnimating = false;
                    s.pendingEvent = null;
                    UI.updateAllStats();
                    UI.updateHeader();
                    UI.updateDebugReputation();
                    if (window.Game && window.Game.Card) {
                        window.Game.Card.loadNewEvent();
                    }
                    console.log('[Debug] 已重置状态，滑动卡片可触发更衣室事件链（条件：团队>35, 年龄<32）');
                });
            }
        }

        // 绑定所有按钮事件
        bindButtons();

        // ==================== 面板可见时实时刷新 ====================
        setInterval(function() {
            if (panel.style.display !== 'none') {
                refreshRepDisplay();
            }
        }, 1000);

        // ==================== 初始状态 ====================
        console.log('[Debug] 调试面板已就绪。按 ` 键切换面板。');
    }

    // ==================== 构建面板DOM ====================
    function buildPanel(panel) {
        panel.innerHTML =
            '<h3>🛠 调试面板</h3>' +

            // 声望显示
            '<div class="debug-rep-display">' +
                '<span style="font-size:0.65rem;color:rgba(255,255,255,0.4);">声望</span>' +
                '<span class="rep-val" id="debugRepValue">-</span>' +
                '<span class="rep-lvl" id="debugRepLevel">-</span>' +
            '</div>' +
            '<div class="debug-row">' +
                '<label class="debug-switch">' +
                    '<input type="checkbox" id="debugShowRepInline" onchange="var d=document.getElementById(\'debugReputation\');if(d)d.style.display=this.checked?\'flex\':\'none\';">' +
                    '在游戏界面显示声望条' +
                '</label>' +
            '</div>' +

            // 8大极端结局
            '<div class="debug-section">' +
                '<h4>8大极端结局（低声望·无模板）</h4>' +
                buildBtnRow(['btn_wealth_0','btn_wealth_100'], ['财富→0','财富→100'], 'extreme') +
                buildBtnRow(['btn_ability_0','btn_ability_100'], ['能力→0','能力→100'], 'extreme') +
                buildBtnRow(['btn_team_0','btn_team_100'], ['团队→0','团队→100'], 'extreme') +
                buildBtnRow(['btn_ambition_0','btn_ambition_100'], ['野心→0','野心→100'], 'extreme') +
            '</div>' +

            // 正常退役
            '<div class="debug-section">' +
                '<h4>正常退役</h4>' +
                '<button class="debug-btn retire" id="btn_retire">38岁正常退役</button>' +
            '</div>' +

            // 世界级球星模板
            '<div class="debug-section">' +
                '<h4>世界级模板 (声望≥81)</h4>' +
                buildBtnRow(['btn_neymar','btn_ronaldinho'], ['内马尔·折翼飞鸟','小罗·落魄精灵'], 'hidden-ending') +
                buildBtnRow(['btn_beckham','btn_mbappe'], ['贝克汉姆·亿元弧线','姆巴佩·法兰西王'], 'hidden-ending') +
                '<button class="debug-btn hidden-ending" id="btn_ronaldo">C罗·一念成魔</button>' +
            '</div>' +

            // 大洲级球星模板
            '<div class="debug-section">' +
                '<h4>大洲级模板 (声望≥49)</h4>' +
                buildBtnRow(['btn_ali','btn_park'], ['阿里·江郎才尽','朴智星·豪门代价'], 'hidden-ending') +
                '<button class="debug-btn hidden-ending" id="btn_balotelli">巴洛特利·何必认真</button>' +
            '</div>' +

            // 3大隐藏结局
            '<div class="debug-section">' +
                '<h4>隐藏结局</h4>' +
                buildBtnRow(['btn_gotze','btn_vardy'], ['格策·惊鸿一瞥','瓦尔迪·凡人图腾'], 'hidden-ending') +
                '<button class="debug-btn hidden-ending" id="btn_messi">梅西·万王之王</button>' +
            '</div>' +

            // 事件测试 (v1.4新增)
            '<div class="debug-section">' +
                '<h4>事件测试</h4>' +
                '<button class="debug-btn" id="btn_locker_room">触发更衣室裂痕事件链</button>' +
            '</div>' +

            // 提示
            '<div style="font-size:0.55rem;color:rgba(255,255,255,0.3);text-align:center;margin-top:8px;">' +
                '点按钮 → 自动设置状态并触发结局<br>' +
                '需重启游戏恢复 | ` 键开关面板' +
            '</div>';
    }

    function buildBtnRow(ids, labels, className) {
        var html = '<div class="debug-row">';
        for (var i = 0; i < ids.length; i++) {
            html += '<button class="debug-btn ' + (className || '') + '" id="' + ids[i] + '">' + labels[i] + '</button>';
        }
        html += '</div>';
        return html;
    }
})();
