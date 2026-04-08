# Foundation Decisions

## Context Summary
Modular Monolith with 3 domain units (Admin Operations, Seller Portal, Buyer Portal). Incremental mode — Admin first. Shared components: auth/RBAC, pricing engine. Dependencies: Seller and Buyer depend on Admin. Greenfield project, tech stack not yet decided (deferred to D3).

---

## Decision Questions

### DF-1: Team Structure
**Question**: What is the team structure for this project?
- 1) Solo developer **(Recommended)**
- 2) Small team (2-3 developers)
- 3) Multiple teams (4+ developers)
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-2: Repository Strategy
**Question**: How should the codebase be organized?
- 1) Monorepo — all units in a single repository with shared tooling **(Recommended)**
- 2) Multi-repo — separate repository per unit
- 3) Hybrid — monorepo for backend, separate repo for frontend
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-3: Shared Auth Approach
**Question**: How should authentication and authorization work across the platform?
- 1) JWT tokens — stateless, good for API-first architecture **(Recommended)**
- 2) Session-based — server-side sessions with cookies, simpler but stateful
- 3) OAuth2 with external provider (Google, Auth0)
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-4: Error Handling Format
**Question**: What error response format should the platform use?
- 1) RFC 7807 Problem Details — standardized JSON error format **(Recommended)**
- 2) Custom error format — project-specific error structure
- 3) Framework default — use whatever the chosen framework provides
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-5: Inter-Unit Communication
**Question**: How should units communicate within the modular monolith?
- 1) Direct function calls with defined interfaces — simplest for monolith **(Recommended)**
- 2) Internal event bus — loose coupling via events within the monolith
- 3) Mixed — direct calls for queries, events for state changes
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-6: Database Strategy
**Question**: How should the database be organized across units?
- 1) Shared database with schema separation — one DB, separate schemas/tables per unit **(Recommended)**
- 2) Single shared schema — all units share the same tables
- 3) Database per unit — separate databases for each unit
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-7: Shared Types Strategy
**Question**: How should shared types (DTOs, interfaces) be managed across units?
- 1) Shared package/module — common types in a shared directory **(Recommended)**
- 2) Code generation from API specs — generate types from OpenAPI/GraphQL schemas
- 3) Manual duplication — each unit defines its own types
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-8: Infrastructure Unit Strategy
**Question**: Should infrastructure components (auth middleware, error handling, DB setup, shared utilities) be combined into a single Foundation unit or split into separate units?
- 1) Combined — single Foundation unit handles all shared infrastructure (recommended for solo/small teams) **(Recommended)**
- 2) Separate — individual units for auth service, shared utilities, etc.
- 3) No infrastructure unit — embed shared code directly in domain units
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- DF-1 Team: Solo developer
- DF-2 Repository: Monorepo — all units in single repository
- DF-3 Auth: JWT tokens — stateless
- DF-4 Errors: RFC 7807 Problem Details
- DF-5 Communication: Direct function calls with defined interfaces
- DF-6 Database: Shared database with schema separation per unit
- DF-7 Shared Types: Shared package/module in common directory
- DF-8 Infra Strategy: Combined — single Foundation unit for all shared infrastructure

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
