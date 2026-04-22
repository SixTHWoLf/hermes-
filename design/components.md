# Components - 组件设计规范

## 表单组件

### Input 输入框

**用途**: 单行文本输入

**规格**:
- 高度: 40px
- 内边距: 12px horizontal
- 边框: 1px solid var(--border-default)
- 圆角: var(--radius-md)
- 背景: var(--bg-tertiary)

**状态**:
| 状态 | 边框颜色 | 背景色 | 说明 |
|------|----------|--------|------|
| Default | #2a2a3a | #1a1a24 | - |
| Hover | #3a3a4a | #1a1a24 | 边框变亮 |
| Focus | #6366f1 | #1a1a24 | 主色边框 + ring |
| Disabled | #2a2a3a | #12121a | 50% 透明度 |
| Error | #ef4444 | #1a1a24 | 红色边框 |

**代码示例**:
```tsx
<Input
  placeholder="输入 API Key"
  type="password"
  error={errors.apiKey}
/>
```

### Select 选择器

**用途**: 下拉选择

**规格**:
- 与 Input 相同尺寸
- 右侧箭头图标 (ChevronDown)
- 下拉面板: bg-elevated, 阴影-lg

**状态**:
| 状态 | 说明 |
|------|------|
| Default | 正常显示 |
| Open | 旋转箭头，显示下拉 |
| Disabled | 50% 透明度 |

### Switch 开关

**用途**: 布尔值切换

**规格**:
- 宽度: 44px
- 高度: 24px
- 圆角: 12px (full rounded)

**状态**:
| 状态 | 轨道颜色 | 滑块位置 |
|------|----------|----------|
| Off | #3a3a4a | left |
| On | #6366f1 | right |
| Disabled | #2a2a3a | - |

### Slider 滑块

**用途**: 数值范围选择

**规格**:
- 轨道高度: 4px
- 滑块尺寸: 16px
- 主色填充轨道

### Textarea 多行文本

**用途**: 多行文本输入

**规格**:
- 最小高度: 80px
- 与 Input 相同的样式

### Button 按钮

**规格**:
- 高度: 40px (md), 32px (sm), 48px (lg)
- 内边距: 16px horizontal
- 圆角: var(--radius-md)

**变体**:
| 变体 | 背景色 | 文字色 | 边框 |
|------|--------|--------|------|
| Primary | #6366f1 | #ffffff | none |
| Secondary | transparent | #f4f4f5 | 1px #2a2a3a |
| Ghost | transparent | #a1a1aa | none |
| Destructive | #ef4444 | #ffffff | none |

**状态**:
| 状态 | 效果 |
|------|------|
| Hover | 明度 +10% |
| Active | 明度 -5% |
| Disabled | 50% 透明度 |
| Loading | 显示 spinner |

**图标按钮**:
- 尺寸: 40px × 40px
- 圆角: var(--radius-md)

### FormField 表单字段

**布局**:
```
┌─────────────────────────────────────────┐
│ Label                          [?] [i]  │
│ ─────────────────────────────────────── │
│ Input/Select/Slider                     │
│ ─────────────────────────────────────── │
│ Helper text or Error message            │
└─────────────────────────────────────────┘
```

## 展示组件

### Card 卡片

**用途**: 分组展示配置项

**规格**:
- 内边距: 24px
- 背景: var(--bg-secondary)
- 边框: 1px solid var(--border-default)
- 圆角: var(--radius-lg)
- 阴影: var(--shadow-sm)

### Badge 标签

**用途**: 状态标记

**规格**:
- 内边距: 4px 8px
- 圆角: var(--radius-sm)
- 字号: var(--text-xs)

**变体**:
| 变体 | 背景色 | 文字色 |
|------|--------|--------|
| Default | #2a2a3a | #a1a1aa |
| Primary | #6366f1/20 | #818cf8 |
| Success | #22c55e/20 | #22c55e |
| Warning | #f59e0b/20 | #f59e0b |
| Error | #ef4444/20 | #ef4444 |

### Tooltip 提示

**用途**: 额外信息

**规格**:
- 背景: var(--bg-elevated)
- 文字: var(--text-secondary)
- 字号: var(--text-sm)
- 圆角: var(--radius-sm)
- 阴影: var(--shadow-md)
- 延迟: 300ms

### Accordion 手风琴

**用途**: 可折叠配置组

**规格**:
- 标题高度: 48px
- 展开图标: ChevronDown (旋转 180°)
- 内容区内边距: 16px

## 反馈组件

### Alert 提示

**用途**: 重要信息展示

**规格**:
- 内边距: 16px
- 圆角: var(--radius-md)
- 图标 + 标题 + 描述

**变体**:
| 变体 | 边框颜色 | 图标 |
|------|----------|------|
| Info | #3b82f6 | Info |
| Success | #22c55e | CheckCircle |
| Warning | #f59e0b | AlertTriangle |
| Error | #ef4444 | XCircle |

### Dialog 对话框

**用途**: 确认/编辑操作

**规格**:
- 宽度: 480px (sm), 640px (md), 800px (lg)
- 内边距: 24px
- 背景: var(--bg-secondary)
- 圆角: var(--radius-xl)
- 遮罩: black/50%

### Toast 通知

**用途**: 操作反馈

**规格**:
- 位置: 右下角
- 宽度: 360px
- 圆角: var(--radius-lg)
- 自动消失: 5s

## 导航组件

### Tabs 标签页

**用途**: 切换子配置

**规格**:
- 标签内边距: 12px 16px
- 选中下划线: 2px solid #6366f1
- 文字: var(--text-secondary) → var(--text-primary)

### SidebarNav 侧边导航

**用途**: 模块切换

**规格**:
- 宽度: 200px
- 项目高度: 40px
- 选中: 背景 var(--bg-tertiary), 左侧 2px 主色

## 高级组件

### ConfigPreview 配置预览

**用途**: 显示 YAML/JSON 配置预览

**规格**:
- 背景: var(--bg-primary)
- 字体: monospace
- 边框: 1px solid var(--border-default)
- 圆角: var(--radius-md)
- 内边距: 16px

### DiffView 变更对比

**用途**: 显示配置变更

**规格**:
- 新增行: #22c55e/20 背景
- 删除行: #ef4444/20 背景
- 修改行: #f59e0b/20 背景

### EmptyState 空状态

**用途**: 无数据时展示

**规格**:
- 图标: 64px
- 标题: var(--text-lg)
- 描述: var(--text-secondary)
- 可选操作按钮