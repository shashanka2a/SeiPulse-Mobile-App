import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'
import { PWAInstaller } from '../components/PWAInstaller'

export default function App({ Component, pageProps }: AppProps) {

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
    </>
  )
}