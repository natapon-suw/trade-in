# Foundation Specification

## Summary
- **Team**: Solo developer
- **Repo**: Monorepo
- **Architecture**: Modular Monolith
- **Gateway**: N/A (monolith)
- **Auth**: JWT tokens — stateless
- **Error Format**: RFC 7807 Problem Details
- **Inter-Unit Comms**: Direct function calls with defined interfaces
- **Database**: Shared DB with schema separation per unit
- **Shared Types**: Shared package/module in common directory
- **Frontend**: In monorepo
- **Infrastructure Units**: Foundation (combined — scaffold, auth, errors, DB, shared utils)

---

## Repository Structure

**Strategy**: Monorepo
**Rationale**: Solo developer, single deployable monolith — monorepo keeps everything together with shared tooling.

```
project-root/
├── src/
│   ├── modules/
│   │   ├── admin/              # Admin Operations unit
│   │   ├── seller/             # Seller Portal unit
│   │   └── buyer/              # Buyer Portal unit
│   ├── shared/
│   │   ├── types/              # Shared DTOs, interfaces
│   │   ├── auth/               # JWT middleware, RBAC
│   │   ├── errors/             # RFC 7807 error handling
│   │   ├── database/           # DB connection, migrations
│   │   └── utils/              # Common utilities
│   ├── config/                 # App configuration
│   └── app.ts                  # Application entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                     # Static assets
├── .kiro/specs/                # AI-DLC spec artifacts
├── .aidlc/workflow/            # AI-DLC workflow state
├── package.json
├── tsconfig.json
└── README.md
```

**Ownership Rules**: Solo developer owns everything. Shared code in `src/shared/` is the foundation.

---

## Authentication & Authorization

**Approach**: JWT tokens — stateless

**Shared Auth Contract**:
```typescript
interface AuthContext {
  userId: string;
  email: string;
  role: 'admin-operation' | 'admin-manager' | 'seller';
  permissions: string[];
}

type AuthMiddleware = (req: Request) => AuthContext | UnauthorizedError;
```

**Authorization**: RBAC with role-based permissions
**Enforced at**: Unit level — each module checks permissions via shared auth middleware

**Roles & Permissions**:
| Role | Permissions |
|------|------------|
| admin-operation | assessment.*, customer.*, stock.add |
| admin-manager | assessment.view, stock.*, dashboard.*, export.*, pricing.*, catalog.*, test-guide.*, defect-checklist.* |
| seller | price-check.*, account.own |

---

## Error Handling

**Format**: RFC 7807 Problem Details

**Standard Error Shape**:
```typescript
interface AppError {
  type: string;        // URI reference for error type
  title: string;       // Human-readable summary
  status: number;      // HTTP status code
  detail?: string;     // Human-readable explanation
  instance?: string;   // URI of the specific occurrence
  code: string;        // App-specific code "AUTH_001"
  requestId: string;   // Correlation ID
}
```

**Code Convention**: `[DOMAIN]_[NUMBER]`

**Shared Codes**:
| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_001 | 400 | Invalid request body |
| AUTH_001 | 401 | Missing or invalid JWT token |
| AUTH_002 | 403 | Insufficient role/permissions |
| NOT_FOUND_001 | 404 | Resource not found |
| CONFLICT_001 | 409 | Duplicate resource (e.g., customer phone) |
| INTERNAL_001 | 500 | Unexpected server error |

---

## Inter-Unit Communication

**Pattern**: Direct function calls with defined interfaces

Since this is a modular monolith, units communicate via TypeScript interfaces and direct imports. No network calls between units.

**Convention**: Each unit exposes a public API via an `index.ts` barrel file. Other units import only from this public interface — never from internal files.

```typescript
// src/modules/admin/index.ts — public API
export { getProductModels } from './services/product-catalog.service';
export { calculatePrice } from './services/pricing.service';
export { getStockItems } from './services/stock.service';
export type { ProductModel, StockItem, PriceEstimate } from './types';
```

---

## Database Strategy

**Approach**: Shared database with schema separation

**Convention**: Table prefix per unit
- Admin: `admin_*` (e.g., `admin_customers`, `admin_assessments`, `admin_stock_items`)
- Seller: `seller_*` (e.g., `seller_accounts`)
- Buyer: No tables (read-only from admin stock)

**Cross-unit access**: Via unit's public service interface, never direct table access.

---

## Shared Types & Contracts

**Strategy**: Shared package in `src/shared/types/`

```typescript
// src/shared/types/index.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PriceBreakdown {
  basePrice: number;
  testDeductions: number;
  defectDeductions: number;
  finalPrice: number;
}

export type DefectSeverity = 1 | 2 | 3 | 4 | 5;

export type UserRole = 'admin-operation' | 'admin-manager' | 'seller';
```

---

## Code & Data Conventions

### Code
- **Language**: TypeScript (pending D3 confirmation)
- **Naming**: camelCase for variables/functions, PascalCase for types/classes, kebab-case for files
- **Testing**: Pending D3 decisions
- **Linting/Formatting**: Pending D3 decisions

### Data
- **IDs**: UUID v4
- **Timestamps**: ISO 8601 UTC
- **Soft deletes**: Yes with `deletedAt` column

---

## Integration Contracts

### Admin Operations → Seller Portal

**Interface** (direct function call):
```typescript
// Seller calls Admin's pricing engine
getProductModels(search?: string): Promise<ProductModel[]>
calculateEstimatedPrice(modelId: string, specs: DeviceSpec, defects: DefectInput[]): Promise<PriceEstimate>
```

### Admin Operations → Buyer Portal

**Interface** (direct function call):
```typescript
// Buyer reads Admin's stock
getStockItems(filters: StockFilter): Promise<PaginatedResponse<StockItem>>
getStockItemDetail(id: string): Promise<StockItemDetail>
```

---

## Logging & Observability

**Log Format**: Structured JSON
**Correlation**: Request ID via `X-Request-Id` header, propagated through all function calls
**Log Levels**: error, warn, info, debug
