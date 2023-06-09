module.exports = {
  purge: { content: ["./public/**/*.html", "./src/**/*.vue"] },
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        bgSong: '#1E2223', // Добавление нового цвета 'customColor'
        bgGenre: '#2176FF',
        bgUploadBy: '#5f7997d9',
        bgName: '#407c98d9'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
],
content: [
  "./node_modules/flowbite/**/*.js"
]
};
