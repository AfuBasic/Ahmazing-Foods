---
name: API server seed runner
description: How to run the seed-menu.ts script in this project
---

From the workspace root:
```
scripts/node_modules/.bin/tsx artifacts/api-server/src/seed-menu.ts
```

**Why:** The api-server package doesn't have a "seed" script in package.json, and `tsx` is not in its devDependencies. The `scripts/` workspace has tsx available. Running from workspace root with that binary works reliably.

**How to apply:** Any time the menu data needs to be reset or re-seeded.
