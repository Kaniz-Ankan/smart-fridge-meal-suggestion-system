import { Router, type IRouter } from "express";
import { db, inventoryTable } from "@workspace/db";

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
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

router.get("/notifications", async (req, res): Promise<void> => {
  const items = await db.select().from(inventoryTable);
  const notifications: {
    id: number;
    type: string;
    message: string;
    itemName: string | undefined;
    severity: string;
    createdAt: string;
  }[] = [];

  let notifId = 1;

  for (const item of items) {
    const status = computeStatus(item.expiryDate, item.quantity, item.lowStockThreshold);
    const days = computeDaysUntilExpiry(item.expiryDate);

    if (status === "expired") {
      notifications.push({
        id: notifId++,
        type: "expired",
        message: `${item.name} has expired`,
        itemName: item.name,
        severity: "critical",
        createdAt: new Date().toISOString(),
      });
    } else if (status === "expiring_soon") {
      notifications.push({
        id: notifId++,
        type: "expiring_soon",
        message: days === 0
          ? `${item.name} expires today`
          : `${item.name} expires in ${days} day${days === 1 ? "" : "s"}`,
        itemName: item.name,
        severity: days <= 1 ? "critical" : "warning",
        createdAt: new Date().toISOString(),
      });
    } else if (status === "low_stock") {
      notifications.push({
        id: notifId++,
        type: "low_stock",
        message: `${item.name} is running low — only ${item.quantity} ${item.unit} remaining`,
        itemName: item.name,
        severity: "warning",
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.json(notifications);
});

export default router;
