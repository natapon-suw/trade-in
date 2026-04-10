# Design Document: Seller Portal Unit

## Summary
- **Architecture**: NestJS module within modular monolith, direct service calls to Admin
- **Stack**: Next.js / NestJS / MySQL / Prisma (same as platform)
- **Components**: 2 — Seller Auth, Price Check
- **Entities**: 0 new (uses existing User entity for seller accounts)
- **Endpoints**: 4 — seller login, register, price check, product model search
- **Integrations**: Admin PricingService (direct import), Admin ProductModelService (direct import)
- **Testing**: Unit tests for price check service
- **Key Decisions**: Public price check (no login required), direct service call to admin pricing engine

## Architecture

```
┌──────────────────────────────────┐
│         Seller Module            │
│                                  │
│  ┌────────────┐  ┌────────────┐ │
│  │ Seller Auth│  │ Price Check│ │
│  │ (login,    │  │ (public,   │ │
│  │  register) │  │  no auth)  │ │
│  └────────────┘  └─────┬──────┘ │
│                        │         │
└────────────────────────┼─────────┘
                         │ direct import
              ┌──────────▼──────────┐
              │   Admin Module      │
              │  PricingService     │
              │  ProductModelService│
              └─────────────────────┘
```

## Endpoints

### POST /api/v1/seller/auth/login
- Auth: Public
- Request: { email, password }
- Response: { accessToken, user }

### POST /api/v1/seller/auth/register
- Auth: Public
- Request: { email, password, name }
- Response: { id, email, name }

### GET /api/v1/seller/product-models?search=query
- Auth: Public (no login required for price check)
- Response: { data: [ProductModel] }

### POST /api/v1/seller/price-check
- Auth: Public (no login required)
- Request: { productModelId, defects: [{ defectItemId, severity }] }
- Response: { estimatedMin, estimatedMax, breakdown }

## Frontend Routes

```
/seller/                    # Seller landing / price check
/seller/login               # Seller login
/seller/register            # Seller registration
```
