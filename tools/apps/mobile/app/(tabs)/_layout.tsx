import React from "react";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: "#f0f0f0",
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: {
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          headerTitle: t("common.goodNews"),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>☀️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: t("tabs.topics"),
          headerTitle: t("tabs.topics"),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          headerTitle: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
