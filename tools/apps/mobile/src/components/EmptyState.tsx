import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌱</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
});
