// frontend/src/components/ui/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    className = "",
    ...props
}) => {
    const baseStyle =
        "px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none w-full";

    const variants = {
        primary: `
        bg-blue-100 text-blue-900
        hover:bg-blue-300
        dark:bg-slate-800 dark:text-white dark:hover:bg-slate-600
    `,
        secondary: `
        bg-gray-100 text-gray-800
        hover:bg-gray-300
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-500
    `,
        danger: `
        bg-red-100 text-red-900
        hover:bg-red-300
        dark:bg-red-600 dark:text-white dark:hover:bg-red-500
    `,
    };


    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
