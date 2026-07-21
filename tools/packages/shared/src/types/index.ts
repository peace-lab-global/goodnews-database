export interface Topic {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  description_zh: string | null;
  description_en: string | null;
  icon_url: string | null;
  color: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface NewsArticle {
  id: string;
  source_id: string | null;
  source_url: string;
  source_name: string;
  guid: string;
  title: string;
  title_zh: string | null;
  summary_zh: string | null;
  summary_en: string | null;
  content_text: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string;
  language: string;
  sentiment_score: number;
  sentiment_label: "positive" | "neutral" | "negative" | "pending";
  positivity_tier: number;
  is_published: boolean;
  ai_processed_at: string | null;
  ai_model: string | null;
  quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleTopic {
  article_id: string;
  topic_id: string;
  relevance: number;
}

export interface Profile {
  id: string;
  username: string | null;
  nickname: string | null;
  avatar_url: string | null;
  locale: string;
  platform: string;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RssSource {
  id: string;
  name: string;
  url: string;
  site_url: string | null;
  language: string;
  category: string | null;
  fetch_interval_minutes: number;
  is_active: boolean;
  last_fetched_at: string | null;
  error_count: number;
  last_error: string | null;
  created_at: string;
}

export interface UserTopicSubscription {
  user_id: string;
  topic_id: string;
  sort_order: number;
  created_at: string;
}

export interface UserSavedArticle {
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface UserReadHistory {
  user_id: string;
  article_id: string;
  read_at: string;
}

export interface ArticleWithTopics extends NewsArticle {
  article_topics: (ArticleTopic & { topics: Topic })[];
}

export type Locale = "zh-CN" | "en-US";

export type SentimentLabel = "positive" | "neutral" | "negative" | "pending";

export type PositivityTier = 0 | 1 | 2 | 3;

export interface AIClassifyResult {
  sentiment_score: number;
  sentiment_label: SentimentLabel;
  positivity_tier: PositivityTier;
  topics: { slug: string; relevance: number }[];
  is_positive: boolean;
}

export interface AISummarizeResult {
  summary_zh: string;
  summary_en: string;
  title_zh: string;
}
