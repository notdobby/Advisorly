export const clearServiceWorkerCache = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('Service worker cache cleared successfully');
      
      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error clearing service worker cache:', error);
    }
  }
};

export const checkAndClearOldCache = (): void => {
  // Check if we're coming from localhost (development) to production
  const referrer = document.referrer;
  if (referrer.includes('localhost:3000') && window.location.hostname !== 'localhost') {
    console.log('Detected transition from development to production, clearing cache...');
    clearServiceWorkerCache();
  }
}; 