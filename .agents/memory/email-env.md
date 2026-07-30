---
name: Email env vars
description: Both GMAIL_USER and GMAIL_APP_PASSWORD are required for email to work; missing either silently disables all notifications.
---

## Rule
`email.ts` calls `getTransporter()` which returns `null` if either `GMAIL_USER` or `GMAIL_APP_PASSWORD` is absent — no error is thrown, emails are just skipped.

**Why:** This is easy to miss because there's no startup warning visible to users; the log line only appears at send time.

## How to apply
- `GMAIL_APP_PASSWORD` — stored as a Replit Secret (already set)
- `GMAIL_USER` — stored as a shared env var: `ahmazingcuisine@gmail.com` (set via `setEnvVars`)
- Always verify both exist before declaring email "working"
- Production deployment inherits shared env vars, so GMAIL_USER is available in prod
