import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToNewArticles } from "@goodnews/supabase-client";
import { supabase } from "../lib/supabase";

export function useRealtimeNews() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = subscribeToNewArticles(supabase, () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
