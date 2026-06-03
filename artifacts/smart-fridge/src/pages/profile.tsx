import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");

  useEffect(() => {
    if (profile) {
      setAllergies(profile.allergies || []);
    }
  }, [profile]);

  const handleAddAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newAllergy.trim()) {
      e.preventDefault();
      if (!allergies.includes(newAllergy.trim())) {
        setAllergies([...allergies, newAllergy.trim()]);
      }
      setNewAllergy("");
    }
  };

  const removeAllergy = (a: string) => {
    setAllergies(allergies.filter(al => al !== a));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      data: {
        name: formData.get("name") as string,
        dietaryPreference: formData.get("dietaryPreference") as any,
        cookingSkillLevel: formData.get("cookingSkillLevel") as any,
        availableCookingTime: Number(formData.get("availableCookingTime")),
        householdSize: Number(formData.get("householdSize")),
        allergies: allergies
      }
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Configure your preferences to get better meal suggestions.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Tell us about yourself and your cooking habits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={profile?.name} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="dietaryPreference">Dietary Preference</Label>
                  <Select name="dietaryPreference" defaultValue={profile?.dietaryPreference || "none"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="halal">Halal</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cookingSkillLevel">Cooking Skill Level</Label>
                  <Select name="cookingSkillLevel" defaultValue={profile?.cookingSkillLevel || "intermediate"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="availableCookingTime">Available Cooking Time (minutes)</Label>
                  <Input id="availableCookingTime" name="availableCookingTime" type="number" defaultValue={profile?.availableCookingTime || 30} required />
                  <p className="text-xs text-muted-foreground">Average time you have to cook a meal.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Input id="householdSize" name="householdSize" type="number" min="1" defaultValue={profile?.householdSize || 1} required />
                </div>
              </div>

              <div className="grid gap-2 pt-4 border-t">
                <Label>Allergies & Dislikes</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allergies.map(allergy => (
                    <Badge key={allergy} variant="secondary" className="px-2 py-1 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
                      {allergy}
                      <button type="button" onClick={() => removeAllergy(allergy)} className="ml-1 hover:text-destructive text-destructive/70 focus:outline-none">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input 
                  placeholder="Type an allergy and press Enter..." 
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={handleAddAllergy}
                />
                <p className="text-xs text-muted-foreground">E.g., Peanuts, Shellfish, Gluten</p>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full sm:w-auto" disabled={updateMutation.isPending}>
                  Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
