import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const DUMMY_ABOUT =
  "Discover Edinburgh and build trip plans. This mobile app is a companion to the web experience. Version 1.0 (demo copy — replace with real marketing text later).";

const DUMMY_LICENSE =
  "Copyright © All rights reserved.\n\nThis is placeholder license text for development. Your legal team can drop in MIT, proprietary, or other terms here.";

function initials(first?: string | null, last?: string | null): string {
  const a = (first?.[0] ?? "").toUpperCase();
  const b = (last?.[0] ?? "").toUpperCase();
  const s = `${a}${b}`.trim();
  return s || "?";
}

export function SettingsScreen() {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Log out", "You will need to sign in again to use the app.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => void logout(),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Settings</Text>
      <Text style={styles.pageHint}>
        Profile uses your account. Other sections are placeholders for now.
      </Text>

      <Text style={styles.sectionHeading}>Profile</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(user?.first_name, user?.last_name)}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>
            Role: {user?.role === "admin" ? "Admin" : "User"}
          </Text>
        </View>
        <Text style={styles.profileNote}>
          Editing profile on mobile is not available yet — use the website if you
          need to change your details.
        </Text>
      </View>

      <Text style={styles.sectionHeading}>About</Text>
      <View style={styles.card}>
        <Text style={styles.bodyText}>{DUMMY_ABOUT}</Text>
      </View>

      <Text style={styles.sectionHeading}>License</Text>
      <View style={styles.card}>
        <Text style={styles.bodyText}>{DUMMY_LICENSE}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && styles.logoutBtnPressed,
        ]}
        onPress={confirmLogout}
      >
        <Text style={styles.logoutBtnText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  pageHint: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  rolePill: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  profileNote: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 18,
  },
  bodyText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  logoutBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  logoutBtnPressed: {
    opacity: 0.9,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b91c1c",
  },
});
