import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuizAttempts(quizId: string | undefined, studentId: string | undefined) {
  return useQuery({
    queryKey: ["quiz-attempts", quizId, studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId!)
        .eq("student_id", studentId!)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!quizId && !!studentId,
  });
}
