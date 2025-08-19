import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'
import { PWAInstaller, useServiceWorker } from '../components/PWAInstaller'

export default function App({ Component, pageProps }: AppProps) {
  const { isOnline, updateAvailable, updateApp } = useServiceWorker();

  useEffect(() => {
    // Prevent zoom on iOS
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <PWAInstaller />
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          You&apos;re offline. Some features may not work.
        </div>
      )}

      {/* Update available notification */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm z-50">
          <span>New version available! </span>
          <button 
            onClick={updateApp}
            className="underline font-medium"
          >
            Update now
          </button>
        </div>
      )}
    </>
  )
}