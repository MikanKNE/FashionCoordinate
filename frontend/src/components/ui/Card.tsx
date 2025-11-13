// frontend/src/components/ui/Card.tsx
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
}

export default function Card({ children, className = "", ...props }: CardProps) {
    return (
        <div
            className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow p-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
