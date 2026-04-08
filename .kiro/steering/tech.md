---
inclusion: always
---
# Technology Context

## Stack

- **Languages**: TypeScript
- **Frameworks**: NestJS (backend), Next.js (frontend)
- **Build System**: Nx
- **Package Manager**: npm
- **Testing**: Vitest + fast-check (PBT)

## Architecture

- **Pattern**: Modular Monolith (NestJS modules)
- **API Style**: REST with OpenAPI/Swagger

## Infrastructure

- **Cloud Provider**: Pending deployment decisions
- **Compute**: Pending deployment decisions
- **Database**: MySQL 8.0+ with Prisma ORM
- **IaC Tool**: Pending deployment decisions

## Conventions

- **Code Style**: ESLint + Prettier
- **Naming**: kebab-case files, PascalCase classes, camelCase functions
- **Testing Pattern**: Vitest for unit/integration, fast-check for PBT
- **Branch Strategy**: GitHub Flow (main + feature branches)
