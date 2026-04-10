# Requirements Document

## Introduction

Branch Management adds a geographic hierarchy (Country → Province → Branch) to the trade-in platform. This enables multi-location operations where users are assigned to branches, and assessments and stock are scoped per branch. Admin Managers can manage the full hierarchy and assign users, while dashboard and reports gain branch-level filtering.

## Glossary

- **Branch_Management_Module**: The NestJS module within the admin domain responsible for Country, Province, and Branch CRUD operations, user-branch assignment, and branch-scoped data filtering.
- **Country**: A top-level geographic entity representing a nation in which the business operates.
- **Province**: A second-level geographic entity belonging to a Country, representing a state, province, or region.
- **Branch**: A physical store location belonging to a Province where trade-in operations occur.
- **User_Branch_Assignment**: The association between a User and a Branch, determining which branch the user operates from.
- **Admin_Manager**: A user with the ADMIN_MANAGER role who can manage the branch hierarchy and assign users.
- **Admin_Operation**: A user with the ADMIN_OPERATION role who performs assessments at a specific branch.
- **Branch_Filter**: A UI and API mechanism that restricts data queries (assessments, stock, dashboard) to a specific branch or set of branches.

## Requirements

### Requirement 1: Country CRUD

**User Story:** As an Admin Manager, I want to create, read, update, and soft-delete countries, so that I can define the top-level geographic structure for the business.

#### Acceptance Criteria

1. WHEN an Admin_Manager submits a valid country name, THE Branch_Management_Module SHALL create a new Country record and return the created Country with its generated ID.
2. WHEN an Admin_Manager requests the country list, THE Branch_Management_Module SHALL return all active (non-deleted) Country records sorted alphabetically by name.
3. WHEN an Admin_Manager requests a single Country by ID, THE Branch_Management_Module SHALL return the Country record including its associated Province count.
4. WHEN an Admin_Manager submits an updated name for an existing Country, THE Branch_Management_Module SHALL update the Country record and return the updated Country.
5. WHEN an Admin_Manager soft-deletes a Country, THE Branch_Management_Module SHALL set the deletedAt timestamp on the Country record.
6. IF a Country has active Provinces, THEN THE Branch_Management_Module SHALL reject the soft-delete and return an error indicating the Country still has active child records.
7. IF a Country name already exists among active records, THEN THE Branch_Management_Module SHALL reject the creation or update and return a duplicate name error.

### Requirement 2: Province CRUD

**User Story:** As an Admin Manager, I want to create, read, update, and soft-delete provinces within a country, so that I can define the second-level geographic structure.

#### Acceptance Criteria

1. WHEN an Admin_Manager submits a valid province name and a Country ID, THE Branch_Management_Module SHALL create a new Province record linked to the specified Country.
2. WHEN an Admin_Manager requests provinces for a given Country, THE Branch_Management_Module SHALL return all active Province records for that Country sorted alphabetically by name.
3. WHEN an Admin_Manager requests a single Province by ID, THE Branch_Management_Module SHALL return the Province record including its parent Country name and associated Branch count.
4. WHEN an Admin_Manager submits an updated name for an existing Province, THE Branch_Management_Module SHALL update the Province record and return the updated Province.
5. WHEN an Admin_Manager soft-deletes a Province, THE Branch_Management_Module SHALL set the deletedAt timestamp on the Province record.
6. IF a Province has active Branches, THEN THE Branch_Management_Module SHALL reject the soft-delete and return an error indicating the Province still has active child records.
7. IF a Province name already exists within the same Country among active records, THEN THE Branch_Management_Module SHALL reject the creation or update and return a duplicate name error.
8. IF the specified Country ID does not exist or is soft-deleted, THEN THE Branch_Management_Module SHALL reject the creation and return a not-found error.

### Requirement 3: Branch CRUD

**User Story:** As an Admin Manager, I want to create, read, update, and soft-delete branches within a province, so that I can register physical store locations.

#### Acceptance Criteria

1. WHEN an Admin_Manager submits a valid branch name, address, and a Province ID, THE Branch_Management_Module SHALL create a new Branch record linked to the specified Province.
2. WHEN an Admin_Manager requests branches, THE Branch_Management_Module SHALL return all active Branch records, optionally filtered by Province or Country, sorted alphabetically by name.
3. WHEN an Admin_Manager requests a single Branch by ID, THE Branch_Management_Module SHALL return the Branch record including its parent Province name, parent Country name, and assigned user count.
4. WHEN an Admin_Manager submits updated fields for an existing Branch, THE Branch_Management_Module SHALL update the Branch record and return the updated Branch.
5. WHEN an Admin_Manager soft-deletes a Branch, THE Branch_Management_Module SHALL set the deletedAt timestamp on the Branch record.
6. IF a Branch has active User_Branch_Assignments, THEN THE Branch_Management_Module SHALL reject the soft-delete and return an error indicating the Branch still has assigned users.
7. IF a Branch name already exists within the same Province among active records, THEN THE Branch_Management_Module SHALL reject the creation or update and return a duplicate name error.
8. IF the specified Province ID does not exist or is soft-deleted, THEN THE Branch_Management_Module SHALL reject the creation and return a not-found error.

### Requirement 4: User-Branch Assignment

**User Story:** As an Admin Manager, I want to assign users to one or more branches, so that each user's operations can span multiple locations.

#### Acceptance Criteria

1. WHEN an Admin_Manager assigns a User to a Branch, THE Branch_Management_Module SHALL create a User_Branch_Assignment record linking the User to the Branch.
2. WHEN an Admin_Manager removes a User from a Branch, THE Branch_Management_Module SHALL delete the User_Branch_Assignment record.
3. WHEN an Admin_Manager requests the list of users for a Branch, THE Branch_Management_Module SHALL return all Users assigned to that Branch with their name, email, and role.
4. WHEN an Admin_Manager requests the branch assignments for a User, THE Branch_Management_Module SHALL return all Branches the User is assigned to, each with its Province and Country.
5. THE Branch_Management_Module SHALL allow each User to be assigned to multiple Branches simultaneously.
6. IF the specified User or Branch does not exist, THEN THE Branch_Management_Module SHALL reject the assignment and return a not-found error.
7. IF the User is already assigned to the specified Branch, THEN THE Branch_Management_Module SHALL reject the duplicate assignment and return a conflict error.

### Requirement 5: Branch-Scoped Data Access

**User Story:** As an Admin Manager, I want assessments and stock items to be associated with a branch, so that data can be filtered and reported per location.

#### Acceptance Criteria

1. WHEN an Admin_Operation user creates an Assessment, THE Branch_Management_Module SHALL require the user to select a Branch from their assigned branches, and record that Branch ID on the Assessment.
2. WHEN an Admin_Operation user adds a StockItem, THE Branch_Management_Module SHALL record the same Branch ID from the Assessment on the StockItem.
3. WHEN an Admin_Manager applies a Branch_Filter to the assessment list, THE Branch_Management_Module SHALL return only Assessments belonging to the specified Branch.
4. WHEN an Admin_Manager applies a Branch_Filter to the stock list, THE Branch_Management_Module SHALL return only StockItems belonging to the specified Branch.
5. WHEN an Admin_Manager applies a Branch_Filter to the dashboard, THE Branch_Management_Module SHALL compute dashboard metrics using only data from the specified Branch.
6. IF an Admin_Operation user is not assigned to any Branch, THEN THE Branch_Management_Module SHALL reject Assessment creation with an error indicating the user must be assigned to a Branch.
7. IF an Admin_Operation user is assigned to exactly one Branch, THE Branch_Management_Module SHALL auto-select that Branch without prompting.

### Requirement 6: Authorization

**User Story:** As a platform administrator, I want branch management operations restricted to authorized roles, so that only Admin Managers can modify the geographic hierarchy.

#### Acceptance Criteria

1. THE Branch_Management_Module SHALL restrict Country, Province, and Branch create, update, and delete operations to users with the ADMIN_MANAGER role.
2. THE Branch_Management_Module SHALL restrict User_Branch_Assignment create and delete operations to users with the ADMIN_MANAGER role.
3. THE Branch_Management_Module SHALL allow read operations on Country, Province, and Branch to users with ADMIN_MANAGER or ADMIN_OPERATION roles.
4. IF a user without the required role attempts a restricted operation, THEN THE Branch_Management_Module SHALL return a 403 Forbidden error.

### Requirement 7: Cascading Hierarchy Queries

**User Story:** As an Admin Manager, I want to retrieve the full branch hierarchy in a single request, so that I can populate dropdown selectors and overview screens efficiently.

#### Acceptance Criteria

1. WHEN an Admin_Manager requests the full hierarchy, THE Branch_Management_Module SHALL return all active Countries, each containing their active Provinces, each containing their active Branches, in a single nested response.
2. THE Branch_Management_Module SHALL sort Countries, Provinces, and Branches alphabetically by name within each level of the hierarchy.
3. WHEN an Admin_Manager requests the hierarchy for a single Country, THE Branch_Management_Module SHALL return that Country with its nested Provinces and Branches.
