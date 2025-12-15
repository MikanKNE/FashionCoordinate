import { useEffect, useState } from "react";
import { API_BASE } from "../api";

/**
 * キャッシュ1件分
 */
type CacheEntry = {
    url: string | null;
    expiresAt: number;
};

/**
 * itemId -> CacheEntry
 */
const cache = new Map<number, CacheEntry>();

/**
 * itemId -> in-flight Promise
 * 同時多重リクエスト防止
 */
const inFlight = new Map<number, Promise<string | null>>();

/**
 * signed URL TTL（ms）
 * backend expires_in より少し短くする
 */
const DEFAULT_TTL = 55 * 1000;

/**
 * 中核 Hook
 * - 複数 itemId 対応
 * - キャッシュ
 * - TTL
 * - 再取得
 */
export function useSignedImageCache(itemIds: number[]) {
    const [urls, setUrls] = useState<Record<number, string | null>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (itemIds.length === 0) {
            setUrls({});
            return;
        }

        let mounted = true;
        const now = Date.now();

        const nextUrls: Record<number, string | null> = {};
        const fetchTargets: number[] = [];

        /**
         * ① キャッシュチェック
         */
        for (const itemId of itemIds) {
            const cached = cache.get(itemId);
            if (cached && cached.expiresAt > now) {
                nextUrls[itemId] = cached.url;
            } else {
                fetchTargets.push(itemId);
            }
        }

        // キャッシュ分は即反映
        setUrls((prev) => ({ ...prev, ...nextUrls }));

        if (fetchTargets.length === 0) {
            return;
        }

        setLoading(true);

        /**
         * ② 取得処理
         */
        fetchTargets.forEach((itemId) => {
            if (inFlight.has(itemId)) {
                inFlight.get(itemId)!.then((url) => {
                    if (!mounted) return;
                    setUrls((prev) => ({ ...prev, [itemId]: url }));
                });
                return;
            }

            const promise = (async () => {
                try {
                    const res = await fetch(
                        `${API_BASE}/items/${itemId}/image/`,
                        {
                            method: "GET",
                            credentials: "include",
                        }
                    );

                    if (!res.ok) {
                        return null;
                    }

                    const data = await res.json();
                    const signedUrl: string | null = data.url ?? null;

                    cache.set(itemId, {
                        url: signedUrl,
                        expiresAt: Date.now() + DEFAULT_TTL,
                    });

                    return signedUrl;
                } catch (err) {
                    console.error("signed image fetch error:", err);
                    return null;
                } finally {
                    inFlight.delete(itemId);
                }
            })();

            inFlight.set(itemId, promise);

            promise.then((url) => {
                if (!mounted) return;
                setUrls((prev) => ({ ...prev, [itemId]: url }));
            });
        });

        setLoading(false);

        return () => {
            mounted = false;
        };
    }, [JSON.stringify(itemIds)]);

    return { urls, loading };
}
