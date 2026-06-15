import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { NewsCard } from "../../src/components/NewsCard";
import { TopicChip } from "../../src/components/TopicChip";
import { LoadingSkeleton } from "../../src/components/LoadingSkeleton";
import { EmptyState } from "../../src/components/EmptyState";
import { useNewsFeed, useTopics } from "../../src/hooks/useNewsFeed";
import { useRealtimeNews } from "../../src/hooks/useRealtimeNews";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith("zh");
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();

  const { data: topics } = useTopics();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useNewsFeed(selectedTopic);

  useRealtimeNews();

  const articles = data?.pages.flat() ?? [];

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof articles)[0]; index: number }) => {
      return (
        <NewsCard
          id={item.id}
          title={item.title}
          titleZh={item.title_zh}
          summaryZh={item.summary_zh}
          imageUrl={item.image_url}
          sourceName={item.source_name}
          publishedAt={item.published_at}
          positivityTier={item.positivity_tier}
          variant={index === 0 ? "hero" : "compact"}
        />
      );
    },
    [],
  );

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        <TopicChip
          label={t("feed.allTopics")}
          color="#10B981"
          isSelected={!selectedTopic}
          onPress={() => setSelectedTopic(undefined)}
        />
        {topics?.map((topic) => (
          <TopicChip
            key={topic.id}
            label={isZh ? topic.name_zh : topic.name_en}
            color={topic.color}
            isSelected={selectedTopic === topic.slug}
            onPress={() =>
              setSelectedTopic(
                selectedTopic === topic.slug ? undefined : topic.slug,
              )
            }
          />
        ))}
      </ScrollView>

      {articles.length === 0 ? (
        <EmptyState
          title={t("feed.todayGoodNews")}
          subtitle={t("common.loading")}
        />
      ) : (
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching ?? false}
              onRefresh={refetch}
              tintColor="#10B981"
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={styles.footer}
                color="#10B981"
                size="small"
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  chipsScroll: {
    maxHeight: 52,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  footer: {
    paddingVertical: 16,
  },
});
