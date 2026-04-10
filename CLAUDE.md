# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack trade-in platform for assessing and trading second-hand electronics. Monorepo managed by **Nx 22** with two main apps: a **NestJS 11** API backend and a **Next.js 16** web frontend.

## Common Commands

All commands run from `trade-in-platform/`.

### Development

```bash
npx nx serve api          # Start API dev server (port 3000)
npx nx dev web            # Start Next.js dev server (port 4200)
```

### Database (Prisma 7)

```bash
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations (dev)
npm run prisma:migrate:deploy  # Deploy migrations (prod)
npm run prisma:studio          # Open Prisma Studio GUI
npm run prisma:seed            # Seed test users
```

### Build / Lint / Test

```bash
npx nx build api                              # Build API
npx nx build web                              # Build web
npx nx affected --target=lint --base=origin/main   # Lint affected
npx nx affected --target=test --base=origin/main   # Test affected
npx nx affected --target=build --base=origin/main  # Build affected
```

### E2E Tests (Playwright)

```bash
npx nx e2e api-e2e
npx nx e2e web-e2e
```

## Architecture

```
trade-in-platform/
├── apps/api/           # NestJS backend (port 3000, prefix /api)
├── apps/api-e2e/       # API E2E tests (Playwright)
├── apps/web/           # Next.js frontend (port 4200)
└── apps/web-e2e/       # Web E2E tests (Playwright)
```

### Backend (apps/api)

NestJS modular architecture with domain-driven modules under `src/modules/`:

- **admin/** — Assessment workflow, catalog (product models, test guides, defect checklists), customer management, dashboard analytics, Excel export, pricing rules engine, stock/inventory
- **seller/** — Auth and price-check API for sellers
- **buyer/** — Buyer-facing endpoints
- **shared/** — Auth (JWT + Passport), database (Prisma service), error handling, logging (Winston + request ID middleware)

Key patterns:
- DTOs validated with `class-validator` / `class-transformer`
- Guards: `JwtAuthGuard`, `RolesGuard` for role-based access
- WebSocket gateway (Socket.io) for real-time photo sync during assessments
- Static file serving from `./uploads` directory

### Frontend (apps/web)

Next.js 16 with React 19, Tailwind CSS 4. API calls proxied via Next.js rewrites (`/api/*` → `http://localhost:3000/api/*`).

Route groups: `/admin/*`, `/seller/*`, `/browse/*`, `/storefront/*`, `/qr/*`, `/login`

Auth state managed via React Context with JWT tokens in localStorage.

### Database

MariaDB/MySQL via Prisma 7. Schema at `apps/api/prisma/schema.prisma`.

Core entity flow: **Customer** → **Assessment** (status workflow: CUSTOMER_SELECTED → PRICED → STOCKED) → **StockItem**

Supporting entities: ProductModel (with brands/categories), TestGuide/TestStep, DefectChecklist/DefectItem, PricingRule, QRSession, AssessmentPhoto

### User Roles

Three roles: `ADMIN_OPERATION`, `ADMIN_MANAGER`, `SELLER`

Seed credentials (dev only): `admin@tradein.local` / `Admin123!`, `manager@tradein.local` / `Manager123!`, `seller@tradein.local` / `Seller123!`

## Environment Setup

Copy `.env.example` to `.env`. Required vars: `DATABASE_URL`, `JWT_SECRET`. Environment validated at startup via `apps/api/src/config/env.validation.ts`.

## Key Tech Stack

- **Backend:** NestJS 11, Prisma 7, Passport/JWT, Socket.io, ExcelJS, Winston
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Socket.io-client
- **Tooling:** Nx 22, TypeScript 5.9, Jest 30, Playwright, ESLint 9, Prettier 3.6, SWC
