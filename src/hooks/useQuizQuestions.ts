import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuizQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId!)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!quizId,
  });
}
