import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/authStore";
import { useReadingStats } from "../../src/hooks/useNewsFeed";
import { supabase } from "../../src/lib/supabase";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const { data: stats } = useReadingStats(session?.user?.id);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function handleLanguageSwitch() {
    const newLang = i18n.language === "zh-CN" ? "en-US" : "zh-CN";
    i18n.changeLanguage(newLang);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session?.user?.email?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.email}>{session?.user?.email}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>{t("profile.readingStats")}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.read ?? 0}</Text>
            <Text style={styles.statLabel}>
              {isZh ? "篇已读" : "articles read"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.saved ?? 0}</Text>
            <Text style={styles.statLabel}>
              {isZh ? "篇收藏" : "saved"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="🔔"
          label={t("profile.dailyPush")}
          trailing="ON"
        />
        <MenuItem
          icon="🌐"
          label={t("profile.language")}
          trailing={i18n.language === "zh-CN" ? "中文" : "English"}
          onPress={handleLanguageSwitch}
        />
        <MenuItem icon="📋" label={t("profile.savedArticles")} trailing=">" />
        <MenuItem icon="📡" label={t("profile.dataSources")} trailing=">" />
        <MenuItem icon="ℹ️" label={t("profile.about")} trailing=">" />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>{t("auth.logout")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  trailing,
  onPress,
}: {
  icon: string;
  label: string;
  trailing: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuTrailing}>{trailing}</Text>
    </TouchableOpacity>
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#10B981",
  },
  statLabel: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#e8e8e8",
  },
  menuSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  menuTrailing: {
    fontSize: 14,
    color: "#999",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
