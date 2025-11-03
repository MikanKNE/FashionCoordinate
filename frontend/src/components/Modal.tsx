import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    width?: string; // e.g. "max-w-lg"
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = "max-w-lg",
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className={`bg-white rounded-2xl shadow-lg w-full ${width} mx-4 p-6 relative`}
            >
                {/* 閉じるボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                {/* タイトル */}
                {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

                {/* コンテンツ */}
                <div className="mb-4">{children}</div>

                {/* フッター（ボタンなど） */}
                {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
}
