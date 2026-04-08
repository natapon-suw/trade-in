# Units Decisions

## Context Summary
24 user stories across 8 functional areas. 5 user types: Admin Operation, Admin Manager, Seller, Buyer Storefront, Buyer Online. 3 clear domains: Admin Operations (assessment workflow, testing, defects, photos, pricing, stock — 14 stories), Seller Portal (price check, auth — 3 stories), Buyer Portal (online + storefront browsing — 2 stories). Plus cross-cutting auth/RBAC (3 stories) and dashboard/export (2 stories). Admin-first priority.

---

## Decision Questions

### D2-1: Decomposition Strategy
**Question**: How should we decompose this platform into units?
- 1) By domain — Admin Operations, Seller Portal, Buyer Portal (3 units aligned with user domains) **(Recommended)**
- 2) By feature — Assessment, Catalog Management, Browsing, Auth (4+ units by feature)
- 3) By layer — Frontend, Backend API, Data Layer (horizontal split)
- 4) Other (please specify): _______

**Answer**: 1

---

### D2-2: Architecture Pattern
**Question**: What high-level architecture pattern should the platform follow?
- 1) Modular Monolith — single deployable with clear module boundaries, good for small teams **(Recommended)**
- 2) Microservices — independent services per domain, better for scaling teams independently
- 3) Monolith — single codebase without module boundaries, simplest but hardest to maintain
- 4) Other (please specify): _______

**Answer**: 1

---

### D2-3: Admin Unit Scope
**Question**: The admin domain has 14 stories covering assessment workflow, testing, defects, photos, pricing, stock, dashboard, and export. Should it stay as one unit or split further?
- 1) Single Admin unit — keeps the assessment workflow cohesive, Manager features included **(Recommended)**
- 2) Split into Admin Assessment (Operation workflow) + Admin Management (Manager dashboard, pricing rules, catalog management)
- 3) Split into Admin Assessment + Admin Catalog + Admin Dashboard (3 sub-units)
- 4) Other (please specify): _______

**Answer**: 1

---

### D2-4: Shared Components
**Question**: Auth/RBAC and the pricing engine are used across domains. How should shared components be handled?
- 1) Shared module within the monolith — auth and pricing as internal shared modules **(Recommended)**
- 2) Separate shared services — auth service and pricing service as independent units
- 3) Inline in each unit — each unit implements its own auth and pricing logic
- 4) Other (please specify): _______

**Answer**: 1

---

### D2-5: Development Sequence
**Question**: In what order should units be designed and implemented?
- 1) Admin first → Seller → Buyer (follows your stated priority, admin is the core) **(Recommended)**
- 2) Shared/Foundation first → Admin → Seller → Buyer (establish shared components, then domains)
- 3) All in parallel (faster but more coordination overhead)
- 4) Other (please specify): _______

**Answer**: 1

---

### D2-6: Buyer Unit Handling
**Question**: Buyer Storefront and Buyer Online share the same data (stock items) but have different UIs. Should they be one unit or two?
- 1) Single Buyer unit with two views (online + storefront) — simpler, shared product listing logic **(Recommended)**
- 2) Two separate units — Buyer Online and Buyer Storefront — independent UI development
- 3) Buyer as part of Admin unit — since it just reads stock data, no separate unit needed
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D2-1 Decomposition: By domain — Admin Operations, Seller Portal, Buyer Portal (3 units)
- D2-2 Architecture: Modular Monolith — single deployable with clear module boundaries
- D2-3 Admin Scope: Single Admin unit — assessment workflow + Manager features together
- D2-4 Shared Components: Shared module within the monolith — auth and pricing as internal shared modules
- D2-5 Dev Sequence: Admin first → Seller → Buyer
- D2-6 Buyer Handling: Single Buyer unit with two views (online + storefront)

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
