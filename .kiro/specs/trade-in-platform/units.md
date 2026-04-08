# Units of Work

## Summary
- **Units**: 4 units — Foundation (infra), Admin Operations, Seller Portal, Buyer Portal
- **Strategy**: Domain-Driven + Combined Foundation
- **Architecture**: Modular Monolith
- **Story Distribution**: Foundation: 0 stories (infrastructure), Admin Operations: 18 stories, Seller Portal: 3 stories, Buyer Portal: 2 stories (+ 1 shared auth story US-003)
- **Key Dependencies**: All domain units → Foundation; Seller → Admin (pricing, models); Buyer → Admin (stock)
- **Development Sequence**: Phase 1: Foundation, Phase 2: Admin Operations, Phase 3: Seller Portal, Phase 4: Buyer Portal

## Overview
Feature decomposed into 4 units (1 infrastructure + 3 domain) for phased delivery with admin-first priority.

**Strategy**: Domain-Driven + Combined Foundation — each domain unit aligns with a distinct user domain. Foundation unit provides shared infrastructure.
**Rationale**: Clear domain boundaries with minimal cross-domain coupling. Shared components (auth, pricing, errors) live in Foundation.

---

## Unit 0: Foundation (Infrastructure)

**Type**: Infrastructure
**Purpose**: Project scaffold, shared packages (auth, errors, DB, types, logging), dev tooling. All domain units depend on this.
**Priority**: Foundation — design and implement first
**Complexity**: Medium

**Stories**: None (cross-cutting infrastructure)

### Responsibilities
- Project scaffold and monorepo setup
- JWT auth middleware and RBAC
- RFC 7807 error handling
- Database connection and migration setup
- Shared types package
- Structured logging with request correlation
- Linting, formatting, and build configuration

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| None | — | Foundation has no dependencies |

---

## Unit 1: Admin Operations

**Purpose**: Complete admin workflow for product assessment, testing, defect grading, photo capture, pricing, stock management, dashboard, and Excel export. Covers both Admin Operation and Admin Manager roles.
**Priority**: High
**Complexity**: High

**Stories**: 18 stories — US-001, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016, US-017, US-018, US-019, US-020

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| RegisterCustomer | Create new customer record | Admin Operation |
| SearchCustomer | Find existing customer | Admin Operation |
| SelectProductModel | Choose device model for assessment | Admin Operation |
| RecordTestResult | Save pass/fail for a test step | Admin Operation |
| UploadPhoto | Upload product photo (PC or mobile) | Admin Operation |
| GenerateQRSession | Create QR code for mobile photo helper | Admin Operation |
| GradeDefect | Select defect and assign severity 1-5 | Admin Operation |
| CalculatePrice | Trigger pricing engine after assessment | System |
| AddToStock | Add assessed product to inventory | Admin Operation |
| ManageProductModel | Add/edit/deactivate product models | Admin Manager |
| ManageTestGuide | Create/edit test guides per category | Admin Manager |
| ManageDefectChecklist | Create/edit defect checklists | Admin Manager |
| ManagePricingRule | Configure pricing rules and multipliers | Admin Manager |
| OverridePrice | Override calculated price with reason | Admin Manager |
| ExportToExcel | Generate Excel file from stock/dashboard | Admin Manager |

### Domain Model
**Aggregates**: Assessment (root: Assessment), ProductCatalog (root: ProductModel), Stock (root: StockItem)
**Entities**: Customer, Assessment, TestResult, DefectGrade, StockItem, ProductModel, TestGuide, DefectChecklist, PricingRule
**Value Objects**: Photo, QRSession, PriceBreakdown, DefectSeverity, TestStep

### Domain Events
**Publishes**: AssessmentCompleted, StockItemAdded, PricingRuleUpdated, ProductModelUpdated
**Subscribes**: None (upstream unit)

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| Foundation | Infrastructure | Auth middleware, error handling, DB, shared types |

---

## Unit 2: Seller Portal

**Purpose**: Seller self-service for account management and trade-in price estimation.
**Priority**: Medium
**Complexity**: Low

**Stories**: 3 stories — US-002, US-021, US-024

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| RegisterSeller | Create seller account | Seller |
| LoginSeller | Authenticate seller | Seller |
| CheckPrice | Estimate trade-in price for a device | Seller |

### Domain Model
**Aggregates**: SellerAccount (root: Seller)
**Entities**: Seller
**Value Objects**: PriceEstimate, DeviceSpec

### Domain Events
**Publishes**: SellerRegistered, PriceCheckRequested
**Subscribes**: PricingRuleUpdated from Admin — recalculate estimates if rules change

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| Foundation | Infrastructure | Auth middleware, error handling, DB, shared types |
| Admin Operations | Data | Product models catalog for model selection |
| Admin Operations | API | Pricing engine for price estimation |

---

## Unit 3: Buyer Portal

**Purpose**: Product browsing for online and storefront buyers. Read-only access to stock items.
**Priority**: Low
**Complexity**: Low

**Stories**: 2 stories — US-022, US-023

### Commands
| Command | Description | Actor |
|---------|-------------|-------|
| BrowseProducts | View available stock items | Buyer |
| FilterProducts | Apply filters to product listing | Buyer |
| ViewProductDetail | View full product details with photos | Buyer |

### Domain Model
**Aggregates**: None (read-only views of Admin stock data)
**Entities**: None (consumes StockItem from Admin)
**Value Objects**: ProductListing, ConditionGrade

### Domain Events
**Publishes**: None
**Subscribes**: StockItemAdded from Admin — update product listings

### Dependencies
| Depends On | Type | Description |
|------------|------|-------------|
| Foundation | Infrastructure | Auth middleware, error handling, DB, shared types |
| Admin Operations | Data | Stock items with photos, specs, condition grades |

---

## Context Map

### Relationships
| Upstream | Downstream | Pattern |
|----------|------------|---------|
| Admin Operations | Seller Portal | Customer/Supplier — Admin provides product models and pricing engine |
| Admin Operations | Buyer Portal | Publisher/Subscriber — Buyer reads stock data published by Admin |

---

## Development Sequence

### Phase 1: Foundation (Infrastructure)
- [ ] Foundation — Project scaffold, shared auth, errors, DB, types, logging. Must be complete before domain units.

### Phase 2: Admin Operations (High Priority)
- [ ] Admin Operations — Core platform, all assessment workflow, dashboard, export. Depends on Foundation.

### Phase 3: Seller Portal (Medium Priority)
- [ ] Seller Portal — Depends on Foundation + Admin's product catalog and pricing engine.

### Phase 4: Buyer Portal (Low Priority)
- [ ] Buyer Portal — Depends on Foundation + Admin's stock data. Simplest unit (read-only).

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Admin unit is large (18 stories) | High | Clear sub-grouping within the unit (assessment flow, management, dashboard) |
| Pricing engine shared between Admin and Seller | Medium | Implement as shared internal module with clear API |
| QR mobile photo helper adds real-time complexity | Medium | Design as independent session-based feature, can be simplified if needed |
| Storefront display may need different tech (kiosk) | Low | Same data, different view — can be a simple responsive variant |
