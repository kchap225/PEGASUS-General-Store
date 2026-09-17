# Pegasus General Store

The official website for **Pegasus General Store** (Pegasus Village Pantry) — North Canterbury's local store. Featuring everyday essentials, artisan foods, local Canterbury produce, and Click & Collect pre-orders.

## Features

- **Storefront & Departments**: Explore artisan pantry, local bakery, South African specialty meats (Safari Meats), local wines, ready meals, and gluten-free goods.
- **Service Hub**: NZ Post agency details, pharmacy essentials, and community noticeboard.
- **Canterbury Suppliers**: Meet the local producers and bakers behind the products.
- **Digital Noticeboard**: Latest arrivals, news, and community events.
- **Click & Collect Pre-orders**: Interactive order basket and pre-order submission persisted locally with instant order reference.
- **100% Local**: Fully standalone React + Vite setup with zero external cloud or platform dependencies.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm (bundled with Node.js)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
├── public/              # Static assets (images, favicon, manifest)
│   ├── images/          # Local store & product photography
│   └── favicon.svg      # Store logo favicon
├── src/
│   ├── api/
│   │   └── client.js    # Local API service & storage layer
│   ├── components/      # UI components & page sections
│   │   ├── sections/    # Hero, About, Range, Suppliers, News, Contact, etc.
│   │   └── ui/          # Standard Tailwind & Radix UI components
│   ├── data/            # Local JSON seed data (products, suppliers, news)
│   ├── lib/             # Utility helpers & store metadata
│   ├── pages/
│   │   ├── Home.jsx         # Main landing page
│   │   └── ClickCollect.jsx # Click & Collect pre-order page
│   ├── App.jsx          # Application routing
│   └── main.jsx         # React application entry point
├── package.json
└── vite.config.js       # Standard Vite React configuration
```
