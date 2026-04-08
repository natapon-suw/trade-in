# Design Decisions — Foundation Unit

## Context Summary
Foundation infrastructure unit for a Modular Monolith trade-in platform. Solo developer. Monorepo. Responsibilities: project scaffold, JWT auth + RBAC, RFC 7807 errors, DB setup, shared types, structured logging. Already decided: JWT auth, RFC 7807 errors, shared DB with schema separation, direct function calls, shared types package, UUID v4 IDs, ISO 8601 timestamps.

---

## Decision Questions

### D3-1: Backend Language & Runtime
**Question**: What backend language and runtime should the platform use?
- 1) TypeScript + Node.js — strong typing, large ecosystem, good for full-stack **(Recommended)**
- 2) Python + FastAPI — fast development, great for data processing
- 3) Java + Spring Boot — enterprise-grade, strong typing, mature ecosystem
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-2: Backend Framework
**Question**: What backend framework for the Node.js/TypeScript API?
- 1) NestJS — opinionated, modular architecture built-in, great for monolith modules **(Recommended)**
- 2) Express.js — minimal, flexible, most popular but requires more manual structure
- 3) Fastify — high performance, schema-based validation, plugin architecture
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-3: Frontend Framework
**Question**: What frontend framework for the admin panel, seller portal, and buyer views?
- 1) Next.js (React) — SSR/SSG support, file-based routing, great DX **(Recommended)**
- 2) React + Vite — SPA, fast build, flexible routing
- 3) Vue.js + Nuxt — similar to Next.js but Vue ecosystem
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-4: UI Component Library
**Question**: What UI component library for consistent styling?
- 1) Tailwind CSS + shadcn/ui — utility-first, customizable, modern **(Recommended)**
- 2) Material UI (MUI) — comprehensive, Google Material Design
- 3) Ant Design — enterprise-focused, rich component set
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-5: Database Technology
**Question**: What database for the platform?
- 1) PostgreSQL — robust, great for relational data, JSON support, free **(Recommended)**
- 2) MySQL — widely used, good performance, simpler
- 3) MongoDB — document-based, flexible schema, good for varied product data
- 4) Other (please specify): _______

**Answer**: 2

---

### D3-6: Database ORM
**Question**: What ORM/database client for TypeScript?
- 1) Prisma — type-safe, auto-generated client, great migrations **(Recommended)**
- 2) TypeORM — decorator-based, supports Active Record and Data Mapper
- 3) Drizzle ORM — lightweight, SQL-like syntax, good performance
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-7: Package Manager & Monorepo Tool
**Question**: What package manager and monorepo tooling?
- 1) pnpm + Turborepo — fast installs, efficient disk usage, great monorepo support **(Recommended)**
- 2) npm + Nx — standard npm, powerful monorepo with Nx
- 3) yarn + Lerna — classic monorepo setup
- 4) Other (please specify): _______

**Answer**: 2

---

### D3-8: File Storage (Photos)
**Question**: Where should product photos be stored?
- 1) Local filesystem with configurable path — simplest for MVP, can migrate later **(Recommended)**
- 2) AWS S3 — scalable cloud storage, CDN-ready
- 3) Cloudinary — image optimization and transformation built-in
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-9: Testing Framework
**Question**: What testing framework for the platform?
- 1) Vitest — fast, native ESM, compatible with Jest API **(Recommended)**
- 2) Jest — most popular, large ecosystem, well-documented
- 3) Mocha + Chai — flexible, modular testing setup
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-10: Code Style & Linting
**Question**: What code style and linting tools?
- 1) ESLint + Prettier — industry standard, auto-formatting **(Recommended)**
- 2) Biome — all-in-one linter and formatter, faster than ESLint
- 3) ESLint only — linting without opinionated formatting
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-11: API Documentation
**Question**: How should the API be documented?
- 1) OpenAPI/Swagger — auto-generated from decorators, interactive docs **(Recommended)**
- 2) Manual markdown docs — simple, version-controlled
- 3) No formal docs — code is the documentation
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-12: Excel Export Library
**Question**: What library for Excel export functionality?
- 1) ExcelJS — full .xlsx support, streaming for large files, good TypeScript support **(Recommended)**
- 2) SheetJS (xlsx) — lightweight, broad format support
- 3) json2csv + manual — CSV only, simpler but less feature-rich
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-13: QR Code Generation
**Question**: What library for QR code generation (mobile photo helper)?
- 1) qrcode — simple, well-maintained, supports SVG and PNG output **(Recommended)**
- 2) qr-image — lightweight, fast generation
- 3) Browser-based QR library (frontend only) — no server dependency
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-14: Correctness & Property-Based Testing
**Question**: Should we use property-based testing (PBT) to verify correctness properties like pricing calculations and defect grading?
- 1) Yes — use fast-check for PBT on pricing engine and defect grading logic **(Recommended)**
- 2) No — standard unit tests are sufficient for correctness
- 3) Partial — PBT only for pricing engine, standard tests for everything else
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D3-1 Backend: TypeScript + Node.js
- D3-2 Framework: NestJS
- D3-3 Frontend: Next.js (React)
- D3-4 UI Library: Tailwind CSS + shadcn/ui
- D3-5 Database: MySQL
- D3-6 ORM: Prisma
- D3-7 Package Manager: npm + Nx monorepo
- D3-8 File Storage: Local filesystem (configurable path)
- D3-9 Testing: Vitest
- D3-10 Linting: ESLint + Prettier
- D3-11 API Docs: OpenAPI/Swagger (auto-generated from NestJS decorators)
- D3-12 Excel: ExcelJS
- D3-13 QR Code: qrcode library
- D3-14 PBT: Yes — fast-check for pricing engine and defect grading

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
