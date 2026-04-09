# API Specification — Admin Operations Unit

## Overview
**API Style**: REST
**Base URL**: `/api/v1/admin`
**Auth**: JWT via `Authorization: Bearer <token>` — roles: admin-operation, admin-manager
**Docs**: OpenAPI/Swagger auto-generated via @nestjs/swagger

## API Conventions
- **Pagination**: Offset-based — `?page=1&pageSize=20`
- **Filtering**: Query params — `?category=LAPTOP&status=AVAILABLE`
- **Sorting**: `?sortBy=createdAt&sortOrder=desc`
- **Error Format**: RFC 7807 Problem Details

---

## Endpoints

### Auth (US-001)

#### POST /api/v1/auth/login
- **Description**: Authenticate admin or seller
- **Auth**: Public
- **Request**: `{ "email": "string", "password": "string" }`
- **Response 200**: `{ "accessToken": "jwt-token", "user": { "userId", "email", "role", "permissions" } }`
- **Errors**: 401 Invalid credentials

---

### Customers (US-004, US-005)

#### GET /api/v1/admin/customers?search=query
- **Description**: Search customers by name or phone
- **Auth**: admin-operation, admin-manager
- **Response 200**: `{ "data": [Customer], "total": number }`

#### POST /api/v1/admin/customers
- **Description**: Register new customer
- **Auth**: admin-operation, admin-manager
- **Request**: `{ "name": "string", "phone": "string", "email?": "string" }`
- **Response 201**: `Customer`
- **Errors**: 409 Phone already exists

---

### Product Models (US-006, US-007)

#### GET /api/v1/admin/product-models?search=query&category=LAPTOP
- **Description**: Search/list product models
- **Auth**: admin-operation, admin-manager
- **Response 200**: `{ "data": [ProductModel], "total": number }`

#### POST /api/v1/admin/product-models
- **Description**: Create product model
- **Auth**: admin-manager
- **Request**: `{ "brand", "name", "category", "basePrice" }`
- **Response 201**: `ProductModel`

#### PATCH /api/v1/admin/product-models/:id
- **Description**: Update product model
- **Auth**: admin-manager
- **Request**: `{ "brand?", "name?", "category?", "basePrice?", "isActive?" }`
- **Response 200**: `ProductModel`

---

### Test Guides (US-008, US-009, US-010)

#### GET /api/v1/admin/test-guides?category=LAPTOP
- **Description**: List test guides by category
- **Auth**: admin-operation, admin-manager
- **Response 200**: `{ "data": [TestGuide with steps] }`

#### POST /api/v1/admin/test-guides
- **Description**: Create test guide with steps
- **Auth**: admin-manager
- **Request**: `{ "category", "name", "steps": [{ "stepNumber", "title", "description?" }] }`
- **Response 201**: `TestGuide`

#### PATCH /api/v1/admin/test-guides/:id
- **Description**: Update test guide
- **Auth**: admin-manager
- **Response 200**: `TestGuide`

---

### Assessments (US-004-US-017 workflow)

#### POST /api/v1/admin/assessments
- **Description**: Start new assessment (step 1: customer selected)
- **Auth**: admin-operation
- **Request**: `{ "customerId": "uuid", "productModelId": "uuid" }`
- **Response 201**: `Assessment` with status CUSTOMER_SELECTED

#### GET /api/v1/admin/assessments/:id
- **Description**: Get assessment with all relations
- **Auth**: admin-operation, admin-manager
- **Response 200**: `Assessment` with customer, model, testResults, photos, defects

#### PATCH /api/v1/admin/assessments/:id/test-results
- **Description**: Submit test results for assessment
- **Auth**: admin-operation
- **Request**: `{ "results": [{ "testStepId", "passed", "notes?" }] }`
- **Response 200**: `Assessment` with status TEST_COMPLETE

#### PATCH /api/v1/admin/assessments/:id/defects
- **Description**: Submit defect grades for assessment
- **Auth**: admin-operation
- **Request**: `{ "defects": [{ "defectItemId", "severity", "notes?" }] }`
- **Response 200**: `Assessment` with status DEFECTS_GRADED + calculated price

#### POST /api/v1/admin/assessments/:id/stock
- **Description**: Add assessed product to stock
- **Auth**: admin-operation
- **Request**: `{}` (uses assessment data)
- **Response 201**: `StockItem`

#### PATCH /api/v1/admin/assessments/:id/price-override
- **Description**: Manager overrides calculated price
- **Auth**: admin-manager
- **Request**: `{ "price": number, "reason": "string" }`
- **Response 200**: `Assessment` with updated price

---

### Photos (US-011, US-012)

#### POST /api/v1/admin/assessments/:id/photos
- **Description**: Upload photo(s) from PC
- **Auth**: admin-operation
- **Request**: multipart/form-data with image files
- **Response 201**: `[AssessmentPhoto]`
- **Errors**: 400 File too large (>10MB), 400 Invalid format

#### POST /api/v1/admin/assessments/:id/qr-session
- **Description**: Generate QR session for mobile photo upload
- **Auth**: admin-operation
- **Response 201**: `{ "sessionId", "qrCodeUrl", "expiresAt" }`

#### POST /api/v1/admin/qr-sessions/:sessionId/photos
- **Description**: Upload photo from mobile via QR session (no JWT needed — session-based auth)
- **Auth**: QR session token
- **Request**: multipart/form-data with image file
- **Response 201**: `AssessmentPhoto`

---

### Defect Checklists (US-013, US-016)

#### GET /api/v1/admin/defect-checklists?category=LAPTOP
- **Description**: List defect checklists by category
- **Auth**: admin-operation, admin-manager
- **Response 200**: `{ "data": [DefectChecklist with items] }`

#### POST /api/v1/admin/defect-checklists
- **Description**: Create defect checklist with items
- **Auth**: admin-manager
- **Request**: `{ "category", "name", "items": [{ "name", "description?", "defaultSeverity?" }] }`
- **Response 201**: `DefectChecklist`

#### PATCH /api/v1/admin/defect-checklists/:id
- **Description**: Update defect checklist
- **Auth**: admin-manager
- **Response 200**: `DefectChecklist`

---

### Pricing Rules (US-015)

#### GET /api/v1/admin/pricing-rules
- **Description**: List all pricing rules
- **Auth**: admin-manager
- **Response 200**: `{ "data": [PricingRule] }`

#### POST /api/v1/admin/pricing-rules
- **Description**: Create pricing rule
- **Auth**: admin-manager
- **Request**: `{ "name", "category?", "conditionType", "conditionOperator", "conditionValue", "adjustmentType", "adjustmentValue", "priority" }`
- **Response 201**: `PricingRule`

#### PATCH /api/v1/admin/pricing-rules/:id
- **Description**: Update pricing rule
- **Auth**: admin-manager
- **Response 200**: `PricingRule`

#### DELETE /api/v1/admin/pricing-rules/:id
- **Description**: Deactivate pricing rule
- **Auth**: admin-manager
- **Response 200**: `PricingRule` with isActive=false

---

### Stock (US-017, US-018)

#### GET /api/v1/admin/stock?category=LAPTOP&status=AVAILABLE&page=1&pageSize=20
- **Description**: List stock items with filters and pagination
- **Auth**: admin-manager
- **Response 200**: `{ "data": [StockItem with model], "total", "page", "pageSize" }`

#### GET /api/v1/admin/stock/:id
- **Description**: Get stock item with full assessment details
- **Auth**: admin-manager
- **Response 200**: `StockItem` with assessment, photos, test results, defects

---

### Dashboard (US-019)

#### GET /api/v1/admin/dashboard?dateFrom=ISO&dateTo=ISO
- **Description**: Get dashboard metrics
- **Auth**: admin-manager
- **Response 200**: `{ "assessedToday", "totalStock", "stockValue", "recentActivity": [...] }`

---

### Export (US-020)

#### GET /api/v1/admin/export/stock?format=xlsx&category=LAPTOP
- **Description**: Export stock list to Excel
- **Auth**: admin-manager
- **Response 200**: Binary .xlsx file download

#### GET /api/v1/admin/export/assessments?format=xlsx&dateFrom=ISO&dateTo=ISO
- **Description**: Export assessments to Excel
- **Auth**: admin-manager
- **Response 200**: Binary .xlsx file download

---

### WebSocket (QR Photo Sync)

#### WS /api/v1/admin/photo-sync
- **Description**: WebSocket for real-time photo sync between mobile and PC
- **Auth**: JWT (PC client connects with token)
- **Events**:
  - `join-session` (PC → Server): `{ "assessmentId" }` — subscribe to photo updates
  - `photo-uploaded` (Server → PC): `{ "photo": AssessmentPhoto }` — new photo notification
  - `session-expired` (Server → PC): `{ "sessionId" }` — QR session expired
