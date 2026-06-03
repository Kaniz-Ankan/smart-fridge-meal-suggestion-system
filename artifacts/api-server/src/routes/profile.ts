import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function toResponse(profile: typeof profileTable.$inferSelect) {
  return {
    id: profile.id,
    name: profile.name,
    dietaryPreference: profile.dietaryPreference,
    allergies: JSON.parse(profile.allergiesJson),
    cookingSkillLevel: profile.cookingSkillLevel,
    availableCookingTime: profile.availableCookingTime,
    householdSize: profile.householdSize,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

async function ensureProfile() {
  const existing = await db.select().from(profileTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(profileTable).values({
    name: "My Household",
    dietaryPreference: "none",
    allergiesJson: "[]",
    cookingSkillLevel: "beginner",
    availableCookingTime: 30,
    householdSize: 1,
  }).returning();
  return created;
}

router.get("/profile", async (req, res): Promise<void> => {
  const profile = await ensureProfile();
  res.json(toResponse(profile));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await ensureProfile();

  const updateData: Partial<typeof profileTable.$inferInsert> = {};
  if (parsed.data.name != null) updateData.name = parsed.data.name;
  if (parsed.data.dietaryPreference != null) updateData.dietaryPreference = parsed.data.dietaryPreference;
  if (parsed.data.allergies != null) updateData.allergiesJson = JSON.stringify(parsed.data.allergies);
  if (parsed.data.cookingSkillLevel != null) updateData.cookingSkillLevel = parsed.data.cookingSkillLevel;
  if (parsed.data.availableCookingTime != null) updateData.availableCookingTime = parsed.data.availableCookingTime;
  if (parsed.data.householdSize != null) updateData.householdSize = parsed.data.householdSize;

  const [updated] = await db.update(profileTable).set(updateData).where(eq(profileTable.id, profile.id)).returning();

  res.json(toResponse(updated || profile));
});

export default router;
