# Tasks Decisions — Foundation Unit

## Context Summary
Foundation infrastructure unit: Nx monorepo scaffold, NestJS backend, Next.js frontend shell, MySQL + Prisma, JWT auth + RBAC, RFC 7807 errors, structured logging, shared types, config module. 6 components, 1 entity (User), 0 user-facing endpoints. Solo developer.

---

## Decision Questions

### D4-1: Implementation Approach
**Question**: What testing approach should be used during implementation?
- 1) Test-after — implement first, write tests after each component **(Recommended)**
- 2) TDD — write tests first, then implement to pass them
- 3) Outside-in — start with integration tests, then fill in unit tests
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-2: Task Granularity
**Question**: How granular should tasks be for the Foundation unit?
- 1) Component-level — one task per shared module (auth, errors, DB, logging, types, config) **(Recommended)**
- 2) Fine-grained — separate tasks for each file/class within a module
- 3) Phase-level — group into scaffold, shared modules, and frontend shell
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-3: Scaffold Priority
**Question**: What should be scaffolded first?
- 1) Nx monorepo + NestJS app + Prisma + basic config → then shared modules → then frontend shell **(Recommended)**
- 2) Full monorepo with both apps first → then shared modules
- 3) Backend only first → frontend deferred to domain unit phase
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-4: Seed Data
**Question**: Should the Foundation include seed data for development?
- 1) Yes — seed admin users (Operation + Manager) and a test seller account **(Recommended)**
- 2) No — seed data will be added in domain unit tasks
- 3) Minimal — only one admin user for testing
- 4) Other (please specify): _______

**Answer**: 1

---

### D4-5: CI/CD Setup
**Question**: Should Foundation include CI/CD pipeline setup?
- 1) Basic — GitHub Actions for lint, test, build on PR **(Recommended)**
- 2) Full — CI/CD with deployment to staging/production
- 3) None — defer CI/CD to later
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D4-1 Testing: Test-after — implement first, write tests after each component
- D4-2 Granularity: Component-level — one task per shared module
- D4-3 Scaffold: Nx monorepo + NestJS + Prisma + config first → shared modules → frontend shell
- D4-4 Seed Data: Yes — seed admin users (Operation + Manager) and test seller
- D4-5 CI/CD: Basic — GitHub Actions for lint, test, build on PR

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
