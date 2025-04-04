/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark_1: "#04152d",
        dark_2: "#041226",
        dark_3: "#020c1b",
        dark_lighter: "#1c4b91",
        dark_light: "#173d77",
      },

      backgroundImage: {
        "app-theme": "linear-gradient(98.37deg, #f89e00 0.99%, #da2f68 100%)",
      },
      width: {
        "full-100px": "calc(100% - 100px)",
        "full-150px": "calc(100% - 150px)",
        "50%-5px": "calc(50% - 5px)",
        "25%-15px": "calc(25% - 15px)",
        "20%-16px": "calc(20% - 16px)",
      },
      keyframes: {
        mobileMenu: {
          "0%": {
            transform: "translateY(-130%)",
          },
          "100%": {
            transform: "translateY(0)",
          },
        },
        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        rotate: {
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        dash: {
          "0%": {
            strokeDasharray: "1, 150",
            strokeDashoffset: "0",
          },
          "50%": {
            strokeDasharray: "90, 150",
            strokeDashoffset: "-35",
          },
          "100%": {
            strokeDasharray: "90, 150",
            strokeDashoffset: "-124",
          },
        },
      },
    },
  },
  plugins: [],
};
