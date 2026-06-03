import { useState } from "react";
import { useListGroceryItems, useCreateGroceryItem, useUpdateGroceryItem, useDeleteGroceryItem, getListGroceryItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Grocery() {
  const { data: items, isLoading } = useListGroceryItems();
  const createMutation = useCreateGroceryItem();
  const updateMutation = useUpdateGroceryItem();
  const deleteMutation = useDeleteGroceryItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemUnit, setNewItemUnit] = useState("pcs");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    createMutation.mutate({
      data: {
        name: newItemName,
        quantity: Number(newItemQty),
        unit: newItemUnit,
        reason: "Manual addition"
      }
    }, {
      onSuccess: () => {
        setNewItemName("");
        queryClient.invalidateQueries({ queryKey: getListGroceryItemsQueryKey() });
      }
    });
  };

  const handleToggle = (id: number, isPurchased: boolean) => {
    updateMutation.mutate({
      id,
      data: { isPurchased: !isPurchased }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGroceryItemsQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Item removed from list" });
        queryClient.invalidateQueries({ queryKey: getListGroceryItemsQueryKey() });
      }
    });
  };

  const groupedItems = items?.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grocery List</h1>
        <p className="text-muted-foreground mt-1">Auto-generated from your low-stock items and planned recipes.</p>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="What do you need?" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Input 
                type="number" 
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="w-20"
                min="1"
              />
              <Input 
                placeholder="Unit" 
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-24"
              />
              <Button type="submit" disabled={createMutation.isPending || !newItemName.trim()}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items?.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/10 flex flex-col items-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Your list is empty</h3>
          <p className="text-muted-foreground">You're all stocked up!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems || {}).map(([category, categoryItems]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                <span className="capitalize">{category}</span>
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                  {categoryItems.length}
                </Badge>
              </h3>
              <div className="space-y-2">
                {categoryItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${item.isPurchased ? 'bg-muted/50 opacity-60' : 'bg-card hover:border-primary/50'}`}
                  >
                    <Checkbox 
                      checked={item.isPurchased} 
                      onCheckedChange={() => handleToggle(item.id, item.isPurchased)}
                      className="w-5 h-5 rounded-full"
                    />
                    <div className={`flex-1 ${item.isPurchased ? 'line-through text-muted-foreground' : ''}`}>
                      <span className="font-medium text-base">{item.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({item.quantity} {item.unit})
                      </span>
                      {item.reason && !item.isPurchased && (
                        <p className="text-xs text-amber-600 mt-0.5">{item.reason}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
