import { useState } from "react";
import { useOptions, useLockInOption } from "@/hooks/use-options";
import { type Option } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Utensils, Settings2, RotateCcw, Lock, ChevronDown, ChevronUp, Star, Truck, ShoppingBag, Leaf, Baby } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays } from "date-fns";

type Filters = {
  mode: "delivery" | "pickup" | "any";
  prices: string[];
  kidFriendly: boolean;
  dairyFree: boolean;
  healthy: boolean;
  noRepeats: boolean;
};

export default function Home() {
  const { data: options } = useOptions();
  const lockInMutation = useLockInOption();
  
  const [filters, setFilters] = useState<Filters>({
    mode: "any",
    prices: ["$", "$$", "$$$"],
    kidFriendly: false,
    dairyFree: true,
    healthy: true,
    noRepeats: true,
  });

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [result, setResult] = useState<{ top: Option; runnersUp: Option[] } | null>(null);

  const decideDinner = () => {
    if (!options || options.length === 0) return;

    // 1. Filter
    let candidates = options.filter(opt => {
      // Mode
      if (filters.mode === "delivery" && !opt.delivery) return false;
      if (filters.mode === "pickup" && !opt.pickup) return false;
      
      // Price (if any selected, otherwise allow all)
      if (filters.prices.length > 0 && !filters.prices.includes(opt.price)) return false;
      
      // Dairy Free
      if (filters.dairyFree && !opt.dairyFree) return false;
      
      // No Repeats (within last 7 days)
      if (filters.noRepeats && opt.lastOrdered) {
        if (differenceInDays(new Date(), new Date(opt.lastOrdered)) < 7) return false;
      }
      
      return true;
    });

    if (candidates.length === 0) {
      alert("No options match these filters! Try loosening them up.");
      return;
    }

    // 2. Score
    const scored = candidates.map(opt => {
      let score = 0;
      
      // Base score from rating
      score += opt.familyRating * 10;
      
      // Healthy bonus
      if (filters.healthy) {
        score += (opt.healthyScore - 3) * 5; // Reward >3, penalize <3
        if (opt.fatCaution === "high") score -= 15;
      }
      
      // Kid friendly bonus
      if (filters.kidFriendly) {
        score += (opt.kidFriendly - 3) * 5;
      }
      
      // Random noise (0-20 points) to vary results
      score += Math.random() * 20;
      
      return { ...opt, score };
    });

    // 3. Sort
    scored.sort((a, b) => b.score - a.score);

    setResult({
      top: scored[0],
      runnersUp: scored.slice(1, 4),
    });
    setFiltersOpen(false);
  };

  const reset = () => {
    setResult(null);
    setFiltersOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="bg-primary pt-12 pb-16 px-6 text-primary-foreground rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 transform -rotate-12"><Utensils size={120} /></div>
          <div className="absolute bottom-10 right-10 transform rotate-45"><Star size={80} /></div>
        </div>
        
        <div className="relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Takeaway Tonight</h1>
          <p className="text-primary-foreground/80 font-medium">Fast decisions for hungry families.</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 relative z-20">
        
        {/* Filter Card */}
        <AnimatePresence>
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden"
            >
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-display flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-primary" />
                      Preferences
                    </h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-9 h-9 p-0 rounded-full">
                        {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="space-y-6 animate-accordion-down">
                    {/* Pickup/Delivery */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Mode</Label>
                      <ToggleGroup type="single" value={filters.mode} onValueChange={(v: any) => v && setFilters({...filters, mode: v})} className="justify-start">
                        <ToggleGroupItem value="any" className="flex-1">Any</ToggleGroupItem>
                        <ToggleGroupItem value="delivery" className="flex-1"><Truck className="w-4 h-4 mr-2"/> Delivery</ToggleGroupItem>
                        <ToggleGroupItem value="pickup" className="flex-1"><ShoppingBag className="w-4 h-4 mr-2"/> Pickup</ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Budget</Label>
                      <ToggleGroup type="multiple" value={filters.prices} onValueChange={(v) => setFilters({...filters, prices: v})} className="justify-start">
                        <ToggleGroupItem value="$" className="flex-1">$</ToggleGroupItem>
                        <ToggleGroupItem value="$$" className="flex-1">$$</ToggleGroupItem>
                        <ToggleGroupItem value="$$$" className="flex-1">$$$</ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Toggles Grid */}
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600">
                            <Leaf className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <Label className="text-sm font-semibold">Healthy-ish</Label>
                            <span className="text-[10px] text-muted-foreground">Prioritize higher health scores</span>
                          </div>
                        </div>
                        <Switch checked={filters.healthy} onCheckedChange={(c) => setFilters({...filters, healthy: c})} />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600">
                            <Baby className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <Label className="text-sm font-semibold">Kid Friendly</Label>
                            <span className="text-[10px] text-muted-foreground">Only places rated 4+ for kids</span>
                          </div>
                        </div>
                        <Switch checked={filters.kidFriendly} onCheckedChange={(c) => setFilters({...filters, kidFriendly: c})} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Dairy Free Required</Label>
                        <Switch checked={filters.dairyFree} onCheckedChange={(c) => setFilters({...filters, dairyFree: c})} />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>No Repeats (7 days)</Label>
                        <Switch checked={filters.noRepeats} onCheckedChange={(c) => setFilters({...filters, noRepeats: c})} />
                      </div>
                    </div>
                  </CollapsibleContent>

                  <Button 
                    size="lg" 
                    className="w-full text-lg font-bold shadow-xl shadow-primary/20 h-14 rounded-xl"
                    onClick={decideDinner}
                  >
                    Decide Dinner 🎲
                  </Button>
                </div>
              </Collapsible>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results View */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-8"
            >
              {/* TOP PICK */}
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg z-20 whitespace-nowrap">
                  🏆 TOP PICK
                </div>
                <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden rounded-3xl">
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                    <Utensils className="w-16 h-16 text-primary/40" />
                    <div className="absolute bottom-4 left-6">
                      <h2 className="text-3xl font-black font-display text-foreground">{result.top.name}</h2>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="font-normal">{result.top.cuisine}</Badge>
                        <Badge variant="outline" className="font-normal">{result.top.price}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Family Rating</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-lg">{result.top.familyRating}/5</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <p className="text-xs text-muted-foreground font-semibold uppercase">Healthy Score</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-lg">{result.top.healthyScore}/5</span>
                        </div>
                      </div>
                    </div>

                    {result.top.dairyFreeNotes && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Dairy Free Order:</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{result.top.dairyFreeNotes}</p>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        {result.top.delivery ? <span className="text-green-600 flex items-center gap-1"><Truck size={14}/> Delivery OK</span> : <span className="text-muted-foreground line-through opacity-50 flex items-center gap-1"><Truck size={14}/> No Delivery</span>}
                      </p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {result.top.pickup ? <span className="text-green-600 flex items-center gap-1"><ShoppingBag size={14}/> Pickup OK</span> : <span className="text-muted-foreground line-through opacity-50 flex items-center gap-1"><ShoppingBag size={14}/> No Pickup</span>}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3 pt-2 pb-6">
                    <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={reset}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Re-roll
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-[2] rounded-xl font-bold shadow-lg shadow-primary/25" 
                      onClick={() => lockInMutation.mutate(result.top.id)}
                      disabled={lockInMutation.isPending}
                    >
                      {lockInMutation.isPending ? "Locking..." : <><Lock className="mr-2 h-4 w-4" /> Lock it in!</>}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Runners Up */}
              {result.runnersUp.length > 0 && (
                <div className="space-y-3 px-2">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-2">Runner Ups</h3>
                  {result.runnersUp.map(runner => (
                    <div key={runner.id} className="bg-card/50 border border-border/50 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold">{runner.name}</p>
                        <p className="text-xs text-muted-foreground">{runner.cuisine} • {runner.price}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                         {runner.familyRating} <Star className="w-3 h-3 fill-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
