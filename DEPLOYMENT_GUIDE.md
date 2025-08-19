# SeiPulse Deployment Guide

## 🚀 **Vercel Deployment (Recommended)**

### **Option 1: Standard Vercel Deployment (Recommended)**

This is the easiest and most optimized way to deploy to Vercel:

#### **1. Quick Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### **2. GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

#### **3. Configuration**
- ✅ **Auto-detected**: Vercel automatically detects Next.js
- ✅ **PWA Support**: Full PWA functionality works out of the box
- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **CDN**: Global edge network
- ✅ **Optimizations**: Image optimization, caching, compression

### **Option 2: Static Export Deployment**

If you prefer static export (current configuration):

```bash
# Build static export
npm run build

# Deploy the dist folder
vercel --prod dist
```

## 🌐 **Other Deployment Options**

### **Netlify**
```bash
# Build static export
npm run build

# Deploy dist folder to Netlify
# Or connect GitHub repo to Netlify
```

**Netlify Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions` (if needed)

### **GitHub Pages**
```bash
# Build static export
npm run build

# Deploy dist folder to gh-pages branch
npx gh-pages -d dist
```

### **Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build static export
npm run build

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

### **Cloudflare Pages**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Build output directory: `dist`

## ⚙️ **Configuration Options**

### **For Standard Vercel Deployment**
Use `next.config.vercel.js`:
```javascript
// Rename next.config.vercel.js to next.config.js
// This removes static export and enables Vercel optimizations
```

### **For Static Export**
Keep current `next.config.js`:
```javascript
// Current configuration with output: 'export'
// Works with any static hosting
```

## 🔧 **Environment Variables**

Create `.env.local` for environment-specific settings:
```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=SeiPulse
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Sei Network Configuration
NEXT_PUBLIC_SEI_NETWORK=pacific-1
NEXT_PUBLIC_SEI_RPC_URL=https://rpc.sei-apis.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Push Notifications (optional)
NEXT_PUBLIC_VAPID_KEY=your-vapid-key
```

## 📱 **PWA Deployment Checklist**

### **✅ Pre-deployment**
- [ ] Icons generated and placed in `/public/icons/`
- [ ] Manifest.json configured with correct domain
- [ ] Service worker tested locally
- [ ] HTTPS enabled (automatic on Vercel)

### **✅ Post-deployment**
- [ ] Test PWA install on mobile devices
- [ ] Verify offline functionality
- [ ] Test service worker updates
- [ ] Check Lighthouse PWA score

## 🎯 **Vercel-Specific Benefits**

### **Why Choose Vercel:**
- ✅ **Zero Configuration**: Auto-detects Next.js
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Edge Functions**: Serverless functions at the edge
- ✅ **Preview Deployments**: Every PR gets a preview URL
- ✅ **Analytics**: Built-in performance analytics
- ✅ **Image Optimization**: Automatic image optimization

### **Vercel PWA Features:**
- ✅ **Service Worker**: Automatically served with correct headers
- ✅ **Manifest**: Proper MIME types and caching
- ✅ **HTTPS**: Required for PWA, included by default
- ✅ **Compression**: Automatic gzip/brotli compression
- ✅ **Caching**: Optimized caching strategies

## 🚀 **Quick Start Commands**

### **Deploy to Vercel (Easiest)**
```bash
# One command deployment
npx vercel --prod

# Or with GitHub integration
git push origin main  # Auto-deploys if connected to Vercel
```

### **Local Development**
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### **Build and Test Locally**
```bash
npm run build
npm start
# Test production build locally
```

## 🔍 **Testing Your Deployment**

### **PWA Testing**
1. **Mobile Test**: Open on mobile browser
2. **Install Prompt**: Should appear after 5 seconds
3. **Offline Test**: Turn off internet, app should still work
4. **Update Test**: Deploy new version, should prompt to update

### **Lighthouse Audit**
Run Lighthouse audit to check:
- Performance: Should be 90+
- Accessibility: Should be 90+
- Best Practices: Should be 90+
- SEO: Should be 90+
- PWA: Should pass all checks

### **Browser Testing**
- ✅ Chrome (Android): Native install prompt
- ✅ Safari (iOS): "Add to Home Screen" instructions
- ✅ Edge (Desktop): Desktop app installation
- ✅ Firefox: Basic PWA support

## 📊 **Performance Optimization**

### **Vercel Optimizations**
- **Image Optimization**: Automatic WebP conversion
- **Code Splitting**: Automatic bundle optimization
- **Edge Caching**: Static assets cached globally
- **Compression**: Automatic gzip/brotli

### **PWA Optimizations**
- **Service Worker**: Caches critical resources
- **Offline Support**: App works without internet
- **Background Sync**: Syncs when back online
- **Push Notifications**: Ready for implementation

## 🎉 **Result**

After deployment, your SeiPulse app will be:
- ✅ **Accessible via URL**: Works like any website
- ✅ **Installable as PWA**: Users can install from browser
- ✅ **Offline Capable**: Works without internet
- ✅ **Fast Loading**: Optimized for performance
- ✅ **Mobile Optimized**: Native app-like experience

**Example URLs after deployment:**
- Vercel: `https://seipulse.vercel.app`
- Custom domain: `https://seipulse.app`
- Preview: `https://seipulse-git-main-username.vercel.app`

Users can visit the URL and install it as a PWA directly from their browser! 🚀