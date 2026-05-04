import { useState } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { CalendarScreen } from "./CalendarScreen";
import { ExploreScreen } from "./ExploreScreen";
import { PlanScreen } from "./PlanScreen";
import { SettingsScreen } from "./SettingsScreen";

type Tab = "main" | "plan" | "calendar" | "settings";

export function MainAppScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("main");

  const topInset =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 52;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <View style={styles.headerRow}>
          <Text
            style={styles.greetRight}
            numberOfLines={1}
            ellipsizeMode="tail"
            accessibilityRole="header"
          >
            Hi,{" "}
            <Text style={styles.greetName}>
              {user?.first_name?.trim() || "there"}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {tab === "main" ? <ExploreScreen /> : null}
        {tab === "plan" ? <PlanScreen /> : null}
        {tab === "calendar" ? <CalendarScreen /> : null}
        {tab === "settings" ? <SettingsScreen /> : null}
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, tab === "main" && styles.tabActive]}
          onPress={() => setTab("main")}
        >
          <Text
            style={[styles.tabIcon, tab === "main" && styles.tabIconActive]}
          >
            ⌂
          </Text>
          <Text
            style={[styles.tabLabel, tab === "main" && styles.tabLabelActive]}
          >
            Main
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "plan" && styles.tabActive]}
          onPress={() => setTab("plan")}
        >
          <Text
            style={[styles.tabIcon, tab === "plan" && styles.tabIconActive]}
          >
            ☰
          </Text>
          <Text
            style={[styles.tabLabel, tab === "plan" && styles.tabLabelActive]}
          >
            My plan
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "calendar" && styles.tabActive]}
          onPress={() => setTab("calendar")}
        >
          <Text
            style={[styles.tabIcon, tab === "calendar" && styles.tabIconActive]}
          >
            ▦
          </Text>
          <Text
            style={[
              styles.tabLabel,
              tab === "calendar" && styles.tabLabelActive,
            ]}
          >
            Calendar
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "settings" && styles.tabActive]}
          onPress={() => setTab("settings")}
        >
          <Text
            style={[styles.tabIcon, tab === "settings" && styles.tabIconActive]}
          >
            ⚙
          </Text>
          <Text
            style={[
              styles.tabLabel,
              tab === "settings" && styles.tabLabelActive,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Settings
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  greetRight: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "right",
  },
  greetName: {
    color: "#111827",
    fontWeight: "600",
  },
  body: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingBottom: Platform.OS === "ios" ? 22 : 12,
    paddingTop: 8,
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 2,
    minWidth: 0,
  },
  tabActive: {
    backgroundColor: "#f0fdfa",
  },
  tabIcon: {
    fontSize: 17,
    marginBottom: 2,
    color: "#9ca3af",
  },
  tabIconActive: {
    color: "#0f766e",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#0f766e",
  },
});
