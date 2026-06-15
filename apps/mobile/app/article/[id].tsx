import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { buildArticleDetailQuery } from "@goodnews/supabase-client";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/stores/authStore";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith("zh");
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const [showWebView, setShowWebView] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const { data, error } = await buildArticleDetailQuery(supabase, id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  async function toggleSave() {
    if (!session?.user?.id || !id) return;

    if (isSaved) {
      await supabase
        .from("user_saved_articles")
        .delete()
        .eq("user_id", session.user.id)
        .eq("article_id", id);
    } else {
      await supabase.from("user_saved_articles").insert({
        user_id: session.user.id,
        article_id: id,
      });
    }
    setIsSaved(!isSaved);
  }

  function markAsRead() {
    if (session?.user?.id && id) {
      supabase.from("user_read_history").upsert(
        {
          user_id: session.user.id,
          article_id: id,
        },
        { onConflict: "user_id,article_id" },
      );
    }
  }

  React.useEffect(() => {
    markAsRead();
  }, [id]);

  if (isLoading || !article) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  const displayTitle = isZh && article.title_zh ? article.title_zh : article.title;
  const summary = isZh ? article.summary_zh : article.summary_en;
  const topics = article.article_topics?.map((at) => at.topics) ?? [];

  if (showWebView) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TouchableOpacity
          style={styles.webViewBack}
          onPress={() => setShowWebView(false)}
        >
          <Text style={styles.backText}>← {t("common.back")}</Text>
        </TouchableOpacity>
        <WebView source={{ uri: article.source_url }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← {t("common.back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSave}>
          <Text style={styles.saveIcon}>{isSaved ? "🔖" : "🏷️"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {article.image_url && (
          <Image
            source={{ uri: article.image_url }}
            style={styles.heroImage}
            contentFit="cover"
          />
        )}

        <Text style={styles.title}>{displayTitle}</Text>

        <Text style={styles.meta}>
          {article.source_name} ·{" "}
          {new Date(article.published_at).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
        </Text>

        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t("feed.aiSummary")}</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {topics.length > 0 && (
          <View style={styles.topicsSection}>
            <Text style={styles.sectionTitle}>{t("feed.relatedTopics")}</Text>
            <View style={styles.topicsRow}>
              {topics.map((topic) => (
                <View
                  key={topic.slug}
                  style={[styles.topicTag, { borderColor: topic.color }]}
                >
                  <Text style={[styles.topicText, { color: topic.color }]}>
                    {isZh ? topic.name_zh : topic.name_en}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.readOriginalButton}
          onPress={() => setShowWebView(true)}
        >
          <Text style={styles.readOriginalText}>{t("feed.readOriginal")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
  },
  saveIcon: {
    fontSize: 22,
  },
  webViewBack: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    lineHeight: 34,
  },
  meta: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
  },
  topicsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  topicsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topicTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  topicText: {
    fontSize: 13,
    fontWeight: "600",
  },
  readOriginalButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  readOriginalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
