# Implementation Tasks — Buyer Portal Unit

## Overview
Simplest unit: 2 stories, 2 endpoints, 3 frontend pages (online browse, detail, storefront).

---

- [x] 1. Buyer Backend
  - [x] 1.1 Implement buyer browse controller
    - **Deps**: None | **Ref**: `design.md`
    - Create `apps/api/src/modules/buyer/buyer.module.ts`
    - Create BuyerService: listProducts (paginated, filtered by category), getProductDetail (with photos, test summary, defect summary)
    - Create BuyerController: GET /v1/buyer/products, GET /v1/buyer/products/:id
    - No auth (public endpoints)
    - Query admin stock items via PrismaService directly
    - Register BuyerModule in app.module.ts
    - Write tests

- [x] 2. Buyer Frontend
  - [x] 2.1 Implement buyer browse pages
    - **Deps**: 1.1 | **Ref**: `design.md`
    - Create /browse layout with simple header
    - Create /browse page: product grid with filters (category, price range), pagination
    - Create /browse/[id] page: product detail with photos, specs, condition, test/defect summary
    - Create /storefront page: kiosk-optimized grid, auto-refresh every 5 minutes
    - Add API functions to api.ts

---

## Requirements Coverage

| Requirement | Implemented By |
|-------------|----------------|
| US-022 Buyer Browsing (Online) | 1.1, 2.1 |
| US-023 Buyer Browsing (Storefront) | 1.1, 2.1 |
