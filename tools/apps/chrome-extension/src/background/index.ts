import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ALARM_NAME = "fetch-news";

chrome.alarms.create(ALARM_NAME, { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await fetchLatestNews();
  }
});

async function fetchLatestNews() {
  const { data, error } = await supabase
    .from("news_articles")
    .select("id, title, title_zh, summary_zh, source_name, published_at, positivity_tier")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(20);

  if (!error && data) {
    await chrome.storage.local.set({
      latestNews: data,
      lastFetched: new Date().toISOString(),
    });

    await chrome.action.setBadgeText({ text: String(data.length) });
    await chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
  }
}

fetchLatestNews();
