/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for Vercel deployment
  trailingSlash: false,
  images: {
    domains: ['api.dexscreener.com'],
    unoptimized: false
  },
  // PWA optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Security headers for PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_SEI_RPC: 'https://rpc.sei-apis.com',
    NEXT_PUBLIC_SEI_REST: 'https://rest.sei-apis.com',
  }
}

module.exports = nextConfig