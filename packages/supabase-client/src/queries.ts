import type { SupabaseClient } from "./client";
import { FEED_PAGE_SIZE } from "@goodnews/shared";

export function buildFeedQuery(
  supabase: SupabaseClient,
  topicSlug?: string,
  page: number = 0,
) {
  let query = supabase
    .from("news_articles")
    .select(
      `*,
      article_topics(
        topic_id,
        relevance,
        topics(slug, name_zh, name_en, color)
      )`,
    )
    .eq("is_published", true)
    .order("positivity_tier", { ascending: true })
    .order("published_at", { ascending: false })
    .range(page * FEED_PAGE_SIZE, (page + 1) * FEED_PAGE_SIZE - 1);

  if (topicSlug) {
    query = query.eq("article_topics.topics.slug", topicSlug);
  }

  return query;
}

export function buildArticleDetailQuery(
  supabase: SupabaseClient,
  articleId: string,
) {
  return supabase
    .from("news_articles")
    .select(
      `*,
      article_topics(
        topic_id,
        relevance,
        topics(slug, name_zh, name_en, color)
      ),
      rss_sources(name, site_url)`,
    )
    .eq("id", articleId)
    .eq("is_published", true)
    .single();
}

export function buildTopicsQuery(supabase: SupabaseClient) {
  return supabase
    .from("topics")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
}
