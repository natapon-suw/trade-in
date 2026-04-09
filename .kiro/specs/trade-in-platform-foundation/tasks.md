# Implementation Tasks — Foundation Unit

## Overview
Tasks organized by component-level granularity with scaffold-first approach.

**Derived From**:
- Design: 6 components, 1 entity (User), 0 endpoints from `design/` folder
- Foundation: Shared infrastructure for all domain units

**Strategy**: Scaffold first → shared modules → frontend shell → seed + CI/CD
**Rationale**: Scaffold must exist before modules can be added. Shared modules are independent of each other. Frontend shell and seed data come last.

---

- [ ] 1. Project Scaffold
  - [x] 1.1 Initialize Nx monorepo with NestJS API app
    - **Deps**: None | **Ref**: `design/implementation.md` — Directory Structure
    - Create Nx workspace with npm workspaces
    - Generate NestJS app at `apps/api/`
    - Configure `nx.json`, `tsconfig.base.json`, root `package.json`
    - Set up ESLint + Prettier configs at root
    - Verify `nx serve api` starts successfully
  - [x] 1.2 Set up Prisma with MySQL
    - **Deps**: 1.1 | **Ref**: `design/data-model.md` — Prisma Schema
    - Install Prisma and @prisma/client
    - Create `apps/api/prisma/schema.prisma` with MySQL datasource
    - Define User model with all fields (id, email, passwordHash, name, role, isActive, createdAt, updatedAt, deletedAt)
    - Create initial migration
    - Verify `npx prisma migrate dev` runs successfully
  - [x] 1.3 Set up Config module
    - **Deps**: 1.1 | **Ref**: `design/components.md` — Config Module
    - Create `src/config/` with NestJS ConfigModule (global)
    - Define environment variable schema and validation (DATABASE_URL, JWT_SECRET, JWT_EXPIRATION, PORT, UPLOAD_PATH, NODE_ENV)
    - Create `.env.example` with all variables
    - Write tests for config validation

- [ ] 2. Shared Modules
  - [x] 2.1 Implement Database module
    - **Deps**: 1.2 | **Ref**: `design/components.md` — Database Module
    - Create `src/shared/database/database.module.ts` and `prisma.service.ts`
    - Implement PrismaService with onModuleInit/onModuleDestroy lifecycle
    - Export PrismaService as injectable provider
    - Write tests for PrismaService lifecycle
  - [x] 2.2 Implement Shared Types
    - **Deps**: 1.1 | **Ref**: `design/components.md` — Shared Types
    - Create `src/shared/types/` with barrel export
    - Define AuthContext, JwtPayload, PaginatedResponse, PaginationQuery
    - Define PriceBreakdown, DefectSeverity, UserRole
    - Define AppError (RFC 7807 shape)
  - [x] 2.3 Implement Error Handling module
    - **Deps**: 2.2 | **Ref**: `design/components.md` — Error Handling Module
    - Create `src/shared/errors/` with NestJS module
    - Implement AllExceptionsFilter (global exception filter, RFC 7807 format)
    - Create AppException base class and domain exceptions (Validation, Unauthorized, Forbidden, NotFound, Conflict)
    - Define shared error codes in `error-codes.ts`
    - Register as global filter in app.module.ts
    - Write tests for exception filter and error formatting
  - [x] 2.4 Implement Logging module
    - **Deps**: 2.2 | **Ref**: `design/components.md` — Logging Module
    - Create `src/shared/logging/` with NestJS module
    - Implement AppLogger service using Winston (structured JSON)
    - Implement RequestIdMiddleware (generate/propagate X-Request-Id)
    - Register middleware globally
    - Write tests for logger output format and request ID propagation
  - [x] 2.5 Implement Auth module
    - **Deps**: 2.1, 2.2, 2.3 | **Ref**: `design/components.md` — Auth Module
    - Create `src/shared/auth/` with NestJS module
    - Implement AuthService (login, hashPassword, verifyPassword, generateToken)
    - Implement JWT strategy (passport-jwt)
    - Implement JwtAuthGuard and RolesGuard
    - Create @Roles() and @CurrentUser() decorators
    - Define role-permission matrix (admin-operation, admin-manager, seller)
    - Write tests for auth service, guards, and decorators
    - Write PBT tests with fast-check for JWT token generation/validation properties

- [ ] 3. Frontend Shell & Finalization
  - [x] 3.1 Initialize Next.js frontend app
    - **Deps**: 1.1 | **Ref**: `design/implementation.md` — Directory Structure
    - Generate Next.js app at `apps/web/` within Nx workspace
    - Configure Tailwind CSS + shadcn/ui
    - Set up App Router structure (`src/app/`)
    - Create basic layout with placeholder pages
    - Verify `nx serve web` starts successfully
  - [x] 3.2 Seed data script
    - **Deps**: 2.1, 2.5 | **Ref**: D4-4 Seed Data decision
    - Create `apps/api/prisma/seed.ts`
    - Seed Admin Operation user, Admin Manager user, and test Seller account
    - Hash passwords with bcrypt
    - Configure seed command in package.json (`prisma db seed`)
    - Write test to verify seed creates expected users
  - [x] 3.3 CI/CD pipeline
    - **Deps**: 1.1 | **Ref**: D4-5 CI/CD decision
    - Create `.github/workflows/ci.yml`
    - Configure: install deps, lint, test, build on PR to main
    - Use Nx affected commands for efficient CI
    - Verify pipeline runs successfully

---

## Task Summary

| Task | Title | Dependencies | Status |
|------|-------|--------------|--------|
| 1.1 | Initialize Nx monorepo with NestJS API app | None | [ ] |
| 1.2 | Set up Prisma with MySQL | 1.1 | [ ] |
| 1.3 | Set up Config module | 1.1 | [ ] |
| 2.1 | Implement Database module | 1.2 | [ ] |
| 2.2 | Implement Shared Types | 1.1 | [ ] |
| 2.3 | Implement Error Handling module | 2.2 | [ ] |
| 2.4 | Implement Logging module | 2.2 | [ ] |
| 2.5 | Implement Auth module | 2.1, 2.2, 2.3 | [ ] |
| 3.1 | Initialize Next.js frontend app | 1.1 | [ ] |
| 3.2 | Seed data script | 2.1, 2.5 | [ ] |
| 3.3 | CI/CD pipeline | 1.1 | [ ] |

---

## Design Coverage

**Components**: 6 components → Tasks 1.3 (Config), 2.1 (Database), 2.2 (Types), 2.3 (Errors), 2.4 (Logging), 2.5 (Auth)
**Entities**: 1 entity (User) → Task 1.2 (Prisma schema)
**Endpoints**: 0 (Foundation has no user-facing endpoints)
**Integrations**: 0 (internal shared modules only)

---

## Definition of Done

- [ ] Code written and follows ESLint + Prettier standards
- [ ] Tests written (test-after) and passing via Vitest
- [ ] PBT properties defined for auth token logic (fast-check)
- [ ] All Nx apps serve successfully
- [ ] Prisma migrations run cleanly
- [ ] Seed data creates expected users

---

## Execution Waves

| Wave | Tasks | Dependencies Resolved | Parallel |
|------|-------|-----------------------|----------|
| 1 | 1.1 | None | No |
| 2 | 1.2, 1.3, 2.2, 3.1, 3.3 | 1.1 | Yes |
| 3 | 2.1, 2.3, 2.4 | 1.2, 2.2 | Yes |
| 4 | 2.5 | 2.1, 2.2, 2.3 | No |
| 5 | 3.2 | 2.1, 2.5 | No |

### File Ownership Per Wave

**Wave 2**:
- Task 1.2: `apps/api/prisma/`
- Task 1.3: `apps/api/src/config/`, `.env.example`
- Task 2.2: `apps/api/src/shared/types/`
- Task 3.1: `apps/web/`
- Task 3.3: `.github/workflows/`

**Wave 3**:
- Task 2.1: `apps/api/src/shared/database/`
- Task 2.3: `apps/api/src/shared/errors/`
- Task 2.4: `apps/api/src/shared/logging/`

---

## Notes

**Technical Debt**: Local file storage for photos — will need migration path to cloud storage in future.

**Future Enhancements**: Domain modules (Admin, Seller, Buyer) will be added in subsequent unit phases.
