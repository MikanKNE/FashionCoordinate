// frontend/src/components/CoordinationDetailModal.tsx
interface Props {
    coordination: {
        coordination_id: number;
        name: string | null;
        created_at: string;
    };
    onClose: () => void;
}

export default function CoordinationDetailModal({ coordination, onClose }: Props) {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-96 shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                    {coordination.name || "無題コーディネーション"}
                </h2>

                <p>ID: {coordination.coordination_id}</p>
                <p>
                    作成日:{" "}
                    {new Date(coordination.created_at).toLocaleString()}
                </p>

                <div className="text-right mt-6">
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-xl"
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
