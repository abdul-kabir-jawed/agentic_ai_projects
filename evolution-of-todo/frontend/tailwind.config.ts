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
        cosmic: {
          dark: '#020617',
          slate: '#0f172a',
          indigo: '#312e81',
          purple: '#581c87',
          fuchsia: '#86198f',
          cyan: '#0891b2',
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #020617 0%, #1e1b4b 25%, #581c87 50%, #0c4a6e 75%, #020617 100%)',
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora-1': 'aurora-1 20s infinite alternate ease-in-out',
        'aurora-2': 'aurora-2 25s infinite alternate ease-in-out',
        'pulse-glow': 'pulse-glow 3s infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)' },
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
          '0%, 100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' },
        },
        breathe: {
          '0%, 100%': {
            transform: 'scale(1)',
            borderColor: 'rgba(34, 211, 238, 0.3)'
          },
          '50%': {
            transform: 'scale(1.02)',
            borderColor: 'rgba(192, 132, 252, 0.6)',
            boxShadow: '0 0 50px rgba(192, 132, 252, 0.2)'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
