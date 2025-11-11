// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
};

module.exports = {
    theme: {
        extend: {
            keyframes: {
                fadeInModal: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                fadeInModal: "fadeInModal 0.3s ease-out forwards", // ← forwards を必ず追加
            },
        },
    },
    plugins: [],
};


