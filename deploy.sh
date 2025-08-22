#!/bin/bash

echo "🚀 Deploying SeiPulse to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build and deploy
echo "📦 Building for Vercel..."
npm run build:vercel

echo "🌐 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at: https://sei-pulse-mobile-app.vercel.app"