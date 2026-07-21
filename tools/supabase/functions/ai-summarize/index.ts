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

const SUMMARIZE_PROMPT = `You are a bilingual news summarizer. Generate concise summaries for positive news articles.

For Chinese summary: Write naturally in simplified Chinese, 2-3 sentences. Focus on:
- WHAT happened (what is the good news)
- WHY it matters (impact and significance)
- WHO benefits (who will find this exciting)

For English summary: Same structure, 2-3 sentences.

Also translate the title to natural Chinese if the original title is not in Chinese.

Return ONLY a JSON object:
{
  "summary_zh": "...",
  "summary_en": "...",
  "title_zh": "..."
}

No markdown, no explanation, just the JSON.`;

Deno.serve(async () => {
  const { data: articles, error } = await supabase
    .from("news_articles")
    .select("id, title, content_text, language")
    .eq("is_published", true)
    .is("summary_zh", null)
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!articles || articles.length === 0) {
    return new Response(
      JSON.stringify({ success: true, summarized: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  let summarized = 0;

  for (const article of articles) {
    try {
      const content = (article.content_text || article.title).slice(0, 3000);

      const response = await ai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SUMMARIZE_PROMPT },
          {
            role: "user",
            content: `Title: ${article.title}\nContent: ${content}\nLanguage: ${article.language}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (!text) continue;

      const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleaned);

      await supabase
        .from("news_articles")
        .update({
          summary_zh: result.summary_zh,
          summary_en: result.summary_en,
          title_zh: article.language === "zh" ? null : result.title_zh,
        })
        .eq("id", article.id);

      summarized++;
    } catch (err) {
      console.error(`Failed to summarize article ${article.id}:`, err);
    }
  }

  return new Response(
    JSON.stringify({ success: true, summarized }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
