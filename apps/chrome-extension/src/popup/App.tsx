import React, { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  title_zh: string | null;
  summary_zh: string | null;
  source_name: string;
  published_at: string;
  positivity_tier: number;
}

const tierColors: Record<number, string> = {
  1: "#10B981",
  2: "#34D399",
  3: "#6EE7B7",
};
const tierLabels: Record<number, string> = {
  1: "极好",
  2: "好消息",
  3: "不错",
};

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["latestNews"], (result) => {
      setNews(result.latestNews || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>🌱</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>
          好消息
        </span>
      </div>

      <div style={{ maxHeight: 440, overflowY: "auto" }}>
        {news.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid #f5f5f5",
              cursor: "pointer",
            }}
            onClick={() => {
              chrome.tabs.create({
                url: `${import.meta.env.VITE_WEB_URL}/article/${item.id}`,
              });
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1a1a1a",
                lineHeight: 1.4,
              }}
            >
              {item.title_zh || item.title}
            </div>
            {item.summary_zh && (
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginTop: 4,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.summary_zh}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#999" }}>
                {item.source_name} ·{" "}
                {new Date(item.published_at).toLocaleDateString("zh-CN")}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor:
                    tierColors[item.positivity_tier] || tierColors[3],
                  padding: "2px 6px",
                  borderRadius: 8,
                }}
              >
                {tierLabels[item.positivity_tier] || tierLabels[3]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
