# Design Decisions — Admin Operations Unit

## Context Summary
Admin Operations unit: 18 stories covering assessment workflow (8 steps), customer management, product model catalog, test guides, defect grading (1-5 severity), photo capture (PC + QR mobile helper), rule-based pricing engine, stock management, dashboard, and Excel export. Two admin roles: Operation (hands-on assessment) and Manager (oversight, config, reports). Stack settled: NestJS, MySQL/Prisma, Next.js, Tailwind/shadcn, Vitest/fast-check. Foundation provides auth, errors, DB, logging, types.

---

## Decision Questions

### D3-1: Admin Module Architecture
**Question**: How should the admin module be organized internally within NestJS?
- 1) Feature-based sub-modules — separate NestJS modules for each feature area (customer, assessment, catalog, stock, dashboard) **(Recommended)**
- 2) Layered — controllers, services, repositories in flat directories
- 3) Single module — all admin features in one NestJS module
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-2: Assessment Workflow State Management
**Question**: How should the multi-step assessment workflow (8 steps) track its state?
- 1) Database-persisted state — Assessment entity with status field tracking current step, allows resume after browser close **(Recommended)**
- 2) Frontend-only state — wizard state in React, only saved to DB on final submit
- 3) Session-based — server session stores progress, lost on session expiry
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-3: Photo Storage Strategy
**Question**: How should product photos be stored and served? (Foundation decided local filesystem)
- 1) Local filesystem with static file serving via NestJS — photos saved to configurable UPLOAD_PATH, served via /uploads/* route **(Recommended)**
- 2) Local filesystem with separate static file server (Nginx)
- 3) Base64 in database — simplest but bloats DB
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-4: QR Mobile Photo Helper — Real-Time Communication
**Question**: How should the QR mobile photo session sync photos to the PC in real-time?
- 1) WebSocket (Socket.IO) — bidirectional real-time, phone uploads photo → server pushes to PC browser **(Recommended)**
- 2) Polling — PC browser polls server every 2 seconds for new photos
- 3) Server-Sent Events (SSE) — server pushes to PC, phone uploads via REST
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-5: Pricing Engine Architecture
**Question**: How should the rule-based pricing engine be structured?
- 1) Service with rule evaluator — PricingService loads rules from DB, evaluates in priority order, returns PriceBreakdown **(Recommended)**
- 2) Strategy pattern — each rule type is a separate strategy class
- 3) Expression engine — rules stored as expressions/formulas, evaluated dynamically
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-6: Excel Export Approach
**Question**: How should Excel export handle large datasets (10,000+ rows)?
- 1) Streaming export — ExcelJS streaming API, generate file on-the-fly, return as download **(Recommended)**
- 2) Background job — queue export, notify when ready, download from temp storage
- 3) Paginated export — export current page only, user exports page by page
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-7: Dashboard Data Strategy
**Question**: How should the admin dashboard aggregate metrics?
- 1) Direct queries — aggregate from source tables on each dashboard load, simple and always fresh **(Recommended)**
- 2) Materialized views — pre-computed metrics updated periodically
- 3) Separate analytics tables — denormalized tables updated on each assessment/stock change
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-8: Admin Frontend Architecture
**Question**: How should the admin frontend pages be organized in Next.js?
- 1) Route groups — `/admin/assessment/*`, `/admin/dashboard/*`, `/admin/catalog/*` with shared admin layout **(Recommended)**
- 2) Single admin page with tab navigation
- 3) Separate Next.js app for admin (separate from buyer/seller)
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-9: Validation Library for API DTOs
**Question**: How should API request bodies be validated? (class-validator already installed)
- 1) class-validator + class-transformer — NestJS native, decorator-based validation on DTO classes **(Recommended)**
- 2) Zod — schema-based validation, more functional approach
- 3) Joi — schema-based, widely used
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-10: Correctness Properties for Admin Unit
**Question**: Which admin features should have property-based testing (PBT) with fast-check?
- 1) Pricing engine + defect grading — the two most calculation-heavy features **(Recommended)**
- 2) Pricing engine only — most critical for correctness
- 3) All business logic — pricing, defect grading, test result scoring, stock calculations
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D3-1 Module Architecture: Feature-based sub-modules (customer, assessment, catalog, stock, dashboard)
- D3-2 Assessment State: Database-persisted with status field tracking current step
- D3-3 Photo Storage: Local filesystem with NestJS static file serving via /uploads/*
- D3-4 QR Real-Time: WebSocket (Socket.IO) — phone uploads, server pushes to PC
- D3-5 Pricing Engine: Service with rule evaluator — loads rules from DB, evaluates in priority order
- D3-6 Excel Export: Streaming export via ExcelJS streaming API
- D3-7 Dashboard Data: Direct queries — aggregate from source tables on each load
- D3-8 Frontend Routes: Route groups — /admin/assessment/*, /admin/dashboard/*, /admin/catalog/* with shared layout
- D3-9 Validation: class-validator + class-transformer (NestJS native)
- D3-10 PBT Scope: Pricing engine + defect grading

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
