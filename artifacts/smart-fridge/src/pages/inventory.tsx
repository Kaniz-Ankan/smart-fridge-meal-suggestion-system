import { useState } from "react";
import { useListInventoryItems, useDeleteInventoryItem, useCreateInventoryItem, useUpdateInventoryItem, getListInventoryItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Edit2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["dairy", "meat", "vegetables", "fruits", "grains", "condiments", "beverages", "frozen", "other"];

const CATEGORY_EMOJI: Record<string, string> = {
  dairy: "🥛", meat: "🥩", vegetables: "🥦", fruits: "🍎",
  grains: "🌾", condiments: "🫙", beverages: "🧃", frozen: "🧊", other: "📦",
};

const FOOD_EMOJI_MAP: [string, string][] = [
  ["pineapple", "🍍"], ["strawberry", "🍓"], ["blueberry", "🫐"], ["watermelon", "🍉"],
  ["avocado", "🥑"], ["eggplant", "🍆"], ["broccoli", "🥦"], ["cucumber", "🥒"],
  ["lettuce", "🥬"], ["spinach", "🥬"], ["cabbage", "🥬"], ["kale", "🥬"],
  ["sweet potato", "🍠"], ["potato", "🥔"], ["tomato", "🍅"], ["cherry", "🍒"],
  ["peach", "🍑"], ["mango", "🥭"], ["coconut", "🥥"], ["kiwi", "🥝"],
  ["banana", "🍌"], ["lemon", "🍋"], ["lime", "🍋"], ["orange", "🍊"],
  ["grape", "🍇"], ["apple", "🍎"], ["pear", "🍐"], ["melon", "🍈"],
  ["corn", "🌽"], ["carrot", "🥕"], ["garlic", "🧄"], ["onion", "🧅"],
  ["pepper", "🌶️"], ["chili", "🌶️"], ["mushroom", "🍄"], ["ginger", "🌿"],
  ["herb", "🌿"], ["mint", "🌿"], ["basil", "🌿"], ["parsley", "🌿"],
  ["celery", "🥬"], ["asparagus", "🥦"], ["zucchini", "🥒"], ["radish", "🥕"],
  ["beetroot", "🫚"], ["beet", "🫚"], ["pumpkin", "🎃"], ["squash", "🎃"],
  ["chicken", "🍗"], ["beef", "🥩"], ["steak", "🥩"], ["pork", "🥩"],
  ["lamb", "🥩"], ["bacon", "🥓"], ["sausage", "🌭"], ["turkey", "🦃"],
  ["salmon", "🐟"], ["tuna", "🐟"], ["fish", "🐟"], ["shrimp", "🍤"],
  ["prawn", "🍤"], ["crab", "🦀"], ["lobster", "🦞"], ["oyster", "🦪"],
  ["milk", "🥛"], ["cheese", "🧀"], ["butter", "🧈"], ["yogurt", "🍦"],
  ["cream", "🥛"], ["egg", "🥚"], ["eggs", "🥚"],
  ["bread", "🍞"], ["bagel", "🥯"], ["croissant", "🥐"], ["baguette", "🥖"],
  ["pretzel", "🥨"], ["pasta", "🍝"], ["spaghetti", "🍝"], ["noodle", "🍜"],
  ["rice", "🍚"], ["oat", "🌾"], ["wheat", "🌾"], ["flour", "🌾"],
  ["cereal", "🌾"], ["granola", "🌾"], ["quinoa", "🌾"], ["barley", "🌾"],
  ["lentil", "🫘"], ["bean", "🫘"], ["chickpea", "🫘"], ["pea", "🫘"],
  ["peanut", "🥜"], ["almond", "🌰"], ["walnut", "🌰"], ["cashew", "🌰"],
  ["pistachio", "🌰"], ["chestnut", "🌰"], ["hazelnut", "🌰"],
  ["olive oil", "🫒"], ["olive", "🫒"], ["oil", "🫙"], ["vinegar", "🫙"],
  ["ketchup", "🍅"], ["mustard", "🫙"], ["mayo", "🫙"], ["mayonnaise", "🫙"],
  ["sauce", "🫙"], ["soy sauce", "🫙"], ["honey", "🍯"], ["jam", "🍯"],
  ["jelly", "🍯"], ["syrup", "🍯"], ["salt", "🧂"], ["sugar", "🍬"],
  ["chocolate", "🍫"], ["cocoa", "🍫"], ["vanilla", "🌿"], ["cinnamon", "🌿"],
  ["coffee", "☕"], ["tea", "🍵"], ["juice", "🧃"], ["lemonade", "🍋"],
  ["water", "💧"], ["soda", "🥤"], ["cola", "🥤"], ["beer", "🍺"],
  ["wine", "🍷"], ["energy drink", "⚡"], ["smoothie", "🥤"],
  ["ice cream", "🍨"], ["gelato", "🍨"], ["sorbet", "🍨"],
  ["cake", "🎂"], ["cookie", "🍪"], ["brownie", "🍫"], ["muffin", "🧁"],
  ["cupcake", "🧁"], ["donut", "🍩"], ["pie", "🥧"], ["pizza", "🍕"],
  ["burger", "🍔"], ["sandwich", "🥪"], ["wrap", "🌯"], ["taco", "🌮"],
  ["soup", "🍲"], ["stew", "🍲"], ["curry", "🍛"], ["salad", "🥗"],
  ["hummus", "🫙"], ["tofu", "🧊"], ["tempeh", "🌾"],
];

function getFoodEmoji(name: string, category: string): string {
  const lower = name.toLowerCase().trim();
  const sorted = [...FOOD_EMOJI_MAP].sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, emoji] of sorted) {
    if (lower.includes(keyword)) return emoji;
  }
  return CATEGORY_EMOJI[category] ?? "📦";
}

const CATEGORY_GRADIENT: Record<string, string> = {
  dairy:      "from-blue-50 to-indigo-50 border-blue-100",
  meat:       "from-red-50 to-pink-50 border-red-100",
  vegetables: "from-green-50 to-emerald-50 border-green-100",
  fruits:     "from-orange-50 to-yellow-50 border-orange-100",
  grains:     "from-amber-50 to-yellow-50 border-amber-100",
  condiments: "from-purple-50 to-violet-50 border-purple-100",
  beverages:  "from-cyan-50 to-sky-50 border-cyan-100",
  frozen:     "from-sky-50 to-blue-50 border-sky-100",
  other:      "from-gray-50 to-slate-50 border-gray-100",
};

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  dairy:      "bg-blue-100 text-blue-700",
  meat:       "bg-red-100 text-red-700",
  vegetables: "bg-green-100 text-green-700",
  fruits:     "bg-orange-100 text-orange-700",
  grains:     "bg-amber-100 text-amber-700",
  condiments: "bg-purple-100 text-purple-700",
  beverages:  "bg-cyan-100 text-cyan-700",
  frozen:     "bg-sky-100 text-sky-700",
  other:      "bg-gray-100 text-gray-700",
};

interface FloatingEmoji { id: number; emoji: string; x: number; }

function FloatingEmojiLayer({ items }: { items: FloatingEmoji[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -180, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ position: "fixed", left: item.x, bottom: "35%" }}
            className="text-4xl select-none"
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [addCategory, setAddCategory] = useState("other");
  const [editCategory, setEditCategory] = useState("other");
  const [addName, setAddName] = useState("");
  const [editName, setEditName] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [nextId, setNextId] = useState(0);

  const { data: items, isLoading } = useListInventoryItems();
  const deleteMutation = useDeleteInventoryItem();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const triggerEmojiBurst = (name: string, category: string) => {
    const emoji = getFoodEmoji(name, category);
    const newEmojis: FloatingEmoji[] = Array.from({ length: 6 }, (_, i) => ({
      id: nextId + i,
      emoji,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
    }));
    setNextId((n) => n + 6);
    setFloatingEmojis((prev) => [...prev, ...newEmojis]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => !newEmojis.find((n) => n.id === e.id)));
    }, 1600);
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "🗑️ Item removed" });
        queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });
      },
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "fresh":         return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "expiring_soon": return "bg-amber-100 text-amber-700 border-amber-200";
      case "expired":       return "bg-red-100 text-red-700 border-red-200";
      case "low_stock":     return "bg-sky-100 text-sky-700 border-sky-200";
      default:              return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      fresh: "✅ Fresh", expiring_soon: "⏰ Expiring", expired: "🚨 Expired", low_stock: "📉 Low",
    };
    return map[status] ?? status;
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 3) return "text-amber-600";
    return "text-gray-500";
  };

  const liveAddEmoji = getFoodEmoji(addName, addCategory);
  const liveEditEmoji = getFoodEmoji(editName, editCategory);

  return (
    <div className="space-y-6">
      <FloatingEmojiLayer items={floatingEmojis} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">🧊 Fridge Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage what's inside your fridge.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { setAddName(""); setAddCategory("other"); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-200 border-0">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <motion.span
                  key={liveAddEmoji}
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-3xl"
                >
                  {liveAddEmoji}
                </motion.span>
                Add New Item
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get("name") as string;
              const notesVal = formData.get("notes");
              const thresholdVal = formData.get("lowStockThreshold");
              createMutation.mutate({
                data: {
                  name,
                  quantity: Number(formData.get("quantity")),
                  unit: formData.get("unit") as string,
                  category: addCategory as any,
                  expiryDate: formData.get("expiryDate") as string,
                  ...(thresholdVal ? { lowStockThreshold: Number(thresholdVal) } : {}),
                  ...(notesVal ? { notes: notesVal as string } : {}),
                },
              }, {
                onSuccess: () => {
                  toast({ title: `${getFoodEmoji(name, addCategory)} ${name} added!` });
                  queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });
                  triggerEmojiBurst(name, addCategory);
                  setIsAddOpen(false);
                  setAddName("");
                  setAddCategory("other");
                },
              });
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Name</Label>
                  <Input
                    id="add-name"
                    name="name"
                    placeholder="e.g. Banana, Chicken, Milk"
                    required
                    className="rounded-xl"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="add-quantity">Quantity</Label>
                    <Input id="add-quantity" name="quantity" type="number" step="0.1" min="0" required className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-unit">Unit</Label>
                    <Input id="add-unit" name="unit" placeholder="pcs, kg, L" required className="rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={addCategory} onValueChange={setAddCategory}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className="flex items-center gap-2">
                            <span>{CATEGORY_EMOJI[c]}</span>
                            <span className="capitalize">{c}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-expiry">Expiry Date</Label>
                  <Input id="add-expiry" name="expiryDate" type="date" required className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-xl">
                  {createMutation.isPending ? "Saving…" : `Save ${liveAddEmoji}`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="fresh">✅ Fresh</SelectItem>
            <SelectItem value="expiring_soon">⏰ Expiring Soon</SelectItem>
            <SelectItem value="expired">🚨 Expired</SelectItem>
            <SelectItem value="low_stock">📉 Low Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="text-5xl mb-3">🥺</div>
          <p className="text-gray-500 font-medium">No items found.</p>
          <p className="text-sm text-gray-400 mt-1">Try adding something to your fridge!</p>
        </motion.div>
      ) : (
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredItems.map((item, i) => {
              const itemEmoji = getFoodEmoji(item.name, item.category);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`rounded-2xl border bg-gradient-to-br ${CATEGORY_GRADIENT[item.category] ?? CATEGORY_GRADIENT.other} shadow-sm overflow-hidden`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, delay: i * 0.04 + 0.1 }}
                          className="text-4xl"
                        >
                          {itemEmoji}
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE_COLOR[item.category] ?? CATEGORY_BADGE_COLOR.other}`}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs font-semibold ${getStatusStyle(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-sm">
                      <div className="font-semibold bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-xl text-gray-800 shadow-sm">
                        {item.quantity} {item.unit}
                      </div>
                      <div className={`flex items-center gap-1 font-medium ${getDaysColor(item.daysUntilExpiry)}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.daysUntilExpiry < 0 ? "Expired!" : `${item.daysUntilExpiry}d left`}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-white/60">
                      <button
                        onClick={() => { setEditItem(item); setEditCategory(item.category); setEditName(item.name); }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/60 hover:bg-white/90 rounded-xl py-2 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 bg-white/60 hover:bg-red-50 rounded-xl py-2 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) { setEditItem(null); setEditName(""); setEditCategory("other"); } }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <motion.span key={liveEditEmoji} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-3xl">
                {liveEditEmoji}
              </motion.span>
              Edit Item
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get("name") as string;
              const editNotesVal = formData.get("notes");
              updateMutation.mutate({
                id: editItem.id,
                data: {
                  name,
                  quantity: Number(formData.get("quantity")),
                  unit: formData.get("unit") as string,
                  category: editCategory as any,
                  expiryDate: formData.get("expiryDate") as string,
                  ...(editNotesVal ? { notes: editNotesVal as string } : {}),
                },
              }, {
                onSuccess: () => {
                  toast({ title: `${getFoodEmoji(name, editCategory)} ${name} updated!` });
                  queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });
                  setEditItem(null);
                  setEditName("");
                },
              });
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    name="name"
                    required
                    className="rounded-xl"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Quantity</Label>
                    <Input name="quantity" type="number" step="0.1" defaultValue={editItem.quantity} required className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Unit</Label>
                    <Input name="unit" defaultValue={editItem.unit} required className="rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className="flex items-center gap-2">
                            <span>{CATEGORY_EMOJI[c]}</span>
                            <span className="capitalize">{c}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Expiry Date</Label>
                  <Input name="expiryDate" type="date" defaultValue={editItem.expiryDate?.split("T")[0]} required className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-xl">
                  {updateMutation.isPending ? "Saving…" : `Save ${liveEditEmoji}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
