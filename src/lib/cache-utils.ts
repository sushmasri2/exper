import { useApiCache } from '@/hooks/use-api-cache';

// Global cache invalidation instance for API calls
let globalCacheInstance: ReturnType<typeof useApiCache> | null = null;

export const setGlobalCacheInstance = (instance: ReturnType<typeof useApiCache>) => {
  globalCacheInstance = instance;
};

export const invalidateGlobalCache = (entity: 'courses' | 'categories' | 'course-types' | 'partners' | 'partner-groups' | 'all') => {
  if (globalCacheInstance) {
    globalCacheInstance.invalidateRelatedCache(entity);
  }
};

// Higher-order function to wrap API calls with cache invalidation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withCacheInvalidation<T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  entity: 'courses' | 'categories' | 'course-types' | 'partners' | 'partner-groups' | 'all'
) {
  return async (...args: T): Promise<R> => {
    const result = await apiFunction(...args);
    invalidateGlobalCache(entity);
    return result;
  };
}