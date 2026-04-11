import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGradeLevels() {
  return useQuery({
    queryKey: ["grade-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grade_levels")
        .select("*")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
