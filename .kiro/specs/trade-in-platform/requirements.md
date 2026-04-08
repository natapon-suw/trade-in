# Requirements

## Summary
- **Total Stories**: 24 across 8 functional areas
- **Priority**: 14 High, 7 Medium, 3 Low
- **User Types**: Admin Operation, Admin Manager, Seller, Buyer Storefront, Buyer Online
- **Key Entities**: Customer, Product Model, Assessment, Defect, Stock Item
- **Integrations**: QR code generation, Excel export, file storage (photos)
- **Core Flows**: Admin assessment workflow (8 steps) | Seller price check | Buyer product browsing | Manager dashboard + export | Auth + RBAC

## Overview
User stories organized by functional area with EARS notation acceptance criteria. Admin-first priority.

---

## Functional Area 1: Authentication & Authorization

### US-001: Admin Login
**As an** Admin (Operation or Manager)
**I want** to log in with email and password
**So that** I can access the admin panel securely

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin enters valid email and password, **THEN** authenticate and redirect to role-appropriate dashboard (Operation → assessment workflow, Manager → dashboard)
2. **IF** credentials are invalid, **THEN** show error message "Invalid email or password", **ELSE** create session
3. **WHILE** admin is logged in, **IF** session expires after inactivity, **THEN** redirect to login with return URL

**Dependencies**: None

---

### US-002: Seller Login
**As a** Seller
**I want** to log in with email and password
**So that** I can access the seller price check tool

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** seller enters valid credentials, **THEN** authenticate and redirect to price check page
2. **IF** credentials are invalid, **THEN** show error message
3. **WHEN** seller does not have an account, **THEN** show registration link

**Dependencies**: None

---

### US-003: Role-Based Access Control
**As an** Admin Manager
**I want** the system to enforce role-based access
**So that** Operation staff cannot access manager-only features

**Priority**: High

**Acceptance Criteria**:
1. **WHERE** Admin Operation role, **WHEN** accessing dashboard or export, **THEN** deny access and show "Insufficient permissions"
2. **WHERE** Admin Manager role, **WHEN** accessing any admin feature, **THEN** allow access
3. **WHERE** Seller role, **WHEN** accessing admin features, **THEN** deny access

**Dependencies**: US-001, US-002

---

## Functional Area 2: Customer Management

### US-004: Search Customer
**As an** Admin Operation
**I want** to search for an existing customer by name or phone
**So that** I can link the assessment to their record

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin types in search field, **THEN** show matching customers after 2+ characters (name or phone)
2. **IF** no matches found, **THEN** show "No customer found" with option to register new
3. **WHEN** admin selects a customer from results, **THEN** populate customer details and proceed to product selection

**Dependencies**: US-001

---

### US-005: Register Customer
**As an** Admin Operation
**I want** to register a new customer with name, phone, and optional email
**So that** I can create a record for the trade-in assessment

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin fills in name and phone and submits, **THEN** create customer record and proceed to product selection
2. **IF** phone number already exists, **THEN** show "Customer already exists" with link to existing record
3. **IF** required fields are empty, **THEN** show inline validation errors

**Dependencies**: US-001

---

## Functional Area 3: Product Model Selection

### US-006: Search Product Model
**As an** Admin Operation
**I want** to search or select a product model from a dropdown
**So that** I can identify the device being assessed

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin types in model search field, **THEN** show matching models filtered by name/brand after 2+ characters
2. **WHEN** admin selects a model, **THEN** load the associated test guide and defect checklist for that model's category
3. **IF** model not found, **THEN** show option to request model addition (logged for Manager review)

**Dependencies**: US-004 or US-005

---

### US-007: Manage Product Models
**As an** Admin Manager
**I want** to add, edit, or deactivate product models in the catalog
**So that** the model list stays current with available products

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** manager adds a new model with brand, name, category, and base price, **THEN** model appears in the catalog
2. **WHEN** manager edits a model, **THEN** changes apply to future assessments (existing assessments unchanged)
3. **WHEN** manager deactivates a model, **THEN** it no longer appears in Operation search but existing stock items remain

**Dependencies**: US-001, US-003

---

## Functional Area 4: Product Testing

### US-008: Follow Test Guide
**As an** Admin Operation
**I want** to follow a step-by-step test guide specific to the product category
**So that** I can systematically test the device

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** product model is selected, **THEN** display the test guide for that model's category with numbered steps
2. **WHEN** admin marks a step as pass or fail, **THEN** record the result and advance to next step
3. **WHILE** test is in progress, **IF** admin navigates away, **THEN** save progress and allow resuming later

**Dependencies**: US-006

---

### US-009: Record Test Results
**As an** Admin Operation
**I want** to submit the completed test results
**So that** they are saved as part of the assessment

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** all test steps are completed, **THEN** show summary of pass/fail results with option to submit
2. **IF** any steps are incomplete, **THEN** highlight missing steps and prevent submission
3. **WHEN** results are submitted, **THEN** save to assessment record and proceed to photo capture

**Dependencies**: US-008

---

### US-010: Manage Test Guides
**As an** Admin Manager
**I want** to create and edit test guides for each product category
**So that** Operation staff have up-to-date testing procedures

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** manager creates a test guide, **THEN** assign it to a product category with ordered test steps
2. **WHEN** manager edits a test guide, **THEN** changes apply to future assessments
3. **WHEN** a category has no test guide, **THEN** show warning during assessment

**Dependencies**: US-001, US-003

---

## Functional Area 5: Photo Capture

### US-011: Upload Photos from PC
**As an** Admin Operation
**I want** to upload product photos directly from my PC
**So that** I can document the device condition

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin clicks upload, **THEN** open file picker accepting image formats (JPEG, PNG, WebP)
2. **WHEN** photos are selected, **THEN** show preview thumbnails with option to remove
3. **IF** file exceeds 10MB, **THEN** reject with size limit message

**Dependencies**: US-009

---

### US-012: QR Code Mobile Photo Helper
**As an** Admin Operation
**I want** to scan a QR code with my phone to take photos
**So that** I can use my phone camera when working on a PC

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin clicks "Use Phone Camera", **THEN** generate and display a QR code linked to the current assessment session
2. **WHEN** user scans QR code with phone, **THEN** open a mobile camera page in the phone browser
3. **WHEN** photo is taken on phone, **THEN** upload directly to the assessment session and show on the PC screen in real-time
4. **IF** QR session expires after 10 minutes, **THEN** show expiry message with option to regenerate

**Dependencies**: US-009

---

## Functional Area 6: Defect Grading & Pricing

### US-013: Fill Defect Checklist
**As an** Admin Operation
**I want** to select defects from a predefined checklist and assign severity levels (1-5)
**So that** the device condition is objectively documented

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** assessment reaches defect step, **THEN** display defect checklist for the product category
2. **WHEN** admin selects a defect, **THEN** show severity slider/selector (1 = minor, 5 = critical)
3. **IF** no defects are selected, **THEN** allow proceeding with "No defects" confirmation
4. **WHEN** defects are submitted, **THEN** save to assessment and trigger price calculation

**Dependencies**: US-011 or US-012

---

### US-014: View Calculated Price
**As an** Admin Operation
**I want** to see the final calculated trade-in price after assessment
**So that** I can inform the customer and proceed to stock addition

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** defects are submitted, **THEN** calculate price using pricing rules (base price adjusted by test results and defect grades)
2. **WHEN** price is calculated, **THEN** display price with breakdown (base price, test deductions, defect deductions)
3. **IF** pricing rules are missing for this model, **THEN** show warning and allow manual price entry

**Dependencies**: US-013

---

### US-015: Manage Pricing Rules
**As an** Admin Manager
**I want** to configure pricing rules with conditions and multipliers
**So that** trade-in prices reflect current market conditions

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** manager creates a pricing rule, **THEN** define conditions (model category, defect severity thresholds, test pass rate) and price adjustments (percentage or fixed amount)
2. **WHEN** manager edits a rule, **THEN** changes apply to future assessments
3. **WHEN** multiple rules match, **THEN** apply rules in priority order (highest priority first)
4. **WHERE** Admin Manager role, **WHEN** viewing a completed assessment, **THEN** allow price override with reason

**Dependencies**: US-001, US-003

---

### US-016: Manage Defect Checklists
**As an** Admin Manager
**I want** to create and edit defect checklists per product category
**So that** Operation staff have consistent defect options

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** manager creates a defect checklist, **THEN** assign to product category with defect items and descriptions
2. **WHEN** manager adds a defect item, **THEN** include name, description, and default severity suggestion
3. **WHEN** manager edits a checklist, **THEN** changes apply to future assessments

**Dependencies**: US-001, US-003

---

## Functional Area 7: Stock Management

### US-017: Add to Stock
**As an** Admin Operation
**I want** to add the assessed product to stock after pricing
**So that** it becomes available for buyers

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** admin confirms the price, **THEN** show "Add to Stock" button
2. **WHEN** admin clicks "Add to Stock", **THEN** create stock item with all assessment data (customer, model, test results, defects, photos, price)
3. **WHEN** item is added to stock, **THEN** show success confirmation and option to start new assessment

**Dependencies**: US-014

---

### US-018: View Stock List
**As an** Admin Manager
**I want** to view all items in stock with filters
**So that** I can monitor inventory

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** manager opens stock list, **THEN** display all stock items with model, price, condition grade, date added
2. **WHEN** manager applies filters (category, date range, price range), **THEN** update list accordingly
3. **WHEN** manager clicks a stock item, **THEN** show full assessment details including photos and test results

**Dependencies**: US-017

---

## Functional Area 8: Dashboard, Export & Browsing

### US-019: Admin Dashboard
**As an** Admin Manager
**I want** to see a dashboard with key operational metrics
**So that** I can monitor business performance at a glance

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** manager opens dashboard, **THEN** display: items assessed today, total stock count, stock value, recent activity feed
2. **WHEN** dashboard loads, **THEN** show data for current day by default with option to change date range
3. **WHILE** dashboard is open, **IF** new assessment is completed, **THEN** update metrics without page refresh

**Dependencies**: US-001, US-003

---

### US-020: Excel Export
**As an** Admin Manager
**I want** to export stock and assessment data to Excel
**So that** I can analyze data offline or share reports

**Priority**: High

**Acceptance Criteria**:
1. **WHEN** manager clicks "Export to Excel" on stock list, **THEN** generate .xlsx file with all visible (filtered) stock items
2. **WHEN** manager clicks "Export to Excel" on dashboard, **THEN** generate .xlsx file with dashboard metrics and recent activity
3. **IF** export contains more than 10,000 rows, **THEN** show progress indicator and generate in background

**Dependencies**: US-018, US-019

---

### US-021: Seller Price Check
**As a** Seller
**I want** to check the estimated trade-in price for my device
**So that** I know what to expect before visiting the store

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** seller selects model and enters specs, **THEN** show defect checkbox options
2. **WHEN** seller checks applicable defects and submits, **THEN** display estimated price range (min-max)
3. **IF** model is not found, **THEN** show "Model not available for price check" message
4. The system shall not require login or account creation for price check

**Dependencies**: US-015

---

### US-022: Buyer Product Browsing (Online)
**As a** Buyer Online
**I want** to browse available second-hand products on the website
**So that** I can find a device that fits my needs and budget

**Priority**: Medium

**Acceptance Criteria**:
1. **WHEN** buyer visits product listing page, **THEN** display all in-stock items with photo, model, price, and condition grade
2. **WHEN** buyer applies filters (category, brand, price range, condition), **THEN** update listing accordingly
3. **WHEN** buyer clicks a product, **THEN** show detail page with all photos, specs, test summary, and defect summary
4. The system shall not require login for browsing

**Dependencies**: US-017

---

### US-023: Buyer Product Browsing (Storefront)
**As a** Buyer Storefront
**I want** to browse available products on an in-store display
**So that** I can compare devices while shopping in the store

**Priority**: Low

**Acceptance Criteria**:
1. **WHEN** storefront display loads, **THEN** show product grid optimized for large screen / kiosk
2. **WHEN** buyer taps a product, **THEN** show detail view with photos, specs, and condition grade
3. The system shall auto-refresh the product list every 5 minutes

**Dependencies**: US-017

---

### US-024: Seller Registration
**As a** Seller
**I want** to create an account with email and password
**So that** I can log in and use the price check tool

**Priority**: Low

**Acceptance Criteria**:
1. **WHEN** seller fills in email, password, and name, **THEN** create account and send verification email
2. **IF** email already exists, **THEN** show "Account already exists" with login link
3. **WHEN** seller verifies email, **THEN** activate account

**Dependencies**: None

---

## Story Summary

| ID | Title | Area | Priority | Dependencies |
|----|-------|------|----------|--------------|
| US-001 | Admin Login | Auth | High | None |
| US-002 | Seller Login | Auth | Medium | None |
| US-003 | Role-Based Access Control | Auth | High | US-001, US-002 |
| US-004 | Search Customer | Customer Mgmt | High | US-001 |
| US-005 | Register Customer | Customer Mgmt | High | US-001 |
| US-006 | Search Product Model | Product Model | High | US-004/005 |
| US-007 | Manage Product Models | Product Model | Medium | US-001, US-003 |
| US-008 | Follow Test Guide | Testing | High | US-006 |
| US-009 | Record Test Results | Testing | High | US-008 |
| US-010 | Manage Test Guides | Testing | Medium | US-001, US-003 |
| US-011 | Upload Photos from PC | Photo Capture | High | US-009 |
| US-012 | QR Code Mobile Photo Helper | Photo Capture | High | US-009 |
| US-013 | Fill Defect Checklist | Defect & Pricing | High | US-011/012 |
| US-014 | View Calculated Price | Defect & Pricing | High | US-013 |
| US-015 | Manage Pricing Rules | Defect & Pricing | High | US-001, US-003 |
| US-016 | Manage Defect Checklists | Defect & Pricing | Medium | US-001, US-003 |
| US-017 | Add to Stock | Stock Mgmt | High | US-014 |
| US-018 | View Stock List | Stock Mgmt | High | US-017 |
| US-019 | Admin Dashboard | Dashboard & Export | High | US-001, US-003 |
| US-020 | Excel Export | Dashboard & Export | High | US-018, US-019 |
| US-021 | Seller Price Check | Seller | Medium | US-015 |
| US-022 | Buyer Browsing (Online) | Buyer | Medium | US-017 |
| US-023 | Buyer Browsing (Storefront) | Buyer | Low | US-017 |
| US-024 | Seller Registration | Auth | Low | None |

---

## Story-Persona Matrix

| Story | Admin Operation | Admin Manager | Seller | Buyer Storefront | Buyer Online |
|-------|----------------|---------------|--------|------------------|--------------|
| US-001 | ✓ Primary | ✓ Primary | - | - | - |
| US-002 | - | - | ✓ Primary | - | - |
| US-003 | ✓ Primary | ✓ Primary | ✓ Primary | - | - |
| US-004 | ✓ Primary | - | - | - | - |
| US-005 | ✓ Primary | - | - | - | - |
| US-006 | ✓ Primary | - | - | - | - |
| US-007 | - | ✓ Primary | - | - | - |
| US-008 | ✓ Primary | - | - | - | - |
| US-009 | ✓ Primary | - | - | - | - |
| US-010 | - | ✓ Primary | - | - | - |
| US-011 | ✓ Primary | - | - | - | - |
| US-012 | ✓ Primary | - | - | - | - |
| US-013 | ✓ Primary | - | - | - | - |
| US-014 | ✓ Primary | - | - | - | - |
| US-015 | - | ✓ Primary | - | - | - |
| US-016 | - | ✓ Primary | - | - | - |
| US-017 | ✓ Primary | - | - | - | - |
| US-018 | - | ✓ Primary | - | - | - |
| US-019 | - | ✓ Primary | - | - | - |
| US-020 | - | ✓ Primary | - | - | - |
| US-021 | - | - | ✓ Primary | - | - |
| US-022 | - | - | - | - | ✓ Primary |
| US-023 | - | - | - | ✓ Primary | - |
| US-024 | - | - | ✓ Primary | - | - |

---

## Non-Functional Considerations

- **Performance**: Photo uploads should complete within 5 seconds. Dashboard should load within 2 seconds. QR mobile session should sync photos in real-time.
- **Security**: RBAC enforcement on all admin endpoints. Session management with timeout. Customer data protection.
- **Scalability**: Excel export should handle 10,000+ rows. Stock list should handle pagination for large inventories.
- **Usability**: Assessment workflow must be completable in under 15 minutes. Storefront display must be touch-friendly.
