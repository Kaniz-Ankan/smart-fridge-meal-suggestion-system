import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, inventoryTable, recipesTable, profileTable } from "@workspace/db";
import {
  CreateRecipeBody,
  GetRecipeParams,
  DeleteRecipeParams,
  GetRecipeSuggestionsQueryParams,
  GetSubstitutionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SUBSTITUTION_MAP: Record<string, Array<{ substitute: string; notes: string; ratio: string }>> = {
  milk: [
    { substitute: "Water + Butter", notes: "Use 3/4 cup water + 1/4 cup melted butter per cup of milk", ratio: "1:1" },
    { substitute: "Coconut Milk", notes: "Slightly sweeter, works well in most recipes", ratio: "1:1" },
    { substitute: "Soy Milk", notes: "Closest in protein content to dairy milk", ratio: "1:1" },
  ],
  eggs: [
    { substitute: "Banana (mashed)", notes: "1/4 cup mashed banana per egg, adds sweetness", ratio: "1:1" },
    { substitute: "Yogurt", notes: "1/4 cup plain yogurt per egg", ratio: "1:1" },
    { substitute: "Vinegar + Baking Soda", notes: "1 tbsp vinegar + 1 tsp baking soda per egg", ratio: "1:1" },
  ],
  butter: [
    { substitute: "Olive Oil", notes: "Use 3/4 the amount of butter called for", ratio: "3:4" },
    { substitute: "Coconut Oil", notes: "1:1 ratio, slightly different flavor", ratio: "1:1" },
    { substitute: "Yogurt", notes: "For baking, use half the amount", ratio: "1:2" },
  ],
  flour: [
    { substitute: "Almond Flour", notes: "Use 1:1 but add extra egg for binding", ratio: "1:1" },
    { substitute: "Oat Flour", notes: "Blend oats until fine, use 1:1", ratio: "1:1" },
    { substitute: "Cornstarch", notes: "For thickening only, use half the amount", ratio: "1:2" },
  ],
  sugar: [
    { substitute: "Honey", notes: "Use 3/4 cup honey per cup of sugar, reduce liquid by 1/4", ratio: "3:4" },
    { substitute: "Maple Syrup", notes: "Use 3/4 cup per cup of sugar", ratio: "3:4" },
    { substitute: "Dates (blended)", notes: "Blend and use 1:1", ratio: "1:1" },
  ],
  parsley: [
    { substitute: "Coriander/Cilantro", notes: "Similar freshness, slightly different flavor", ratio: "1:1" },
    { substitute: "Basil", notes: "Sweeter flavor, works well in many dishes", ratio: "1:1" },
    { substitute: "Celery Leaves", notes: "Mild flavor, available year-round", ratio: "1:1" },
  ],
  cheese: [
    { substitute: "Yogurt (strained)", notes: "Gives creaminess without strong flavor", ratio: "1:1" },
    { substitute: "Nutritional Yeast", notes: "Adds cheesy/nutty flavor, great for vegan", ratio: "1:4" },
    { substitute: "Skip it", notes: "Many dishes work fine without cheese", ratio: "-" },
  ],
  onion: [
    { substitute: "Shallots", notes: "Milder, sweeter flavor", ratio: "1:1" },
    { substitute: "Leeks", notes: "Milder onion flavor, use white and light green parts", ratio: "1:1" },
    { substitute: "Onion Powder", notes: "1 tsp onion powder per medium onion", ratio: "varies" },
  ],
  garlic: [
    { substitute: "Garlic Powder", notes: "1/8 tsp per clove of garlic", ratio: "varies" },
    { substitute: "Asafoetida (Hing)", notes: "Small pinch gives garlic-like flavor", ratio: "very small" },
    { substitute: "Ginger", notes: "Different flavor but adds depth", ratio: "1:1" },
  ],
};

const RECIPE_TEMPLATES = [
  {
    name: "Vegetable Omelette",
    description: "A quick and protein-rich breakfast using eggs and whatever vegetables you have on hand.",
    mandatoryIngredients: ["eggs"],
    optionalIngredients: ["onion", "tomato", "cheese", "parsley", "salt", "pepper"],
    instructions: [
      "Crack 2-3 eggs into a bowl and beat well with a pinch of salt and pepper.",
      "Chop any available vegetables into small pieces.",
      "Heat a non-stick pan over medium heat with a little oil or butter.",
      "Pour the egg mixture into the pan.",
      "Add vegetables on one half of the omelette.",
      "Fold the omelette in half and cook for 1 more minute.",
      "Serve hot.",
    ],
    cookingTime: 10,
    servings: 1,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=vegetable+omelette+recipe",
  },
  {
    name: "Rice and Lentil Dal",
    description: "A hearty and nutritious one-pot meal that's perfect for using pantry staples.",
    mandatoryIngredients: ["rice", "lentils"],
    optionalIngredients: ["onion", "garlic", "tomato", "turmeric", "cumin", "coriander"],
    instructions: [
      "Rinse lentils and rice separately until water runs clear.",
      "In a pot, heat oil and sauté diced onion and garlic until golden.",
      "Add spices (turmeric, cumin) and cook for 30 seconds.",
      "Add lentils and water (3 cups per cup of lentils). Bring to boil.",
      "Simmer for 20 minutes until lentils are soft.",
      "Meanwhile, cook rice separately.",
      "Serve dal over rice, garnished with fresh coriander.",
    ],
    cookingTime: 35,
    servings: 3,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "vegan", "halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=dal+rice+recipe",
  },
  {
    name: "Stir-Fried Vegetables",
    description: "A fast and healthy way to use up fresh vegetables before they expire.",
    mandatoryIngredients: ["vegetables"],
    optionalIngredients: ["garlic", "soy sauce", "ginger", "sesame oil", "rice"],
    instructions: [
      "Cut all vegetables into similar-sized pieces for even cooking.",
      "Heat a wok or large pan over high heat with a little oil.",
      "Add garlic and ginger first, stir for 30 seconds.",
      "Add harder vegetables (carrots, broccoli) first, stir-fry for 2 minutes.",
      "Add softer vegetables (peppers, cabbage) and stir-fry for 2 more minutes.",
      "Season with soy sauce and sesame oil.",
      "Serve over cooked rice.",
    ],
    cookingTime: 15,
    servings: 2,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    videoUrl: "https://www.youtube.com/results?search_query=stir+fried+vegetables+recipe",
  },
  {
    name: "Pasta with Tomato Sauce",
    description: "Classic comfort food using simple pantry ingredients.",
    mandatoryIngredients: ["pasta", "tomatoes"],
    optionalIngredients: ["garlic", "onion", "olive oil", "basil", "cheese", "salt", "pepper"],
    instructions: [
      "Boil pasta in salted water according to package instructions.",
      "While pasta cooks, heat olive oil in a pan and sauté garlic and onion.",
      "Add chopped or canned tomatoes, season with salt and pepper.",
      "Simmer sauce for 10 minutes.",
      "Drain pasta and combine with sauce.",
      "Top with grated cheese and fresh basil if available.",
    ],
    cookingTime: 25,
    servings: 2,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "halal"],
    videoUrl: "https://www.youtube.com/results?search_query=pasta+tomato+sauce+recipe",
  },
  {
    name: "Fruit Smoothie Bowl",
    description: "A refreshing breakfast or snack using whatever fruits you have.",
    mandatoryIngredients: ["fruits", "milk"],
    optionalIngredients: ["banana", "yogurt", "honey", "oats", "nuts", "seeds"],
    instructions: [
      "Add all fruits and milk/yogurt to a blender.",
      "Blend until smooth. Add honey to taste.",
      "Pour into a bowl.",
      "Top with sliced fruits, oats, and nuts.",
      "Drizzle with honey and serve immediately.",
    ],
    cookingTime: 5,
    servings: 1,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "vegan-optional", "halal"],
    videoUrl: "https://www.youtube.com/results?search_query=fruit+smoothie+bowl+recipe",
  },
  {
    name: "Chicken Fried Rice",
    description: "A filling one-pan meal perfect for using leftover rice and whatever protein is available.",
    mandatoryIngredients: ["rice", "chicken"],
    optionalIngredients: ["eggs", "onion", "garlic", "soy sauce", "vegetables", "sesame oil"],
    instructions: [
      "Use day-old cold rice for best results.",
      "Cut chicken into small pieces, season with salt.",
      "Heat oil in a wok over high heat. Cook chicken until golden, set aside.",
      "In the same wok, scramble eggs if using.",
      "Add rice and break up any clumps. Stir-fry for 2 minutes.",
      "Return chicken, add vegetables and soy sauce.",
      "Stir-fry everything together for 3 minutes.",
      "Finish with sesame oil and serve.",
    ],
    cookingTime: 20,
    servings: 3,
    difficulty: "medium",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=chicken+fried+rice+recipe",
  },
  {
    name: "Lentil Soup",
    description: "A warming, nourishing soup that's easy to make and very filling.",
    mandatoryIngredients: ["lentils"],
    optionalIngredients: ["onion", "garlic", "tomatoes", "cumin", "turmeric", "lemon", "coriander"],
    instructions: [
      "Rinse lentils under cold water.",
      "Sauté diced onion and garlic in a pot with oil until soft.",
      "Add cumin and turmeric, stir for 30 seconds.",
      "Add lentils and 4 cups of water or broth.",
      "Bring to a boil, then simmer for 25 minutes until lentils are tender.",
      "Blend half the soup for a creamy texture if desired.",
      "Season with salt, squeeze of lemon, and fresh coriander.",
    ],
    cookingTime: 35,
    servings: 4,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "vegan", "halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=lentil+soup+recipe",
  },
  {
    name: "Banana Pancakes",
    description: "Fluffy pancakes using ripe bananas — a great way to use overripe fruit.",
    mandatoryIngredients: ["banana", "eggs", "flour"],
    optionalIngredients: ["milk", "butter", "vanilla", "honey", "fruits"],
    instructions: [
      "Mash 2 ripe bananas in a bowl.",
      "Add 2 beaten eggs and 1/2 cup flour. Mix well.",
      "Add a splash of milk if batter is too thick.",
      "Heat a pan over medium heat with a little butter.",
      "Pour small circles of batter and cook until bubbles form (2-3 minutes).",
      "Flip and cook 1-2 more minutes.",
      "Serve with honey and fresh fruits.",
    ],
    cookingTime: 15,
    servings: 2,
    difficulty: "easy",
    dietaryTags: ["vegetarian", "halal"],
    videoUrl: "https://www.youtube.com/results?search_query=banana+pancakes+recipe",
  },
  {
    name: "Beef Biryani",
    description: "A fragrant rice dish using beef, basmati rice, spices, and simple pantry ingredients.",
    mandatoryIngredients: ["beef", "rice"],
    optionalIngredients: ["basmati rice", "onion", "garlic", "ginger", "yogurt", "cumin", "coriander", "mint"],
    instructions: [
      "Wash and soak basmati rice for 20 minutes, then drain.",
      "Cut beef into small pieces and season with salt, garlic, ginger, and spices.",
      "Fry sliced onion in oil until golden, then set some aside for garnish.",
      "Cook beef with onion, spices, and a little water until tender.",
      "Parboil the rice until it is about 70% cooked.",
      "Layer rice and beef in a pot, add fried onions and herbs if available.",
      "Cover and cook on low heat for 15 minutes, then fluff gently and serve hot.",
    ],
    cookingTime: 45,
    servings: 3,
    difficulty: "easy",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=beef+biryani+recipe",
  },
  {
    name: "Chicken Korma",
    description: "A rich, slow-cooked chicken curry with yogurt, onions, warm spices, and a creamy finish.",
    mandatoryIngredients: ["chicken", "yogurt"],
    optionalIngredients: ["onion", "garlic", "ginger", "cream", "cashews", "cumin", "coriander", "rice"],
    instructions: [
      "Marinate chicken with yogurt, ginger, garlic, salt, and spices for at least 20 minutes.",
      "Fry sliced onions until golden, then blend half with a little yogurt for the sauce base.",
      "Sear the chicken pieces in oil until lightly browned.",
      "Add the onion-yogurt sauce and cook on medium heat until the oil separates.",
      "Simmer covered until chicken is tender and the sauce thickens.",
      "Finish with cream or crushed cashews if available.",
      "Serve with rice or flatbread.",
    ],
    cookingTime: 55,
    servings: 4,
    difficulty: "hard",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=chicken+korma+recipe",
  },
  {
    name: "Beef Tehari",
    description: "A spiced beef and rice dish inspired by Bangladeshi tehari, cooked in one pot for deep flavor.",
    mandatoryIngredients: ["beef", "rice"],
    optionalIngredients: ["basmati rice", "potato", "onion", "garlic", "ginger", "cumin", "bay leaf"],
    instructions: [
      "Wash rice and soak it while preparing the beef.",
      "Cook beef with onion, ginger, garlic, salt, and spices until the beef becomes tender.",
      "Add potato pieces if available and cook for a few minutes.",
      "Add drained rice and stir gently so the grains are coated with spices.",
      "Pour in hot water, cover, and cook on low heat until rice is done.",
      "Rest for 10 minutes before opening the lid.",
      "Fluff gently and serve hot.",
    ],
    cookingTime: 60,
    servings: 4,
    difficulty: "medium",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=beef+tehari+recipe",
  },
  {
    name: "Thai Basil Beef",
    description: "A quick but bold beef stir-fry with garlic, chili, basil, and rice.",
    mandatoryIngredients: ["beef", "rice"],
    optionalIngredients: ["basil", "garlic", "chili", "soy sauce", "eggs", "vegetables"],
    instructions: [
      "Slice beef thinly so it cooks quickly.",
      "Mix soy sauce, a little sugar, and chili if available.",
      "Heat oil in a very hot pan and sear the beef quickly.",
      "Add garlic and vegetables, then stir-fry for 2 minutes.",
      "Pour in the sauce and toss until glossy.",
      "Add basil at the end so it stays fragrant.",
      "Serve over hot rice, optionally with a fried egg.",
    ],
    cookingTime: 25,
    servings: 2,
    difficulty: "medium",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=thai+basil+beef+recipe",
  },
  {
    name: "Roast Chicken Dinner",
    description: "A complete roast-style meal with chicken, vegetables, herbs, and pan juices.",
    mandatoryIngredients: ["chicken", "vegetables"],
    optionalIngredients: ["potato", "carrot", "garlic", "butter", "lemon", "herbs"],
    instructions: [
      "Season chicken with salt, pepper, garlic, lemon, and herbs.",
      "Cut vegetables into large chunks and place them in a baking dish.",
      "Place chicken over the vegetables and brush with butter or oil.",
      "Roast until the chicken is cooked through and the vegetables are tender.",
      "Rest the chicken for 10 minutes before slicing.",
      "Spoon pan juices over the chicken and vegetables.",
      "Serve warm.",
    ],
    cookingTime: 75,
    servings: 4,
    difficulty: "hard",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=roast+chicken+dinner+recipe",
  },
  {
    name: "Fish Curry",
    description: "A flavorful fish curry with tomato, spices, and a light sauce for serving with rice.",
    mandatoryIngredients: ["fish", "tomatoes"],
    optionalIngredients: ["onion", "garlic", "ginger", "turmeric", "coconut milk", "rice", "coriander"],
    instructions: [
      "Season fish pieces with salt and turmeric.",
      "Lightly sear the fish and set it aside.",
      "Cook onion, garlic, and ginger until soft.",
      "Add tomatoes and spices, then cook until the sauce thickens.",
      "Add water or coconut milk and simmer for 5 minutes.",
      "Return fish to the pan and cook gently until done.",
      "Serve with rice and coriander if available.",
    ],
    cookingTime: 35,
    servings: 3,
    difficulty: "medium",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=fish+curry+recipe",
  },
  {
    name: "Shrimp Noodles",
    description: "A savory noodle stir-fry with shrimp, vegetables, garlic, and soy sauce.",
    mandatoryIngredients: ["shrimp", "noodles"],
    optionalIngredients: ["garlic", "ginger", "soy sauce", "vegetables", "eggs", "sesame oil"],
    instructions: [
      "Boil noodles until just tender, then drain and rinse.",
      "Season shrimp with salt and a little garlic.",
      "Stir-fry shrimp in hot oil until pink, then remove from the pan.",
      "Cook vegetables with garlic and ginger for 2 minutes.",
      "Add noodles, soy sauce, and sesame oil.",
      "Return shrimp and toss everything together.",
      "Serve immediately.",
    ],
    cookingTime: 25,
    servings: 2,
    difficulty: "medium",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=shrimp+noodles+recipe",
  },
  {
    name: "Lamb Curry",
    description: "A deep, slow-cooked curry with lamb, yogurt, onions, and warming spices.",
    mandatoryIngredients: ["lamb", "yogurt"],
    optionalIngredients: ["onion", "garlic", "ginger", "cumin", "coriander", "tomatoes", "rice"],
    instructions: [
      "Marinate lamb with yogurt, ginger, garlic, and spices.",
      "Brown onions slowly until golden.",
      "Add lamb and sear until the color changes.",
      "Add tomatoes and cook until the oil separates.",
      "Add water, cover, and simmer until lamb is tender.",
      "Reduce the sauce until thick and glossy.",
      "Serve with rice or flatbread.",
    ],
    cookingTime: 90,
    servings: 4,
    difficulty: "hard",
    dietaryTags: ["halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=lamb+curry+recipe",
  },
  {
    name: "Stuffed Bell Peppers",
    description: "Bell peppers filled with rice, beef or vegetables, tomato, and cheese if available.",
    mandatoryIngredients: ["bell pepper", "rice"],
    optionalIngredients: ["beef", "cheese", "tomatoes", "onion", "garlic", "parsley"],
    instructions: [
      "Cut the tops off bell peppers and remove seeds.",
      "Cook rice until almost done.",
      "Prepare filling with rice, beef or vegetables, tomato, onion, and garlic.",
      "Stuff peppers with the filling and place them in a baking dish.",
      "Add a little tomato sauce or water to the dish.",
      "Bake until peppers are tender.",
      "Top with cheese or parsley if available.",
    ],
    cookingTime: 50,
    servings: 3,
    difficulty: "medium",
    dietaryTags: ["halal"],
    videoUrl: "https://www.youtube.com/results?search_query=stuffed+bell+peppers+recipe",
  },
  {
    name: "Shakshuka",
    description: "Eggs gently cooked in a spicy tomato and pepper sauce, perfect for breakfast or dinner.",
    mandatoryIngredients: ["eggs", "tomatoes"],
    optionalIngredients: ["onion", "garlic", "pepper", "cumin", "parsley", "bread"],
    instructions: [
      "Cook onion, garlic, and pepper in oil until soft.",
      "Add tomatoes, cumin, salt, and pepper.",
      "Simmer until the sauce becomes thick.",
      "Make small wells in the sauce and crack eggs into them.",
      "Cover and cook until eggs are set but yolks are still soft.",
      "Garnish with parsley if available.",
      "Serve with bread or rice.",
    ],
    cookingTime: 30,
    servings: 2,
    difficulty: "medium",
    dietaryTags: ["vegetarian", "halal", "high-protein"],
    videoUrl: "https://www.youtube.com/results?search_query=shakshuka+recipe",
  },
];

const MIN_RECIPE_MATCH_SCORE = 20;

const INGREDIENT_ALIASES: Record<string, string[]> = {
  vegetable: ["carrot", "broccoli", "cabbage", "pepper", "bell pepper", "spinach", "potato", "tomato", "onion"],
  fruit: ["banana", "apple", "mango", "orange", "berry", "strawberry", "blueberry", "grape"],
  rice: ["basmati rice", "jasmine rice", "plain rice", "cooked rice"],
  tomato: ["tomatoes", "tomato"],
  egg: ["eggs", "egg"],
  noodle: ["noodles", "noodle"],
  lentil: ["lentils", "lentil", "dal"],
};

function normalizeIngredient(name: string): string {
  const normalized = name.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
  const singulars: Record<string, string> = {
    eggs: "egg",
    fruits: "fruit",
    vegetables: "vegetable",
    tomatoes: "tomato",
    noodles: "noodle",
    lentils: "lentil",
  };

  return singulars[normalized] ?? normalized.replace(/s$/, "");
}

function ingredientMatches(fridgeItem: string, recipeIngredient: string): boolean {
  const fridge = normalizeIngredient(fridgeItem);
  const ingredient = normalizeIngredient(recipeIngredient);
  const aliases = INGREDIENT_ALIASES[ingredient] ?? [];

  return fridge.includes(ingredient) || ingredient.includes(fridge) || aliases.some((alias) => fridge.includes(normalizeIngredient(alias)));
}

function computeMatchScore(
  mandatoryIngredients: string[],
  optionalIngredients: string[],
  fridgeItems: string[]
): number {
  const allIngredients = [...mandatoryIngredients, ...optionalIngredients];
  if (allIngredients.length === 0) return 100;

  const matched = allIngredients.filter((ing) => fridgeItems.some((item) => ingredientMatches(item, ing))).length;
  return Math.round((matched / allIngredients.length) * 100);
}

router.get("/recipes/suggestions", async (req, res): Promise<void> => {
  const params = GetRecipeSuggestionsQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit || 5) : 5;

  const fridgeItems = await db.select().from(inventoryTable);
  const fridgeNames = fridgeItems.filter((i) => i.quantity > 0).map((i) => i.name);
  const profileRows = await db.select().from(profileTable).limit(1);
  const profile = profileRows[0];

  const suggestions = RECIPE_TEMPLATES.map((template) => {
    const matchScore = computeMatchScore(template.mandatoryIngredients, template.optionalIngredients, fridgeNames);

    const ingredients = [
      ...template.mandatoryIngredients.map((ing) => {
        const inFridge = fridgeNames.some((fn) => ingredientMatches(fn, ing));
        return {
          name: ing,
          quantity: undefined,
          isOptional: false,
          inFridge,
          substitutes: SUBSTITUTION_MAP[ing]?.map((s) => s.substitute) || [],
        };
      }),
      ...template.optionalIngredients.map((ing) => {
        const inFridge = fridgeNames.some((fn) => ingredientMatches(fn, ing));
        return {
          name: ing,
          quantity: undefined,
          isOptional: true,
          inFridge,
          substitutes: SUBSTITUTION_MAP[ing]?.map((s) => s.substitute) || [],
        };
      }),
    ];

    return {
      id: RECIPE_TEMPLATES.indexOf(template) + 1000,
      name: template.name,
      description: template.description,
      ingredients,
      instructions: template.instructions,
      cookingTime: template.cookingTime,
      servings: template.servings,
      difficulty: template.difficulty,
      dietaryTags: template.dietaryTags,
      matchScore,
      videoUrl: template.videoUrl,
      savedAt: undefined,
    };
  });

  let filtered = suggestions;
  if (profile?.dietaryPreference === "vegetarian") {
    filtered = filtered.filter((r) => r.dietaryTags.includes("vegetarian"));
  } else if (profile?.dietaryPreference === "vegan") {
    filtered = filtered.filter((r) => r.dietaryTags.includes("vegan") || r.dietaryTags.includes("vegan-optional"));
  } else if (profile?.dietaryPreference === "halal") {
    filtered = filtered.filter((r) => r.dietaryTags.includes("halal") || r.dietaryTags.includes("vegetarian") || r.dietaryTags.includes("vegan"));
  }

  if (profile?.cookingSkillLevel === "beginner") {
    filtered = filtered.filter((r) => r.difficulty === "easy");
  } else if (profile?.cookingSkillLevel === "intermediate") {
    filtered = filtered.filter((r) => r.difficulty !== "hard");
  }

  filtered = filtered.filter((r) => r.matchScore >= MIN_RECIPE_MATCH_SCORE);
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  res.json(filtered.slice(0, Number(limit)));
});

router.get("/recipes", async (req, res): Promise<void> => {
  const recipes = await db.select().from(recipesTable).orderBy(recipesTable.savedAt);
  const result = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    ingredients: JSON.parse(r.ingredientsJson),
    instructions: JSON.parse(r.instructionsJson),
    cookingTime: r.cookingTime,
    servings: r.servings,
    difficulty: r.difficulty,
    dietaryTags: JSON.parse(r.dietaryTagsJson),
    videoUrl: r.videoUrl,
    matchScore: 100,
    savedAt: r.savedAt.toISOString(),
  }));
  res.json(result);
});

router.post("/recipes", async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [recipe] = await db.insert(recipesTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    ingredientsJson: JSON.stringify(parsed.data.ingredients),
    instructionsJson: JSON.stringify(parsed.data.instructions),
    cookingTime: parsed.data.cookingTime,
    servings: parsed.data.servings,
    difficulty: parsed.data.difficulty,
    dietaryTagsJson: JSON.stringify(parsed.data.dietaryTags || []),
    videoUrl: parsed.data.videoUrl,
  }).returning();

  res.status(201).json({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    ingredients: JSON.parse(recipe.ingredientsJson),
    instructions: JSON.parse(recipe.instructionsJson),
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    dietaryTags: JSON.parse(recipe.dietaryTagsJson),
    videoUrl: recipe.videoUrl,
    matchScore: 100,
    savedAt: recipe.savedAt.toISOString(),
  });
});

router.get("/recipes/:id", async (req, res): Promise<void> => {
  const params = GetRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [recipe] = await db.select().from(recipesTable).where(eq(recipesTable.id, params.data.id));
  if (!recipe) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }

  res.json({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    ingredients: JSON.parse(recipe.ingredientsJson),
    instructions: JSON.parse(recipe.instructionsJson),
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    dietaryTags: JSON.parse(recipe.dietaryTagsJson),
    videoUrl: recipe.videoUrl,
    matchScore: 100,
    savedAt: recipe.savedAt.toISOString(),
  });
});

router.delete("/recipes/:id", async (req, res): Promise<void> => {
  const params = DeleteRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(recipesTable).where(eq(recipesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/substitutions", async (req, res): Promise<void> => {
  const params = GetSubstitutionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const ingredient = params.data.ingredient.toLowerCase().trim();
  const subs = SUBSTITUTION_MAP[ingredient] || [];
  const result = subs.map((s) => ({
    original: ingredient,
    substitute: s.substitute,
    notes: s.notes,
    ratio: s.ratio,
  }));

  res.json(result);
});

export default router;
