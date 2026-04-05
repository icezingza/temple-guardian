import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ActionType = "UPDATE" | "CLEAR";

export interface ActivityLog {
  id: string;
  kuti_id: string;
  kuti_number: string;
  action_type: ActionType;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  created_at: string;
}

export interface LogPayload {
  name: string;
  status: string;
  notes: string;
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
}

export function useInsertActivityLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: {
      kuti_id: string;
      kuti_number: string;
      action_type: ActionType;
      old_data: LogPayload;
      new_data: LogPayload;
    }) => {
      const { error } = await supabase.from("activity_logs").insert(log);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}
