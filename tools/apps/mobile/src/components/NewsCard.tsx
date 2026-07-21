import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

interface NewsCardProps {
  id: string;
  title: string;
  titleZh: string | null;
  summaryZh: string | null;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string;
  positivityTier: number;
  variant?: "hero" | "compact";
}

function SentimentBadge({ tier }: { tier: number }) {
  const { t } = useTranslation();
  const labels: Record<number, string> = {
    1: t("sentiment.great"),
    2: t("sentiment.good"),
    3: t("sentiment.mild"),
  };
  const colors: Record<number, string> = {
    1: "#10B981",
    2: "#34D399",
    3: "#6EE7B7",
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[tier] || colors[3] }]}>
      <Text style={styles.badgeText}>{labels[tier] || labels[3]}</Text>
    </View>
  );
}

export function NewsCard({
  id,
  title,
  titleZh,
  summaryZh,
  imageUrl,
  sourceName,
  publishedAt,
  positivityTier,
  variant = "compact",
}: NewsCardProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith("zh");

  const displayTitle = isZh && titleZh ? titleZh : title;
  const displaySummary = isZh ? summaryZh : null;
  const timeAgo = dayjs(publishedAt).locale(isZh ? "zh-cn" : "en").fromNow();

  if (variant === "hero" && imageUrl) {
    return (
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/article/${id}`)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {displayTitle}
          </Text>
          {displaySummary && (
            <Text style={styles.heroSummary} numberOfLines={2}>
              {displaySummary}
            </Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {sourceName} · {timeAgo}
            </Text>
            <SentimentBadge tier={positivityTier} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.compactCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/article/${id}`)}
    >
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {displayTitle}
        </Text>
        {displaySummary && (
          <Text style={styles.compactSummary} numberOfLines={2}>
            {displaySummary}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {sourceName} · {timeAgo}
          </Text>
          <SentimentBadge tier={positivityTier} />
        </View>
      </View>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.compactImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    width: "100%",
    height: 200,
  },
  heroContent: {
    padding: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: 26,
  },
  heroSummary: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#999",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  compactCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  compactContent: {
    flex: 1,
    marginRight: 12,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 22,
  },
  compactSummary: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginTop: 4,
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});
