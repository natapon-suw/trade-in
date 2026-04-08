# Personas

## Overview
This feature serves 5 distinct user types with different needs and workflows across 3 domains.

---

## Persona 1: Admin Operation

**Demographics**:
- Role: Store technician / assessment staff
- Technical Proficiency: Intermediate
- Usage Frequency: Daily (8+ hours)

**Goals**:
- Primary: Efficiently assess, test, and grade trade-in products
- Secondary: Capture accurate photos and defect data for fair pricing

**Pain Points**:
- Inconsistent assessment process without structured guides
- Switching between PC and phone for photos is clunky
- Manual price calculation is slow and error-prone

**User Journey**:
1. Entry: Logs in at start of shift, customer walks in with device
2. Action: Registers customer, selects product model, follows test guide, records defects, takes photos, reviews price, adds to stock
3. Outcome: Product assessed, priced, and added to inventory in under 15 minutes

**Implications for Requirements**:
- Needs step-by-step guided workflow — minimal decision-making
- QR-based mobile photo helper for seamless PC-to-phone transition
- Clear pass/fail test steps with no ambiguity

---

## Persona 2: Admin Manager

**Demographics**:
- Role: Store manager / operations supervisor
- Technical Proficiency: Intermediate
- Usage Frequency: Daily (dashboard checks, periodic deep dives)

**Goals**:
- Primary: Monitor operations, review stock levels, and export reports
- Secondary: Override pricing when needed, manage pricing rules

**Pain Points**:
- No visibility into daily assessment volume or stock trends
- Manual Excel tracking is tedious and out of date
- Cannot adjust pricing rules without developer help

**User Journey**:
1. Entry: Logs in, checks dashboard for daily metrics
2. Action: Reviews recent assessments, exports stock report to Excel, adjusts pricing rules if needed
3. Outcome: Clear picture of operations, up-to-date reports, pricing rules reflect market conditions

**Implications for Requirements**:
- Dashboard with key metrics and recent activity
- Excel export for stock and assessment data
- Pricing rule management interface
- Role separation from Operation — no assessment workflow access needed

---

## Persona 3: Seller

**Demographics**:
- Role: Device owner looking to trade in
- Technical Proficiency: Novice to Intermediate
- Usage Frequency: One-time or occasional

**Goals**:
- Primary: Get a quick price estimate for their device before visiting the store
- Secondary: Understand what factors affect the trade-in value

**Pain Points**:
- No idea what their device is worth before going to a store
- Worried about getting lowballed without transparency
- Don't want to create an account just to check a price

**User Journey**:
1. Entry: Visits the website, navigates to price check
2. Action: Selects device model, enters specs, checks applicable defect boxes
3. Outcome: Sees estimated price range, decides whether to visit the store

**Implications for Requirements**:
- Simple, no-account-required price check flow
- Clear model/spec selection with defect checkboxes
- Transparent price range display (not a single number)

---

## Persona 4: Buyer Storefront

**Demographics**:
- Role: Walk-in customer at the physical store
- Technical Proficiency: Novice
- Usage Frequency: Occasional

**Goals**:
- Primary: Browse available second-hand devices in-store
- Secondary: Compare specs and condition grades before purchasing

**Pain Points**:
- Hard to compare multiple devices without structured info
- Condition descriptions are vague or inconsistent

**User Journey**:
1. Entry: Walks into store, views product display or in-store kiosk/screen
2. Action: Browses available products, views photos, specs, and condition grade
3. Outcome: Finds a device that meets their needs and budget

**Implications for Requirements**:
- Product listing optimized for in-store display (kiosk-friendly)
- Clear condition grades and photos
- No account or login required

---

## Persona 5: Buyer Online

**Demographics**:
- Role: Online shopper browsing from home
- Technical Proficiency: Intermediate
- Usage Frequency: Occasional

**Goals**:
- Primary: Browse available second-hand devices online
- Secondary: Filter and compare products by specs, price, and condition

**Pain Points**:
- Can't physically inspect the device — needs detailed photos and condition info
- Wants to filter by budget, brand, specs

**User Journey**:
1. Entry: Visits the website, navigates to product listings
2. Action: Filters by category/brand/price, views product details with photos and condition grade
3. Outcome: Identifies devices of interest, may visit store or contact for purchase

**Implications for Requirements**:
- Product listing with search and filter capabilities
- Detailed product pages with multiple photos and condition breakdown
- No account or login required

---

## Persona-Requirement Matrix

| Requirement Area | Admin Operation | Admin Manager | Seller | Buyer Storefront | Buyer Online |
|-----------------|----------------|---------------|--------|------------------|--------------|
| Assessment Workflow | Primary | N/A | N/A | N/A | N/A |
| Test Guides | Primary | N/A | N/A | N/A | N/A |
| Defect Grading | Primary | N/A | N/A | N/A | N/A |
| Photo Capture | Primary | N/A | N/A | N/A | N/A |
| Pricing Engine | Primary | Primary | Secondary | N/A | N/A |
| Stock Management | Primary | Secondary | N/A | N/A | N/A |
| Dashboard | N/A | Primary | N/A | N/A | N/A |
| Excel Export | N/A | Primary | N/A | N/A | N/A |
| Price Check | N/A | N/A | Primary | N/A | N/A |
| Product Browsing | N/A | N/A | N/A | Primary | Primary |
| Authentication | Primary | Primary | Primary | N/A | N/A |

---

## Design Implications

**Architecture**: Need RBAC with at least 3 roles (Admin Operation, Admin Manager, Seller). Buyers are unauthenticated.
**UI/UX**: Admin Operation needs a guided, step-by-step workflow. Manager needs a dashboard-centric view. Seller needs a simple, focused price check. Buyers need a clean browsing experience.
**Data & Privacy**: Customer data collected during assessment must be protected. Seller price checks should not store personal data. Product photos are public once in stock.
