# Theme Design - 深色主题规范

## 配色系统

### 语义化颜色令牌

```css
:root {
  /* 背景层级 */
  --bg-primary: #0a0a0f;        /* 主背景 - 最深 */
  --bg-secondary: #12121a;      /* 次级背景 - 卡片/面板 */
  --bg-tertiary: #1a1a24;       /* 三级背景 - 输入框/hover */
  --bg-elevated: #22222e;       /* 提升背景 - 弹窗/下拉 */

  /* 边框 */
  --border-default: #2a2a3a;   /* 默认边框 */
  --border-hover: #3a3a4a;     /* hover 边框 */
  --border-focus: #6366f1;     /* focus 边框 - 主色调 */

  /* 主色调 - Indigo */
  --primary: #6366f1;           /* 主色 */
  --primary-hover: #818cf8;     /* 主色 hover */
  --primary-foreground: #ffffff; /* 主色文字 */

  /* 辅助色 - 成功/警告/错误 */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* 文本 */
  --text-primary: #f4f4f5;       /* 主要文本 */
  --text-secondary: #a1a1aa;    /* 次要文本 */
  --text-muted: #71717a;       /* 弱化文本 */
  --text-disabled: #52525b;     /* 禁用文本 */

  /* 状态 */
  --ring: #6366f1;              /* 焦点环 */
}
```

## 字体系统

### 字体族

```css
--font-sans: "Inter", "Noto Sans SC", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### 字体尺寸

```css
--text-xs: 0.75rem;    /* 12px - 标签/提示 */
--text-sm: 0.875rem;   /* 14px - 次要文本 */
--text-base: 1rem;     /* 16px - 正文 */
--text-lg: 1.125rem;   /* 18px - 标题 h3 */
--text-xl: 1.25rem;    /* 20px - 标题 h2 */
--text-2xl: 1.5rem;    /* 24px - 标题 h1 */
```

### 字重

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 间距系统

基于 4px 网格:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

## 圆角

```css
--radius-sm: 0.375rem;  /* 6px - 小元素 */
--radius-md: 0.5rem;    /* 8px - 默认 */
--radius-lg: 0.75rem;   /* 12px - 卡片 */
--radius-xl: 1rem;      /* 16px - 大卡片 */
```

## 阴影

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
```

## 过渡动画

```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

## Tailwind 配置

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a24',
          elevated: '#22222e',
        },
        border: {
          DEFAULT: '#2a2a3a',
          hover: '#3a3a4a',
          focus: '#6366f1',
        },
        primary: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          foreground: '#ffffff',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
          disabled: '#52525b',
        },
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
```