---
inclusion: always
---
# Project Structure

## Repository

- **Type**: Monorepo (Nx + npm workspaces)
- **Root**: Trade-in platform workspace

## Key Directories

| Directory | Purpose |
|-----------|---------|
| apps/api/ | NestJS backend API |
| apps/web/ | Next.js frontend |
| apps/api/src/modules/ | Domain modules (admin, seller, buyer) |
| apps/api/src/shared/ | Foundation shared code (auth, errors, DB, logging, types) |
| apps/api/prisma/ | Prisma schema and migrations |
| .kiro/specs/ | AI-DLC spec artifacts |
| .aidlc/workflow/ | AI-DLC workflow state |

## Key Files

| File | Purpose |
|------|---------|
| nx.json | Nx workspace configuration |
| package.json | Root dependencies and scripts |
| tsconfig.base.json | Shared TypeScript configuration |
| apps/api/prisma/schema.prisma | Database schema |
| .env | Environment variables |

## Entry Points

- `apps/api/src/main.ts` — NestJS API server
- `apps/web/src/app/` — Next.js App Router
