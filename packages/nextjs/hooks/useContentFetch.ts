import { useState, useEffect, useRef } from "react";
import { getContent, getBatchContent } from "@/app/actions/content";

interface ContentData {
    content: string;
    image: string | null;
    name?: string;
    description?: string;
}

interface ZoomState {
    zoomDepth: number;
    scale: number;
}

// Global content cache
const contentCache = new Map<number, ContentData>();

// Batch fetching queue
let batchQueue: number[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
const maxBatchDelay = 16; // Only wait for one frame (60fps ≈ 16ms) max

// Track which indices are currently being fetched
const pendingFetches = new Set<number>();

// Dynamic batch size based on zoom state
function getBatchSize(zoomState: ZoomState) {
    const isResetState = zoomState.zoomDepth === 0 && zoomState.scale === 1;
    return isResetState ? 15 : 5;
}

async function processBatchQueue(zoomState: ZoomState) {
    if (batchQueue.length === 0) return;

    const indices = [...batchQueue];
    batchQueue = [];
    if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
    }

    // Add indices to pending set
    indices.forEach((index) => pendingFetches.add(index));

    try {
        const results = await getBatchContent(indices);
        // Update cache with results
        Object.entries(results).forEach(([index, data]) => {
            const numIndex = Number(index);
            contentCache.set(numIndex, data);
            pendingFetches.delete(numIndex);
            // Notify all subscribers for this index
            const event = new CustomEvent(`content-${index}`, { detail: data });
            window.dispatchEvent(event);
        });
    } catch (error) {
        console.error("Batch processing failed:", error);
        // Notify error to all subscribers and clean up pending fetches
        indices.forEach((index) => {
            pendingFetches.delete(index);
            const event = new CustomEvent(`content-${index}-error`, { detail: error });
            window.dispatchEvent(event);
        });
    }
}

export function useContentFetch(index: number, zoomState: ZoomState, isVisible = true) {
    const [data, setData] = useState<ContentData | null>(() => contentCache.get(index) || null);
    const [loading, setLoading] = useState(!contentCache.has(index));
    const [error, setError] = useState<Error | null>(null);
    const lastVisibleRef = useRef(isVisible);

    useEffect(() => {
        let isMounted = true;

        // If data is in cache, use it immediately
        if (contentCache.has(index)) {
            setData(contentCache.get(index)!);
            setLoading(false);
            return;
        }

        // Only fetch if the square is visible and wasn't already visible
        // This prevents re-fetching when other props change
        if (!isVisible || pendingFetches.has(index)) {
            setLoading(false);
            return;
        }

        // Only start loading if visibility actually changed to true
        if (isVisible && !lastVisibleRef.current) {
            setLoading(true);

            // Add to batch queue if not already being fetched
            if (!batchQueue.includes(index) && !pendingFetches.has(index)) {
                batchQueue.push(index);

                // Process immediately if we have enough items
                const currentBatchSize = getBatchSize(zoomState);
                if (batchQueue.length >= currentBatchSize) {
                    processBatchQueue(zoomState);
                } else {
                    // Otherwise wait for a short time for more items
                    if (batchTimeout) {
                        clearTimeout(batchTimeout);
                    }
                    batchTimeout = setTimeout(() => processBatchQueue(zoomState), maxBatchDelay);
                }
            }
        }

        lastVisibleRef.current = isVisible;

        // Listen for content updates
        const handleContent = (e: CustomEvent<ContentData>) => {
            if (isMounted) {
                setData(e.detail);
                setError(null);
                setLoading(false);
            }
        };

        const handleError = (e: CustomEvent<Error>) => {
            if (isMounted) {
                setError(e.detail);
                setData(null);
                setLoading(false);
            }
        };

        window.addEventListener(`content-${index}` as any, handleContent as any);
        window.addEventListener(`content-${index}-error` as any, handleError as any);

        return () => {
            isMounted = false;
            window.removeEventListener(`content-${index}` as any, handleContent as any);
            window.removeEventListener(`content-${index}-error` as any, handleError as any);
        };
    }, [index, zoomState, isVisible]);

    return { data, loading, error };
}
