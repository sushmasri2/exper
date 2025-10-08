"use client";
import { useRef, useCallback } from 'react';

// Cache storage helper
const CACHE_STORAGE_KEY = 'cms_api_cache';
const CACHE_TTL = 60000; // 60 seconds

interface CacheEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: number;
}

// Persistent cache using localStorage with fallback to memory
class PersistentCache {
  private memoryCache = new Map<string, CacheEntry>();
  private isClient = typeof window !== 'undefined';

  get(key: string): CacheEntry | undefined {
    // First try memory cache
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      return memoryEntry;
    }

    // Then try localStorage if available
    if (this.isClient) {
      try {
        const stored = localStorage.getItem(`${CACHE_STORAGE_KEY}_${key}`);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          // Restore to memory cache for faster access
          this.memoryCache.set(key, entry);
          return entry;
        }
      } catch (error) {
        console.warn('Cache localStorage read error:', error);
      }
    }

    return undefined;
  }

  set(key: string, entry: CacheEntry): void {
    // Always store in memory
    this.memoryCache.set(key, entry);

    // Also store in localStorage if available
    if (this.isClient) {
      try {
        localStorage.setItem(`${CACHE_STORAGE_KEY}_${key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Cache localStorage write error:', error);
      }
    }
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    if (this.isClient) {
      try {
        localStorage.removeItem(`${CACHE_STORAGE_KEY}_${key}`);
      } catch (error) {
        console.warn('Cache localStorage delete error:', error);
      }
    }
  }

  clear(): void {
    this.memoryCache.clear();
    if (this.isClient) {
      try {
        // Clear all cache entries from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(CACHE_STORAGE_KEY)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Cache localStorage clear error:', error);
      }
    }
  }

  // Get all keys for pattern matching
  getKeys(): string[] {
    const memoryKeys = Array.from(this.memoryCache.keys());

    if (!this.isClient) {
      return memoryKeys;
    }

    try {
      const storageKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_STORAGE_KEY))
        .map(key => key.replace(`${CACHE_STORAGE_KEY}_`, ''));

      // Combine and deduplicate
      return [...new Set([...memoryKeys, ...storageKeys])];
    } catch (error) {
      console.warn('Cache localStorage keys error:', error);
      return memoryKeys;
    }
  }

  // Check if key exists
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  // Get all keys as iterable (for compatibility)
  keys(): string[] {
    return this.getKeys();
  }
}

const apiCache = new PersistentCache();

interface ApiCacheOptions {
  cacheKey: string;
  ttl?: number;
}

export function useApiCache() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingRequests = useRef(new Map<string, Promise<any>>());

  const cachedApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: ApiCacheOptions
  ): Promise<T> => {
    const { cacheKey, ttl = CACHE_TTL } = options;
    const now = Date.now();

    // Check if there's a pending request for this key
    if (pendingRequests.current.has(cacheKey)) {
      return pendingRequests.current.get(cacheKey)!;
    }

    // Check cache
    const cached = apiCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < ttl) {
      console.log(`[Cache HIT] ${cacheKey} - using cached data`);
      return cached.data;
    }

    if (cached) {
      console.log(`[Cache EXPIRED] ${cacheKey} - cache expired, fetching fresh data`);
    } else {
      console.log(`[Cache MISS] ${cacheKey} - no cached data, fetching from API`);
    }

    // Make the API call and cache the promise to prevent duplicates
    const promise = apiCall();
    pendingRequests.current.set(cacheKey, promise);

    try {
      const result = await promise;

      // Cache the result
      apiCache.set(cacheKey, {
        data: result,
        timestamp: now
      });

      console.log(`[Cache STORE] ${cacheKey} - cached fresh data`);
      return result;
    } finally {
      // Remove from pending requests
      pendingRequests.current.delete(cacheKey);
    }
  }, []);

  const clearCache = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      apiCache.delete(cacheKey);
    } else {
      apiCache.clear();
    }
  }, []);

  const invalidateCache = useCallback((pattern: string | string[]) => {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];

    patterns.forEach(pat => {
      // If it's an exact match, delete directly
      if (apiCache.has(pat)) {
        console.log(`[Cache INVALIDATE] Exact match: ${pat}`);
        apiCache.delete(pat);
      } else {
        // If it's a pattern, find and delete matching keys
        const keysToDelete = apiCache.getKeys().filter((key: string) =>
          key.includes(pat) || pat.includes(key)
        );
        console.log(`[Cache INVALIDATE] Pattern '${pat}' matches: [${keysToDelete.join(', ')}]`);
        keysToDelete.forEach((key: string) => apiCache.delete(key));
      }
    });
  }, []);  const invalidateRelatedCache = useCallback((entity: 'courses' | 'categories' | 'course-types' | 'partners' | 'partner-groups' | 'all') => {
    console.log(`[Cache INVALIDATE] ${entity} - clearing related cache entries`);
    switch (entity) {
      case 'courses':
        invalidateCache(['courses', 'course-']);
        break;
      case 'categories':
        invalidateCache(['categories', 'category']);
        break;
      case 'course-types':
        invalidateCache(['course-types', 'coursetype']);
        break;
      case 'partners':
        invalidateCache(['partners', 'partner-']);
        break;
      case 'partner-groups':
        invalidateCache(['partner-groups', 'partnergroup']);
        break;
      case 'all':
        apiCache.clear();
        console.log('[Cache CLEAR] All cache entries cleared');
        break;
    }
  }, [invalidateCache]);

  return {
    cachedApiCall,
    clearCache,
    invalidateCache,
    invalidateRelatedCache
  };
}