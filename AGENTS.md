# AGENTS.md

## Project Context

This is a standalone React + Vite single-page application for **Pegasus General Store**.
It runs completely locally without external cloud dependencies or third-party backend platforms.

## Key Files

- `src/`: frontend application source.
- `src/api/client.js`: local API client & storage layer (products, suppliers, news, orders).
- `src/data/`: local JSON seed data (`products.json`, `suppliers.json`, `newsEvents.json`).
- `public/images/`: local product and store photography.
- `vite.config.js`: standard Vite React configuration.

## Development Workflow

- Run `npm install` to install local dependencies.
- Run `npm run dev` to start the local development server (typically `http://localhost:5173`).
- Run `npm run build` to create a production bundle.
- Run `npm run lint` for code quality checks.
