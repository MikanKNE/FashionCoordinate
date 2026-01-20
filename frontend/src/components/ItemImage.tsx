// frontend/src/components/ItemImage.tsx
import { useSignedImageUrl } from "../hooks/useSignedImageUrl";

export function ItemImage({
    itemId,
    alt = "item",
    className = "",
}: {
    itemId: number;
    alt?: string;
    className?: string;
}) {
    const { url, loading } = useSignedImageUrl(itemId);

    return (
        <div
            className={`
                ${className}
                bg-gray-100 dark:bg-gray-800
                flex items-center justify-center
                overflow-hidden
            `}
        >
            {loading && <div />}

            {!loading && !url && (
                <div className="text-gray-400 text-xs">
                    No Image
                </div>
            )}

            {!loading && url && (
                <img
                    src={url}
                    alt={alt}
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
}