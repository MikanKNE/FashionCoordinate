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

    if (loading) {
        return <div className={className} />;
    }

    if (!url) {
        return (
            <div
                className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs`}
            >
                No Image
            </div>
        );
    }

    return (
        <img
            src={url}
            alt={alt}
            className={className}
        />
    );
}
