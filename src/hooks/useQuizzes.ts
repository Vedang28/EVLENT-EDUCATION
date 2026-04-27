import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuizzes(courseId: string | undefined) {
  return useQuery({
    queryKey: ["quizzes", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!courseId,
  });
}
