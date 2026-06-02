/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---- Paleta oficial Titi ----
        titi: {
          yellow: '#FFD93D',
          green: '#6BCB77',
          blue: '#4D96FF',
          red: '#FF6B6B',
          orange: '#FF9A3C',
          bg: '#FFFBF0',
          card: '#FFFFFF',
          border: '#F0E6C8',
          text: '#1A1A2E',
          muted: '#6B7280',
          dark: '#1A1A2E',
        },
        // Aliases neo-* → mapeados a Titi para que cualquier referencia legacy
        // (componentes que no se rediseñaron explícitamente) tome el nuevo tema.
        neo: {
          bg: '#FFFBF0',
          card: '#FFFFFF',
          accent: '#FFD93D',
          accentHover: '#FF9A3C',
          muted: '#6B7280',
          border: '#F0E6C8',
        },
      },
      fontFamily: {
        sans: [
          'Nunito',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        titi: '0 4px 14px rgba(26, 26, 46, 0.08)',
        'titi-lg': '0 10px 30px rgba(26, 26, 46, 0.12)',
        neo: '0 4px 14px rgba(26, 26, 46, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
