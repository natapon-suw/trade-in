# Implementation Plan: Branch Management

## Overview

Add a three-level geographic hierarchy (Country → Province → Branch) to the trade-in platform. New Prisma models, a `BranchManagementModule` with CRUD services/controllers, modifications to existing Assessment/Stock/Dashboard services for branch-scoped data, and frontend pages for hierarchy management and branch filtering.

## Execution Waves

- **Wave 1**: Tasks 1 (schema) — no dependencies
- **Wave 2**: Tasks 2, 3, 4, 5, 6 (backend CRUD) — depend on 1
- **Wave 3**: Tasks 7, 8, 9 (backend integration) — depend on 2–6
- **Wave 4**: Tasks 11, 12, 13 (frontend) — depend on 7–9
- **Wave 5**: Task 14 (final checkpoint)

## Tasks

- [x] 1. Prisma schema: Add branch hierarchy models and modify existing models
  - [x] 1.1 Add Country, Province, Branch, and UserBranchAssignment models to `apps/api/prisma/schema.prisma`
    - Add `Country` model with `id`, `name` (unique among active), `createdAt`, `updatedAt`, `deletedAt`, mapped to `admin_countries`
    - Add `Province` model with `id`, `name`, `countryId`, `createdAt`, `updatedAt`, `deletedAt`, `@@unique([countryId, name])`, mapped to `admin_provinces`
    - Add `Branch` model with `id`, `name`, `address`, `provinceId`, `createdAt`, `updatedAt`, `deletedAt`, `@@unique([provinceId, name])`, mapped to `admin_branches`
    - Add `UserBranchAssignment` model with `id`, `userId`, `branchId`, `createdAt`, `@@unique([userId, branchId])`, mapped to `admin_user_branch_assignments`
    - Add relations: Country→Province[], Province→Branch[], Branch→UserBranchAssignment[], Branch→Assessment[], Branch→StockItem[]
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

  - [x] 1.2 Modify Assessment, StockItem, and User models
    - Add optional `branchId String?` and `branch Branch?` relation to `Assessment`
    - Add `@@index([branchId])` to `Assessment`
    - Add optional `branchId String?` and `branch Branch?` relation to `StockItem`
    - Add `@@index([branchId])` to `StockItem`
    - Add `branchAssignments UserBranchAssignment[]` relation to `User`
    - _Requirements: 5.1, 5.2_

  - [x] 1.3 Generate and apply Prisma migration
    - Run `npx prisma migrate dev --name add-branch-management` from `apps/api`
    - Regenerate Prisma client
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 5.2_

- [x] 2. Backend: Country CRUD service and controller
  - [x] 2.1 Create CountryService in `apps/api/src/modules/admin/branch-management/country.service.ts`
    - Implement `create(dto)`: check duplicate name among active records (`deletedAt IS NULL`), create Country, return with generated ID
    - Implement `findAll()`: return active countries sorted alphabetically by name
    - Implement `findById(id)`: return country with `_count` of active provinces
    - Implement `update(id, dto)`: check duplicate name, update and return
    - Implement `softDelete(id)`: check for active provinces (BRANCH_005), set `deletedAt`
    - Use `ConflictException` (BRANCH_001) for duplicate names, `NotFoundException` for missing records
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.2 Write property tests for CountryService in `country.service.pbt.spec.ts`
    - **Property 1: CRUD creation returns correct entity** (country subset)
    - **Property 4: Listing returns only active records sorted alphabetically** (country subset)
    - **Property 6: Duplicate names within scope are rejected** (country subset)
    - **Validates: Requirements 1.1, 1.2, 1.7**

  - [x] 2.3 Create CountryController in `apps/api/src/modules/admin/branch-management/country.controller.ts`
    - POST `/v1/admin/branch-management/countries` — admin-manager only
    - GET `/v1/admin/branch-management/countries` — admin-manager + admin-operation
    - GET `/v1/admin/branch-management/countries/:id` — admin-manager + admin-operation
    - PATCH `/v1/admin/branch-management/countries/:id` — admin-manager only
    - DELETE `/v1/admin/branch-management/countries/:id` — admin-manager only
    - Create `CreateCountryDto` and `UpdateCountryDto` in `dto/` subfolder with class-validator decorators
    - _Requirements: 1.1–1.7, 6.1, 6.3_

- [x] 3. Backend: Province CRUD service and controller
  - [x] 3.1 Create ProvinceService in `apps/api/src/modules/admin/branch-management/province.service.ts`
    - Implement `create(dto)`: validate countryId exists and is active, check duplicate name within country, create Province
    - Implement `findAll(countryId?)`: return active provinces filtered by country, sorted alphabetically
    - Implement `findById(id)`: return province with parent country name and active branch count
    - Implement `update(id, dto)`: check duplicate name within country, update and return
    - Implement `softDelete(id)`: check for active branches (BRANCH_006), set `deletedAt`
    - Use `ConflictException` (BRANCH_002) for duplicate names, `NotFoundException` for missing country/province
    - _Requirements: 2.1–2.8_

  - [ ]* 3.2 Write property tests for ProvinceService in `province.service.pbt.spec.ts`
    - **Property 1: CRUD creation returns correct entity** (province subset)
    - **Property 4: Listing returns only active records sorted alphabetically** (province subset)
    - **Property 6: Duplicate names within scope are rejected** (province subset)
    - **Validates: Requirements 2.1, 2.2, 2.7**

  - [x] 3.3 Create ProvinceController in `apps/api/src/modules/admin/branch-management/province.controller.ts`
    - POST `/v1/admin/branch-management/provinces` — admin-manager only
    - GET `/v1/admin/branch-management/provinces?countryId=` — admin-manager + admin-operation
    - GET `/v1/admin/branch-management/provinces/:id` — admin-manager + admin-operation
    - PATCH `/v1/admin/branch-management/provinces/:id` — admin-manager only
    - DELETE `/v1/admin/branch-management/provinces/:id` — admin-manager only
    - Create `CreateProvinceDto` and `UpdateProvinceDto` with class-validator decorators
    - _Requirements: 2.1–2.8, 6.1, 6.3_

- [x] 4. Backend: Branch CRUD service and controller
  - [x] 4.1 Create BranchService in `apps/api/src/modules/admin/branch-management/branch.service.ts`
    - Implement `create(dto)`: validate provinceId exists and is active, check duplicate name within province, create Branch
    - Implement `findAll(provinceId?, countryId?)`: return active branches with optional filters, sorted alphabetically
    - Implement `findById(id)`: return branch with parent province name, parent country name, and assigned user count
    - Implement `update(id, dto)`: check duplicate name within province, update and return
    - Implement `softDelete(id)`: check for active user assignments (BRANCH_007), set `deletedAt`
    - Use `ConflictException` (BRANCH_003) for duplicate names, `NotFoundException` for missing province/branch
    - _Requirements: 3.1–3.8_

  - [ ]* 4.2 Write property tests for BranchService in `branch.service.pbt.spec.ts`
    - **Property 1: CRUD creation returns correct entity** (branch subset)
    - **Property 5: FindById returns correct child counts and parent references** (branch subset)
    - **Property 6: Duplicate names within scope are rejected** (branch subset)
    - **Validates: Requirements 3.1, 3.3, 3.7**

  - [x] 4.3 Create BranchController in `apps/api/src/modules/admin/branch-management/branch.controller.ts`
    - POST `/v1/admin/branch-management/branches` — admin-manager only
    - GET `/v1/admin/branch-management/branches?provinceId=&countryId=` — admin-manager + admin-operation
    - GET `/v1/admin/branch-management/branches/:id` — admin-manager + admin-operation
    - PATCH `/v1/admin/branch-management/branches/:id` — admin-manager only
    - DELETE `/v1/admin/branch-management/branches/:id` — admin-manager only
    - Create `CreateBranchDto` and `UpdateBranchDto` with class-validator decorators
    - _Requirements: 3.1–3.8, 6.1, 6.3_

- [x] 5. Backend: UserBranch assignment service and controller
  - [x] 5.1 Create UserBranchService in `apps/api/src/modules/admin/branch-management/user-branch.service.ts`
    - Implement `assign(dto)`: validate user and branch exist, check duplicate assignment (BRANCH_004), create UserBranchAssignment
    - Implement `remove(id)`: hard-delete the assignment record
    - Implement `findByBranch(branchId)`: return users assigned to branch with name, email, role
    - Implement `findByUser(userId)`: return branches assigned to user with province and country info
    - Implement `getUserBranches(userId)`: utility method returning branch IDs for a user (used by AssessmentService)
    - _Requirements: 4.1–4.7_

  - [ ]* 5.2 Write property tests for UserBranchService in `user-branch.service.pbt.spec.ts`
    - **Property 7: Assign then list includes the user-branch pair**
    - **Property 8: Assign then remove round-trip**
    - **Property 9: Duplicate assignment is rejected**
    - **Validates: Requirements 4.1–4.5, 4.7**

  - [x] 5.3 Create UserBranchController in `apps/api/src/modules/admin/branch-management/user-branch.controller.ts`
    - POST `/v1/admin/branch-management/user-assignments` — admin-manager only
    - DELETE `/v1/admin/branch-management/user-assignments/:id` — admin-manager only
    - GET `/v1/admin/branch-management/user-assignments?branchId=` — admin-manager
    - GET `/v1/admin/branch-management/user-assignments?userId=` — admin-manager + admin-operation
    - Create `CreateUserBranchAssignmentDto` with class-validator decorators
    - _Requirements: 4.1–4.7, 6.2, 6.3_

- [x] 6. Backend: Hierarchy service, controller, and module registration
  - [x] 6.1 Create HierarchyService in `apps/api/src/modules/admin/branch-management/hierarchy.service.ts`
    - Implement `getFullHierarchy()`: return all active Countries → Provinces → Branches nested, sorted alphabetically at each level
    - Implement `getCountryHierarchy(countryId)`: return single country subtree
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 6.2 Write property tests for HierarchyService in `hierarchy.service.pbt.spec.ts`
    - **Property 14: Hierarchy returns only active records, nested and sorted**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [x] 6.3 Create HierarchyController in `apps/api/src/modules/admin/branch-management/hierarchy.controller.ts`
    - GET `/v1/admin/branch-management/hierarchy` — admin-manager + admin-operation
    - GET `/v1/admin/branch-management/hierarchy/:countryId` — admin-manager + admin-operation
    - _Requirements: 7.1–7.3, 6.3_

  - [x] 6.4 Create BranchManagementModule and register in AdminModule
    - Create `apps/api/src/modules/admin/branch-management/branch-management.module.ts`
    - Register all controllers and services
    - Export `BranchService` and `UserBranchService` for use by AssessmentModule, StockModule, DashboardModule
    - Import `BranchManagementModule` in `admin.module.ts`
    - _Requirements: All_

- [ ] 7. Checkpoint — Verify branch hierarchy CRUD
  - Ensure all tests pass, ask the user if questions arise.
  - Verify Country, Province, Branch, UserBranch CRUD and Hierarchy endpoints work correctly.

- [x] 8. Backend: Modify AssessmentService for branch-scoped creation
  - [x] 8.1 Update AssessmentService.create() to support branchId
    - Accept optional `branchId` in `CreateAssessmentDto`
    - If user has no branch assignments → reject with BRANCH_008
    - If user has exactly one branch and no `branchId` provided → auto-select that branch
    - If `branchId` provided → validate it's in user's assigned branches (BRANCH_009)
    - Store `branchId` on the Assessment record
    - Import `UserBranchService` from `BranchManagementModule`
    - _Requirements: 5.1, 5.6, 5.7_

  - [ ]* 8.2 Write property tests for branch-scoped assessment creation in `branch-scoped-data.pbt.spec.ts`
    - **Property 10: Assessment creation records branchId from user's assignments**
    - **Validates: Requirements 5.1, 5.7**

- [x] 9. Backend: Modify StockService for branchId propagation and filtering
  - [x] 9.1 Update StockService.addToStock() to copy branchId from Assessment
    - When creating StockItem, copy `assessment.branchId` to `stockItem.branchId`
    - _Requirements: 5.2_

  - [x] 9.2 Update StockService.findAll() to accept optional branchId filter
    - Add `branchId` to `StockFilterDto`
    - When `branchId` is provided, add `where: { branchId }` to the query
    - _Requirements: 5.4_

  - [ ]* 9.3 Write property tests for branchId propagation and filtering in `branch-scoped-data.pbt.spec.ts`
    - **Property 11: StockItem inherits branchId from Assessment**
    - **Property 12: Branch filter returns only matching records** (stock subset)
    - **Validates: Requirements 5.2, 5.4**

- [x] 10. Backend: Modify DashboardService for branch-scoped metrics
  - [x] 10.1 Update DashboardService.getMetrics() to accept optional branchId
    - Add optional `branchId` parameter
    - When provided, filter `assessment.count`, `stockItem.count`, `stockItem.aggregate`, and `recentActivity` by branchId
    - Update DashboardController to accept `branchId` query param
    - _Requirements: 5.5_

  - [ ]* 10.2 Write property test for branch-filtered dashboard metrics
    - **Property 12: Branch filter returns only matching records** (dashboard subset)
    - **Validates: Requirements 5.5**

- [ ] 11. Checkpoint — Verify backend integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify assessment creation with branch selection, stock branchId propagation, and dashboard filtering work correctly.

- [ ] 12. Frontend: Branch management pages
  - [ ] 12.1 Create branch management layout and countries page
    - Create `/admin/branches/layout.tsx` with tab navigation (Countries, Provinces, Branches, Assignments)
    - Create `/admin/branches/page.tsx` — redirects to countries tab
    - Create `/admin/branches/countries/page.tsx` — list countries with create/edit/delete actions
    - Add API functions for country CRUD in `api.ts`
    - _Requirements: 1.1–1.7_

  - [ ] 12.2 Create provinces and branches pages
    - Create `/admin/branches/provinces/page.tsx` — list provinces filtered by country dropdown, with create/edit/delete
    - Create `/admin/branches/branches/page.tsx` — list branches filtered by province/country, with create/edit/delete
    - Add API functions for province and branch CRUD in `api.ts`
    - _Requirements: 2.1–2.8, 3.1–3.8_

  - [ ] 12.3 Create user-branch assignment page
    - Create `/admin/branches/assignments/page.tsx` — manage user-branch assignments
    - Show branch selector and user list; allow assign/unassign
    - Add API functions for user-branch assignment CRUD in `api.ts`
    - _Requirements: 4.1–4.7_

  - [ ] 12.4 Add branch management link to admin sidebar/navigation
    - Add "Branches" nav item to admin layout sidebar
    - _Requirements: All_

- [ ] 13. Frontend: BranchSelector and BranchFilter components
  - [ ] 13.1 Create BranchSelector component for assessment workflow
    - Create `BranchSelector` component that loads user's assigned branches via API
    - If user has exactly one branch, auto-select and show as read-only
    - If user has multiple branches, show dropdown
    - Integrate into assessment creation step (step-product or step-customer)
    - Pass selected `branchId` to assessment creation API call
    - _Requirements: 5.1, 5.6, 5.7_

  - [ ] 13.2 Create BranchFilter component for dashboard and stock pages
    - Create `BranchFilter` dropdown component that loads full hierarchy for branch selection
    - Integrate into `/admin/stock/page.tsx` — pass `branchId` query param to stock list API
    - Integrate into `/admin/dashboard/page.tsx` — pass `branchId` query param to dashboard metrics API
    - When no branch selected, show all data (backward compatible)
    - _Requirements: 5.3, 5.4, 5.5_

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify end-to-end: hierarchy CRUD, user assignments, branch-scoped assessment creation, stock filtering, dashboard filtering, and frontend pages.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- `branchId` is nullable on Assessment/StockItem for backward compatibility with existing data
- BranchManagementModule exports BranchService and UserBranchService for cross-module use
