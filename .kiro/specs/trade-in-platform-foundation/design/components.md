# Components — Foundation Unit

## Overview
Foundation provides shared infrastructure for all domain units: auth middleware, error handling, database setup, shared types, logging, and project scaffold. All components are consumed by domain units via direct imports.

---

## Auth Module (`src/shared/auth/`)

**Purpose**: JWT-based authentication and RBAC authorization middleware for NestJS.

**Technology**: NestJS Guards + Decorators, jsonwebtoken, bcrypt

**Responsibilities**:
- Issue JWT access tokens on login
- Validate JWT tokens on protected routes
- Enforce role-based access control (RBAC)
- Hash and verify passwords

**Exposes**:
- `JwtAuthGuard` — NestJS guard for protected routes
- `RolesGuard` — NestJS guard for role-based access
- `@Roles(...)` — Decorator to specify required roles
- `@CurrentUser()` — Decorator to extract user from request
- `AuthService.login(email, password)` — Returns JWT token
- `AuthService.hashPassword(password)` — Returns hashed password
- `AuthService.verifyPassword(password, hash)` — Returns boolean

**Internal Structure**:
```
src/shared/auth/
├── auth.module.ts          # NestJS module
├── auth.service.ts         # Login, token generation, password hashing
├── jwt.strategy.ts         # Passport JWT strategy
├── guards/
│   ├── jwt-auth.guard.ts   # Token validation guard
│   └── roles.guard.ts      # RBAC guard
├── decorators/
│   ├── roles.decorator.ts  # @Roles() decorator
│   └── current-user.decorator.ts  # @CurrentUser() decorator
└── types.ts                # AuthContext, JwtPayload
```

---

## Error Handling Module (`src/shared/errors/`)

**Purpose**: RFC 7807 Problem Details error handling with domain-prefixed error codes.

**Technology**: NestJS Exception Filters

**Responsibilities**:
- Catch all exceptions and format as RFC 7807
- Map NestJS HTTP exceptions to standard error codes
- Attach request ID for correlation
- Provide typed error classes for domain errors

**Exposes**:
- `AllExceptionsFilter` — Global NestJS exception filter
- `AppException` — Base exception class with code, status, detail
- `ValidationException` — 400 errors
- `UnauthorizedException` — 401 errors
- `ForbiddenException` — 403 errors
- `NotFoundException` — 404 errors
- `ConflictException` — 409 errors

**Internal Structure**:
```
src/shared/errors/
├── errors.module.ts
├── filters/
│   └── all-exceptions.filter.ts
├── exceptions/
│   ├── app.exception.ts
│   ├── validation.exception.ts
│   └── domain.exception.ts
└── error-codes.ts          # Shared error code constants
```

---

## Database Module (`src/shared/database/`)

**Purpose**: Prisma client setup, connection management, and migration tooling for MySQL.

**Technology**: Prisma ORM, MySQL

**Responsibilities**:
- Provide PrismaService as injectable NestJS service
- Handle connection lifecycle (onModuleInit, onModuleDestroy)
- Provide base Prisma schema with shared conventions

**Exposes**:
- `PrismaService` — Injectable Prisma client
- `prisma/schema.prisma` — Base schema file

**Internal Structure**:
```
src/shared/database/
├── database.module.ts
├── prisma.service.ts       # PrismaClient wrapper
└── prisma/
    ├── schema.prisma       # Prisma schema
    └── migrations/         # Migration files
```

---

## Logging Module (`src/shared/logging/`)

**Purpose**: Structured JSON logging with request correlation.

**Technology**: Winston

**Responsibilities**:
- Provide structured JSON log output
- Attach request ID (`X-Request-Id`) to all log entries
- Configure log levels per environment
- Provide NestJS LoggerService replacement

**Exposes**:
- `LoggingModule` — NestJS module
- `AppLogger` — Injectable logger service
- `RequestIdMiddleware` — Middleware to generate/propagate request IDs

**Internal Structure**:
```
src/shared/logging/
├── logging.module.ts
├── app-logger.service.ts
└── request-id.middleware.ts
```

---

## Shared Types (`src/shared/types/`)

**Purpose**: Shared DTOs, interfaces, and type definitions used across all domain modules.

**Exposes**:
- `AuthContext` — User context from JWT
- `PaginatedResponse<T>` — Standard paginated response
- `PriceBreakdown` — Pricing calculation result
- `DefectSeverity` — 1-5 severity type
- `UserRole` — Role enum type
- `AppError` — RFC 7807 error shape

**Internal Structure**:
```
src/shared/types/
├── index.ts                # Barrel export
├── auth.types.ts           # AuthContext, JwtPayload
├── pagination.types.ts     # PaginatedResponse, PaginationQuery
├── pricing.types.ts        # PriceBreakdown, DefectSeverity
└── error.types.ts          # AppError shape
```

---

## Config Module (`src/config/`)

**Purpose**: Centralized application configuration with environment variable validation.

**Technology**: NestJS ConfigModule, class-validator

**Responsibilities**:
- Load and validate environment variables
- Provide typed configuration access
- Support different environments (dev, staging, prod)

**Exposes**:
- `ConfigModule` — NestJS module (global)
- `AppConfig` — Typed config interface

**Internal Structure**:
```
src/config/
├── config.module.ts
├── app.config.ts           # Config schema and validation
└── env.validation.ts       # Environment variable validation
```

---

## Component Interactions

```
┌─────────────────────────────────────────────────┐
│                  NestJS App                       │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Admin   │  │  Seller  │  │  Buyer   │       │
│  │  Module  │  │  Module  │  │  Module  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │
│       └──────────────┼──────────────┘              │
│                      │                             │
│              ┌───────▼────────┐                    │
│              │    Shared      │                    │
│              │  ┌──────────┐  │                    │
│              │  │   Auth   │  │                    │
│              │  ├──────────┤  │                    │
│              │  │  Errors  │  │                    │
│              │  ├──────────┤  │                    │
│              │  │ Database │  │                    │
│              │  ├──────────┤  │                    │
│              │  │ Logging  │  │                    │
│              │  ├──────────┤  │                    │
│              │  │  Types   │  │                    │
│              │  ├──────────┤  │                    │
│              │  │  Config  │  │                    │
│              │  └──────────┘  │                    │
│              └────────────────┘                    │
└─────────────────────────────────────────────────┘
```

**Data Flow**: All domain modules import shared modules. Auth guard intercepts requests → validates JWT → attaches AuthContext → domain module handles business logic → errors caught by global exception filter → structured logging throughout.
