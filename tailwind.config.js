/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        myGreen: "#98D98E",
        myGray: "#D3D3D3",
        myWhite: "#FEFEFE",
        myBackGround: "#F5F5F5",
        primary: "#1E3A8A", // Example color
        secondary: "#FBBF24", // Example color
        // 日间模式颜色
        'day-primary': '#ffffff',
        'day-secondary': '#f0f0f0',
        'day-text': '#333333',
        
        // 夜间模式颜色
        myBG: '#07070F',
        mySpan: '#2D2C34',
        myPriFont: '#FFFFFF',
        mySecFont: '#9696A0',
        myButton: '#5E5BE6',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
}