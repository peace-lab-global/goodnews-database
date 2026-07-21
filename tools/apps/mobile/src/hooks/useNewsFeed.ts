import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { FEED_PAGE_SIZE } from "@goodnews/shared";
import { supabase } from "../lib/supabase";
import { buildFeedQuery, buildTopicsQuery } from "@goodnews/supabase-client";

export function useNewsFeed(topicSlug?: string) {
  return useInfiniteQuery({
    queryKey: ["news", topicSlug ?? "all"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await buildFeedQuery(
        supabase,
        topicSlug,
        pageParam,
      );
      if (error) throw error;
      return data;
    },
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
      if (!_lastPage || _lastPage.length < FEED_PAGE_SIZE) return undefined;
      return lastPageParam + 1;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await buildTopicsQuery(supabase);
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useUserSubscriptions(userId: string | undefined) {
  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_topic_subscriptions")
        .select("topic_id, topics(slug, name_zh, name_en, color)")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useReadingStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["reading-stats", userId],
    queryFn: async () => {
      if (!userId) return { read: 0, saved: 0 };
      const [{ count: readCount }, { count: savedCount }] = await Promise.all([
        supabase
          .from("user_read_history")
          .select("article_id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("user_saved_articles")
          .select("article_id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);
      return { read: readCount || 0, saved: savedCount || 0 };
    },
    enabled: !!userId,
  });
}
