"use client";

/**
 * Vortex Cache Utility
 * Provides a simple client-side caching mechanism for expensive or frequent data lookups.
 */
export const vortexCache = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(`vortex_cache_${key}`);
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item);
      const now = Date.now();
      
      // Cache expires after 1 hour (3600000 ms)
      if (now - parsed.timestamp > 3600000) {
        localStorage.removeItem(`vortex_cache_${key}`);
        return null;
      }
      
      return parsed.data;
    } catch (e) {
      return null;
    }
  },
  
  set: <T>(key: string, data: T): void => {
    if (typeof window === "undefined") return;
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`vortex_cache_${key}`, JSON.stringify(cacheItem));
  }
};
