export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-subtle': 'var(--bg-subtle)',
        'border': 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent-blue': 'var(--accent-blue)',
        'accent-orange': 'var(--accent-orange)',
        'success': 'var(--success)',
        'danger': 'var(--danger)',
        'warning': 'var(--warning)',
        'ai-purple': 'var(--ai-purple)'
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
