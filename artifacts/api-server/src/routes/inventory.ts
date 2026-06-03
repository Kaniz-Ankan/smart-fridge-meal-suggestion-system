import { Router, type IRouter } from "express";
import { eq, and, gte, lte, or, sql } from "drizzle-orm";
import { db, inventoryTable, groceryTable, wasteLogTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
  GetInventoryItemParams,
  UpdateInventoryItemParams,
  DeleteInventoryItemParams,
  ListInventoryItemsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function computeStatus(expiryDate: string, quantity: number, lowStockThreshold: number | null): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiring_soon";
  if (lowStockThreshold != null && quantity <= lowStockThreshold) return "low_stock";
  return "fresh";
}

function computeDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toResponseItem(item: typeof inventoryTable.$inferSelect) {
  const status = computeStatus(item.expiryDate, item.quantity, item.lowStockThreshold);
  const daysUntilExpiry = computeDaysUntilExpiry(item.expiryDate);
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expiryDate: item.expiryDate,
    lowStockThreshold: item.lowStockThreshold,
    notes: item.notes,
    status,
    daysUntilExpiry,
    addedAt: item.addedAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

router.get("/inventory", async (req, res): Promise<void> => {
  const parsed = ListInventoryItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const items = await db.select().from(inventoryTable).orderBy(inventoryTable.expiryDate);
  let result = items.map(toResponseItem);

  if (parsed.data.category) {
    result = result.filter((i) => i.category === parsed.data.category);
  }
  if (parsed.data.status) {
    result = result.filter((i) => i.status === parsed.data.status);
  }

  res.json(result);
});

router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(inventoryTable).values({
    name: parsed.data.name,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit,
    category: parsed.data.category,
    expiryDate: toDateOnlyString(parsed.data.expiryDate),
    lowStockThreshold: parsed.data.lowStockThreshold,
    notes: parsed.data.notes,
  }).returning();

  res.status(201).json(toResponseItem(item));
});

router.get("/inventory/summary", async (req, res): Promise<void> => {
  const items = await db.select().from(inventoryTable);
  const mapped = items.map(toResponseItem);

  const totalItems = mapped.length;
  const freshItems = mapped.filter((i) => i.status === "fresh").length;
  const expiringSoonItems = mapped.filter((i) => i.status === "expiring_soon").length;
  const expiredItems = mapped.filter((i) => i.status === "expired").length;
  const lowStockItems = mapped.filter((i) => i.status === "low_stock").length;

  const categoryCounts: Record<string, number> = {};
  for (const item of mapped) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }

  const urgentAlerts: string[] = [];
  for (const item of mapped) {
    if (item.status === "expired") {
      urgentAlerts.push(`${item.name} has expired`);
    } else if (item.status === "expiring_soon") {
      urgentAlerts.push(`${item.name} expires in ${item.daysUntilExpiry} day${item.daysUntilExpiry === 1 ? "" : "s"}`);
    } else if (item.status === "low_stock") {
      urgentAlerts.push(`${item.name} is running low (${item.quantity} ${item.unit} remaining)`);
    }
  }

  res.json({ totalItems, freshItems, expiringSoonItems, expiredItems, lowStockItems, categoryCounts, urgentAlerts });
});

router.get("/inventory/:id", async (req, res): Promise<void> => {
  const params = GetInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(toResponseItem(item));
});

router.put("/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof inventoryTable.$inferInsert> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.quantity != null) updateData.quantity = parsed.data.quantity;
  if (parsed.data.unit != null) updateData.unit = parsed.data.unit;
  if (parsed.data.category != null) updateData.category = parsed.data.category;
  if (parsed.data.expiryDate != null) updateData.expiryDate = toDateOnlyString(parsed.data.expiryDate);
  if ("lowStockThreshold" in parsed.data) updateData.lowStockThreshold = parsed.data.lowStockThreshold;
  if ("notes" in parsed.data) updateData.notes = parsed.data.notes;

  const [updated] = await db
    .update(inventoryTable)
    .set(updateData)
    .where(eq(inventoryTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(toResponseItem(updated));
});

router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const params = DeleteInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const status = computeStatus(item.expiryDate, item.quantity, item.lowStockThreshold);
  if (status === "expired" || status === "expiring_soon") {
    await db.insert(wasteLogTable).values({
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      estimatedCost: 50,
      expiryDate: item.expiryDate,
      reason: status === "expired" ? "expired" : "removed_expiring",
    });
  }

  await db.delete(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
