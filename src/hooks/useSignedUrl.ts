import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSignedUrl(bucket = "submissions") {
  const [isLoading, setIsLoading] = useState(false);

  const getSignedUrl = useCallback(
    async (path: string): Promise<string | null> => {
      if (!path) return null;
      setIsLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600);
        if (error) throw error;
        return data.signedUrl;
      } catch {
        toast.error("Failed to generate download link. Please try again.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [bucket]
  );

  const downloadFile = useCallback(
    async (path: string, filename?: string) => {
      const url = await getSignedUrl(path);
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || path.split("/").pop() || "download";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [getSignedUrl]
  );

  return { getSignedUrl, downloadFile, isLoading };
}
