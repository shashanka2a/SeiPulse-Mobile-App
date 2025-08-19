# SeiPulse - Next.js 14 Application

A modern payment application built with Next.js 14, React 18, and Tailwind CSS for the Sei ecosystem.

## Features

- 🚀 Next.js 14 with App Router
- ⚡ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🌙 Dark/Light mode support
- 📱 Mobile-first responsive design
- 🔒 Type-safe with TypeScript
- 🎯 Static export ready for deployment
- 🧩 Modular UI components with Radix UI
- 💳 Payment flow with AI security checks
- 📊 Asset tracking and wallet monitoring
- 👤 User profile management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Static Export

This app is configured for static export:

```bash
npm run export
# or
yarn export
# or
pnpm export
```

## Project Structure

```
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── HomeTab.tsx     # Home screen component
│   ├── PayTab.tsx      # Payment flow component
│   ├── WatchTab.tsx    # Asset tracking component
│   └── ProfileTab.tsx  # User profile component
├── pages/              # Next.js pages
│   ├── _app.tsx        # App wrapper
│   ├── _document.tsx   # Document structure
│   └── index.tsx       # Main application page
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS and custom styles
└── public/             # Static assets
```

## Technologies Used

- **Next.js 14** - React framework with static export
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Class Variance Authority** - Component variants

## Key Features

### Payment Flow
- Multi-step payment process
- AI-powered security checks
- Real-time risk assessment
- QR code scanning support

### Asset Tracking
- Memecoin monitoring
- NFT collection tracking
- Wallet balance monitoring
- Market insights with AI

### User Experience
- Dark/light mode toggle
- Mobile-optimized interface
- Smooth animations and transitions
- Accessible components

## Deployment

This application is configured for static export and can be deployed to:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

The `next.config.js` is configured with `output: 'export'` for static generation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.