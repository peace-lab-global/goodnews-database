import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface TopicChipProps {
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}

export function TopicChip({ label, color, isSelected, onPress }: TopicChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected
          ? { backgroundColor: color, borderColor: color }
          : { borderColor: "#e0e0e0" },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          isSelected ? { color: "#fff" } : { color: "#666" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
