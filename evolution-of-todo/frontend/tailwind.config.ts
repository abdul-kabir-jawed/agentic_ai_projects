import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian & Gold Theme
        void: '#08080a',
        deep: '#0c0c0f',
        surface: '#111115',
        elevated: '#18181d',
        card: '#1c1c22',
        gold: {
          DEFAULT: '#c9a962',
          bright: '#e4c77b',
          dim: '#9a7d3a',
        },
        rose: {
          DEFAULT: '#b76e79',
          bright: '#d4919b',
        },
        text: {
          primary: '#f5f5f7',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'mesh': `
          radial-gradient(ellipse 80% 50% at 20% -10%, rgba(201, 169, 98, 0.08), transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 110%, rgba(183, 110, 121, 0.06), transparent 50%)
        `,
        'gold-gradient': 'linear-gradient(135deg, #c9a962 0%, #e4c77b 100%)',
        'rose-gradient': 'linear-gradient(135deg, #b76e79 0%, #d4919b 100%)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 4s infinite',
        'scroll': 'scroll 40s linear infinite',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-1': 'aurora-1 20s infinite alternate ease-in-out',
        'aurora-2': 'aurora-2 25s infinite alternate ease-in-out',
        'pulse-glow': 'pulse-glow 3s infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
        'check': 'check 0.4s ease-out forwards',
        'ripple': 'ripple 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'aurora-1': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0.6' },
          '50%': { transform: 'translate(20%, 20%) rotate(10deg)', opacity: '0.8' },
        },
        'aurora-2': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '0.5' },
          '50%': { transform: 'translate(-20%, 10%) rotate(-10deg)', opacity: '0.7' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(201, 169, 98, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(201, 169, 98, 0.5)' },
        },
        breathe: {
          '0%, 100%': {
            transform: 'scale(1)',
            borderColor: 'rgba(201, 169, 98, 0.3)',
          },
          '50%': {
            transform: 'scale(1.02)',
            borderColor: 'rgba(228, 199, 123, 0.6)',
            boxShadow: '0 0 50px rgba(228, 199, 123, 0.2)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
        check: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(201, 169, 98, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(201, 169, 98, 0.6)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pop: {
          '0%': { transform: 'translate(0, 0) scale(0)', opacity: '1' },
          '100%': { transform: 'translate(var(--tx), var(--ty)) scale(1)', opacity: '0' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 169, 98, 0.3)',
        'gold-lg': '0 0 40px rgba(201, 169, 98, 0.4)',
        'rose': '0 0 20px rgba(183, 110, 121, 0.3)',
        'inner-gold': 'inset 0 0 20px rgba(201, 169, 98, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
