// frontend/src/components/ConfirmDeleteModal.tsx
import React from "react";
import { Button } from "./ui/Button";

interface Props {
    isOpen: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<Props> = ({
    isOpen,
    title = "本当に削除しますか？",
    description,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        // 背景（ここをクリックしたらキャンセル）
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
            onClick={onCancel}
        >
            {/* モーダル本体（クリック伝播を止める） */}
            <div
                className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-lg w-80 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-gray-800 dark:text-gray-100 mb-2 text-lg font-semibold">
                    {title}
                </p>

                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-4 whitespace-pre-line">
                        {description}
                    </p>
                )}

                <div className="flex gap-3 mt-4">
                    <Button
                        variant="danger"
                        className="flex-1"
                        onClick={onConfirm}
                    >
                        削除する
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={onCancel}
                    >
                        キャンセル
                    </Button>
                </div>
            </div>
        </div>
    );
};
