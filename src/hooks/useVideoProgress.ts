import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useCallback } from "react";

export function useVideoProgress(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: savedPosition } = useQuery({
    queryKey: ["video-progress", lessonId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("video_progress" as any)
        .select("position_seconds, duration_seconds")
        .eq("student_id", user!.id)
        .eq("lesson_id", lessonId!)
        .maybeSingle();
      return data as { position_seconds: number; duration_seconds: number } | null;
    },
    enabled: !!lessonId && !!user,
    staleTime: 60_000,
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ position, duration }: { position: number; duration: number }) => {
      const { error } = await supabase.from("video_progress" as any).upsert(
        {
          student_id: user!.id,
          lesson_id: lessonId!,
          position_seconds: Math.floor(position),
          duration_seconds: Math.floor(duration),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id,lesson_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-progress", lessonId, user?.id] });
    },
  });

  const updatePosition = useCallback(
    (position: number, duration: number) => {
      if (!lessonId || !user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        upsertMutation.mutate({ position, duration });
      }, 5000);
    },
    [lessonId, user, upsertMutation]
  );

  const saveImmediately = useCallback(
    (position: number, duration: number) => {
      if (!lessonId || !user) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      upsertMutation.mutate({ position, duration });
    },
    [lessonId, user, upsertMutation]
  );

  return {
    savedPosition: savedPosition?.position_seconds ?? 0,
    savedDuration: savedPosition?.duration_seconds ?? 0,
    updatePosition,
    saveImmediately,
  };
}
