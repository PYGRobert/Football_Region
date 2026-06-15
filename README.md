# 足球生涯：抉择与传承 v2.3

## 版本说明

v2.3 是精简维护版本，清理了 v2.2 中的冗余文件和未使用资源。

---

## v2.3 清理清单

| 文件 | 原因 |
|------|------|
| `assets/icons/camera.png` | 未在任何 JS/HTML 中引用 |
| `assets/icons/wine.png` | 未在任何 JS/HTML 中引用 |
| `js/events_data_v2.2_backup.js` | 备份文件，未被任何 HTML 加载 |

---

## v2.2 回顾

v2.2 是 Bug 修复版本，重点修复**系列事件顺序 / Hook与Flag 体系**中的逻辑缺陷。

### v2.2 Bug 修复清单

| 优先级 | 文件 | 问题 | 修复 |
|--------|------|------|------|
| **P0** | `card.js` | `Flags.tick()` 在 `flagsStartTimers` 之后调用，导致新启动的 timer 寿命 = duration-1 (差一错误) | 将 `Flags.tick()` 移至标志位操作之前，仅衰减已存在的 timer |
| **P1** | `card.js` | `processHook` 死代码 — `series.js` 中定义但从未调用，伏笔计数器仅靠事件 `flagsAdd` 手动递增 | 在 `applyChoice` 中集成 `Series.processHook(event.hookCounter)` |
| **P2** | `constants.js` | `TENSION_NAMES` 缺少 tension=3 映射，多条事件数据使用 tension=3 却无名称 | 添加 `'3': '偏重'` 映射 |
| **P2** | `events_data.js` | `cup_f1/f2/f3` 事件内部 `series.totalSteps: 5` 与系列定义 `totalSteps: 4` 不一致 | 统一修正为 4 |
| **P2** | `events.js` | `_continueSeries` 中 `failedAtKeyNode` 失败但未定义 `failNext` 时静默结束，无日志警告 | 添加防御性检查和 `console.warn` |
| **P2** | `events.js` | `_continueSeries` 中 `activeSeries` 或系列定义为空时无保护直接访问属性 | 添加空值守卫 |
| **P2** | `series.js` | `advanceStep` 无步骤边界检查，`currentStep` 可无限递增溢出 | 添加 `currentStep > totalSteps` 前置守卫 |
| **P3** | `index.html` | CSS `.card.flip-out`/`.flip-in` 重复定义两次（0.28s 和 0.55s），同名 `@keyframes` 后者覆盖前者 | 移除死代码（第一组0.28s定义），仅保留 ending teaser 使用的0.55s版 |
| **P3** | `index_debug.html` | 同上重复 CSS 定义 | 同上移除 |

---

## 系统设计回顾

### 结果卡系统 (v2.1)
- 选择后卡片原地变为黑底结果模式（叙事 + 已揭示效果）
- 结果卡上任意方向滑动 → 飞出 → 下一个事件
- 移除旧结算卡机制（飞出→飞入→确认）

### 事件系统 (v2.0)

| 类型 | 标识 | 结构 | 结局数量 |
|------|------|------|----------|
| **树状系列** | `tree` | 3步 → 4叶子结局 | 4 |
| **线性 counter** | `linear` | N步 → 成功/失败 | 2 |
| **线性 keynode** | `linear` | N步 → 成功/失败(提前终止) | 2 |
| **伏笔系列** | `foreshadow` | 2-3步 | 逐步升级 |

### 标志位系统

三种标志类型：
- **boolean** — 永久存储，手动清除
- **counter** — 累加至 max，阈值触发伏笔钩子
- **timer** — 设置后 N 个事件自动归零

### 调度优先级

```
0. 青训期 → 固定顺序
1. 系列进行中 → 子弹时间继续
1.5. 链式续接 → 上一系列完成后立即启动下一阶段
2. 减压模式 → 强制 LIGHT 直到 pressure ≤ 0
3. 伏笔钩子达阈值 → 启动伏笔系列
4. 因果事件 (已unlock+条件满足) → 60%概率优先
5. 可用系列 + 距上次系列≥5 → 40%概率触发
6. 等概率从独立事件池抽取
```

### 四级张力系统

| 张力 | 值 | 说明 |
|------|-----|------|
| LIGHT | -2 | 轻松 — 呼吸事件 |
| MILD | 1 | 轻度 — 普通独立事件 |
| MODERATE | 2-3 | 中度/偏重 — 系列事件 |
| HEAVY | 4 | 重度 — 大赛系列 |

---

## 文件结构

```
version 2.3/
├── index.html          # 主页面
├── index_debug.html    # Debug版页面 (含调试面板)
├── README.md           # 本文件
├── js/
│   ├── constants.js    # 常量 + 张力/类别/标志位注册表
│   ├── state.js        # 状态管理 + 存档兼容
│   ├── utils.js        # 工具函数
│   ├── animation.js    # 动画工具
│   ├── icons.js        # 图标管理
│   ├── flags.js        # 标志位管理模块
│   ├── ui.js           # UI渲染 (+/- 覆盖层 + 系列进度条)
│   ├── series.js       # 系列状态机
│   ├── events_data.js  # 事件数据 + 系列定义
│   ├── events.js       # 张力调度算法 + 条件评估
│   ├── timeline.js     # 时间线 (赛季分割线)
│   ├── ending.js       # 结局系统
│   ├── card.js         # 卡片交互 + 结果卡
│   ├── debug.js        # 调试面板
│   └── main.js         # 游戏入口
└── assets/
    ├── icons/          # 75 个通用图标 PNG
    └── player_icons/   # 11 个球星肖像 PNG
```

---

## 更新日志

### v2.3 (2026-06-16) — 资源精简
- 🧹 移除未使用的图标：`camera.png`、`wine.png`
- 🧹 移除备份文件：`events_data_v2.2_backup.js`
- 📝 图标数量从77→75（均为活跃使用）

### v2.2 (2026-06-15) — Hook/Flag 体系 Bug 修复

**关键修复：**
- 🐛 Timer 差一错误：`Flags.tick()` 移至标志位操作之前
- 🐛 `processHook` 死代码：集成到 `card.js:applyChoice` 中
- 🐛 `TENSION_NAMES` 缺失 tension=3 映射
- 🐛 `cup_final` 事件 totalSteps 不一致 (5→4)
- 🐛 `_continueSeries`/`advanceStep` 防御性边界守卫
- 🧹 移除重复 CSS flip 动画定义

### v2.1 (2026-06-14) — 结果卡系统
- 🃏 翻转结果卡：选择后原地切换为黑底结果模式
- 🗑️ 移除旧结算卡机制

### v2.0 (2026-06-13) — 事件系统全面重构
- 🔄 三级系列事件体系
- 🔗 标志位因果网络 (Flags模块)
- 📊 四级张力调度算法
- ➕ +/- 五档符号系统
