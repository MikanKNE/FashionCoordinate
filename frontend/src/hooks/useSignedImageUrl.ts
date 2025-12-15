// frontend/src/hooks/useSignedImageUrl.ts
import { useSignedImageCache } from "./useSignedImageCache";

/**
 * 単体 itemId 用の薄いラッパー
 * UI 側の変更を不要にするために存在する
 */
export function useSignedImageUrl(itemId?: number | null) {
    const { urls, loading } = useSignedImageCache(
        itemId ? [itemId] : []
    );

    return {
        url: itemId ? urls[itemId] ?? null : null,
        loading,
    };
}
