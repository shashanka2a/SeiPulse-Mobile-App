/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Vercel deployment (no static export)
  // output: 'export', // Remove this for standard Vercel deployment
  trailingSlash: true,
  images: {
    domains: [],
    unoptimized: false // Can use Next.js Image optimization on Vercel
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
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
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
  // Vercel-specific optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot']
  }
}

module.exports = nextConfig