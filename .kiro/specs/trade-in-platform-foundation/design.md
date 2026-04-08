# Design Document: Foundation Unit

## Summary
- **Architecture**: Modular Monolith — NestJS with module-per-domain pattern
- **Stack**: Next.js (React) / NestJS (Node.js) / MySQL / Prisma
- **Components**: 6 — Auth, Errors, Database, Logging, Types, Config
- **Entities**: 1 — User (auth accounts)
- **Endpoints**: 0 (Foundation is infrastructure — no user-facing endpoints)
- **Integrations**: None (internal shared modules)
- **Testing**: PBT Yes (fast-check) — NFR deferred to domain units
- **Key Decisions**: NestJS modular monolith, MySQL + Prisma, JWT + RBAC, npm + Nx monorepo

## Architecture

### System Context Diagram
```
┌─────────────────────────────────────────────┐
│              Nx Monorepo                     │
│                                              │
│  ┌──────────────┐    ┌──────────────┐       │
│  │   apps/api   │    │   apps/web   │       │
│  │   (NestJS)   │    │  (Next.js)   │       │
│  │              │    │              │        │
│  │  ┌────────┐  │    │  Tailwind +  │       │
│  │  │ Admin  │  │    │  shadcn/ui   │       │
│  │  │ Seller │  │◄───│              │       │
│  │  │ Buyer  │  │    └──────────────┘       │
│  │  └────────┘  │                            │
│  │      │       │                            │
│  │  ┌────────┐  │                            │
│  │  │ Shared │  │                            │
│  │  │ (Auth, │  │                            │
│  │  │ Errors,│  │                            │
│  │  │ DB,    │  │                            │
│  │  │ Log)   │  │                            │
│  │  └────────┘  │                            │
│  └──────┬───────┘                            │
│         │                                    │
│    ┌────▼────┐                               │
│    │  MySQL  │                               │
│    └─────────┘                               │
└──────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 14+ (React 18+) with Tailwind CSS + shadcn/ui
- **Backend**: NestJS 10+ on Node.js 20+
- **Database**: MySQL 8.0+ with Prisma ORM
- **Monorepo**: Nx with npm workspaces
- **Testing**: Vitest + fast-check (PBT)
- **Linting**: ESLint + Prettier
- **API Docs**: OpenAPI/Swagger via @nestjs/swagger
- **Key Libraries**: ExcelJS, qrcode, Winston, bcrypt

### Key Design Decisions
1. **NestJS Modular Monolith**: Built-in module system maps perfectly to domain units. Each unit = NestJS module.
2. **MySQL + Prisma**: User chose MySQL. Prisma provides type-safe client and migration tooling.
3. **Nx Monorepo**: npm + Nx for workspace management, build caching, and task orchestration.

## Open Questions & Risks

| # | Question/Risk | Impact | Status |
|---|--------------|--------|--------|
| 1 | MySQL lacks native UUID type — using String | Low | Mitigated (Prisma handles) |
| 2 | Local file storage for photos — needs migration path to cloud later | Medium | Open |

## Detailed Specifications

- [Components](design/components.md) — Auth, Errors, Database, Logging, Types, Config
- [Data Model](design/data-model.md) — User entity, Prisma schema, conventions
- [Implementation](design/implementation.md) — Directory structure, setup, conventions
