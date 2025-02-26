import { useState, useEffect } from "react";
import { getContent, getBatchContent } from "@/app/actions/content";

interface ContentData {
    content: string;
    image: string | null;
    name?: string;
    description?: string;
}

// Global content cache with LRU implementation
const MAX_CACHE_SIZE = 100; // Maximum number of items to store in cache
class LRUCache<K, V> extends Map<K, V> {
    private maxSize: number;

    constructor(maxSize: number) {
        super();
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        const item = super.get(key);
        if (item) {
            // Re-insert to put it at the end (most recently used)
            this.delete(key);
            this.set(key, item);
        }
        return item;
    }

    set(key: K, value: V): this {
        if (this.has(key)) {
            this.delete(key);
        } else if (this.size >= this.maxSize) {
            // Remove the first (least recently used) item
            const firstKey = Array.from(this.keys())[0];
            if (firstKey !== undefined) {
                this.delete(firstKey);
            }
        }
        super.set(key, value);
        return this;
    }
}

// Initialize the content cache with size limit
const contentCache = new LRUCache<number, ContentData>(MAX_CACHE_SIZE);

// Batch fetching queue
let batchQueue: number[] = [];
let batchTimeout: NodeJS.Timeout | null = null;
const batchSize = 15; // Process immediately when queue reaches this size
const maxBatchDelay = 16; // Only wait for one frame (60fps ≈ 16ms) max

async function processBatchQueue() {
    if (batchQueue.length === 0) return;

    const indices = [...batchQueue];
    batchQueue = [];
    if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
    }

    try {
        const results = await getBatchContent(indices);
        // Update cache with results
        Object.entries(results).forEach(([index, data]) => {
            contentCache.set(Number(index), data);
            // Notify all subscribers for this index
            const event = new CustomEvent(`content-${index}`, { detail: data });
            window.dispatchEvent(event);
        });
    } catch (error) {
        console.error("Batch processing failed:", error);
        // Notify error to all subscribers
        indices.forEach((index) => {
            const event = new CustomEvent(`content-${index}-error`, { detail: error });
            window.dispatchEvent(event);
        });
    }
}

export function useContentFetch(index: number) {
    const [data, setData] = useState<ContentData | null>(() => contentCache.get(index) || null);
    const [loading, setLoading] = useState(!contentCache.has(index));
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        // If data is in cache, use it immediately
        if (contentCache.has(index)) {
            setData(contentCache.get(index)!);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Add to batch queue
        if (!batchQueue.includes(index)) {
            batchQueue.push(index);

            // Process immediately if we have enough items
            if (batchQueue.length >= batchSize) {
                processBatchQueue();
            } else {
                // Otherwise wait for a short time for more items
                if (batchTimeout) {
                    clearTimeout(batchTimeout);
                }
                batchTimeout = setTimeout(processBatchQueue, maxBatchDelay);
            }
        }

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
    }, [index]);

    return { data, loading, error };
}
