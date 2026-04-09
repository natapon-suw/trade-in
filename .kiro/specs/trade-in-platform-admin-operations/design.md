# Design Document: Admin Operations Unit

## Summary
- **Architecture**: Modular Monolith — NestJS feature-based sub-modules within admin module
- **Stack**: Next.js / NestJS / MySQL / Prisma / Socket.IO / ExcelJS
- **Components**: 8 — Customer, Catalog, Assessment, Photo/QR, Pricing, Stock, Dashboard, Export
- **Entities**: 12 — Customer, ProductModel, TestGuide, TestStep, DefectChecklist, DefectItem, Assessment, TestResult, AssessmentPhoto, AssessmentDefect, PricingRule, StockItem, QRSession
- **Endpoints**: 25+ REST endpoints + 1 WebSocket gateway
- **Integrations**: Socket.IO (QR photo sync), ExcelJS (export), qrcode (QR generation), multer (file upload)
- **Testing**: PBT Yes (pricing engine + defect grading) — NFR noted
- **Key Decisions**: Feature-based sub-modules, DB-persisted assessment state, WebSocket for QR photo sync

## Architecture

### Admin Module Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Admin Module                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Customer │  │ Catalog  │  │     Assessment       │  │
│  │ Module   │  │ Module   │  │ Module (orchestrator) │  │
│  └──────────┘  │ -Models  │  │ -Workflow state       │  │
│                │ -Guides  │  │ -Photo upload         │  │
│                │ -Defects │  │ -QR session           │  │
│                └──────────┘  │ -WebSocket gateway    │  │
│                              └──────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Pricing  │  │  Stock   │  │Dashboard │             │
│  │ Module   │  │ Module   │  │ Module   │             │
│  │ -Rules   │  │          │  │ -Metrics │             │
│  │ -Engine  │  │          │  │ -Export  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │  Foundation (shared/)       │
    │  Auth, Errors, DB, Logging  │
    └─────────────────────────────┘
```

### Key Design Decisions
1. **Feature-based sub-modules**: Each feature area (customer, catalog, assessment, pricing, stock, dashboard) is a separate NestJS module for clear boundaries.
2. **DB-persisted assessment state**: Assessment entity tracks workflow step via status enum, allowing resume after browser close.
3. **WebSocket for QR photo sync**: Socket.IO enables real-time photo push from mobile to PC during assessment.

## Open Questions & Risks

| # | Question/Risk | Impact | Status |
|---|--------------|--------|--------|
| 1 | QR session security — mobile uploads without JWT | Medium | Mitigated (session-based auth with 10min expiry) |
| 2 | Photo storage migration to cloud | Low | Open (local filesystem for now) |
| 3 | Dashboard query performance at scale | Medium | Mitigated (direct queries with proper indexes) |

## Detailed Specifications

- [Data Model](design/data-model.md) — 12 entities with relationships and indexes
- [API Specification](design/api-spec.md) — 25+ REST endpoints + WebSocket
- [Implementation](design/implementation.md) — directory structure and module organization
