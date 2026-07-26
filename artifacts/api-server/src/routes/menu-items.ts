import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, menuItemsTable } from "@workspace/db";
import {
  ListMenuItemsQueryParams,
  GetMenuItemParams,
  ListMenuItemsResponse,
  GetMenuItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu-items", async (req, res): Promise<void> => {
  const params = ListMenuItemsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const items = params.data.category
    ? await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.category, params.data.category))
        .orderBy(asc(menuItemsTable.name))
    : await db.select().from(menuItemsTable).orderBy(asc(menuItemsTable.name));

  res.json(ListMenuItemsResponse.parse(items));
});

router.get("/menu-items/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(GetMenuItemResponse.parse(item));
});

export default router;
