const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=600&q=80`;

export const GENERIC_RECIPE_IMAGE = photo("photo-1504674900247-0877df9cc836");

const RECIPE_IMAGES: Record<string, string> = {
  "vegetable omelette": photo("photo-1525351484163-7529414344d8"),
  "rice and lentil dal": photo("photo-1585937421612-70a008356fbe"),
  "stir-fried vegetables": photo("photo-1512058564366-18510be2db19"),
  "pasta with tomato sauce": photo("photo-1551892374-ecf8754cf8b0"),
  "fruit smoothie bowl": photo("photo-1494597564530-871f2b93ac55"),
  "chicken fried rice": photo("photo-1603133872878-684f208fb84b"),
  "lentil soup": photo("photo-1547592180-85f173990554"),
  "banana pancakes": photo("photo-1567620905732-2d1ec7ab7445"),
  "beef biryani": photo("photo-1563379091339-03246963d96c"),
  "chicken korma": photo("photo-1583847268964-b28dc8f51f92"),
  "beef tehari": photo("photo-1563379091339-03246963d96c"),
  "thai basil beef": photo("photo-1512058564366-18510be2db19"),
  "roast chicken dinner": photo("photo-1598103442097-8b74394b95c6"),
  "fish curry": photo("photo-1626645738196-c2a7c87a8f58"),
  "shrimp noodles": photo("photo-1552611052-33e04de081de"),
  "lamb curry": photo("photo-1574484284002-952d92456975"),
  "stuffed bell peppers": photo("photo-1604908176997-125f25cc6f3d"),
  "shakshuka": photo("photo-1590412200988-a436970781fa"),
};

export function getRecipeImage(recipeName?: string | null): string {
  if (!recipeName) return GENERIC_RECIPE_IMAGE;

  const normalizedName = recipeName.toLowerCase().trim();
  return RECIPE_IMAGES[normalizedName] ?? GENERIC_RECIPE_IMAGE;
}
