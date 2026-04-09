# Implementation Specifications — Admin Operations Unit

## Code Organization

**Architecture Pattern**: Feature-based sub-modules within NestJS
**Location**: `apps/api/src/modules/admin/`

### Directory Structure
```
apps/api/src/modules/admin/
├── admin.module.ts                 # Root admin module importing sub-modules
├── customer/
│   ├── customer.module.ts
│   ├── customer.controller.ts
│   ├── customer.service.ts
│   ├── dto/
│   │   ├── create-customer.dto.ts
│   │   └── search-customer.dto.ts
│   └── customer.service.spec.ts
├── catalog/
│   ├── catalog.module.ts
│   ├── product-model.controller.ts
│   ├── product-model.service.ts
│   ├── test-guide.controller.ts
│   ├── test-guide.service.ts
│   ├── defect-checklist.controller.ts
│   ├── defect-checklist.service.ts
│   └── dto/
├── assessment/
│   ├── assessment.module.ts
│   ├── assessment.controller.ts
│   ├── assessment.service.ts
│   ├── photo.controller.ts
│   ├── photo.service.ts
│   ├── qr-session.service.ts
│   ├── photo-sync.gateway.ts       # WebSocket gateway for real-time sync
│   ├── dto/
│   └── assessment.service.spec.ts
├── pricing/
│   ├── pricing.module.ts
│   ├── pricing-rule.controller.ts
│   ├── pricing-rule.service.ts
│   ├── pricing.service.ts          # Price calculation engine
│   ├── dto/
│   ├── pricing.service.spec.ts
│   └── pricing.service.pbt.spec.ts # PBT tests
├── stock/
│   ├── stock.module.ts
│   ├── stock.controller.ts
│   ├── stock.service.ts
│   ├── dto/
│   └── stock.service.spec.ts
├── dashboard/
│   ├── dashboard.module.ts
│   ├── dashboard.controller.ts
│   ├── dashboard.service.ts
│   └── dashboard.service.spec.ts
├── export/
│   ├── export.module.ts
│   ├── export.controller.ts
│   ├── export.service.ts
│   └── export.service.spec.ts
├── auth/
│   ├── auth.controller.ts          # Login endpoint
│   └── auth.module.ts
└── index.ts                        # Public API barrel export
```

### Frontend Structure (Next.js)
```
apps/web/src/app/
├── admin/
│   ├── layout.tsx                  # Admin layout with sidebar nav
│   ├── page.tsx                    # Redirect to dashboard or assessment
│   ├── assessment/
│   │   ├── page.tsx                # Assessment workflow wizard
│   │   └── [id]/page.tsx           # Assessment detail/resume
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard with metrics
│   ├── catalog/
│   │   ├── models/page.tsx         # Product model management
│   │   ├── test-guides/page.tsx    # Test guide management
│   │   └── defect-checklists/page.tsx
│   ├── stock/
│   │   ├── page.tsx                # Stock list
│   │   └── [id]/page.tsx           # Stock item detail
│   └── pricing/
│       └── page.tsx                # Pricing rules management
├── login/
│   └── page.tsx                    # Login page
└── qr/
    └── [sessionId]/page.tsx        # Mobile photo capture page (QR target)
```

### Module Boundaries
- Sub-modules import from `shared/` only — never from each other directly
- Assessment module orchestrates the workflow, calling other services as needed
- Pricing module exposes `calculatePrice()` for both admin assessment and seller price check

### Additional Dependencies
| Package | Purpose |
|---------|---------|
| @nestjs/platform-socket.io | WebSocket support for photo sync |
| socket.io | Socket.IO server |
| socket.io-client | Socket.IO client (frontend) |
| multer, @types/multer | File upload handling |
| @nestjs/serve-static | Serve uploaded photos |
