import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type KutiStatus = Database["public"]["Enums"]["kuti_status"];
export type Kuti = Database["public"]["Tables"]["kutis"]["Row"];

export function useKutis() {
  return useQuery({
    queryKey: ["kutis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kutis")
        .select("*")
        .order("kuti_number");
      if (error) throw error;
      return data as Kuti[];
    },
  });
}

export function useUpdateKuti() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      status,
      notes,
    }: {
      id: string;
      name: string;
      status: KutiStatus;
      notes: string;
    }) => {
      const { data, error } = await supabase
        .from("kutis")
        .update({ name, status, notes })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, name, status, notes }) => {
      await queryClient.cancelQueries({ queryKey: ["kutis"] });
      const previous = queryClient.getQueryData<Kuti[]>(["kutis"]);
      queryClient.setQueryData<Kuti[]>(["kutis"], (old) =>
        (old ?? []).map((k) =>
          k.id === id
            ? { ...k, name, status, notes, updated_at: new Date().toISOString() }
            : k
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["kutis"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["kutis"] });
    },
  });
}

export function useSeedKutis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      kutis: { kuti_number: string; x_percent: number; y_percent: number }[]
    ) => {
      const { data, error } = await supabase
        .from("kutis")
        .upsert(kutis, { onConflict: "kuti_number" })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kutis"] });
    },
  });
}

export const STATUS_CONFIG: Record<
  KutiStatus,
  { label: string; labelTh: string; colorClass: string }
> = {
  available: {
    label: "Available",
    labelTh: "ว่าง",
    colorClass: "bg-status-available",
  },
  occupied: {
    label: "Occupied",
    labelTh: "มีผู้พัก",
    colorClass: "bg-status-occupied",
  },
  reserved: {
    label: "Reserved",
    labelTh: "จองแล้ว",
    colorClass: "bg-status-reserved",
  },
  maintenance: {
    label: "Maintenance",
    labelTh: "ซ่อมบำรุง",
    colorClass: "bg-status-maintenance",
  },
};
