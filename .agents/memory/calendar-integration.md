---
name: Google Calendar integration
description: How delivery calendar events are created for every order, and key implementation details.
---

# Google Calendar — delivery event creation

## Rule
Every `POST /orders` fires `createDeliveryCalendarEvent()` as a fire-and-forget call (same pattern as `sendBookingNotification`). Never await it in the route handler.

**Why:** Keeps the API response fast; calendar errors must not fail the order.

## How to apply
- Wired in `artifacts/api-server/src/routes/orders.ts` after the email call.
- Helper lives in `artifacts/api-server/src/lib/calendar.ts`.
- Uses `@replit/connectors-sdk` (`ReplitConnectors`) — never cache the client; instantiate fresh per call.
- Connection ID: `conn_google-calendar_01KZ8AD0MS2NT2YQCNPC1APAR5` (ahmazingfoodsorders@gmail.com).
- Calendar target: `primary` (the business's own calendar).

## Key details
- Delivery slot → time mapping (WAT = UTC+1): `10am–12pm`→10–12, `12–2pm`→12–14, `2–4pm`→14–16, `4–6pm`→16–18.
- Reminder: 240 minutes (4 hrs) via both `popup` and `email` override.
- Customer attendee invite sent only when `customerEmail` is non-null.
- Event color: `colorId: "5"` (banana yellow) for easy scanning.
- All errors are caught and logged; never propagated.

## Business email
`ahmazingfoodsorders@gmail.com` — used for GMAIL_USER, Google Calendar OAuth, and all customer-facing contact. `ahmazingcuisine@gmail.com` has been fully removed from the codebase.
