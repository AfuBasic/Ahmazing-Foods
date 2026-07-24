---
name: Cart + pepper schema
description: How multi-item cart and pepper level are stored in the orders table
---

The orders table has two optional columns added for cart orders:
- `cartItems` (jsonb, nullable) — array of CartItemPayload objects
- `pepperLevel` (text, nullable) — one of "Low 🌶️", "Medium 🌶️🌶️", "Really Peppery 🌶️🌶️🌶️"

**Why:** The original schema was single-item only. Cart support required either encoding in notes or adding columns. Proper columns were added for queryability.

**How to apply:**
- Frontend (book.tsx) sends cartItems + pepperLevel as extra fields on the POST /orders body (cast as `any` since generated type doesn't include them)
- API route (orders.ts) parses these manually from `req.body` after the Zod validation of standard fields (Zod cannot be imported directly in api-server — no direct dep)
- Rush fee is tiered: 1 dish=₦20k, 2=₦15k each, 3=₦13k each, 4=₦12k each, 5=₦10k each
- `itemPrice` for cart orders = sum of all cart item prices (client-computed, server trusts)
