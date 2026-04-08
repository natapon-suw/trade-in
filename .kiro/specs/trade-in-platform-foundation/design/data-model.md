# Data Model — Foundation Unit

## Overview
**Database**: MySQL
**ORM/Client**: Prisma

Foundation defines the shared database connection and base conventions. Domain-specific entities are defined in each unit's design. Foundation owns the User entity for authentication.

---

## Entities

### User

**Purpose**: Authenticated user account for Admin and Seller roles. Buyers don't have accounts.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | UUID (String) | Yes | PK | Unique identifier |
| email | String | Yes | Unique | Login email |
| passwordHash | String | Yes | — | bcrypt hashed password |
| name | String | Yes | — | Display name |
| role | Enum | Yes | admin-operation, admin-manager, seller | User role for RBAC |
| isActive | Boolean | Yes | Default: true | Account active status |
| createdAt | DateTime | Yes | Auto | Creation timestamp |
| updatedAt | DateTime | Yes | Auto | Last update timestamp |
| deletedAt | DateTime | No | — | Soft delete timestamp |

**Indexes**:
- Unique: `email`
- Index: `role` — for role-based queries

**Business Rules**:
1. Email must be unique across all users
2. Password must be hashed with bcrypt before storage
3. Soft delete sets `deletedAt`, does not remove record
4. Role determines access permissions per RBAC matrix

---

## Prisma Schema (Foundation portion)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN_OPERATION
  ADMIN_MANAGER
  SELLER
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  role         UserRole
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  @@map("users")
}
```

---

## Data Conventions

- **IDs**: UUID v4 (String type in Prisma)
- **Timestamps**: ISO 8601 UTC via Prisma `DateTime`
- **Soft deletes**: `deletedAt` column, null = active
- **Table naming**: Lowercase plural via `@@map()` (e.g., `users`, `customers`)
- **Column naming**: camelCase in code, snake_case in DB via Prisma mapping
