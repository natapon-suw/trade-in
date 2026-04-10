# Implementation Tasks — Seller Portal Unit

## Overview
Small unit: 3 stories, 4 endpoints, 3 frontend pages.

---

- [ ] 1. Seller Backend
  - [x] 1.1 Implement seller auth controller (login + register)
    - **Deps**: None | **Ref**: `design.md` — Seller Auth endpoints
    - Create `apps/api/src/modules/seller/seller.module.ts`
    - Create seller auth controller: POST /seller/auth/login, POST /seller/auth/register
    - Register uses shared AuthService.hashPassword, creates User with role SELLER
    - Login uses shared AuthService.login
    - Register seller module in app.module.ts
    - Write tests
  - [x] 1.2 Implement price check service and controller
    - **Deps**: 1.1 | **Ref**: `design.md` — Price Check endpoint
    - Create SellerPriceCheckService: import PricingService + ProductModelService from admin
    - `checkPrice(productModelId, defects)`: load model, calculate price using admin pricing engine, return estimated range (min/max by applying ±10% variance)
    - Create controller: GET /seller/product-models (public), POST /seller/price-check (public)
    - No auth required for these endpoints
    - Write tests for price check service

- [ ] 2. Seller Frontend
  - [x] 2.1 Implement seller pages
    - **Deps**: 1.1, 1.2 | **Ref**: `design.md` — Frontend Routes
    - Create /seller layout with simple header
    - Create /seller page: price check form (select model, check defects, see price range)
    - Create /seller/login page: email/password form
    - Create /seller/register page: email/password/name form
    - Add API functions to api.ts for seller endpoints

---

## Task Summary

| Task | Title | Dependencies | Status |
|------|-------|--------------|--------|
| 1.1 | Seller auth controller | None | [ ] |
| 1.2 | Price check service | 1.1 | [ ] |
| 2.1 | Seller frontend pages | 1.1, 1.2 | [ ] |

---

## Requirements Coverage

| Requirement | Implemented By |
|-------------|----------------|
| US-002 Seller Login | 1.1, 2.1 |
| US-021 Seller Price Check | 1.2, 2.1 |
| US-024 Seller Registration | 1.1, 2.1 |

---

## Execution Waves

| Wave | Tasks | Parallel |
|------|-------|----------|
| 1 | 1.1 | No |
| 2 | 1.2 | No |
| 3 | 2.1 | No |
