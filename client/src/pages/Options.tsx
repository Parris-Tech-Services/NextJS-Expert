import { useState } from "react";
import { useOptions, useDeleteOption } from "@/hooks/use-options";
import { OptionForm } from "@/components/OptionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Truck, ShoppingBag, Leaf, MilkOff } from "lucide-react";
import { type Option } from "@shared/schema";

export default function Options() {
  const { data: options, isLoading } = useOptions();
  const deleteMutation = useDeleteOption();
  const [search, setSearch] = useState("");
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter options
  const filteredOptions = options?.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase()) || 
    opt.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (option: Option) => {
    setEditingOption(option);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this place?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingOption(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-16">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">Your Places</h1>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full h-12 w-12 shadow-lg shadow-primary/20">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle>{editingOption ? "Edit Place" : "Add New Place"}</DialogTitle>
              </DialogHeader>
              <OptionForm 
                option={editingOption || undefined} 
                onSuccess={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search places or cuisine..." 
            className="pl-10 h-12 rounded-xl bg-card border-border/50 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading your favorites...</div>
          ) : filteredOptions?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No places found. Add your first one!
            </div>
          ) : (
            filteredOptions?.map(option => (
              <Card key={option.id} className="p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-border/60">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg leading-tight">{option.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">{option.cuisine}</Badge>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium bg-background">{option.price}</Badge>
                      {option.dairyFree && <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium border-blue-200 text-blue-700 bg-blue-50"><MilkOff size={10} className="mr-1"/>DF</Badge>}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(option)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(option.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-foreground">{option.familyRating}</span>/5 Rating
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <div className="flex items-center gap-2">
                    {option.delivery && <Truck size={14} className="text-green-600/70" />}
                    {option.pickup && <ShoppingBag size={14} className="text-green-600/70" />}
                    {option.healthyScore >= 4 && <Leaf size={14} className="text-green-600/70" />}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
