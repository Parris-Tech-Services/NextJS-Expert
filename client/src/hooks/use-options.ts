import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertOption, type Option } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useOptions() {
  return useQuery({
    queryKey: [api.options.list.path],
    queryFn: async () => {
      const res = await fetch(api.options.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch takeaway options");
      return api.options.list.responses[200].parse(await res.json());
    },
  });
}

export function useOption(id: number) {
  return useQuery({
    queryKey: [api.options.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.options.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch option");
      return api.options.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateOption() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertOption) => {
      const res = await fetch(api.options.create.path, {
        method: api.options.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.options.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create option");
      }
      return api.options.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.options.list.path] });
      toast({ title: "Added!", description: "New takeaway place added successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateOption() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertOption>) => {
      const url = buildUrl(api.options.update.path, { id });
      const res = await fetch(url, {
        method: api.options.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) throw new Error("Validation failed");
        if (res.status === 404) throw new Error("Option not found");
        throw new Error("Failed to update option");
      }
      return api.options.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.options.list.path] });
      toast({ title: "Updated!", description: "Changes saved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteOption() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.options.delete.path, { id });
      const res = await fetch(url, { method: api.options.delete.method, credentials: "include" });
      if (res.status === 404) throw new Error("Option not found");
      if (!res.ok) throw new Error("Failed to delete option");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.options.list.path] });
      toast({ title: "Deleted", description: "Takeaway option removed." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useLockInOption() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.options.lockIn.path, { id });
      const res = await fetch(url, { method: api.options.lockIn.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to lock in option");
      return api.options.lockIn.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.options.list.path] });
      // Invalidate history as well since locking in creates a history entry
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Locked In! 🔒",
        description: `Enjoy your ${data.name}! Don't forget, 15 min outside!`,
        className: "bg-primary text-primary-foreground border-none",
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
