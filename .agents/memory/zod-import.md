---
name: Zod import conventions
description: Which zod import path to use in each package
---

Use `import { z } from "zod"` everywhere in this project.

**Why:** The project uses a pnpm workspace catalog to pin zod. The `zod/v4` subpath export does not resolve correctly in esbuild bundles or tsx, because `zod` is only a direct dependency of certain packages (api-zod, db) and not others (api-server). Using `zod/v4` caused build failures in api-server.

**How to apply:** Any file in any package that needs Zod validation should import from `"zod"` (not `"zod/v4"`). If the package doesn't have zod as a direct dependency, avoid importing it directly — pass schemas through packages that already depend on it, or do manual validation.
