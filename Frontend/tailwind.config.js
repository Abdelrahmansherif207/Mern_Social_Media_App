import { heroui } from "@heroui/react";
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            colors: {
                cream: {
                    50: "#fafaf9",
                    100: "#f5f5f4",
                    200: "#e7e5e4",
                    300: "#d6d3d1",
                    400: "#a8a29e",
                    500: "#78716c",
                    600: "#57534e",
                    700: "#44403c",
                    800: "#292524",
                    900: "#1c1917",
                },
            },
            animation: {
                happyBounce: "happyBounce 1s ease-in-out",
                pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "spin-slow": "spin 2s linear infinite",
            },
            keyframes: {
                happyBounce: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-3px)" },
                },
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
};
