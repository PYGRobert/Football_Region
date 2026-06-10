# 足球生涯：抉择与传承 v1.3

## 📋 版本更新说明

### 🎯 高优先级优化（已完成）

#### 1. 本地存储功能 ✅
- **自动保存**：每次做出选择后自动保存游戏进度
- **继续游戏**：启动游戏时检测存档，可选择继续或新游戏
- **存档管理**：支持保存、加载、删除存档
- **数据验证**：加载时验证存档完整性

#### 2. DOM操作优化 ✅
- **重复代码修复**：card.js中的颜色判断从4行简化为1行
- **代码简化**：使用 `card.classList.add(event.color)` 替代多重if判断

#### 3. 用户体验提升 ✅
- **继续游戏对话框**：美观的UI界面，显示存档信息
- **一键操作**：点击按钮即可继续或开始新游戏
- **动画效果**：对话框淡入动画

---

## 🚀 功能特性

### 核心玩法
- 左右滑动卡片做出选择
- 影响四个属性：体质、名望、团队、情绪
- 达成不同结局：球王加冕、大明星、城市英雄等

### 新增功能
- 📦 **本地存档**：游戏进度自动保存到浏览器
- 🔄 **继续游戏**：关闭后可继续上次进度
- 🎮 **键盘支持**：方向键或A/D键操作

---

## 📁 文件结构

```
version 1.3/
├── index.html          # 主页面
├── js/
│   ├── constants.js    # 常量定义
│   ├── state.js        # 状态管理 + 存档功能
│   ├── utils.js        # 工具函数
│   ├── animation.js    # 动画工具模块
│   ├── icons.js        # 图标管理 + emoji替换 + 预加载 ⭐
│   ├── ui.js           # UI渲染
│   ├── events_data.js  # 事件数据（icon字段已本地化）
│   ├── events.js       # 事件系统 + 安全条件解析
│   ├── timeline.js     # 时间线（支持emoji替换）
│   ├── ending.js       # 结局系统
│   ├── card.js         # 卡片交互 + 自动保存 + rAF动画
│   └── main.js         # 游戏入口 + 图标预加载
├── assets/
│   └── icons/          # 77个Twemoji PNG图标（72x72）
│       ├── arrow_left.png    # 👈 新增
│       ├── arrow_right.png   # 👉 新增
│       ├── lock.png          # 🔒 新增
│       ├── calendar.png      # 📅 新增
│       └── ... (73个原有图标)
└── README.md           # 本文件
```

---

## 🔧 技术改进

### state.js 新增API
```javascript
// 保存游戏
State.save() → boolean

// 加载游戏
State.load() → boolean

// 检查存档
State.hasSave() → boolean

// 删除存档
State.deleteSave()

// 获取存档信息
State.getSaveInfo() → { version, timestamp, age, season, fame }
```

### card.js 优化
```javascript
// 修复前（4行）
if (event.color === 'gold') card.classList.add('gold');
else if (event.color === 'special') card.classList.add('special');
else if (event.color === 'dark') card.classList.add('dark');

// 修复后（1行）
card.classList.add(event.color);
```

### events.js 条件系统
```javascript
// 旧方式（不安全）
ev.conditionFn = new Function('s', 'return ' + ev.condition);

// 新方式（安全）
ev.conditionFn = _parseCondition(ev.condition);
// 支持的操作符: <, >, <=, >=, ==, !=
// 支持的状态: s.age, s.fame, s.physical, s.team, s.mood, s.season
```

### animation.js API
```javascript
// 执行动画
Animation.animate(id, callback, duration, easingFn) → Promise

// 取消动画
Animation.cancel(id)
Animation.cancelAll()

// 检查动画状态
Animation.isRunning(id) → boolean

// 缓动函数
Animation.easing.easeOutCubic(t)
Animation.easing.easeInCubic(t)
Animation.easing.easeInOutCubic(t)
Animation.easing.easeOutElastic(t)

// 工具函数
Animation.utils.lerp(start, end, t)
Animation.utils.delay(ms)
```

### icons.js API
```javascript
// 获取事件图标（本地PNG）
Icons.getEventIconById(eventId, size) → string (img HTML)

// 获取结局图标（本地PNG）
Icons.getEndingIcon(reason, size) → string (img HTML)

// 获取属性图标（本地PNG）
Icons.getStatIcon(name, size) → string (img HTML)

// UI便捷方法
Icons.getArrowLeft(size) → string
Icons.getArrowRight(size) → string
Icons.getLockIcon(size) → string
Icons.getCalendarIcon(size) → string

// 将文本中emoji替换为本地图片
Icons.replaceEmoji(text, size) → string (HTML)

// 预加载所有图标到浏览器缓存
Icons.preloadIcons() → Promise<void>
```

---

## 🎮 使用方法

1. **新游戏**：直接打开 `index.html`
2. **继续游戏**：有存档时会弹出对话框选择
3. **操作方式**：
   - 鼠标：拖拽卡片
   - 触屏：滑动卡片
   - 键盘：← → 或 A D 键

---

## 📊 对比 v1.2

| 功能 | v1.2 | v1.3 |
|------|------|------|
| 本地存储 | ❌ | ✅ |
| 继续游戏 | ❌ | ✅ |
| 自动保存 | ❌ | ✅ |
| 安全条件解析 | ❌ | ✅ |
| 动画性能优化 | ❌ | ✅ |
| 代码优化 | 基础 | 改进 |

---

### 🟡 中优先级优化（已完成）

#### 4. 事件系统重构 ✅
- **安全条件解析**：移除 `new Function()`，使用配置式条件系统
- **操作符支持**：`<`, `>`, `<=`, `>=`, `==`, `!=`
- **状态属性**：`s.age`, `s.fame`, `s.physical`, `s.team`, `s.mood`, `s.season`
- **复合条件**：支持 `&&` 连接的多个条件

#### 5. 动画性能优化 ✅
- **requestAnimationFrame**：新增 `animation.js` 动画工具模块
- **缓动函数**：提供 `easeOutCubic`, `easeInCubic`, `easeInOutCubic`, `easeOutElastic`
- **动画队列**：支持动画取消、状态查询
- **Promise支持**：动画完成时返回Promise

---

## 🔮 后续优化计划

### 中优先级
- [x] 事件系统重构（安全性）✅
- [x] 动画性能优化（requestAnimationFrame）✅
- [ ] 统一错误处理

### 低优先级
- [ ] 音效系统
- [ ] 数据可视化
- [ ] 单元测试

---

## 💡 视觉优化建议

### 已实施优化
1. ✅ 属性配色优化 - 体质与名望颜色区分度更高
2. ✅ 结局卡片优化 - 底部遮罩增强文字可读性
3. ✅ 渐变方向调整 - 底部颜色更深，避免与白色文字冲突

### 进一步优化建议

#### 1. 属性面板增强
```css
/* 为每个属性添加对应颜色的图标 */
.stat-icon.physical svg { fill: #e74c3c; }
.stat-icon.fame svg { fill: #f1c40f; }
.stat-icon.team svg { fill: #3498db; }
.stat-icon.mood svg { fill: #9b59b6; }
```

#### 2. 卡片交互反馈
```css
/* 滑动时添加颜色反馈 */
.card.swiping-left { box-shadow: 10px 0 30px rgba(231,76,60,0.3); }
.card.swiping-right { box-shadow: -10px 0 30px rgba(46,204,113,0.3); }
```

#### 3. 结局卡片增强
- 添加粒子效果背景
- 使用更复杂的渐变（径向+线性）
- 添加微妙的动画效果

#### 4. 属性变化动画
```css
/* 数值变化时的脉冲效果 */
.stat-bar-inner.changed {
    animation: statPulse 0.5s ease-out;
}
@keyframes statPulse {
    0% { filter: brightness(1.5); }
    100% { filter: brightness(1); }
}
```

#### 5. 主题系统
- 支持深色/浅色主题切换
- 根据时间自动切换主题
- 用户自定义主题色

#### 6. 微交互动画
- 属性条变化时的弹性动画
- 卡片出现时的错落动画
- 里程碑达成时的庆祝动画

#### 7. 数据可视化
- 雷达图显示四维属性
- 折线图显示属性变化趋势
- 时间线回顾时的统计图表

#### 8. 无障碍优化
- 添加高对比度模式
- 支持屏幕阅读器
- 键盘导航优化

---

## 📝 更新日志

### v1.3.1 (2026-06-11) — UI深度优化

**布局重构：**
- 🎨 将年龄/赛季信息栏从顶部移至卡片下方，属性面板保留在顶部，参考Reigns布局
- 🎨 布局顺序：[属性面板] → [卡片主体] → [年龄/赛季] → [滑动提示]
- 🎨 卡片图标放大至 `clamp(80px, 22vw, 130px)`，视觉重心更突出
- 🎨 卡片内部间距优化，图标获得更多展示空间
- 🎨 底部面板（属性+信息栏）统一管理，层次更清晰

**Emoji本地化：**
- 🖼️ 新增4个Twemoji图标：`arrow_left.png`、`arrow_right.png`、`lock.png`、`calendar.png`
- 🖼️ `icons.js` 新增 `EMOJI_TO_FILE` 映射表，覆盖所有UI中使用的emoji字符
- 🖼️ `icons.js` 新增 `replaceEmoji(text, size)` 函数，自动将文本中emoji替换为本地图标
- 🖼️ `icons.js` 新增 `preloadIcons()` 函数，游戏启动时预加载所有图标到浏览器缓存
- 🖼️ `getStatIcon()` 从返回emoji字符改为返回本地图片 `<img>` 标签
- 🖼️ 新增便捷方法：`getArrowLeft()`、`getArrowRight()`、`getLockIcon()`、`getCalendarIcon()`
- 🖼️ 滑动提示箭头（👈👉）替换为本地 `arrow_left.png` / `arrow_right.png`
- 🖼️ Toast通知中的emoji（🔒📅等）通过 `replaceEmoji()` 替换为本地图标
- 🖼️ 里程碑文本中的emoji在显示时自动替换
- 🖼️ 时间线回顾中的emoji通过 `replaceEmoji()` 替换
- 🖼️ 属性图标（💪⭐🤝❤）替换为本地 `muscle.png`/`star.png`/`handshake.png`/`heart.png`
- 🖼️ `events_data.js` 所有事件 `icon` 字段从emoji字符替换为本地PNG文件名

**对齐与细节优化：**
- 🎯 卡片图标容器添加 `display:flex; align-items:center; justify-content:center;`
- 🎯 卡片标题添加 `text-align:center; width:100%;`
- 🎯 卡片描述区域添加 `justify-content:center;`
- 🎯 属性图标 `<img>` 添加 `display:block;` 消除行内元素基线间隙
- 🎯 Toast消息改为 `innerHTML` 渲染以支持图片标签
- 🎯 滑动提示箭头改为 `<img>` 标签，添加 `display:block;` 对齐

**图标预加载：**
- ⚡ 游戏启动时调用 `Icons.preloadIcons()` 预加载全部77个图标文件
- ⚡ 使用 `new Image()` 将所有PNG加载到浏览器缓存
- ⚡ 首张卡片显示时图标已缓存，无加载延迟
- ⚡ 3秒安全超时，网络不佳时也不阻塞游戏启动
**功能优化：**
- ✨ 新增本地存储功能
- ✨ 新增继续游戏对话框
- ✨ 新增自动保存机制
- ✨ 保存并恢复当前事件（pendingEvent）
- ✨ 新增 animation.js 动画工具模块
- ✨ 事件系统重构：安全条件解析（移除 new Function）
- ✨ 动画性能优化：使用 requestAnimationFrame
- ✨ 新增 icons.js SVG图标系统（跨平台一致性）
- ✨ UI全面优化：顶部信息栏、属性面板、卡片样式

**UI/视觉优化：**
- 🎨 顶部信息栏：紧凑设计，赛季右对齐，圆润字体
- 🎨 属性面板：与卡片宽度统一，颜色区分度更高
  - 体质：深红→橙红（热血、体力）
  - 名望：纯金→亮金（荣誉、光芒）
  - 团队：蓝绿（协作、信任）
  - 情绪：紫粉（活力、热情）
- 🎨 卡片样式：去掉边框，响应式适配
- 🎨 结局卡片：底部遮罩增强文字可读性，渐变方向优化
- 🎨 Twemoji图标：本地存储75个高质量emoji图片，跨平台完全一致，无需联网
- 🎨 字体优化：使用微软雅黑等圆润字体
- 🎨 响应式设计：自动适配不同屏幕尺寸

**Bug修复：**
- 🐛 修复card.js重复代码
- 🐛 修复继续游戏后事件不正确的问题
- 🐛 修复保存时机：现在保存的是新加载的事件，而不是已滑走的事件
- 📝 完善代码注释

### v1.2
- 🎮 基础游戏功能
- 🎨 卡片滑动交互
- 📊 属性系统
- 🏆 结局系统
