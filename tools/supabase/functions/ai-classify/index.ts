import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const ai = new OpenAI({
  baseURL: Deno.env.get("AI_API_BASE_URL") || "https://api.deepseek.com/v1",
  apiKey: Deno.env.get("AI_API_KEY")!,
});

const MODEL = Deno.env.get("AI_MODEL") || "deepseek-chat";

const CLASSIFY_PROMPT = `You are a news sentiment analyzer. You ONLY identify POSITIVE news.

Analyze the following news article and return a JSON object with:
{
  "sentiment_score": <float -1.0 to 1.0>,
  "sentiment_label": "<positive|neutral|negative>",
  "positivity_tier": <1|2|3|0>,
  "topics": [{"slug": "<topic-slug>", "relevance": <0-1>}],
  "is_positive": <boolean>
}

Rules for positivity_tier:
- 1 = Breakthrough, inspiring, game-changing
- 2 = Good progress, helpful development
- 3 = Mildly positive
- 0 = Not positive (neutral, negative, or just a product launch/funding round)

Only label as "positive" if the news represents genuine progress, breakthroughs, helpful developments, or inspiring stories.
Product launches alone are neutral. Funding rounds are neutral unless tied to clear positive impact.

Return ONLY the JSON object, no markdown, no explanation.`;

interface TopicDef {
  slug: string;
  name_en: string;
}

async function getTopics(): Promise<TopicDef[]> {
  const { data } = await supabase
    .from("topics")
    .select("slug, name_en")
    .eq("is_active", true);
  return data || [];
}

async function classifyArticle(article: {
  id: string;
  title: string;
  content_text: string | null;
  source_name: string;
}, topics: TopicDef[]) {
  const contentSnippet = (article.content_text || "").slice(0, 2000);
  const topicList = topics.map((t) => `${t.slug} (${t.name_en})`).join(", ");

  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: CLASSIFY_PROMPT },
      {
        role: "user",
        content: `Title: ${article.title}\nContent: ${contentSnippet}\nSource: ${article.source_name}\nAvailable topics: ${topicList}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty AI response");

  const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

Deno.serve(async (req) => {
  const { data: pendingArticles, error } = await supabase
    .from("news_articles")
    .select("id, title, content_text, source_name")
    .eq("sentiment_label", "pending")
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!pendingArticles || pendingArticles.length === 0) {
    return new Response(
      JSON.stringify({ success: true, processed: 0, published: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const topics = await getTopics();
  let processed = 0;
  let published = 0;

  for (const article of pendingArticles) {
    try {
      const result = await classifyArticle(article, topics);

      const isPublished = result.is_positive && result.sentiment_score >= 0.3;

      await supabase
        .from("news_articles")
        .update({
          sentiment_score: result.sentiment_score,
          sentiment_label: result.sentiment_label,
          positivity_tier: result.positivity_tier,
          is_published: isPublished,
          ai_processed_at: new Date().toISOString(),
          ai_model: MODEL,
        })
        .eq("id", article.id);

      if (isPublished && result.topics?.length > 0) {
        const topicInserts = result.topics
          .filter((t: { slug: string; relevance: number }) => {
            const valid = topics.find((td) => td.slug === t.slug);
            return valid && t.relevance > 0.3;
          })
          .map(async (t: { slug: string; relevance: number }) => {
            const topic = topics.find((td) => td.slug === t.slug);
            if (!topic) return;
            const { data: topicData } = await supabase
              .from("topics")
              .select("id")
              .eq("slug", t.slug)
              .single();
            if (topicData) {
              await supabase.from("article_topics").upsert({
                article_id: article.id,
                topic_id: topicData.id,
                relevance: t.relevance,
              });
            }
          });
        await Promise.allSettled(topicInserts);
      }

      if (isPublished) published++;
      processed++;
    } catch (err) {
      console.error(`Failed to classify article ${article.id}:`, err);
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed, published }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
