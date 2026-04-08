# Implementation Specifications — Foundation Unit

## Code Organization

**Architecture Pattern**: Modular Monolith (NestJS modules)
**Repository**: Monorepo with Nx

### Directory Structure
```
trade-in-platform/
├── apps/
│   ├── api/                        # NestJS backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── admin/          # Admin Operations module (future)
│   │   │   │   ├── seller/         # Seller Portal module (future)
│   │   │   │   └── buyer/          # Buyer Portal module (future)
│   │   │   ├── shared/
│   │   │   │   ├── auth/           # JWT auth + RBAC
│   │   │   │   ├── errors/         # RFC 7807 error handling
│   │   │   │   ├── database/       # Prisma setup + migrations
│   │   │   │   ├── logging/        # Structured logging
│   │   │   │   ├── types/          # Shared DTOs, interfaces
│   │   │   │   └── utils/          # Common utilities
│   │   │   ├── config/             # App configuration
│   │   │   ├── app.module.ts       # Root NestJS module
│   │   │   └── main.ts             # Entry point
│   │   ├── test/                   # E2E tests
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── project.json            # Nx project config
│   └── web/                        # Next.js frontend (future)
│       ├── src/
│       │   ├── app/                # Next.js App Router
│       │   ├── components/         # Shared UI components
│       │   ├── lib/                # API client, utilities
│       │   └── styles/             # Tailwind config
│       └── project.json
├── libs/                           # Nx shared libraries (future)
├── nx.json                         # Nx workspace config
├── package.json                    # Root package.json
├── tsconfig.base.json              # Shared TS config
├── .env.example                    # Environment template
├── .eslintrc.json                  # ESLint config
├── .prettierrc                     # Prettier config
└── README.md
```

### Module Boundaries
- Domain modules (`admin/`, `seller/`, `buyer/`) import from `shared/` only
- Domain modules never import from each other directly — use shared interfaces
- `shared/` modules have no dependencies on domain modules
- Each domain module registers as a NestJS module in `app.module.ts`

### Naming Conventions
- **Files**: kebab-case (e.g., `jwt-auth.guard.ts`)
- **Classes**: PascalCase (e.g., `JwtAuthGuard`)
- **Functions**: camelCase (e.g., `hashPassword`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `AuthContext`)

---

## Technology Stack

### Dependencies
| Package | Purpose |
|---------|---------|
| @nestjs/core, @nestjs/common | NestJS framework |
| @nestjs/platform-express | Express adapter |
| @nestjs/passport, passport-jwt | JWT authentication |
| @nestjs/swagger | OpenAPI/Swagger docs |
| @prisma/client, prisma | Database ORM |
| bcrypt | Password hashing |
| jsonwebtoken | JWT token handling |
| class-validator, class-transformer | DTO validation |
| winston | Structured logging |
| uuid | UUID generation |
| next, react, react-dom | Frontend framework |
| tailwindcss | CSS framework |
| exceljs | Excel export |
| qrcode | QR code generation |
| fast-check | Property-based testing |

### Nx Workspace Configuration
- **Tool**: Nx with npm workspaces
- **Apps**: `api` (NestJS), `web` (Next.js)
- **Libs**: Shared libraries as needed

---

## Development Setup

### Prerequisites
- Node.js v20+
- npm v10+
- MySQL 8.0+
- Nx CLI (`npm install -g nx`)

### Setup Commands
```bash
git clone <repo-url>
npm install
cp .env.example .env
# Edit .env with MySQL connection string
npx prisma migrate dev
nx serve api
# In another terminal:
nx serve web
```

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | mysql://user:pass@localhost:3306/tradein |
| JWT_SECRET | Secret for JWT signing | <generated-secret> |
| JWT_EXPIRATION | Token expiry | 24h |
| PORT | API server port | 3000 |
| UPLOAD_PATH | Photo storage directory | ./uploads |
| NODE_ENV | Environment | development |

---

## Testing

**Unit Tests**: Vitest — `nx test api`
**Integration Tests**: Vitest + Prisma test utils — `nx test api --integration`
**E2E Tests**: Vitest + Supertest — `nx e2e api-e2e`
**PBT**: fast-check with Vitest — included in unit test runs

**Coverage Target**: 80%+

---

## Git Workflow

**Branching**: GitHub Flow (main + feature branches)
**Branch Naming**: `feature/<name>`, `bugfix/<name>`, `chore/<name>`
**Commit Messages**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
