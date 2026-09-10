/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        'nc-bg': 'hsl(var(--nc-bg))',
        'nc-card': 'hsl(var(--nc-card))',
        'nc-ink': 'hsl(var(--nc-ink))',
        'nc-ink-soft': 'hsl(var(--nc-ink-soft))',
        'nc-muted': 'hsl(var(--nc-muted))',
        'nc-border': 'hsl(var(--nc-border))',
        'nc-green': 'hsl(var(--nc-green))',
        'nc-green-dark': 'hsl(var(--nc-green-dark))',
        'nc-beige': 'hsl(var(--nc-beige))',
        'nc-blue': 'hsl(var(--nc-blue))',
        'nc-blue-dark': 'hsl(var(--nc-blue-dark))',
        'nc-peach': 'hsl(var(--nc-peach))',
      },
    },
  },
  plugins: [],
};
