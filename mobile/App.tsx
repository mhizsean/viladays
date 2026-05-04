import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { MainAppScreen } from "./src/screens/MainAppScreen";
import { LoginScreen } from "./src/screens/LoginScreen";

function Root() {
  const { ready, token, user, userLoading } = useAuth();

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>Starting…</Text>
      </View>
    );
  }

  if (token && userLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>Loading your account…</Text>
      </View>
    );
  }

  if (!token || !user) {
    return <LoginScreen />;
  }

  return <MainAppScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6b7280",
  },
});
