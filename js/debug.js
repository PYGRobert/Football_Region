/**
 * debug.js — 开发者调试面板 (v2.2)
 * 依赖: 所有 Game.* 模块
 * 职责: 声望/标志位显示、20种结局一键触发、系列/标志位状态重置
 *
 * v2.2: 适配新事件系统 — 新增flagStore查看、张力信息、系列测试
 * v2.0: 事件系统重构
 * 快捷键: ` (反引号) 切换面板显示/隐藏
 */
(function() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }

    function init() {
        var G = window.Game;
        if (!G || !G.State || !G.Ending || !G.Constants || !G.UI || !G.Flags) {
            console.warn('[Debug] Game模块未就绪，延迟初始化...');
            setTimeout(init, 500);
            return;
        }

        var S = G.State;
        var C = G.Constants;
        var End = G.Ending;
        var UI = G.UI;
        var Flags = G.Flags;

        var panel = document.getElementById('debugPanel');
        if (!panel) { console.warn('[Debug] #debugPanel 不存在'); return; }

        buildPanel(panel);

        // 创建切换按钮
        var toggleBtn = document.createElement('div');
        toggleBtn.className = 'debug-toggle-btn';
        toggleBtn.textContent = 'D';
        toggleBtn.title = '调试面板 (`键切换)';
        toggleBtn.onclick = function() { togglePanel(); };
        document.body.appendChild(toggleBtn);

        // 键盘切换
        window.addEventListener('keydown', function(e) {
            if (e.key === '`' || e.code === 'Backquote') {
                if (document.activeElement === document.body || !document.activeElement) {
                    e.preventDefault();
                    togglePanel();
                }
            }
        });

        function togglePanel() {
            var isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'flex' : 'none';
            if (isHidden) refreshDebugDisplay();
        }

        function refreshDebugDisplay() {
            var s = S.get();
            var rep = s.reputation;
            var level = C.getReputationLevel(rep);
            var valEl = document.getElementById('debugRepValue');
            var lvlEl = document.getElementById('debugRepLevel');
            if (valEl) valEl.textContent = rep;
            if (lvlEl) lvlEl.textContent = level.name;

            // v2.2: 张力信息
            var tensEl = document.getElementById('debugTension');
            if (tensEl) {
                var status = s.decompressing ? ' 🔄减压中' :
                    (s.tutorialStep < C.TUTORIAL_EVENT_COUNT ? ' 📖教程' : '');
                tensEl.textContent = s.pressureLevel + '/' + C.PRESSURE_CAP + status +
                    ' | 距系列:' + (s.eventsSinceLastSeries || 0);
            }

            // v2.2: 标志位信息
            var flagsEl = document.getElementById('debugFlags');
            if (flagsEl && s.flagStore) {
                var store = s.flagStore;
                var parts = [];

                // 布尔标志
                var activeBools = [];
                Object.keys(store.boolean || {}).forEach(function(k) {
                    if (store.boolean[k]) activeBools.push(k);
                });
                if (activeBools.length) parts.push('B:' + activeBools.join(','));

                // 计数器
                var counters = [];
                Object.keys(store.counter || {}).forEach(function(k) {
                    if (store.counter[k] > 0) counters.push(k + '=' + store.counter[k]);
                });
                if (counters.length) parts.push('C:' + counters.join(','));

                // 计时器
                var timers = [];
                Object.keys(store.timer || {}).forEach(function(k) {
                    if (store.timer[k] && store.timer[k].value > 0) {
                        timers.push(k + '(' + store.timer[k].remaining + ')');
                    }
                });
                if (timers.length) parts.push('T:' + timers.join(','));

                flagsEl.textContent = parts.length ? parts.join(' | ') : '(空)';
            }

            // unlocked事件
            var unlEl = document.getElementById('debugUnlocks');
            if (unlEl) {
                unlEl.textContent = s.unlockedEventIds.length ? s.unlockedEventIds.join(',') : '(空)';
            }
        }

        function resetStateForDebug() {
            var s = S.get();
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
            s.milestoneFlags.leagueChampion = false;
            s.milestoneFlags.championsLeagueWinner = false;
            s.milestoneFlags.worldCupWinner = false;
            s.activeSeries = null;
            s.pendingSeasonEnd = false;
            s.seriesThisSeason = { tree: 0, linear: 0 };
            s.pressureLevel = 0;
            s.tutorialStep = 9;
            s.decompressing = false;
            s.eventsSinceLastSeries = 0;
            s.eventCounter = 0;
            s.unlockedEventIds = [];
            s.recentCategoryIds = [];
            s.completedSeries = [];
            // v2.2: 重置所有flag
            Flags.ensure();
            var store = s.flagStore;
            if (store) {
                Object.keys(store.boolean || {}).forEach(function(k) { store.boolean[k] = false; });
                Object.keys(store.counter || {}).forEach(function(k) { store.counter[k] = 0; });
                Object.keys(store.timer || {}).forEach(function(k) { store.timer[k] = { value: 0, remaining: 0 }; });
            }
        }

        function triggerEnding(desc) {
            console.log('[Debug] 触发结局: ' + desc);
            refreshDebugDisplay();
            var triggered = End.checkGameOver();
            if (!triggered) {
                console.warn('[Debug] 结局未触发！当前状态:', {
                    wealth: S.get().wealth, ability: S.get().ability,
                    team: S.get().team, ambition: S.get().ambition,
                    reputation: S.get().reputation, age: S.get().age
                });
                alert('结局未触发！请查看Console了解当前状态。');
            } else {
                End.flushPendingEnding();
                UI.updateAllStats();
                UI.updateHeader();
                refreshDebugDisplay();
            }
        }

        function bindButtons() {
            // 8极端结局
            var extremes = [
                { id: 'wealth_0',  label: '财富→0',  setup: function(s){ s.wealth=0; } },
                { id: 'wealth_100',label: '财富→100', setup: function(s){ s.wealth=100; } },
                { id: 'ability_0', label: '能力→0',   setup: function(s){ s.ability=0; } },
                { id: 'ability_100',label:'能力→100', setup: function(s){ s.ability=100; } },
                { id: 'team_0',    label: '团队→0',   setup: function(s){ s.team=0; } },
                { id: 'team_100',  label: '团队→100', setup: function(s){ s.team=100; } },
                { id: 'ambition_0',label:'野心→0',    setup: function(s){ s.ambition=0; } },
                { id: 'ambition_100',label:'野心→100', setup: function(s){ s.ambition=100; } }
            ];
            extremes.forEach(function(item) {
                var btn = document.getElementById('btn_' + item.id);
                if (btn) btn.addEventListener('click', function() {
                    resetStateForDebug();
                    item.setup(S.get());
                    triggerEnding(item.label);
                });
            });

            // 正常退役
            var btnRetire = document.getElementById('btn_retire');
            if (btnRetire) btnRetire.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get(); s.age = 38; s.reputation = 40;
                triggerEnding('正常退役');
            });

            // 世界级模板
            var worldTemplates = [
                { id: 'neymar',    label:'内马尔·能力100', setup: function(s){ s.ability=100; s.reputation=85; } },
                { id: 'ronaldinho',label:'小罗·财富0',    setup: function(s){ s.wealth=0; s.reputation=85; } },
                { id: 'beckham',   label:'贝克汉姆·财富100', setup: function(s){ s.wealth=100; s.reputation=85; } },
                { id: 'mbappe',    label:'姆巴佩·团队0',  setup: function(s){ s.team=0; s.reputation=85; } },
                { id: 'ronaldo',   label:'C罗·野心100',   setup: function(s){ s.ambition=100; s.reputation=85; } }
            ];
            worldTemplates.forEach(function(item) {
                var btn = document.getElementById('btn_' + item.id);
                if (btn) btn.addEventListener('click', function() {
                    resetStateForDebug();
                    item.setup(S.get());
                    triggerEnding(item.label);
                });
            });

            // 大洲级模板
            var contTemplates = [
                { id: 'ali',       label:'阿里·能力0',    setup: function(s){ s.ability=0; s.reputation=60; } },
                { id: 'park',      label:'朴智星·团队100', setup: function(s){ s.team=100; s.reputation=60; } },
                { id: 'balotelli', label:'巴洛特利·野心0', setup: function(s){ s.ambition=0; s.reputation=60; } }
            ];
            contTemplates.forEach(function(item) {
                var btn = document.getElementById('btn_' + item.id);
                if (btn) btn.addEventListener('click', function() {
                    resetStateForDebug();
                    item.setup(S.get());
                    triggerEnding(item.label);
                });
            });

            // 隐藏结局
            var btnGotze = document.getElementById('btn_gotze');
            if (btnGotze) btnGotze.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get(); s.team = 0; s.age = 24; s.reputation = 60;
                triggerEnding('惊鸿一瞥');
            });
            var btnVardy = document.getElementById('btn_vardy');
            if (btnVardy) btnVardy.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get();
                s.age = 38; s.reputation = 60;
                s.wealth = 65; s.ability = 65; s.team = 65; s.ambition = 65;
                triggerEnding('凡人图腾');
            });
            var btnMessi = document.getElementById('btn_messi');
            if (btnMessi) btnMessi.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get();
                s.age = 38; s.reputation = 85;
                s.wealth = 65; s.ability = 65; s.team = 65; s.ambition = 65;
                s.milestoneFlags.leagueChampion = true;
                s.milestoneFlags.championsLeagueWinner = true;
                s.milestoneFlags.worldCupWinner = true;
                triggerEnding('球王加冕');
            });

            // v2.2: 系列测试
            var btnCup = document.getElementById('btn_trigger_cup');
            if (btnCup) btnCup.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get();
                s.reputation = 25; s.age = 24; s.tutorialStep = 9;
                s.pressureLevel = 0; s.decompressing = false;
                s.unlockedEventIds = [];
                UI.updateAllStats(); UI.updateHeader(); UI.updateDebugReputation();
                if (G.Series) G.Series.startSeries('cup_run');
                if (G.Card) G.Card.loadNewEvent();
                console.log('[Debug] 杯赛征途已启动');
            });

            var btnTrans = document.getElementById('btn_trigger_transfer');
            if (btnTrans) btnTrans.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get();
                s.reputation = 35; s.age = 26; s.tutorialStep = 9;
                s.pressureLevel = 0; s.decompressing = false;
                s.unlockedEventIds = [];
                UI.updateAllStats(); UI.updateHeader(); UI.updateDebugReputation();
                if (G.Series) G.Series.startSeries('transfer_saga');
                if (G.Card) G.Card.loadNewEvent();
                console.log('[Debug] 豪门邀约已启动');
            });

            var btnLocker = document.getElementById('btn_trigger_locker');
            if (btnLocker) btnLocker.addEventListener('click', function() {
                resetStateForDebug();
                var s = S.get();
                s.tutorialStep = 9;
                s.pressureLevel = 0; s.decompressing = false;
                s.unlockedEventIds = [];
                if (G.Flags) { G.Flags.add('locker_tension', 3); }
                UI.updateAllStats(); UI.updateHeader(); UI.updateDebugReputation();
                if (G.Card) G.Card.loadNewEvent();
                console.log('[Debug] 更衣室风暴已触发 (locker_tension=3)');
            });

            var btnResetSeries = document.getElementById('btn_reset_series');
            if (btnResetSeries) btnResetSeries.addEventListener('click', function() {
                resetStateForDebug();
                UI.updateAllStats(); UI.updateHeader(); UI.updateDebugReputation();
                if (G.Card) G.Card.loadNewEvent();
                console.log('[Debug] 已重置为初始状态 (v2.2)');
            });
        }

        bindButtons();

        setInterval(function() {
            if (panel.style.display !== 'none') refreshDebugDisplay();
        }, 1000);

        console.log('[Debug] 调试面板已就绪 (v2.2)。按 ` 键切换面板。');
    }

    function buildPanel(panel) {
        panel.innerHTML =
            '<h3>🛠 调试面板 v2.2</h3>' +
            '<div class="debug-rep-display">' +
                '<span style="font-size:0.65rem;color:rgba(255,255,255,0.4);">声望</span>' +
                '<span class="rep-val" id="debugRepValue">-</span>' +
                '<span class="rep-lvl" id="debugRepLevel">-</span>' +
            '</div>' +
            // v2.2: 张力信息
            '<div class="debug-rep-display" style="margin-bottom:4px;">' +
                '<span style="font-size:0.6rem;color:rgba(255,255,255,0.4);">压力</span>' +
                '<span style="color:#fff;font-size:0.7rem;" id="debugTension">-</span>' +
            '</div>' +
            // v2.2: 标志位
            '<div class="debug-section">' +
                '<h4>标志位 (Flags)</h4>' +
                '<div style="font-size:0.52rem;color:rgba(46,204,113,0.7);word-break:break-all;" id="debugFlags">(空)</div>' +
            '</div>' +
            // v2.2: unlocked事件
            '<div class="debug-section">' +
                '<h4>已解锁事件 (Unlocks)</h4>' +
                '<div style="font-size:0.5rem;color:rgba(201,168,76,0.7);word-break:break-all;" id="debugUnlocks">(空)</div>' +
            '</div>' +
            // 8极端结局
            '<div class="debug-section">' +
                '<h4>8大极端结局</h4>' +
                buildBtnRow(['btn_wealth_0','btn_wealth_100'], ['财富→0','财富→100']) +
                buildBtnRow(['btn_ability_0','btn_ability_100'], ['能力→0','能力→100']) +
                buildBtnRow(['btn_team_0','btn_team_100'], ['团队→0','团队→100']) +
                buildBtnRow(['btn_ambition_0','btn_ambition_100'], ['野心→0','野心→100']) +
            '</div>' +
            '<div class="debug-section">' +
                '<h4>正常退役</h4>' +
                '<button class="debug-btn retire" id="btn_retire">38岁正常退役</button>' +
            '</div>' +
            '<div class="debug-section">' +
                '<h4>世界级模板 (声望≥81)</h4>' +
                buildBtnRow(['btn_neymar','btn_ronaldinho'], ['内马尔','小罗']) +
                buildBtnRow(['btn_beckham','btn_mbappe'], ['贝克汉姆','姆巴佩']) +
                '<button class="debug-btn hidden-ending" id="btn_ronaldo">C罗·一念成魔</button>' +
            '</div>' +
            '<div class="debug-section">' +
                '<h4>大洲级模板 (声望≥49)</h4>' +
                buildBtnRow(['btn_ali','btn_park'], ['阿里','朴智星']) +
                '<button class="debug-btn hidden-ending" id="btn_balotelli">巴洛特利</button>' +
            '</div>' +
            '<div class="debug-section">' +
                '<h4>隐藏结局</h4>' +
                buildBtnRow(['btn_gotze','btn_vardy'], ['惊鸿一瞥','凡人图腾']) +
                '<button class="debug-btn hidden-ending" id="btn_messi">球王加冕</button>' +
            '</div>' +
            '<div class="debug-section">' +
                '<h4>系列事件开关</h4>' +
                buildBtnRow(['btn_trigger_cup','btn_trigger_transfer'], ['▶ 杯赛征途','▶ 豪门邀约']) +
                buildBtnRow(['btn_trigger_locker','btn_reset_series'], ['▶ 更衣室风暴','↺ 重置全部']) +
            '</div>' +
            '<div style="font-size:0.5rem;color:rgba(255,255,255,0.3);text-align:center;margin-top:4px;">' +
                '需重启游戏恢复 | ` 键开关面板' +
            '</div>';
    }

    function buildBtnRow(ids, labels) {
        var html = '<div class="debug-row">';
        for (var i = 0; i < ids.length; i++) {
            html += '<button class="debug-btn extreme" id="' + ids[i] + '">' + labels[i] + '</button>';
        }
        html += '</div>';
        return html;
    }
})();
