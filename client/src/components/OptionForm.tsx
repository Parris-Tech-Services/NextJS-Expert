import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOptionSchema, type InsertOption, type Option } from "@shared/schema";
import { useCreateOption, useUpdateOption } from "@/hooks/use-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DialogFooter } from "@/components/ui/dialog";

// Schema refinement for coerce
const formSchema = insertOptionSchema.extend({
  kidFriendly: z.coerce.number().min(1).max(5),
  healthyScore: z.coerce.number().min(1).max(5),
  familyRating: z.coerce.number().min(1).max(5),
});

type FormData = z.infer<typeof formSchema>;

interface OptionFormProps {
  option?: Option;
  onSuccess?: () => void;
}

export function OptionForm({ option, onSuccess }: OptionFormProps) {
  const createMutation = useCreateOption();
  const updateMutation = useUpdateOption();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: option
      ? {
          ...option,
          dairyFreeNotes: option.dairyFreeNotes || "",
          notes: option.notes || "",
        }
      : {
          name: "",
          cuisine: "",
          price: "$$",
          kidFriendly: 3,
          dairyFree: false,
          dairyFreeNotes: "",
          healthyScore: 3,
          fatCaution: "medium",
          delivery: true,
          pickup: true,
          notes: "",
          familyRating: 3,
        },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormData) {
    if (option) {
      updateMutation.mutate(
        { id: option.id, ...values },
        { onSuccess }
      );
    } else {
      createMutation.mutate(values, { onSuccess });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Luigi's Pizza" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cuisine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine / Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Italian, Pizza, Pasta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="$">$ (Cheap)</SelectItem>
                      <SelectItem value="$$">$$ (Moderate)</SelectItem>
                      <SelectItem value="$$$">$$$ (Pricey)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Logistics Switches */}
          <div className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <FormField
              control={form.control}
              name="delivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg flex-1">
                  <div className="space-y-0.5 mr-2">
                    <FormLabel className="text-sm">Delivery</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="w-px bg-border/50 h-8 self-center" />
            <FormField
              control={form.control}
              name="pickup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg flex-1">
                  <div className="space-y-0.5 mr-2">
                    <FormLabel className="text-sm">Pickup</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Sliders Section */}
          <div className="space-y-4 rounded-xl border p-4 bg-card shadow-sm">
            <FormField
              control={form.control}
              name="kidFriendly"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between mb-2">
                    <FormLabel>Kid Friendly</FormLabel>
                    <span className="text-xs text-muted-foreground font-mono">{field.value}/5</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthyScore"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between mb-2">
                    <FormLabel>Healthy Score</FormLabel>
                    <span className="text-xs text-muted-foreground font-mono">{field.value}/5</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="familyRating"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between mb-2">
                    <FormLabel>Overall Family Rating</FormLabel>
                    <span className="text-xs text-muted-foreground font-mono">{field.value}/5</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Dietary Details */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="dairyFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                  <div className="space-y-0.5">
                    <FormLabel>Dairy Free Options?</FormLabel>
                    <FormDescription>Can we eat here safely?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("dairyFree") && (
              <FormField
                control={form.control}
                name="dairyFreeNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="What do we usually order?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="fatCaution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fat Content Caution</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select caution level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low (Safe)</SelectItem>
                      <SelectItem value="medium">Medium (Watch it)</SelectItem>
                      <SelectItem value="high">High (Greasy!)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any other details..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Saving..." : option ? "Save Changes" : "Add Place"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
