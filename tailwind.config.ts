import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0d0d1a',
          low: '#121220',
          mid: '#181828',
          high: '#1e1e2f',
          highest: '#242437',
          bright: '#2a2a3f',
          dim: '#0d0d1a',
        },
        primary: {
          DEFAULT: '#22d3ee',
          dim: '#1ad0eb',
          container: '#00cbe6',
        },
        secondary: {
          DEFAULT: '#6366f1',
          dim: '#6063ee',
          container: '#2f2ebe',
        },
        tertiary: {
          DEFAULT: '#a855f7',
          container: '#6f00be',
        },
        outline: {
          DEFAULT: '#757484',
          variant: '#474656',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #22d3ee, #6366f1)',
        'gradient-hero': 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.15) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
        'gradient-card': 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), rgba(99, 102, 241, 0.05))',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(34, 211, 238, 0.3)',
        'glow-secondary': '0 0 30px rgba(99, 102, 241, 0.3)',
        'glow-sm': '0 0 15px rgba(34, 211, 238, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 211, 238, 0.6)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
