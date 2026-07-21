import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

interface Topic {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  color: string;
}

export default function OptionsApp() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
    loadTopics();
  }, []);

  async function loadTopics() {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setTopics(data);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setLoggedIn(true);
      const { data: subs } = await supabase
        .from("user_topic_subscriptions")
        .select("topic_id");
      if (subs) setSubscribed(new Set(subs.map((s) => s.topic_id)));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setLoggedIn(false);
    setSubscribed(new Set());
  }

  async function toggleTopic(topicId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    if (subscribed.has(topicId)) {
      await supabase
        .from("user_topic_subscriptions")
        .delete()
        .eq("user_id", session.user.id)
        .eq("topic_id", topicId);
      setSubscribed((prev) => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    } else {
      await supabase.from("user_topic_subscriptions").insert({
        user_id: session.user.id,
        topic_id: topicId,
      });
      setSubscribed((prev) => new Set(prev).add(topicId));
    }
  }

  if (!loggedIn) {
    return (
      <div>
        <h1>🌱 Good News Settings</h1>
        <p>Please sign in to manage your topic preferences.</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "8px 12px", fontSize: 14, width: 250 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: "8px 12px", fontSize: 14, width: 250 }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "8px 24px",
              background: "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🌱 Good News Settings</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 16px",
            background: "#EF4444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Sign Out
        </button>
      </div>
      <h2 style={{ fontSize: 16, color: "#666" }}>Topic Subscriptions</h2>
      {topics.map((topic) => (
        <div key={topic.id} className="topic">
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: topic.color,
            }}
          />
          <span className="topic-name">{topic.name_zh}</span>
          <button
            className={`toggle ${subscribed.has(topic.id) ? "active" : ""}`}
            onClick={() => toggleTopic(topic.id)}
          />
        </div>
      ))}
    </div>
  );
}
