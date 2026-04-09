# Tasks Decisions — Admin Operations Unit

## Context Summary
Admin Operations: 18 stories, 8 sub-modules (customer, catalog, assessment, photo/QR, pricing, stock, dashboard, export), 12 entities, 25+ REST endpoints + WebSocket. Feature-based NestJS sub-modules. DB-persisted assessment workflow. Socket.IO for QR photo sync. Streaming Excel export. Rule-based pricing engine with PBT. Solo developer. Test-after approach (from Foundation D4).

---

## Decision Questions

### D4-1: Task Breakdown Strategy
**Question**: How should the 18 stories be broken into implementation tasks?
- 1) By sub-module — one task group per NestJS sub-module (customer, catalog, assessment, pricing, stock, dashboard, export) **(Recommended)**
- 2) By workflow step — tasks follow the 8-step assessment flow sequentially
- 3) By layer — all Prisma models first, then all services, then all controllers, then all frontend
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-2: Backend vs Frontend Sequencing
**Question**: Should backend API and frontend pages be built together or separately?
- 1) Backend first, then frontend — build all API endpoints first, then all Next.js pages **(Recommended)**
- 2) Vertical slices — build backend + frontend for each feature together
- 3) Frontend first with mocks — build UI with mock data, then connect to real API
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-3: Prisma Schema Migration Strategy
**Question**: How should the 12 new entities be added to the Prisma schema?
- 1) Single migration — add all 12 entities in one migration, then build services on top **(Recommended)**
- 2) Incremental migrations — add entities as each sub-module is built
- 3) Migration per feature group — one migration for catalog entities, one for assessment, etc.
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-4: WebSocket Implementation Timing
**Question**: When should the Socket.IO WebSocket for QR photo sync be implemented?
- 1) After basic photo upload works — build PC upload first, then add QR/WebSocket as enhancement **(Recommended)**
- 2) Together with photo upload — build both upload methods simultaneously
- 3) Last — defer WebSocket to the end as it's the most complex feature
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-5: Testing Scope for Admin Unit
**Question**: What testing scope for this unit? (Test-after approach already decided)
- 1) Service-level unit tests + PBT for pricing/defects — test business logic, mock DB **(Recommended)**
- 2) Full coverage — unit tests for services + controller tests + integration tests
- 3) Minimal — PBT for pricing only, manual testing for the rest
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D4-1 Breakdown: By sub-module — one task group per NestJS sub-module
- D4-2 Sequencing: Backend first, then frontend
- D4-3 Migration: Single migration — all 12 entities in one migration
- D4-4 WebSocket: After basic photo upload — PC upload first, then QR/WebSocket
- D4-5 Testing: Service-level unit tests + PBT for pricing/defects

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
