/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6DFF',
          container: '#D8E2FF',
          on: '#FFFFFF',
          'on-container': '#001A41',
        },
        secondary: {
          DEFAULT: '#575E71',
          container: '#DBE2F9',
          on: '#FFFFFF',
          'on-container': '#141B2C',
        },
        tertiary: {
          DEFAULT: '#725572',
          container: '#FDD8FC',
          on: '#FFFFFF',
          'on-container': '#291328',
        },
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
          on: '#FFFFFF',
          'on-container': '#410002',
        },
        surface: {
          DEFAULT: '#FDFBFF',
          variant: '#E0E2EC',
          on: '#1A1C1E',
          'on-variant': '#44474E',
          dim: '#DDDBE0',
          bright: '#FDFBFF',
        },
        outline: {
          DEFAULT: '#74777F',
          variant: '#C4C6D0',
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-lg': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'title-md': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'title-sm': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      borderRadius: {
        'md3-xs': '4px',
        'md3-sm': '8px',
        'md3-md': '12px',
        'md3-lg': '16px',
        'md3-xl': '28px',
        'md3-full': '9999px',
      },
      boxShadow: {
        'md3-0': '0 0 0 0 transparent',
        'md3-1': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'md3-2': '0 2px 8px 0 rgba(0,0,0,0.10), 0 1px 3px 0 rgba(0,0,0,0.06)',
        'md3-3': '0 4px 16px 0 rgba(0,0,0,0.12), 0 2px 6px 0 rgba(0,0,0,0.08)',
        'md3-4': '0 6px 24px 0 rgba(0,0,0,0.14), 0 3px 8px 0 rgba(0,0,0,0.10)',
        'md3-5': '0 8px 32px 0 rgba(0,0,0,0.16), 0 4px 12px 0 rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
