/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        system: {
          bg: '#070A10',
          card: '#0D121F',
          border: '#1E293B',
          neon: '#00F0FF',
          purple: '#8B5CF6',
          gold: '#F59E0B',
          rankE: '#94A3B8',
          rankD: '#22C55E',
          rankC: '#3B82F6',
          rankB: '#A855F7',
          rankA: '#EF4444',
          rankS: '#F59E0B',
        },
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'system-glow': '0 0 20px rgba(0, 240, 255, 0.35)',
        'purple-glow': '0 0 20px rgba(139, 92, 246, 0.35)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};
