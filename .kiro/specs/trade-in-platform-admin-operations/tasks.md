# Implementation Tasks — Admin Operations Unit

## Overview
Tasks organized by sub-module with backend-first approach.

**Derived From**:
- Requirements: 18 user stories (US-001, US-003-US-020)
- Design: 8 sub-modules, 12 entities, 25+ endpoints, 1 WebSocket gateway

**Strategy**: By sub-module, backend first → frontend
**Rationale**: Each sub-module is independently testable. Backend API complete before frontend pages.

---

- [ ] 1. Database Schema & Admin Module Scaffold
  - [x] 1.1 Add all admin entities to Prisma schema
    - **Deps**: None | **Ref**: `design/data-model.md` — all entities
    - Add Customer, ProductModel, TestGuide, TestStep, DefectChecklist, DefectItem, Assessment (with status enum), TestResult, AssessmentPhoto, AssessmentDefect, PricingRule, StockItem, QRSession to schema.prisma
    - Add all enums: ProductCategory (LAPTOP, PC, MACBOOK), AssessmentStatus, UploadVia (PC, MOBILE), ConditionType, ConditionOperator, AdjustmentType, StockStatus
    - Create migration and run it
    - Verify schema with `npx prisma validate`
  - [x] 1.2 Scaffold admin module structure
    - **Deps**: 1.1 | **Ref**: `design/implementation.md` — directory structure
    - Create `apps/api/src/modules/admin/admin.module.ts` root module
    - Create empty sub-module folders: customer/, catalog/, assessment/, pricing/, stock/, dashboard/, export/, auth/
    - Create DTOs directory in each sub-module
    - Register AdminModule in app.module.ts
    - Install additional deps: @nestjs/platform-socket.io, socket.io, multer, @types/multer, @nestjs/serve-static

- [ ] 2. Auth & Customer Sub-Modules (Backend)
  - [x] 2.1 Implement admin auth controller
    - **Deps**: 1.2 | **Ref**: `design/api-spec.md` — POST /api/v1/auth/login
    - Create login endpoint using shared AuthService
    - Return JWT token + AuthContext with permissions
    - Write tests for login controller
  - [x] 2.2 Implement customer service and controller
    - **Deps**: 1.2 | **Ref**: `design/api-spec.md` — Customers endpoints
    - Create CustomerService: search (by name/phone), create (with phone uniqueness check)
    - Create CustomerController: GET /customers?search, POST /customers
    - Create DTOs: CreateCustomerDto, SearchCustomerDto
    - Apply JwtAuthGuard + RolesGuard (admin-operation, admin-manager)
    - Write tests for CustomerService

- [ ] 3. Catalog Sub-Module (Backend)
  - [x] 3.1 Implement product model service and controller
    - **Deps**: 1.2 | **Ref**: `design/api-spec.md` — Product Models endpoints
    - Create ProductModelService: search, create, update, deactivate
    - Create ProductModelController: GET, POST, PATCH endpoints
    - Create DTOs with class-validator decorators
    - Roles: search = admin-operation + admin-manager, create/update = admin-manager
    - Write tests for ProductModelService
  - [ ] 3.2 Implement test guide service and controller
    - **Deps**: 1.2 | **Ref**: `design/api-spec.md` — Test Guides endpoints
    - Create TestGuideService: list by category, create with steps, update
    - Create TestGuideController: GET, POST, PATCH endpoints
    - Include TestStep creation as nested operation
    - Write tests for TestGuideService
  - [ ] 3.3 Implement defect checklist service and controller
    - **Deps**: 1.2 | **Ref**: `design/api-spec.md` — Defect Checklists endpoints
    - Create DefectChecklistService: list by category, create with items, update
    - Create DefectChecklistController: GET, POST, PATCH endpoints
    - Include DefectItem creation as nested operation
    - Write tests for DefectChecklistService

- [ ] 4. Assessment Sub-Module (Backend)
  - [ ] 4.1 Implement assessment workflow service
    - **Deps**: 2.2, 3.1 | **Ref**: `design/api-spec.md` — Assessments endpoints
    - Create AssessmentService: create (start workflow), get with relations, submit test results, submit defects
    - Implement status transitions: CUSTOMER_SELECTED → MODEL_SELECTED → TESTING → TEST_COMPLETE → PHOTOS_CAPTURED → DEFECTS_GRADED → PRICED → STOCKED
    - Validate status transitions (can't skip steps)
    - Create AssessmentController: POST, GET, PATCH endpoints
    - Create DTOs for each step
    - Write tests for AssessmentService (status transitions, validation)
  - [ ] 4.2 Implement photo upload (PC)
    - **Deps**: 4.1 | **Ref**: `design/api-spec.md` — Photos endpoints
    - Create PhotoService: upload (save to UPLOAD_PATH), list by assessment, delete
    - Create PhotoController: POST /assessments/:id/photos (multipart upload via multer)
    - Configure static file serving for /uploads/* route
    - Validate file size (max 10MB) and format (JPEG, PNG, WebP)
    - Write tests for PhotoService
  - [ ] 4.3 Implement QR session and WebSocket photo sync
    - **Deps**: 4.2 | **Ref**: `design/api-spec.md` — QR Session + WebSocket
    - Create QRSessionService: generate session (10min expiry), validate session, expire session
    - Create QR code generation using qrcode library
    - Create PhotoSyncGateway (Socket.IO WebSocket): join-session, photo-uploaded events
    - Create mobile upload endpoint: POST /qr-sessions/:sessionId/photos (session-based auth, no JWT)
    - On mobile upload → save photo → emit photo-uploaded to PC via WebSocket
    - Write tests for QRSessionService

- [ ] 5. Pricing Sub-Module (Backend)
  - [ ] 5.1 Implement pricing rule service and controller
    - **Deps**: 1.2 | **Ref**: `design/api-spec.md` — Pricing Rules endpoints
    - Create PricingRuleService: list, create, update, deactivate
    - Create PricingRuleController: GET, POST, PATCH, DELETE endpoints
    - Roles: admin-manager only
    - Write tests for PricingRuleService
  - [ ] 5.2 Implement pricing engine
    - **Deps**: 5.1, 4.1 | **Ref**: `design/api-spec.md` — price calculation
    - Create PricingService.calculatePrice(): load rules by category, evaluate conditions against assessment data (test pass rate, defect severity avg, defect count), apply adjustments in priority order, return PriceBreakdown
    - Integrate with AssessmentService: auto-calculate after defects submitted
    - Implement price override for admin-manager
    - Write unit tests for PricingService
    - Write PBT tests with fast-check: property — price never negative, property — more defects = lower price, property — higher severity = larger deduction
  - [ ] 5.3 Implement defect grading PBT tests
    - **Deps**: 4.1 | **Ref**: D3-10 PBT scope
    - Write PBT tests for defect grading logic: property — severity always 1-5, property — condition grade derived consistently from defect scores
    - Verify defect-to-grade mapping correctness

- [ ] 6. Stock & Dashboard Sub-Modules (Backend)
  - [ ] 6.1 Implement stock service and controller
    - **Deps**: 4.1, 5.2 | **Ref**: `design/api-spec.md` — Stock endpoints
    - Create StockService: addToStock (from assessment), list with filters/pagination, getDetail
    - Compute conditionGrade from assessment data (test results + defect grades)
    - Create StockController: POST /assessments/:id/stock, GET /stock, GET /stock/:id
    - Write tests for StockService
  - [ ] 6.2 Implement dashboard service and controller
    - **Deps**: 6.1 | **Ref**: `design/api-spec.md` — Dashboard endpoint
    - Create DashboardService: getMetrics (assessed today, total stock, stock value, recent activity)
    - Direct aggregate queries on assessment and stock tables
    - Create DashboardController: GET /dashboard
    - Write tests for DashboardService
  - [ ] 6.3 Implement Excel export service and controller
    - **Deps**: 6.1, 6.2 | **Ref**: `design/api-spec.md` — Export endpoints
    - Create ExportService: exportStock (streaming .xlsx), exportAssessments (streaming .xlsx)
    - Use ExcelJS streaming API for large datasets
    - Create ExportController: GET /export/stock, GET /export/assessments
    - Set response headers for file download
    - Write tests for ExportService

- [ ] 7. Admin Frontend Pages
  - [ ] 7.1 Implement login page and auth flow
    - **Deps**: 2.1 | **Ref**: `design/implementation.md` — Frontend Structure
    - Create /login page with email/password form
    - Call POST /api/v1/auth/login, store JWT in httpOnly cookie or localStorage
    - Redirect to role-appropriate page (Operation → assessment, Manager → dashboard)
    - Create auth context provider for frontend
  - [ ] 7.2 Implement admin layout and navigation
    - **Deps**: 7.1 | **Ref**: `design/implementation.md` — Frontend Structure
    - Create /admin layout with sidebar navigation
    - Nav items: Assessment, Dashboard, Stock, Catalog (Models, Test Guides, Defect Checklists), Pricing Rules
    - Show/hide nav items based on role (Operation vs Manager)
    - Protected route wrapper (redirect to login if no token)
  - [ ] 7.3 Implement assessment workflow page
    - **Deps**: 7.2, 4.1, 4.2, 4.3 | **Ref**: `design/implementation.md`
    - Create /admin/assessment page with multi-step wizard
    - Steps: 1) Search/register customer, 2) Select product model, 3) Follow test guide, 4) Record test results, 5) Upload photos (PC + QR helper), 6) Fill defects, 7) View price, 8) Add to stock
    - Each step calls the corresponding API endpoint
    - QR photo step: show QR code, connect WebSocket for real-time photo updates
  - [ ] 7.4 Implement catalog management pages
    - **Deps**: 7.2, 3.1, 3.2, 3.3 | **Ref**: `design/implementation.md`
    - Create /admin/catalog/models page: list, add, edit product models
    - Create /admin/catalog/test-guides page: list, add, edit test guides with steps
    - Create /admin/catalog/defect-checklists page: list, add, edit checklists with items
    - Manager role only
  - [ ] 7.5 Implement pricing rules page
    - **Deps**: 7.2, 5.1 | **Ref**: `design/implementation.md`
    - Create /admin/pricing page: list, add, edit, deactivate pricing rules
    - Show rule conditions and adjustments in a table
    - Manager role only
  - [ ] 7.6 Implement stock list and detail pages
    - **Deps**: 7.2, 6.1 | **Ref**: `design/implementation.md`
    - Create /admin/stock page: list with filters (category, status, date, price range), pagination
    - Create /admin/stock/[id] page: full assessment details with photos, test results, defects
    - Manager role only
  - [ ] 7.7 Implement dashboard page with export
    - **Deps**: 7.2, 6.2, 6.3 | **Ref**: `design/implementation.md`
    - Create /admin/dashboard page: metrics cards (assessed today, stock count, stock value), recent activity feed
    - Add "Export to Excel" buttons for stock and assessments
    - Manager role only
  - [ ] 7.8 Implement QR mobile photo capture page
    - **Deps**: 4.3 | **Ref**: `design/implementation.md`
    - Create /qr/[sessionId] page: mobile-optimized camera capture
    - Validate QR session on load (check expiry)
    - Capture photo → upload to POST /qr-sessions/:sessionId/photos
    - Show success/error feedback
    - No auth required (session-based)

---

## Task Summary

| Task | Title | Dependencies | Status |
|------|-------|--------------|--------|
| 1.1 | Add all admin entities to Prisma schema | None | [ ] |
| 1.2 | Scaffold admin module structure | 1.1 | [ ] |
| 2.1 | Implement admin auth controller | 1.2 | [ ] |
| 2.2 | Implement customer service and controller | 1.2 | [ ] |
| 3.1 | Implement product model service and controller | 1.2 | [ ] |
| 3.2 | Implement test guide service and controller | 1.2 | [ ] |
| 3.3 | Implement defect checklist service and controller | 1.2 | [ ] |
| 4.1 | Implement assessment workflow service | 2.2, 3.1 | [ ] |
| 4.2 | Implement photo upload (PC) | 4.1 | [ ] |
| 4.3 | Implement QR session and WebSocket photo sync | 4.2 | [ ] |
| 5.1 | Implement pricing rule service and controller | 1.2 | [ ] |
| 5.2 | Implement pricing engine | 5.1, 4.1 | [ ] |
| 5.3 | Implement defect grading PBT tests | 4.1 | [ ] |
| 6.1 | Implement stock service and controller | 4.1, 5.2 | [ ] |
| 6.2 | Implement dashboard service and controller | 6.1 | [ ] |
| 6.3 | Implement Excel export service and controller | 6.1, 6.2 | [ ] |
| 7.1 | Implement login page and auth flow | 2.1 | [ ] |
| 7.2 | Implement admin layout and navigation | 7.1 | [ ] |
| 7.3 | Implement assessment workflow page | 7.2, 4.1, 4.2, 4.3 | [ ] |
| 7.4 | Implement catalog management pages | 7.2, 3.1, 3.2, 3.3 | [ ] |
| 7.5 | Implement pricing rules page | 7.2, 5.1 | [ ] |
| 7.6 | Implement stock list and detail pages | 7.2, 6.1 | [ ] |
| 7.7 | Implement dashboard page with export | 7.2, 6.2, 6.3 | [ ] |
| 7.8 | Implement QR mobile photo capture page | 4.3 | [ ] |

---

## Requirements Coverage

| Requirement | Implemented By | Status |
|-------------|----------------|--------|
| US-001 Admin Login | 2.1, 7.1 | [ ] |
| US-003 RBAC | 2.1, 2.2, 3.1 (guards on all endpoints) | [ ] |
| US-004 Search Customer | 2.2, 7.3 | [ ] |
| US-005 Register Customer | 2.2, 7.3 | [ ] |
| US-006 Search Product Model | 3.1, 7.3 | [ ] |
| US-007 Manage Product Models | 3.1, 7.4 | [ ] |
| US-008 Follow Test Guide | 3.2, 4.1, 7.3 | [ ] |
| US-009 Record Test Results | 4.1, 7.3 | [ ] |
| US-010 Manage Test Guides | 3.2, 7.4 | [ ] |
| US-011 Upload Photos (PC) | 4.2, 7.3 | [ ] |
| US-012 QR Mobile Photo Helper | 4.3, 7.3, 7.8 | [ ] |
| US-013 Fill Defect Checklist | 4.1, 7.3 | [ ] |
| US-014 View Calculated Price | 5.2, 7.3 | [ ] |
| US-015 Manage Pricing Rules | 5.1, 7.5 | [ ] |
| US-016 Manage Defect Checklists | 3.3, 7.4 | [ ] |
| US-017 Add to Stock | 6.1, 7.3 | [ ] |
| US-018 View Stock List | 6.1, 7.6 | [ ] |
| US-019 Admin Dashboard | 6.2, 7.7 | [ ] |
| US-020 Excel Export | 6.3, 7.7 | [ ] |

---

## Design Coverage

**Components**: 8 sub-modules → Tasks 2.1-2.2 (auth/customer), 3.1-3.3 (catalog), 4.1-4.3 (assessment/photo), 5.1-5.3 (pricing), 6.1-6.3 (stock/dashboard/export)
**Entities**: 12 entities → Task 1.1 (Prisma schema)
**Endpoints**: 25+ → Tasks 2.1-6.3 (backend controllers)
**Frontend**: 8 pages → Tasks 7.1-7.8

---

## Definition of Done

- [ ] All API endpoints return correct responses
- [ ] RBAC enforced on all admin endpoints
- [ ] Assessment workflow completes all 8 steps
- [ ] Photo upload works (PC + QR mobile)
- [ ] Pricing engine calculates correctly (PBT verified)
- [ ] Excel export generates valid .xlsx files
- [ ] Dashboard shows accurate metrics
- [ ] All tests passing (unit + PBT)

---

## Execution Waves

| Wave | Tasks | Dependencies Resolved | Parallel |
|------|-------|-----------------------|----------|
| 1 | 1.1 | None | No |
| 2 | 1.2 | 1.1 | No |
| 3 | 2.1, 2.2, 3.1, 3.2, 3.3, 5.1 | 1.2 | Yes |
| 4 | 4.1, 7.1 | 2.2+3.1, 2.1 | Yes |
| 5 | 4.2, 5.2, 5.3, 7.2 | 4.1, 5.1+4.1, 4.1, 7.1 | Yes |
| 6 | 4.3, 6.1 | 4.2, 4.1+5.2 | Yes |
| 7 | 6.2, 6.3, 7.3, 7.4, 7.5, 7.8 | 6.1, 6.1+6.2, 7.2+4.3, 7.2+3.x, 7.2+5.1, 4.3 | Yes |
| 8 | 7.6, 7.7 | 7.2+6.1, 7.2+6.2+6.3 | Yes |

### File Ownership Per Wave

**Wave 3**:
- Task 2.1: `modules/admin/auth/`
- Task 2.2: `modules/admin/customer/`
- Task 3.1: `modules/admin/catalog/product-model*`
- Task 3.2: `modules/admin/catalog/test-guide*`
- Task 3.3: `modules/admin/catalog/defect-checklist*`
- Task 5.1: `modules/admin/pricing/pricing-rule*`

**Wave 4**:
- Task 4.1: `modules/admin/assessment/assessment*`
- Task 7.1: `apps/web/src/app/login/`

**Wave 5**:
- Task 4.2: `modules/admin/assessment/photo*`
- Task 5.2: `modules/admin/pricing/pricing.service*`
- Task 5.3: `modules/admin/pricing/*.pbt.spec*`
- Task 7.2: `apps/web/src/app/admin/layout*`, `apps/web/src/app/admin/page*`

**Wave 6**:
- Task 4.3: `modules/admin/assessment/qr*`, `modules/admin/assessment/photo-sync*`
- Task 6.1: `modules/admin/stock/`

**Wave 7**:
- Task 6.2: `modules/admin/dashboard/`
- Task 6.3: `modules/admin/export/`
- Task 7.3: `apps/web/src/app/admin/assessment/`
- Task 7.4: `apps/web/src/app/admin/catalog/`
- Task 7.5: `apps/web/src/app/admin/pricing/`
- Task 7.8: `apps/web/src/app/qr/`

**Wave 8**:
- Task 7.6: `apps/web/src/app/admin/stock/`
- Task 7.7: `apps/web/src/app/admin/dashboard/`

---

## Notes

**Technical Debt**: Photo storage is local filesystem — will need cloud migration path later.

**Public API for Other Units**: Admin module exposes via `index.ts`:
- `getProductModels()` — for Seller price check
- `calculatePrice()` — for Seller price estimation
- `getStockItems()` — for Buyer browsing
