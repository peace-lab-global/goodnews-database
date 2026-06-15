import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "GoodNews/1.0 RSS Reader",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

interface FeedItem {
  title: string;
  link: string;
  guid?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
  isoDate?: string;
  enclosure?: { url: string };
}

async function extractFullText(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "GoodNews/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await resp.text();
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, aside, .ad, .sidebar").remove();

    const article =
      $("article").text() ||
      $('[role="main"]').text() ||
      $(".post-content").text() ||
      $(".article-body").text() ||
      $("main").text();

    return article?.trim().slice(0, 5000) || null;
  } catch {
    return null;
  }
}

async function processSource(source: {
  id: string;
  name: string;
  url: string;
  language: string;
}) {
  let feed;
  try {
    feed = await parser.parseURL(source.url);
  } catch (err) {
    const { data: current } = await supabase
      .from("rss_sources")
      .select("error_count")
      .eq("id", source.id)
      .single();

    await supabase
      .from("rss_sources")
      .update({
        error_count: (current?.error_count ?? 0) + 1,
        last_error: String(err),
        last_fetched_at: new Date().toISOString(),
      })
      .eq("id", source.id);
    return [];
  }

  const items = (feed.items || []) as FeedItem[];
  const articles: Array<{
    source_id: string;
    source_url: string;
    source_name: string;
    guid: string;
    title: string;
    content_text: string | null;
    image_url: string | null;
    author: string | null;
    published_at: string;
    language: string;
  }> = [];

  for (const item of items.slice(0, 10)) {
    if (!item.title || !item.link) continue;

    const guid = item.guid || item.link;

    const { count } = await supabase
      .from("news_articles")
      .select("id", { count: "exact", head: true })
      .eq("guid", guid);

    if (count && count > 0) continue;

    const contentText =
      item.content || item.contentSnippet || null;

    let fullText: string | null = null;
    if (!contentText || contentText.length < 200) {
      fullText = await extractFullText(item.link);
    }

    articles.push({
      source_id: source.id,
      source_url: item.link,
      source_name: source.name,
      guid,
      title: item.title,
      content_text: fullText || contentText || null,
      image_url: item.enclosure?.url || null,
      author: item.creator || null,
      published_at: item.isoDate || new Date().toISOString(),
      language: source.language,
    });
  }

  if (articles.length > 0) {
    const { error } = await supabase
      .from("news_articles")
      .upsert(articles, { onConflict: "guid" });

    if (error) {
      console.error(`Insert error for ${source.name}:`, error.message);
    }
  }

  await supabase
    .from("rss_sources")
    .update({
      last_fetched_at: new Date().toISOString(),
      error_count: 0,
      last_error: null,
    })
    .eq("id", source.id);

  return articles;
}

Deno.serve(async (req) => {
  const { data: sources, error: srcError } = await supabase
    .from("rss_sources")
    .select("id, name, url, language")
    .eq("is_active", true);

  if (srcError) {
    return new Response(JSON.stringify({ error: srcError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results = await Promise.allSettled(
    (sources || []).map((s) => processSource(s)),
  );

  const totalNew = results.reduce((sum, r) => {
    if (r.status === "fulfilled") return sum + r.value.length;
    return sum;
  }, 0);

  const failed = results.filter((r) => r.status === "rejected").length;

  return new Response(
    JSON.stringify({
      success: true,
      sources_processed: sources?.length || 0,
      articles_inserted: totalNew,
      sources_failed: failed,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
