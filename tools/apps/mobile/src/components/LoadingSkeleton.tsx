import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function LoadingSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.titleBar} />
          <View style={styles.summaryBar} />
          <View style={[styles.summaryBar, { width: "60%" }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  titleBar: {
    height: 18,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 10,
    width: "80%",
  },
  summaryBar: {
    height: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginBottom: 6,
  },
});
