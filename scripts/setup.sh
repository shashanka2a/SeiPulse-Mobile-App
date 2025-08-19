#!/bin/bash

echo "🚀 Setting up SeiPulse Next.js Application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running TypeScript checks..."
npx tsc --noEmit

# Run linting
echo "🧹 Running ESLint..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Setup complete! Run 'npm run dev' to start development server."