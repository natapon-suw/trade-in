# Design Decisions — Seller Portal Unit

## Context Summary
Seller Portal: 3 stories (US-002 Seller Login, US-021 Price Check, US-024 Seller Registration). Simple unit — seller logs in, checks estimated trade-in price by selecting model + specs + defects, sees price range. No account required for price check (D1-10). Stack fully settled: NestJS, Next.js, MySQL/Prisma, JWT. Foundation + Admin Operations complete. Seller depends on Admin's product model catalog and pricing engine.

---

## Decision Questions

### D3-1: Seller Module Scope
**Question**: The seller price check was decided as no-account-required (D1-10). Should the seller module still include login/registration, or just the public price check?
- 1) Include both — login/registration for future features (price history, saved checks) + public price check **(Recommended)**
- 2) Public price check only — defer login/registration entirely
- 3) Login required for price check — override D1-10 decision
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-2: Price Check Integration
**Question**: How should the seller price check call the admin pricing engine?
- 1) Direct service call — import PricingService from admin module (monolith, simplest) **(Recommended)**
- 2) Internal API call — seller module calls admin REST endpoints
- 3) Duplicate logic — copy pricing calculation into seller module
- 4) Other (please specify): _______

**Answer**: 1

---

### D3-3: Seller Frontend Location
**Question**: Where should the seller pages live in the Next.js app?
- 1) Route group /seller/* — separate from admin, shared layout **(Recommended)**
- 2) Standalone pages at root — /price-check, /seller/login
- 3) Separate Next.js app — completely independent frontend
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D3-1 Scope: Include both — login/registration + public price check
- D3-2 Integration: Direct service call — import PricingService from admin module
- D3-3 Frontend: Route group /seller/* with shared layout

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
