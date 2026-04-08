# Requirements Decisions

## Context Summary
Greenfield trade-in platform for second-hand laptops, PCs, and MacBooks. 5 user types: Admin Operation, Admin Manager, Seller, Buyer Storefront, Buyer Online. Admin-first focus with 8-step assessment workflow. 3 domains: Admin Operations, Seller Portal, Buyer Portal.

---

## Decision Questions

### D1-1: Personas
**Question**: Should we create detailed user personas for each user type to guide story writing?
- 1) Yes — create personas for all 5 user types (Admin Operation, Admin Manager, Seller, Buyer Storefront, Buyer Online) **(Recommended)**
- 2) Yes — but only for the 3 primary roles (Admin Operation, Admin Manager, Seller) since buyers are simpler
- 3) No — skip personas, write stories directly from user type descriptions
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-2: Feature Scope Priority
**Question**: You mentioned focusing on admin first. How should we scope the initial requirements?
- 1) Admin-first — full admin workflow + dashboard, then seller and buyer as secondary priority **(Recommended)**
- 2) Full platform — all 3 domains at equal priority in one release
- 3) Admin-only MVP — only admin workflow for v1, seller and buyer deferred to v2
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-3: Admin Role Separation
**Question**: How should Admin Operation and Admin Manager roles differ in terms of access and capabilities?
- 1) Operation does assessment workflow only; Manager has dashboard, reports, Excel export, and can override pricing **(Recommended)**
- 2) Both can do everything, but Manager also has user management and approval authority
- 3) Operation handles assessment + stock; Manager handles dashboard + reports + user management + pricing rules
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-4: Product Catalog Scope
**Question**: What product categories should the system support at launch?
- 1) Laptops, PCs, and MacBooks only (as described) **(Recommended)**
- 2) Laptops, PCs, MacBooks + tablets and phones
- 3) Generic — any electronics category, configurable by admin
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-5: Pricing Engine Logic
**Question**: How should the trade-in price be calculated?
- 1) Formula-based — base price per model adjusted by test results and defect grades (automated) **(Recommended)**
- 2) Rule-based — admin-configurable pricing rules with conditions and multipliers
- 3) Manual — admin sets price after seeing test results and defects, system only suggests
- 4) Other (please specify): _______

**Answer**: 2

---

### D1-6: Defect Grading System
**Question**: How should the defect grading work?
- 1) Predefined defect checklist per product category with severity levels 1-5 per defect **(Recommended)**
- 2) Free-form defect entry with severity levels 1-5
- 3) Predefined checklist with pass/fail only (no severity levels)
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-7: Photo Capture Workflow
**Question**: How should the photo capture with QR mobile helper work?
- 1) Admin generates QR code on PC → scans with phone → phone opens camera page → photos upload directly to the assessment session **(Recommended)**
- 2) Admin generates QR code → phone takes photos → photos saved locally → admin manually uploads later
- 3) Direct upload only from PC (webcam or file picker), no QR/mobile helper
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-8: Test Guide System
**Question**: How should the product test guides work?
- 1) Predefined test steps per product model/category — admin follows step-by-step and records pass/fail per step **(Recommended)**
- 2) Generic test checklist for all products — same steps regardless of model
- 3) Admin-configurable test templates that can be assigned to product categories
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-9: Buyer Experience Scope
**Question**: What should buyers (storefront + online) be able to do?
- 1) Browse products with photos, specs, condition grade — no account needed **(Recommended)**
- 2) Browse + create account + save favorites + get notifications on new stock
- 3) Browse + account + purchase/reserve online with payment
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-10: Seller Price Check
**Question**: How should the seller self-service price check work?
- 1) Select model + specs + check defect boxes → see estimated price range (no account required) **(Recommended)**
- 2) Same as above but requires account creation for price history
- 3) Full assessment simulation — seller answers test guide questions too for more accurate estimate
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-11: Dashboard and Reporting
**Question**: What should the admin dashboard include?
- 1) Key metrics (items assessed today, stock levels, revenue) + recent activity + Excel export of stock/assessments **(Recommended)**
- 2) Full analytics — charts, trends, comparisons, custom date ranges + Excel export
- 3) Simple stock list view with Excel export only
- 4) Other (please specify): _______

**Answer**: 1

---

### D1-12: Authentication and Authorization
**Question**: What authentication approach for the platform?
- 1) Email/password login for Admin and Seller; Buyer browses without login **(Recommended)**
- 2) Email/password for all roles including Buyer accounts
- 3) SSO/OAuth integration (Google, Microsoft) for Admin; email/password for Seller
- 4) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Auto-populated after user fills answers above. One line per decision. -->
- D1-1 Personas: Yes — all 5 user types (Admin Operation, Admin Manager, Seller, Buyer Storefront, Buyer Online)
- D1-2 Scope Priority: Admin-first — full admin workflow + dashboard, seller and buyer secondary
- D1-3 Admin Roles: Operation does assessment only; Manager has dashboard, reports, Excel export, pricing override
- D1-4 Product Catalog: Laptops, PCs, and MacBooks only
- D1-5 Pricing Engine: Rule-based — admin-configurable pricing rules with conditions and multipliers
- D1-6 Defect Grading: Predefined checklist per product category with severity levels 1-5
- D1-7 Photo Capture: QR code on PC → phone scans → camera page → photos upload directly to session
- D1-8 Test Guides: Predefined test steps per model/category — step-by-step with pass/fail per step
- D1-9 Buyer Experience: Browse products with photos, specs, condition grade — no account needed
- D1-10 Seller Price Check: Select model + specs + defect boxes → estimated price range, no account required
- D1-11 Dashboard: Key metrics + recent activity + Excel export of stock/assessments
- D1-12 Authentication: Email/password for Admin and Seller; Buyer browses without login

---

**Instructions**: Fill in your answers above and respond with "done" or say "use recommendations" to accept all recommended options.
