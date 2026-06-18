# 足球生涯：抉择与传承 v1.4

## 📋 版本更新说明

### 🎯 v1.4 核心更新 — 球星肖像系统 & 特殊结局动画

本版本引入完整的球星肖像系统，11位足球巨星肖像集成到结局展示中，每位球员拥有专属主题色和卡片渐变背景。同时重构了特殊结局的动画流程，新增引导卡片翻转系统。

---

## 🚀 功能特性

### 核心玩法

- 左右滑动卡片做出选择
- 影响四个属性：财富、能力、团队、野心
- 达成不同结局：球王加冕、凡人图腾、惊鸿一瞥等

### 新增功能

- 📦 **本地存档**：游戏进度自动保存到浏览器
- 🔄 **继续游戏**：关闭后可继续上次进度
- 🎮 **键盘支持**：方向键或A/D键操作
- 🖼️ **球星肖像系统**：11位球星PNG肖像，用于特殊结局展示
- 🎨 **球员主题色系统**：每位球星独立主题色 + 卡片渐变背景
- 🃏 **引导卡片翻转**：特殊结局先展示引导卡片，点击翻转揭示结局
- ✨ **沉重翻转动画**：180度翻转拍下效果，极具冲击力

---

## 📁 文件结构

```
version 1.4/
├── index.html          # 主页面 (CSS + HTML)
├── js/
│   ├── constants.js    # 常量定义 + 初始状态
│   ├── state.js        # 状态管理 + 存档功能
│   ├── utils.js        # 工具函数
│   ├── animation.js    # 动画工具模块
│   ├── icons.js        # 图标管理 + emoji替换 + 预加载
│   ├── ui.js           # UI渲染
│   ├── events_data.js  # 事件数据
│   ├── events.js       # 事件系统 + 安全条件解析
│   ├── timeline.js     # 时间线
│   ├── ending.js       # 结局系统 (三层结局 + 球星模板 + 引导卡片翻转)
│   ├── card.js         # 卡片交互 + 自动保存
│   ├── debug.js        # 调试面板
│   └── main.js         # 游戏入口 + 图标预加载
├── assets/
│   ├── icons/          # 78个通用图标PNG (72x72)
│   │   ├── money.png, soccer.png, handshake.png, dart.png  (四属性图标)
│   │   ├── crown.png, trophy.png, star.png, diamond.png    (结局/声望图标)
│   │   └── ...
│   ├── player_icons/   # 11个球星肖像PNG (152px级) 🆕
│   │   ├── 梅西.png        (Lionel Messi)
│   │   ├── C罗.png         (Cristiano Ronaldo)
│   │   ├── 内马尔.png      (Neymar Jr.)
│   │   ├── 姆巴佩.png      (Kylian Mbappe)
│   │   ├── 小罗.png        (Ronaldinho)
│   │   ├── 贝克汉姆.png    (David Beckham)
│   │   ├── 瓦尔迪.png      (Jamie Vardy)
│   │   ├── 格策.png        (Mario Gotze)
│   │   ├── 阿里.png        (Dele Alli)
│   │   ├── 朴智星.png      (Park Ji-sung)
│   │   └── 巴洛特利.png    (Mario Balotelli)
└── README.md           # 本文件
```

---

## 🏗️ 结局系统架构 (v1.4 完全重写)

### 三层结局体系

| 层级 | 名称 | 触发条件 | 数量 |
|------|------|----------|------|
| 1 | 极端结局 | 四属性任一达到0或100 | 8 |
| 2 | 球星模板结局 | 极端结局 + 声望>=49 (大洲级以上) | 11 |
| 3 | 隐藏结局 | 特定条件组合 (球王/凡人/惊鸿) | 3 |

### 11位球星模板映射

| 球星 | 模板Key | 声望要求 | 触发属性 | 触发方向 | 结局标题 |
|------|---------|----------|----------|----------|----------|
| 内马尔 | `neymar` | >=81 世界级 | 能力 | MAX↑ | 折翼飞鸟 |
| 小罗 | `ronaldinho` | >=81 世界级 | 财富 | MIN↓ | 落魄精灵 |
| 贝克汉姆 | `beckham` | >=81 世界级 | 财富 | MAX↑ | 亿元弧线 |
| 姆巴佩 | `mbappe` | >=81 世界级 | 团队 | MIN↓ | 法兰西王 |
| C罗 | `ronaldo` | >=81 世界级 | 野心 | MAX↑ | 一念成魔 |
| 阿里 | `ali` | >=49 大洲级 | 能力 | MIN↓ | 江郎才尽 |
| 朴智星 | `park` | >=49 大洲级 | 团队 | MAX↑ | 豪门代价 |
| 巴洛特利 | `balotelli` | >=49 大洲级 | 野心 | MIN↓ | 何必认真 |
| 梅西 | `messi` | 球王隐藏条件 | — | — | 球王加冕 |
| 瓦尔迪 | `vardy` | 一人一城条件 | — | — | 凡人图腾 |
| 格策 | `gotze` | 惊鸿条件 | — | — | 惊鸿一瞥 |

---

## 🎨 球员主题色系统

每位球星拥有独立的主题色，影响结局卡片的视觉呈现：

| 球星 | 主题色 | 色值 | 卡片渐变 | 文字方案 |
|------|--------|------|----------|----------|
| 内马尔 | 天蓝色 | `#87CEEB` | `#B3E2F5→#87CEEB→#4A9DBF` | 深色 🔤 |
| 小罗 | 淡黄色 | `#FFF5BA` | `#FFF9D6→#FFF5BA→#C4B060` | 深色 🔤 |
| 贝克汉姆 | 黄色 | `#F1C40F` | `#F9E668→#F1C40F→#B8960F` | 深色 🔤 |
| 姆巴佩 | 墨绿色 | `#2E5E3E` | `#5A8A6A→#2E5E3E→#1A3020` | 白色 |
| C罗 | 深红色 | `#C41E3A` | `#E8556A→#C41E3A→#8B001F` | 白色 |
| 阿里 | 淡灰蓝色 | `#A8BED4` | `#C8D8E8→#A8BED4→#6A8A9F` | 深色 🔤 |
| 朴智星 | 淡草绿色 | `#A8D870` | `#C8E89A→#A8D870→#6A9A3E` | 深色 🔤 |
| 巴洛特利 | 浅红色 | `#F08080` | `#F5B0B0→#F08080→#B05050` | 深色 🔤 |
| 格策 | 紫罗兰色 | `#9B7FC0` | `#BBA8D8→#9B7FC0→#6A5090` | 白色 |
| 瓦尔迪 | 橘黄色 | `#E8922A` | `#F5B860→#E8922A→#B06018` | 深色 🔤 |
| 梅西 | 闪耀金色 | `#F5D940` | `#FFF3C8→#F5D940→#B8860B` | 白色 |

> 🔤 = 浅色背景球员，自动切换为深色文字以确保可读性

### 数据结构 (ending.js)

```javascript
// 球星肖像文件名映射
var PLAYER_ICON_MAP = {
    'messi': '梅西.png',
    'ronaldo': 'C罗.png',
    'neymar': '内马尔.png',
    // ... 共11个映射
};

// 球星主题色 (用于肖像光晕)
var PLAYER_COLOR_MAP = {
    'neymar': '#87CEEB',     // 天蓝色
    'ronaldo': '#C41E3A',    // 深红色
    'messi': '#F5D940',      // 闪耀金色
    // ...
};

// 球星卡片背景渐变 (160deg三阶渐变)
var PLAYER_GRADIENT_MAP = {
    'messi': 'linear-gradient(160deg, #FFF3C8, #F5D940, #B8860B)',
    // ...
};

// 浅色背景球员标记 (自动切换深色文字)
var PLAYER_IS_LIGHT = {
    'neymar': true,
    'ronaldinho': true,
    'beckham': true,
    'ali': true,
    'park': true,
    'balotelli': true,
    'vardy': true
};
```

---

## 🃏 特殊结局动画流程

### 普通结局 (无球星模板)

```
事件选项 → 结局卡片 → 左右滑动 → 时间线遮罩
```

- 结局卡片直接展示，使用通用配色 CSS class
- 肖像位置显示通用图标 (100px)
- 滑动后卡片飞出，遮罩层接入时间线

### 特殊结局 (有球星模板)

```
事件选项 → 引导卡片 → 点击翻转(沉重拍下) → 结局卡片 → 左右滑动 → 时间线遮罩
```

#### 引导卡片三层设计

| 类别 | 适用球员 | 背景 | 文字 | 光晕 |
|------|----------|------|------|------|
| **特殊结局** | 8极端 + 格策 | 黑色 `#1a1a2e→#000` | 白色 "特殊结局" | 红色 `rgba(220,40,40)` |
| **隐藏结局** | 瓦尔迪 | 白色 `#FFF→#D0D0D0` | 黑色 "隐藏结局" | 金色 `rgba(212,168,67)` |
| **最终结局** | 梅西 | 天蓝色 `#87CEEB→#0288D1` | 金色 "最终结局" | 金色 `rgba(212,168,67)` |

#### 引导卡片交互

1. **入场**：引导卡片以 enterCard 动画入场，标题带呼吸脉冲效果
2. **提示**：卡片底部显示闪烁小字「点击翻看结局」
3. **等待点击**：玩家点击卡片触发翻转，引导阶段禁止拖拽
4. **沉重翻转**：`cardSlamFlip` 动画 (0.9s)
   - 0–12%: 高高抬起 28px
   - 12–48%: 快速旋转至 90° 竖立，压扁至 76% 极薄
   - 48–54%: 在边缘短暂停顿，JS 切换为结局内容
   - 54–78%: 猛力旋转拍下 +22px，反弹至 105%
   - 78–100%: 回弹归位，沉重落定
5. **结局展示**：翻转完成后，结局卡片显示球星肖像 (152px) + 结局标题
6. **滑动时间线**：玩家左右滑动，卡片飞出，遮罩层显示时间线

#### 动画时序

```
t=0.0s  引导卡片入场
t=0.4s  → 等待玩家点击...
t=click 开始沉重翻转 (0.9s)
  t+0.46s  翻转中点 → 内容切换
  t+0.95s  翻转完成 → 允许滑动
t=swipe 卡片飞出 → 时间线遮罩
```

---

## 📐 图标尺寸体系

| 场景 | CSS 默认 | 实际尺寸 | 说明 |
|------|----------|----------|------|
| 普通事件图标 | `clamp(64px, 18vw, 105px)` | 响应式 | 紧凑不抢戏 |
| 通用结局肖像 (无模板) | `100px` | 固定 | CSS 默认 |
| 特殊结局肖像 (有模板) | `152px` | 内联覆盖 | JS 动态设置，视觉焦点 |
| 结局遮罩层图标 | `96px` | CSS | 圆形背景 + 肖像 |

---

## 🔧 技术改进

### ending.js 新增 API

```javascript
// 球星肖像文件名映射
PLAYER_ICON_MAP    // templateKey → 中文文件名

// 球星主题色
PLAYER_COLOR_MAP   // templateKey → hex颜色

// 球星卡片背景渐变
PLAYER_GRADIENT_MAP // templateKey → CSS gradient string

// 浅色背景标记
PLAYER_IS_LIGHT    // templateKey → boolean

// 引导卡片配置 (内部)
_getTeaserConfig(playerKey)        // → {title, bg, textColor, textGlow, glow}

// 结局内容渲染 (内部)
_renderEndingContent(playerTemplate, reason, title, subtitle, templateName)

// 结局遮罩层设置 (内部)
_setupEndingOverlay(playerTemplate, reason, title, subtitle)

// 引导卡片翻转序列 (内部)
_showTeaserSequence(playerTemplate, reason, title, subtitle)
```

### index.html 新增 CSS

```css
/* 浅色背景文字适配 */
.card.ending-card.player-light-bg .card-title       /* 深色标题 */
.card.ending-card.player-light-bg .card-description  /* 深色描述 */
.card.ending-card.player-light-bg .ending-glow-title /* 深色发光标题 */
.card.ending-card.player-light-bg .ending-draft-text /* 深色正文 */
.card.ending-card.player-light-bg .player-name-tag   /* 深色标签 */

/* 引导卡片 */
.teaser-content    /* 居中弹性布局 */
.teaser-title      /* 2.8rem 粗体，呼吸脉冲 */
.teaser-hint       /* 0.7rem 闪烁提示文字 */

/* 沉重翻转动画 */
.card.slam-flip    /* 0.9s cubic-bezier(0.35,0.15,0.15,1.0) */
@keyframes cardSlamFlip  /* 抬起→竖立→停顿→猛拍→回弹→落定 */
```

### card.js 新增守卫

```javascript
// 引导卡片阶段禁止拖动
if (s.gameOver && !s.isEndingPhase) return;
```

---

## 🎮 使用方法

1. **新游戏**：直接打开 `index.html`
2. **继续游戏**：有存档时会弹出对话框选择
3. **操作方式**：
   - 鼠标：拖拽卡片
   - 触屏：滑动卡片
   - 键盘：← → 或 A D 键
   - 特殊结局引导卡片：**点击**触发翻转

---

## 📊 版本对比

| 功能 | v1.3 | v1.4 |
|------|------|------|
| 球星肖像 | ❌ | ✅ 11位 PNG 肖像 |
| 球员主题色 | ❌ | ✅ 11色渐变系统 |
| 浅色背景适配 | ❌ | ✅ 自动深色文字 |
| 引导卡片翻转 | ❌ | ✅ 点击触发 |
| 沉重翻转动画 | ❌ | ✅ 0.9s 拍下动画 |
| 时间线滑动 | 翻转回场 | ✅ 简单飞出 |
| 图标尺寸分级 | 统一 | ✅ 三级尺寸体系 |
| 属性重命名 | 体质/名望/团队/情绪 | ✅ 财富/能力/团队/野心 |

---

## 📝 更新日志

### v1.4 (2026-06-11) — 球星肖像系统 & 特殊结局动画

**球星肖像系统：**

- 🖼️ 新增 `assets/player_icons/` 目录，包含11位足球巨星 PNG 肖像
- 🖼️ 新增 `PLAYER_ICON_MAP`：英文模板键 → 中文文件名映射
- 🖼️ 结局卡片肖像路径修复：`assets/players/` → `assets/player_icons/`
- 🖼️ 结局遮罩层图标改用实际球员肖像 (96px 圆形)

**球员主题色系统：**

- 🎨 新增 `PLAYER_COLOR_MAP`：11位球星独立主题色 hex
- 🎨 新增 `PLAYER_GRADIENT_MAP`：11条三阶 CSS 渐变 (浅→主题色→深)
- 🎨 结局卡片在匹配球星模板时，整体背景切换为球员专属渐变
- 🎨 浅色背景球员 (`PLAYER_IS_LIGHT`) 自动切换深色文字，确保可读性
- 🎨 肖像光晕使用球员主题色

**图标尺寸调整：**

- 📐 普通事件图标容器缩小：`clamp(80,22vw,150)` → `clamp(64,18vw,105)`
- 📐 通用结局肖像缩小：`128px` → `100px`
- 📐 特殊结局肖像加大：`128px` → `152px` (JS 内联覆盖)
- 📐 结局遮罩层图标：`64px` → `96px`
- 📐 响应式断点同步缩小

**特殊结局动画重构：**

- 🃏 新增引导卡片系统 (`_showTeaserSequence`)
- 🃏 三层引导卡片：特殊结局(黑卡+红光)、隐藏结局(白卡+金光)、最终结局(天蓝卡+金光)
- 🃏 引导卡片标题呼吸脉冲动画 + 底部提示文字「点击翻看结局」
- 🃏 点击触发翻转，非自动播放
- 🃏 新增 `cardSlamFlip` 沉重翻转动画 (0.9s)
  - 抬起 28px → 竖立压扁至 76% → 停顿 → 猛拍 +22px → 回弹归位
- 🃏 翻转期间 `pointer-events: none` 防误触
- 🃏 `card.js` 新增守卫：引导阶段 `gameOver && !isEndingPhase` 禁止拖拽

**时间线滑动简化：**

- 🔄 `handleFly()` 移除返回翻转 (`ending-flip`)
- 🔄 结局卡片滑动后直接飞出屏幕 → 遮罩层淡入
- 🔄 简洁左右滑动逻辑，不再发生二次翻转

**球员颜色调整：**

- 🎨 贝克汉姆：红色 → **黄色**
- 🎨 姆巴佩：深蓝色 → **墨绿色**
- 🎨 瓦尔迪：宝蓝色 → **橘黄色**
- 🎨 梅西：青铜金 → **闪耀金黄色** `#FFF3C8→#F5D940→#B8860B`

**代码重构：**

- 📦 `ending.js` 提取共享函数：`_renderEndingContent()`、`_setupEndingOverlay()`
- 📦 `_loadEndingCard()` 分流：有模板 → `_showTeaserSequence()`，无模板 → 直接展示
- 📦 消除重复代码，两条路径共享核心渲染逻辑

### v1.3.1 (2026-06-11) — UI深度优化

- 🎨 布局重构：属性面板置顶，年龄/赛季移至卡片下方
- 🖼️ Emoji 本地化：77个 Twemoji PNG，跨平台一致
- ⚡ 图标预加载系统
- ✨ 本地存储 + 继续游戏 + 自动保存

### v1.2

- 🎮 基础游戏功能
- 🎨 卡片滑动交互
- 📊 属性系统
- 🏆 结局系统
