import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        overlay: 'var(--bg-overlay)',
        hover: 'var(--bg-hover)',
        active: 'var(--bg-active)',
        input: 'var(--bg-input)',
        'activitybar-bg': 'var(--activitybar-bg)',
        'activitybar-icon': 'var(--activitybar-icon)',
        'activitybar-icon-active': 'var(--activitybar-icon-active)',
        'activitybar-badge': 'var(--activitybar-badge-bg)',
        'activitybar-badge-text': 'var(--activitybar-badge-text)',
        'sidepanel-bg': 'var(--sidepanel-bg)',
        'sidepanel-border': 'var(--sidepanel-border)',
        'sidepanel-header': 'var(--sidepanel-header)',
        'sidepanel-text': 'var(--sidepanel-text)',
        'statusbar-bg': 'var(--statusbar-bg)',
        'statusbar-text': 'var(--statusbar-text)',
        'titlebar-bg': 'var(--titlebar-bg)',
        'titlebar-text': 'var(--titlebar-text)',
        'editor-bg': 'var(--editor-bg)',
        'editor-text': 'var(--editor-text)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-yellow': 'var(--accent-yellow)',
        'accent-orange': 'var(--accent-orange)',
        'accent-red': 'var(--accent-red)',
        'accent-purple': 'var(--accent-purple)',
        panel: 'var(--panel-bg)',
        'panel-border': 'var(--panel-border)',
      },
      fontFamily: {
        ui: ['Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Cascadia Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: '11px',
        sm: '12px',
        md: '13px',
        lg: '14px',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        focus: 'var(--border-focus)',
      },
    },
  },
  plugins: [],
}

export default config
