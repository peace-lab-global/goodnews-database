import type { SupabaseClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function subscribeToNewArticles(
  supabase: SupabaseClient,
  onInsert: (payload: { new: Record<string, unknown> }) => void,
): RealtimeChannel {
  return supabase
    .channel("new-positive-articles")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "news_articles",
        filter: "is_published=eq.true",
      },
      onInsert,
    )
    .subscribe();
}
