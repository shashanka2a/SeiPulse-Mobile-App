# 🚀 SeiPulse Deployment Guide

## Quick Deploy to Vercel

### Option 1: Automatic Deployment (Recommended)
```bash
# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Build for Vercel
npm run build:vercel

# Deploy to production
vercel --prod
```

### Option 3: Git-based Deployment
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will auto-deploy on every push to main

## Configuration Files

- **`next.config.vercel.js`** - Vercel-optimized Next.js config
- **`vercel.json`** - Vercel deployment settings
- **`next.config.js`** - Static export config (for other hosts)

## Environment Variables

No environment variables needed! SeiPulse works entirely client-side with:
- Keplr wallet integration
- Public Sei RPC endpoints
- DexScreener API (no key required)

## Troubleshooting

### Build Errors
```bash
# Check for TypeScript errors
npm run lint

# Test build locally
npm run build:vercel
```

### Deployment Issues
- Make sure you're logged into Vercel: `vercel login`
- Check domain configuration in Vercel dashboard
- Verify build logs in Vercel deployment panel

### Runtime Issues
- Ensure Keplr extension is installed for wallet features
- Check browser console for client-side errors
- Verify network connectivity for blockchain features

## Production Checklist

✅ **Before Deployment:**
- [ ] Code builds successfully (`npm run build:vercel`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Keplr integration tested
- [ ] PWA features working (manifest, service worker)
- [ ] Dark mode toggle functional
- [ ] All tabs (Home, Pay, Watch, Profile) working

✅ **After Deployment:**
- [ ] App loads correctly on mobile and desktop
- [ ] Wallet connection works with Keplr
- [ ] Real-time price data loading
- [ ] PWA install prompt appears
- [ ] Dark/light theme switching works

## Performance Optimization

The app is optimized for:
- **Fast Loading** - Code splitting and lazy loading
- **Mobile Performance** - Responsive design and touch-friendly
- **Offline Support** - Service worker and transaction queuing
- **SEO** - Proper meta tags and structured data

---

**Your SeiPulse app is ready for production! 🌟**