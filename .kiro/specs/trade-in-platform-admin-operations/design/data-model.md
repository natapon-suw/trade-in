# Data Model — Admin Operations Unit

## Overview
**Database**: MySQL
**ORM/Client**: Prisma
**Table Prefix**: `admin_` (per foundation convention)

---

## Entities

### Customer

**Purpose**: Trade-in customer record linked to assessments.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| name | String | Yes | — | Customer full name |
| phone | String | Yes | Unique | Phone number |
| email | String | No | — | Optional email |
| createdAt | DateTime | Yes | Auto | Creation timestamp |
| updatedAt | DateTime | Yes | Auto | Last update |
| deletedAt | DateTime | No | — | Soft delete |

**Relationships**: Has Many → Assessment
**Indexes**: Unique: `phone`, Index: `name` (for search)

---

### ProductModel

**Purpose**: Catalog of device models available for trade-in.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| brand | String | Yes | — | Device brand (Apple, Dell, HP, etc.) |
| name | String | Yes | — | Model name (MacBook Pro 14", ThinkPad X1, etc.) |
| category | Enum | Yes | LAPTOP, PC, MACBOOK | Product category |
| basePrice | Decimal | Yes | > 0 | Base trade-in price before adjustments |
| isActive | Boolean | Yes | Default: true | Whether model appears in search |
| createdAt | DateTime | Yes | Auto | Creation timestamp |
| updatedAt | DateTime | Yes | Auto | Last update |

**Relationships**: Has Many → Assessment, Has Many → TestGuide (via category), Has Many → DefectChecklist (via category)
**Indexes**: Index: `brand`, Index: `category`, Composite: `brand, name` (for search)

---

### TestGuide

**Purpose**: Step-by-step test procedure for a product category.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| category | Enum | Yes | LAPTOP, PC, MACBOOK | Product category this guide applies to |
| name | String | Yes | — | Guide name |
| isActive | Boolean | Yes | Default: true | Active status |
| createdAt | DateTime | Yes | Auto | Creation timestamp |
| updatedAt | DateTime | Yes | Auto | Last update |

**Relationships**: Has Many → TestStep
**Indexes**: Index: `category`

---

### TestStep

**Purpose**: Individual test step within a test guide.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| testGuideId | String (UUID) | Yes | FK → TestGuide | Parent guide |
| stepNumber | Int | Yes | > 0 | Order within guide |
| title | String | Yes | — | Step title |
| description | String | No | — | Detailed instructions |

**Relationships**: Belongs To → TestGuide
**Indexes**: Composite: `testGuideId, stepNumber` (unique order)

---

### DefectChecklist

**Purpose**: Predefined defect options for a product category.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| category | Enum | Yes | LAPTOP, PC, MACBOOK | Product category |
| name | String | Yes | — | Checklist name |
| isActive | Boolean | Yes | Default: true | Active status |
| createdAt | DateTime | Yes | Auto | Creation timestamp |
| updatedAt | DateTime | Yes | Auto | Last update |

**Relationships**: Has Many → DefectItem
**Indexes**: Index: `category`

---

### DefectItem

**Purpose**: Individual defect option within a checklist.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| defectChecklistId | String (UUID) | Yes | FK → DefectChecklist | Parent checklist |
| name | String | Yes | — | Defect name (e.g., "Screen scratch") |
| description | String | No | — | Detailed description |
| defaultSeverity | Int | No | 1-5 | Suggested severity level |

**Relationships**: Belongs To → DefectChecklist

---

### Assessment

**Purpose**: Core entity tracking the entire trade-in assessment workflow.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| customerId | String (UUID) | Yes | FK → Customer | Customer being assessed |
| productModelId | String (UUID) | Yes | FK → ProductModel | Device model |
| assessedById | String (UUID) | Yes | FK → User | Admin Operation who performed assessment |
| status | Enum | Yes | Default: CUSTOMER_SELECTED | Current workflow step |
| finalPrice | Decimal | No | — | Calculated or overridden price |
| priceOverrideReason | String | No | — | Reason if manager overrode price |
| priceOverrideById | String (UUID) | No | FK → User | Manager who overrode |
| createdAt | DateTime | Yes | Auto | Assessment start time |
| updatedAt | DateTime | Yes | Auto | Last update |
| completedAt | DateTime | No | — | When assessment was finalized |

**Assessment Status Enum**:
- `CUSTOMER_SELECTED` → `MODEL_SELECTED` → `TESTING` → `TEST_COMPLETE` → `PHOTOS_CAPTURED` → `DEFECTS_GRADED` → `PRICED` → `STOCKED`

**Relationships**: Belongs To → Customer, ProductModel, User. Has Many → TestResult, AssessmentPhoto, AssessmentDefect. Has One → StockItem.
**Indexes**: Index: `customerId`, Index: `assessedById`, Index: `status`, Index: `createdAt`

---

### TestResult

**Purpose**: Pass/fail result for each test step in an assessment.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| assessmentId | String (UUID) | Yes | FK → Assessment | Parent assessment |
| testStepId | String (UUID) | Yes | FK → TestStep | Which test step |
| passed | Boolean | Yes | — | Pass or fail |
| notes | String | No | — | Optional notes |
| createdAt | DateTime | Yes | Auto | When recorded |

**Relationships**: Belongs To → Assessment, TestStep
**Indexes**: Composite: `assessmentId, testStepId` (unique per assessment)

---

### AssessmentPhoto

**Purpose**: Photo attached to an assessment.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| assessmentId | String (UUID) | Yes | FK → Assessment | Parent assessment |
| filename | String | Yes | — | Stored filename |
| originalName | String | Yes | — | Original upload filename |
| mimeType | String | Yes | — | MIME type (image/jpeg, etc.) |
| size | Int | Yes | — | File size in bytes |
| uploadedVia | Enum | Yes | PC, MOBILE | Upload method |
| createdAt | DateTime | Yes | Auto | Upload timestamp |

**Relationships**: Belongs To → Assessment
**Indexes**: Index: `assessmentId`

---

### AssessmentDefect

**Purpose**: Defect recorded during assessment with severity grade.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| assessmentId | String (UUID) | Yes | FK → Assessment | Parent assessment |
| defectItemId | String (UUID) | Yes | FK → DefectItem | Which defect |
| severity | Int | Yes | 1-5 | Severity level (1=minor, 5=critical) |
| notes | String | No | — | Optional notes |

**Relationships**: Belongs To → Assessment, DefectItem
**Indexes**: Composite: `assessmentId, defectItemId` (unique per assessment)

---

### PricingRule

**Purpose**: Admin-configurable pricing rule with conditions and adjustments.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| name | String | Yes | — | Rule name |
| category | Enum | No | LAPTOP, PC, MACBOOK | Category filter (null = all) |
| conditionType | Enum | Yes | DEFECT_SEVERITY, TEST_PASS_RATE, DEFECT_COUNT | What condition to check |
| conditionOperator | Enum | Yes | GT, GTE, LT, LTE, EQ | Comparison operator |
| conditionValue | Decimal | Yes | — | Threshold value |
| adjustmentType | Enum | Yes | PERCENTAGE, FIXED | How to adjust price |
| adjustmentValue | Decimal | Yes | — | Adjustment amount (negative = deduction) |
| priority | Int | Yes | Default: 0 | Evaluation order (higher = first) |
| isActive | Boolean | Yes | Default: true | Active status |
| createdAt | DateTime | Yes | Auto | Creation timestamp |
| updatedAt | DateTime | Yes | Auto | Last update |

**Indexes**: Index: `category`, Index: `priority DESC`, Index: `isActive`

---

### StockItem

**Purpose**: Product added to inventory after assessment and pricing.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Unique identifier |
| assessmentId | String (UUID) | Yes | FK → Assessment, Unique | Source assessment |
| productModelId | String (UUID) | Yes | FK → ProductModel | Device model |
| price | Decimal | Yes | > 0 | Final selling price |
| conditionGrade | String | Yes | — | Computed grade (e.g., "A", "B", "C", "D") |
| status | Enum | Yes | Default: AVAILABLE | AVAILABLE, SOLD, REMOVED |
| createdAt | DateTime | Yes | Auto | When added to stock |
| updatedAt | DateTime | Yes | Auto | Last update |

**Relationships**: Belongs To → Assessment, ProductModel
**Indexes**: Index: `status`, Index: `productModelId`, Index: `createdAt`

---

### QRSession

**Purpose**: Temporary session for QR-based mobile photo upload.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | String (UUID) | Yes | PK | Session identifier (encoded in QR) |
| assessmentId | String (UUID) | Yes | FK → Assessment | Linked assessment |
| expiresAt | DateTime | Yes | — | Session expiry (10 min from creation) |
| isActive | Boolean | Yes | Default: true | Whether session is still valid |
| createdAt | DateTime | Yes | Auto | Creation timestamp |

**Relationships**: Belongs To → Assessment
**Indexes**: Index: `assessmentId`, Index: `expiresAt`

---

## Entity Relationship Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ Customer │──1:N──│  Assessment  │──1:1──│  StockItem   │
└──────────┘     │              │     └──────────────┘
                 │  status      │
                 │  finalPrice  │     ┌──────────────┐
                 │              │──1:N──│  TestResult  │
                 │              │     └──────────────┘
                 │              │     ┌──────────────┐
                 │              │──1:N──│ Assess.Photo │
                 │              │     └──────────────┘
                 │              │     ┌──────────────┐
                 │              │──1:N──│ Assess.Defect│
                 └──────┬───────┘     └──────────────┘
                        │
                   N:1  │
                 ┌──────▼───────┐     ┌──────────────┐
                 │ ProductModel │     │  TestGuide   │──1:N──TestStep
                 │  basePrice   │     │  (category)  │
                 │  category    │     └──────────────┘
                 └──────────────┘     ┌──────────────┐
                                      │DefectChecklist│──1:N──DefectItem
                                      │  (category)  │
                                      └──────────────┘
                 ┌──────────────┐
                 │ PricingRule  │  (standalone, evaluated by PricingService)
                 └──────────────┘
                 ┌──────────────┐
                 │  QRSession   │──N:1──Assessment
                 └──────────────┘
```

---

## Data Access Patterns

| Query | Frequency | Index Used |
|-------|-----------|------------|
| Search customers by name/phone | High | name, phone (unique) |
| Search product models by brand/name | High | brand, brand+name composite |
| Get test guide by category | Medium | category |
| Get defect checklist by category | Medium | category |
| Get assessment with all relations | High | PK + eager load |
| List assessments by date | Medium | createdAt |
| List stock items with filters | High | status, productModelId, createdAt |
| Dashboard aggregates (today's count, stock value) | Medium | createdAt, status |
| Pricing rules by category + priority | Medium | category, priority DESC |
