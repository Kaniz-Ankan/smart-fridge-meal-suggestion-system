import { Link, useLocation } from "wouter";
import { Home, Refrigerator, ChefHat, ShoppingCart, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, emoji: "🏠", color: "text-violet-500", activeGrad: "from-violet-500 to-purple-500" },
  { name: "Inventory", href: "/inventory", icon: Refrigerator, emoji: "🧊", color: "text-sky-500", activeGrad: "from-sky-500 to-blue-500" },
  { name: "Recipes", href: "/recipes", icon: ChefHat, emoji: "🍳", color: "text-orange-500", activeGrad: "from-orange-500 to-pink-500" },
  { name: "Grocery List", href: "/grocery", icon: ShoppingCart, emoji: "🛒", color: "text-emerald-500", activeGrad: "from-emerald-500 to-teal-500" },
  { name: "Analytics", href: "/analytics", icon: PieChart, emoji: "📊", color: "text-pink-500", activeGrad: "from-pink-500 to-rose-500" },
  { name: "Profile", href: "/profile", icon: User, emoji: "👤", color: "text-amber-500", activeGrad: "from-amber-500 to-yellow-500" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100 shadow-sm">
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-200">
            <span className="text-lg">🥗</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">SmartFridge</div>
            <div className="text-xs text-gray-400 leading-tight">Kitchen Assistant</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-gradient-to-r shadow-sm text-white " + item.activeGrad
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className={cn("mr-3 text-lg transition-transform group-hover:scale-110", isActive ? "" : "")}>{item.emoji}</span>
                <span className={isActive ? "text-white font-semibold" : ""}>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-3 text-center">
          <div className="text-lg mb-1">🌿</div>
          <div className="text-xs font-medium text-emerald-700">Reduce food waste</div>
          <div className="text-xs text-emerald-500">one meal at a time</div>
        </div>
      </div>
    </div>
  );
}
