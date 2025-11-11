import type { Item } from "../types";
import type { FC } from "react";

interface Props {
    items: Item[];
}

const CoordinationPreview: FC<Props> = ({ items }) => {
    if (items.length === 0) return <p>選択されたアイテムはありません。</p>;

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div
                    key={item.item_id}
                    className="bg-white dark:bg-gray-700 rounded-2xl shadow p-2 flex items-center gap-2 transition transform hover:scale-[1.02]"
                >
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col text-sm">
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                            {item.name}
                        </span>
                        {item.category && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.category}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CoordinationPreview;
