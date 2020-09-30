const backup = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    extend: {
      fontFamily: {
        display: "'Oswald', " + backup,
        body: "'Lato', " + backup
      },
      maxWidth: {
        '7xl': '84rem',
        '8xl': '96rem',
      }
    },
  },
  variants: {},
  plugins: [],
}
