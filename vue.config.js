module.exports = {
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableLegacy: true,
    },
  },
  pwa: {
    name: "MusicApp",
    themeColor: "#ff5e3a",
    manifestOptions: {
      short_name: "Music",
    },
  },
  publicPath: "/MusicApp/",
};
