# Design Document: Buyer Portal Unit

## Summary
- **Architecture**: NestJS module + Next.js pages, read-only access to admin stock data
- **Stack**: Same platform stack (NestJS / Next.js / MySQL / Prisma)
- **Components**: 1 — Buyer Browse (read-only stock listing)
- **Entities**: 0 new (reads from admin StockItem + ProductModel)
- **Endpoints**: 2 — public stock listing, public stock detail
- **Integrations**: Admin StockService (direct import for data access)
- **Testing**: Minimal (read-only endpoints)

## Endpoints

### GET /api/v1/buyer/products?category=&page=&pageSize=
- Auth: Public (no login)
- Response: { data: [{ id, brand, model, category, price, conditionGrade, photoUrl }], total, page, pageSize }

### GET /api/v1/buyer/products/:id
- Auth: Public
- Response: { id, brand, model, category, price, conditionGrade, photos, testSummary, defectSummary }

## Frontend Routes

```
/browse/                    # Product listing (online buyers)
/browse/[id]                # Product detail
/storefront/                # Storefront display (kiosk-optimized, auto-refresh)
```
