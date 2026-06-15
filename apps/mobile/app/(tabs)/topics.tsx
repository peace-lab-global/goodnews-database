import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTopics, useUserSubscriptions } from "../../src/hooks/useNewsFeed";
import { useAuthStore } from "../../src/stores/authStore";
import { supabase } from "../../src/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

interface TopicItem {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  color: string;
  is_default: boolean;
}

export default function TopicsScreen() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith("zh");
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useTopics();
  const { data: subscriptions } = useUserSubscriptions(session?.user?.id);

  const subscribedIds = new Set(subscriptions?.map((s) => s.topic_id) ?? []);

  async function toggleSubscription(topicId: string, isSubscribed: boolean) {
    if (!session?.user?.id) return;

    if (isSubscribed) {
      await supabase
        .from("user_topic_subscriptions")
        .delete()
        .eq("user_id", session.user.id)
        .eq("topic_id", topicId);
    } else {
      await supabase.from("user_topic_subscriptions").insert({
        user_id: session.user.id,
        topic_id: topicId,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  const myTopics = topics?.filter((t) => subscribedIds.has(t.id)) ?? [];
  const recommendedTopics =
    topics?.filter((t) => !subscribedIds.has(t.id)) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {myTopics.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t("topics.myTopics")}</Text>
          <View style={styles.grid}>
            {myTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isSubscribed={true}
                isZh={isZh}
                onToggle={() => toggleSubscription(topic.id, true)}
                subscribeLabel={t("topics.unsubscribe")}
              />
            ))}
          </View>
        </>
      )}

      {recommendedTopics.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            {t("topics.recommendedTopics")}
          </Text>
          <View style={styles.grid}>
            {recommendedTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isSubscribed={false}
                isZh={isZh}
                onToggle={() => toggleSubscription(topic.id, false)}
                subscribeLabel={t("topics.subscribe")}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function TopicCard({
  topic,
  isSubscribed,
  isZh,
  onToggle,
  subscribeLabel,
}: {
  topic: TopicItem;
  isSubscribed: boolean;
  isZh: boolean;
  onToggle: () => void;
  subscribeLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={[styles.colorDot, { backgroundColor: topic.color }]} />
      <Text style={styles.cardTitle}>
        {isZh ? topic.name_zh : topic.name_en}
      </Text>
      <TouchableOpacity
        style={[
          styles.subscribeButton,
          isSubscribed && styles.subscribedButton,
        ]}
        onPress={onToggle}
      >
        <Text
          style={[
            styles.subscribeText,
            isSubscribed && styles.subscribedText,
          ]}
        >
          {isSubscribed ? t("topics.subscribed") : subscribeLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },
  subscribeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#10B981",
  },
  subscribedButton: {
    backgroundColor: "#f0f0f0",
  },
  subscribeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  subscribedText: {
    color: "#999",
  },
});
