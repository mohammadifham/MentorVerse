import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ['class'],
  theme: {
    extend: {
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top, rgba(139, 92, 246, 0.35), transparent 45%), radial-gradient(circle at right, rgba(59, 130, 246, 0.22), transparent 35%)'
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.28)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
