// frontend/src/components/ConfirmDeleteModal.tsx
import React from "react";
import { Button } from "./ui/Button";

interface Props {
    isOpen: boolean;
    title?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<Props> = ({
    isOpen,
    title = "本当に削除しますか？",
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-lg w-80 text-center">
                <p className="text-gray-800 dark:text-gray-100 mb-4 text-lg font-semibold">
                    {title}
                </p>

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
