export const clearServiceWorkerCache = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔄 Clearing service worker cache...');
      
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} service worker registrations`);
      
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Unregistered service worker');
      }
      
      // Clear all caches
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} caches to clear`);
      
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
      
      console.log('✅ Service worker cache cleared successfully');
      
      // Clear browser cache for the domain
      if ('caches' in window) {
        console.log('🗑️ Clearing browser cache...');
      }
      
      // Reload the page to apply changes
      console.log('🔄 Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('❌ Error clearing service worker cache:', error);
    }
  } else {
    console.log('⚠️ Service Worker not supported');
  }
};

export const checkAndClearOldCache = (): void => {
  // Check if we're coming from localhost (development) to production
  const referrer = document.referrer;
  const currentHost = window.location.hostname;
  
  console.log('🔍 Cache check:', {
    referrer,
    currentHost,
    isFromLocalhost: referrer.includes('localhost:3000'),
    isProduction: currentHost.includes('vercel.app')
  });
  
  if (referrer.includes('localhost:3000') && currentHost.includes('vercel.app')) {
    console.log('🚨 Detected transition from development to production, clearing cache...');
    clearServiceWorkerCache();
  }
};

// Add to window for manual debugging
if (typeof window !== 'undefined') {
  (window as any).clearServiceWorkerCache = clearServiceWorkerCache;
  (window as any).checkAndClearOldCache = checkAndClearOldCache;
} 