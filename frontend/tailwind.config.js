export default {
  darkMode: 'class',
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{js,jsx}']
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
