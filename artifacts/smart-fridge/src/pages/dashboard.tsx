import type { SyntheticEvent } from "react";
import { useGetInventorySummary, useListNotifications, useGetRecipeSuggestions } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChefHat, Info, AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { GENERIC_RECIPE_IMAGE, getRecipeImage } from "@/lib/recipe-images";

function handleRecipeImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = GENERIC_RECIPE_IMAGE;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
};

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetInventorySummary();
  const { data: notificationsRaw, isLoading: loadingNotifs } = useListNotifications();
  const notifications = Array.isArray(notificationsRaw) ? notificationsRaw : [];
  const { data: recipes, isLoading: loadingRecipes } = useGetRecipeSuggestions({ limit: 3 });

  const statCards = [
    {
      label: "Total Items",
      emoji: "🧊",
      value: summary?.totalItems ?? 0,
      gradient: "from-violet-500 to-purple-600",
      bg: "from-violet-50 to-purple-50",
      text: "text-violet-700",
      sub: "In your fridge",
    },
    {
      label: "Fresh",
      emoji: "🥗",
      value: summary?.freshItems ?? 0,
      gradient: "from-emerald-500 to-green-600",
      bg: "from-emerald-50 to-green-50",
      text: "text-emerald-700",
      sub: "Ready to use",
    },
    {
      label: "Expiring Soon",
      emoji: "⏰",
      value: summary?.expiringSoonItems ?? 0,
      gradient: "from-amber-400 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      text: "text-amber-700",
      sub: "Use these first!",
    },
    {
      label: "Low Stock",
      emoji: "🛒",
      value: summary?.lowStockItems ?? 0,
      gradient: "from-sky-400 to-blue-500",
      bg: "from-sky-50 to-blue-50",
      text: "text-sky-700",
      sub: "Time to restock",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to your Kitchen!</h1>
          </div>
          <p className="text-emerald-100 mt-1 ml-1">Here's what's happening in your fridge today.</p>
        </div>
      </motion.div>

      {loadingNotifs ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : notifications.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {notifications.map((notif, i) => (
            <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Alert
                variant={notif.severity === "critical" ? "destructive" : "default"}
                className={
                  notif.severity === "warning"
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : notif.severity === "critical"
                    ? ""
                    : "border-blue-200 bg-blue-50 text-blue-900"
                }
              >
                {notif.severity === "critical" ? <AlertCircle className="h-4 w-4" /> : notif.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <Info className="h-4 w-4" />}
                <AlertTitle>{notif.type === "expiring_soon" ? "⏰ Expiring Soon" : notif.type === "expired" ? "🚨 Expired" : "📉 Low Stock"}</AlertTitle>
                <AlertDescription>{notif.message}</AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <div className={`rounded-2xl bg-gradient-to-br ${card.bg} border border-white shadow-sm p-5 flex flex-col gap-3`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.emoji}</span>
                <div className={`rounded-full bg-gradient-to-br ${card.gradient} p-1.5 shadow`}>
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </div>
              </div>
              {loadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className={`text-4xl font-bold ${card.text}`}>{card.value}</div>
              )}
              <div>
                <div className="font-semibold text-sm text-gray-700">{card.label}</div>
                <div className="text-xs text-gray-500">{card.sub}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-12 lg:col-span-7">
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-4">
              <CardTitle className="text-white flex items-center gap-2"><ChefHat className="h-5 w-5" /> Top Recipe Suggestions</CardTitle>
              <CardDescription className="text-orange-100 mt-1">Meals you can make with what you have.</CardDescription>
            </div>
            <CardContent className="pt-4">
              {loadingRecipes ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : recipes && recipes.length > 0 ? (
                <div className="space-y-3">
                  {recipes.map((recipe, i) => (
                    <Link key={recipe.id} href="/recipes">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-center gap-4 rounded-xl border border-orange-100 bg-orange-50/40 p-4 transition-all hover:bg-orange-50 hover:shadow-sm cursor-pointer mb-1"
                      >
                        <img
                          src={getRecipeImage(recipe.name)}
                          alt={recipe.name}
                          className="h-14 w-14 rounded-xl object-cover shadow-sm"
                          loading="lazy"
                          onError={handleRecipeImageError}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{recipe.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {recipe.cookingTime} mins
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 min-w-[80px]">
                          <span className="text-xs font-medium text-gray-500">Match</span>
                          <Progress
                            value={recipe.matchScore}
                            className={
                              recipe.matchScore > 75 ? "[&>div]:bg-emerald-500" :
                              recipe.matchScore > 50 ? "[&>div]:bg-amber-500" :
                              "[&>div]:bg-red-400"
                            }
                          />
                          <span className="text-xs font-bold text-gray-700">{recipe.matchScore}%</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="text-4xl mb-3">🥘</div>
                  <p className="font-medium">Add items to get recipe ideas!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-span-12 lg:col-span-5">
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden h-full">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
              <CardTitle className="text-white">⚡ Quick Actions</CardTitle>
            </div>
            <CardContent className="grid gap-3 pt-4">
              {[
                { href: "/inventory", emoji: "🧊", label: "Manage Inventory", sub: "Add or update fridge items", color: "hover:bg-violet-50 border-violet-100" },
                { href: "/grocery", emoji: "🛒", label: "Grocery List", sub: "View what you need to buy", color: "hover:bg-sky-50 border-sky-100" },
                { href: "/recipes", emoji: "🍳", label: "Browse Recipes", sub: "Discover new meal ideas", color: "hover:bg-orange-50 border-orange-100" },
                { href: "/analytics", emoji: "📊", label: "Food Analytics", sub: "Track waste & savings", color: "hover:bg-emerald-50 border-emerald-100" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${action.color}`}>
                    <span className="text-2xl">{action.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.sub}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
