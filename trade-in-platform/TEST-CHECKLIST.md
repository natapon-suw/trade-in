# Trade-In Platform — Test Checklist

## Setup
- [/] Run `npx nx serve api` (backend at localhost:3000)
- [/] Run `npx nx serve web` (frontend at localhost:4200)
- [/] Run `npm run prisma:seed` (if not done already)

---

## 1. Authentication

### Admin Operation Login
- [/] Go to http://localhost:4200/login
- [/] Login: `admin@tradein.local` / `Admin123!`
- [/] Redirects to `/admin/assessment`
- [/] Sidebar shows only "Assessment"

### Admin Manager Login
- [/] Logout → login: `manager@tradein.local` / `Manager123!`
- [/] Redirects to `/admin/dashboard`
- [/] Sidebar shows: Assessment, Dashboard, Stock, Catalog, Pricing Rules, Branches

### Invalid Login
- [/] Try wrong password → shows "Invalid email or password"

### Logout
- [/] Click "Sign Out" in sidebar → redirects to login

---

## 2. Branch Management Setup (login as Manager)

> Set up the geographic hierarchy before anything else — assessments require branch assignments.

### Countries
- [ ] Go to `/admin/branches` → Countries tab active
- [ ] Click "Add Country" → name=United States → created, appears in list
- [ ] Add another: name=Canada
- [ ] Try adding "United States" again → duplicate error
- [ ] Click "Edit" on Canada → rename to "Canada Updated" → saves
- [ ] Rename back to "Canada"
- [ ] Countries listed alphabetically (Canada, United States)

### Provinces
- [ ] Switch to Provinces tab
- [ ] Select country=United States
- [ ] Add province: name=California → created
- [ ] Add province: name=New York → created
- [ ] Select country=Canada → add province: name=Ontario
- [ ] Try adding "California" again under United States → duplicate error
- [ ] Add "California" under Canada → succeeds (different country scope)
- [ ] Provinces sorted alphabetically within each country

### Branches
- [ ] Switch to Branches tab
- [ ] Filter by country=United States, province=California
- [ ] Add branch: name=LA Downtown, address=123 Main St → created
- [ ] Add branch: name=SF Market St, address=456 Market St → created
- [ ] Filter by province=New York → add branch: name=NYC 5th Ave, address=789 5th Ave
- [ ] Try adding "LA Downtown" again under California → duplicate error
- [ ] Branches sorted alphabetically

### Hierarchy View
- [ ] GET `/api/v1/admin/branch-management/hierarchy` returns nested structure
- [ ] Countries → Provinces → Branches all present and sorted alphabetically
- [ ] GET `/api/v1/admin/branch-management/hierarchy/:countryId` returns single country subtree

### User-Branch Assignments
- [ ] Switch to Assignments tab
- [ ] Select a branch from the dropdown (e.g., "LA Downtown")
- [ ] Enter the admin operation user ID (from seed output) and click "Assign"
- [ ] User appears in the table with name, email, role
- [ ] Try assigning same user again → conflict error
- [ ] Click "Remove" → user removed from list

### Soft-Delete Guards
- [ ] Try deleting "LA Downtown" branch (has assigned user) → error: has active assignments
- [ ] Unassign admin@tradein.local from "LA Downtown"
- [ ] Delete "LA Downtown" → succeeds, disappears from list
- [ ] Re-add "LA Downtown" branch for later tests, re-assign admin@tradein.local to it
- [ ] Try deleting province "California" (has active branches) → error: has active child records
- [ ] Try deleting country "United States" (has active provinces) → error: has active child records

---

## 3. Catalog Setup (login as Manager)

### Product Models
- [ ] Go to `/admin/catalog/models`
- [ ] Click "Add Model" → fill: brand=Apple, name=MacBook Pro 14, category=MACBOOK, basePrice=1500
- [ ] Model appears in table
- [ ] Click "Edit" → change base price → saves
- [ ] Click Active/Inactive toggle → status changes

### Test Guides
- [ ] Go to `/admin/catalog/test-guides`
- [ ] Click "Add Guide" → category=MACBOOK, name=MacBook Test Guide
- [ ] Add 3 steps: "Power On Test", "Screen Check", "Keyboard Test"
- [ ] Guide appears in list with "3 steps"
- [ ] Click "Edit" → modify a step → saves

### Defect Checklists
- [ ] Go to `/admin/catalog/defect-checklists`
- [ ] Click "Add Checklist" → category=MACBOOK, name=MacBook Defects
- [ ] Add items: "Screen Scratch" (sev 2), "Dent on Body" (sev 3), "Battery Wear" (sev 4)
- [ ] Checklist appears with "3 items"
- [ ] Click "Edit" → modify an item → saves

---

## 4. Pricing Rules (login as Manager)

- [ ] Go to `/admin/pricing`
- [ ] Add rule: name="High defect count", conditionType=DEFECT_COUNT, operator=GT, value=2, adjustmentType=PERCENTAGE, adjustmentValue=-15, priority=5
- [ ] Add rule: name="Low test pass rate", conditionType=TEST_PASS_RATE, operator=LT, value=80, adjustmentType=PERCENTAGE, adjustmentValue=-10, priority=10
- [ ] Both rules appear in table
- [ ] Edit a rule → saves
- [ ] Deactivate a rule → disappears from list

---

## 5. Assessment Workflow (login as Operation)

### Step 1: Customer
- [ ] Go to `/admin/assessment`
- [ ] Search for customer (none yet) → shows "No customer found"
- [ ] Click "Register New" → fill name + phone → customer created
- [ ] Customer selected → moves to step 2

### Step 2: Product Model + Branch Selection
- [ ] Search for "MacBook" → model appears
- [ ] Select model
- [ ] If user has 1 branch → branch auto-selected (shown as read-only)
- [ ] If user has multiple branches → branch dropdown appears, select one
- [ ] Assessment created with branchId → moves to step 3

### Step 3: Test Guide
- [ ] Test guide loads with 3 steps
- [ ] Mark each step Pass or Fail
- [ ] All steps completed → moves to step 4

### Step 4: Submit Test Results
- [ ] Shows pass/fail summary
- [ ] Click "Submit" → results saved → moves to step 5

### Step 5: Photos
- [ ] Upload a photo from PC (drag & drop or click)
- [ ] Photo thumbnail appears
- [ ] (Optional) Click "Use Phone Camera" → QR code appears
- [ ] Moves to step 6 after clicking Continue

### Step 6: Defects
- [ ] Defect checklist loads
- [ ] Check 2-3 defects, set severity levels
- [ ] Click "Submit" → defects saved → moves to step 7

### Step 7: Price
- [ ] Price breakdown shows: base price, test deductions, defect deductions, final price
- [ ] Final price reflects pricing rules applied
- [ ] Click "Add to Stock" → moves to step 8

### Step 8: Complete
- [ ] Success message shown
- [ ] "Start New Assessment" button works

### Branch-Scoped Assessment Edge Cases
- [ ] (API) Create assessment without branch assignments → error: "User has no branch assignments"
- [ ] (API) Create assessment with branchId not in user's assignments → error: "Provided branchId is not in user's assigned branches"

---

## 6. Dashboard (login as Manager)

- [ ] Go to `/admin/dashboard`
- [ ] "Assessed Today" shows count (at least 1 from step 5)
- [ ] "Total Stock" shows count (at least 1)
- [ ] "Stock Value" shows dollar amount
- [ ] Recent Activity shows the assessment just completed

### Branch Filtering
- [ ] Select a branch from the branch filter dropdown
- [ ] Metrics update to show only data for the selected branch
- [ ] Clear branch filter → all data shown again
- [ ] Select a branch with no assessments → counts show 0

### Export
- [ ] Click "Export Stock" → downloads .xlsx file
- [ ] Click "Export Assessments" → downloads .xlsx file
- [ ] Open .xlsx files → data is correct

---

## 7. Stock (login as Manager)

- [ ] Go to `/admin/stock`
- [ ] Stock item from assessment appears in list
- [ ] Filter by category → filters correctly
- [ ] Click stock item → detail page opens
- [ ] Detail shows: product info, photos, test results, defects, price breakdown
- [ ] Back button works

### Branch Filtering
- [ ] Select a branch from the branch filter dropdown → only stock from that branch shown
- [ ] Clear branch filter → all stock shown
- [ ] Stock item's branchId matches the assessment's branch (inherited)

---

## 8. QR Mobile Photo (during assessment step 5)

- [ ] During step 5, click "Use Phone Camera"
- [ ] QR code appears on screen
- [ ] Scan QR with phone → opens mobile camera page
- [ ] Take photo on phone → photo appears on PC in real-time
- [ ] "Take Another Photo" works
- [ ] After 10 minutes → session expires message

---

## 9. Seller Portal

### Price Check (no login required)
- [ ] Go to http://localhost:4200/seller
- [ ] Search for "MacBook" → model appears
- [ ] Select model → defect checkboxes appear
- [ ] Check some defects, set severity
- [ ] Click "Get Estimate" → price range shows (min — max)
- [ ] Breakdown shows base price and deductions
- [ ] "Check Another Device" resets the form

### Seller Registration
- [ ] Go to `/seller/register`
- [ ] Fill name, email, password → register
- [ ] Redirects to login page

### Seller Login
- [ ] Go to `/seller/login`
- [ ] Login with registered email/password → works

---

## 10. Buyer Portal

### Online Browse
- [ ] Go to http://localhost:4200/browse
- [ ] Product grid shows available stock items
- [ ] Filter by category → filters correctly
- [ ] Click a product → detail page opens
- [ ] Detail shows: photos, price, condition grade, test summary, defect summary
- [ ] Back button works

### Storefront (Kiosk)
- [ ] Go to http://localhost:4200/storefront
- [ ] Dark theme, large product cards
- [ ] Products display correctly
- [ ] "Last updated" timestamp shows at bottom
- [ ] (Wait 5 min or check code) Auto-refresh works

---

## 11. RBAC Enforcement

### Branch Management RBAC
- [ ] Login as Operation → cannot create/update/delete countries, provinces, or branches
- [ ] Login as Operation → can read (list/get) countries, provinces, branches, hierarchy
- [ ] Login as Operation → cannot create/delete user-branch assignments
- [ ] Login as Manager → can perform all branch management operations
- [ ] Seller cannot access any `/api/v1/admin/branch-management/*` endpoints → 403

### General RBAC
- [ ] Login as Operation → cannot access `/admin/dashboard` (sidebar hidden)
- [ ] Login as Operation → cannot access `/admin/stock`
- [ ] Login as Operation → cannot access `/admin/pricing`
- [ ] Login as Operation → cannot access `/admin/catalog/*`
- [ ] Login as Manager → can access all admin pages
- [ ] Seller cannot access any `/admin/*` pages

---

## 12. Automated Tests

- [ ] Run `npx nx test api` → all tests pass
- [ ] PBT tests included (pricing engine, defect grading)

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin Operation | admin@tradein.local | Admin123! |
| Admin Manager | manager@tradein.local | Manager123! |
| Test Seller | seller@tradein.local | Seller123! |
