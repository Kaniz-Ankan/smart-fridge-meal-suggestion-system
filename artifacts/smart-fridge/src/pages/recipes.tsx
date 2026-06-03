import { useState, type SyntheticEvent } from "react";
import { updateInventoryItem, useGetRecipeSuggestions, useListInventoryItems, useListRecipes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, PlayCircle, CheckCircle2, Circle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { GENERIC_RECIPE_IMAGE, getRecipeImage } from "@/lib/recipe-images";

function handleRecipeImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = GENERIC_RECIPE_IMAGE;
}

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

function ingredientMatches(inventoryName: string, recipeIngredient: string): boolean {
  const item = normalizeIngredient(inventoryName);
  const ingredient = normalizeIngredient(recipeIngredient);
  const aliases = INGREDIENT_ALIASES[ingredient] ?? [];

  return item.includes(ingredient) || ingredient.includes(item) || aliases.some((alias) => item.includes(normalizeIngredient(alias)));
}

export default function Recipes() {
  const { data: suggestions, isLoading: loadingSuggestions } = useGetRecipeSuggestions({ limit: 50 });
  const { data: inventoryItems } = useListInventoryItems();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isCooking, setIsCooking] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getMatchColor = (score: number) => {
    if (score > 75) return "bg-green-500";
    if (score > 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const findInventoryItemForIngredient = (ingredientName: string) => {
    const items = Array.isArray(inventoryItems) ? inventoryItems : [];
    return items.find((item) => item.quantity > 0 && ingredientMatches(item.name, ingredientName));
  };

  const handleCookRecipe = async (recipe: any) => {
    const usedItems = new Map<number, any>();

    for (const ingredient of recipe.ingredients || []) {
      const item = findInventoryItemForIngredient(ingredient.name);
      if (item) usedItems.set(item.id, item);
    }

    if (usedItems.size === 0) {
      toast({ title: "No matching inventory items found", description: "Add the ingredients to inventory before cooking this recipe." });
      return;
    }

    setIsCooking(true);
    try {
      await Promise.all(
        Array.from(usedItems.values()).map((item) =>
          updateInventoryItem(item.id, { quantity: Math.max(0, Number(item.quantity) - 1) })
        )
      );
      await queryClient.invalidateQueries();
      toast({ title: "Recipe cooked", description: `${usedItems.size} inventory item${usedItems.size === 1 ? "" : "s"} updated.` });
    } finally {
      setIsCooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Recipe Suggestions</h1>
        <p className="text-muted-foreground mt-1">Discover meals you can make with your current fridge inventory.</p>
      </div>

      {loadingSuggestions ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : suggestions?.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/20">
          <p className="text-muted-foreground">Add more items to your fridge to get recipe suggestions.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suggestions?.map((recipe) => (
            <Card key={recipe.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
              <div className="h-48 bg-muted relative overflow-hidden group">
                <img
                  src={getRecipeImage(recipe.name)}
                  alt={recipe.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={handleRecipeImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
                  <div className="w-16">
                    <Progress value={recipe.matchScore} className={`[&>div]:${getMatchColor(recipe.matchScore)} h-2`} />
                  </div>
                  <span>{recipe.matchScore}%</span>
                </div>
              </div>
              <CardContent className="flex-1 p-5 flex flex-col">
                <h3 className="font-bold text-xl line-clamp-1 mb-2">{recipe.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {recipe.description || "A delicious meal you can prepare now."}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.cookingTime}m</div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {recipe.servings}</div>
                  <Badge variant="secondary" className="capitalize ml-auto">{recipe.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryTags?.slice(0,3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedRecipe.cookingTime} mins</div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {selectedRecipe.servings} servings</div>
                  <Badge className="capitalize">{selectedRecipe.difficulty}</Badge>
                </div>
              </DialogHeader>

              <div className="h-64 overflow-hidden rounded-lg bg-muted md:h-80">
                <img
                  src={getRecipeImage(selectedRecipe.name)}
                  alt={selectedRecipe.name}
                  className="h-full w-full object-cover"
                  onError={handleRecipeImageError}
                />
              </div>

              {selectedRecipe.description && (
                <p className="text-muted-foreground">{selectedRecipe.description}</p>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center justify-between">
                    Ingredients
                    <Badge variant="outline" className="font-normal">
                      {selectedRecipe.matchScore}% Match
                    </Badge>
                  </h4>
                  <ul className="space-y-3">
                    {selectedRecipe.ingredients.map((ing: any, i: number) => (
                      <li key={i} className={`flex items-start gap-3 p-2 rounded-md ${ing.inFridge ? 'bg-green-50/50' : ''}`}>
                        {ing.inFridge ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className={`w-5 h-5 shrink-0 mt-0.5 ${ing.isOptional ? 'text-muted-foreground' : 'text-red-400'}`} />
                        )}
                        <div className="flex-1">
                          <span className={`font-medium ${!ing.inFridge && !ing.isOptional ? 'text-red-700' : ''}`}>
                            {ing.quantity} {ing.name}
                          </span>
                          {ing.isOptional && <span className="text-xs text-muted-foreground ml-2">(Optional)</span>}
                          {!ing.inFridge && ing.substitutes && ing.substitutes.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Substitutes: {ing.substitutes.join(", ")}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4">Instructions</h4>
                  <ol className="space-y-4">
                    {selectedRecipe.instructions.map((step: string, i: number) => (
                      <li key={i} className="flex gap-4">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-medium text-sm shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-foreground leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                  <Button className="mt-6 w-full" onClick={() => handleCookRecipe(selectedRecipe)} disabled={isCooking}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> {isCooking ? "Updating Inventory..." : "Cook This Recipe"}
                  </Button>
                  {selectedRecipe.videoUrl && (
                    <Button variant="outline" className="mt-3 w-full" onClick={() => window.open(selectedRecipe.videoUrl, "_blank")}>
                      <PlayCircle className="w-4 h-4 mr-2" /> Watch Video Tutorial
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
