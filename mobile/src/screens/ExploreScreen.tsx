import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchEvents } from "../api/events";
import { API_BASE_URL } from "../config";
import { AddToPlanModal } from "../components/AddToPlanModal";
import { CategoryDropdown } from "../components/CategoryDropdown";
import { EventCard } from "../components/EventCard";
import type { Event, EventCategory } from "../types/event";

export function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | undefined
  >();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [listBusy, setListBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planModalEvent, setPlanModalEvent] = useState<Event | null>(null);

  const isFirstLoad = useRef(true);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setError(null);
    const showFullScreenLoader = isFirstLoad.current;
    if (!showFullScreenLoader) {
      setListBusy(true);
    }
    try {
      const data = await fetchEvents(
        selectedCategory ? { category: selectedCategory } : {},
      );
      if (id !== requestId.current) return;
      setEvents(data);
    } catch {
      if (id !== requestId.current) return;
      setError("Could not load events. Pull to try again.");
    } finally {
      if (id !== requestId.current) return;
      if (showFullScreenLoader) {
        isFirstLoad.current = false;
        setLoading(false);
      }
      setListBusy(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centerBlock}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.muted}>Loading events…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        style={styles.list}
        data={events}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onAddToPlan={() => setPlanModalEvent(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHead}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <Text style={styles.sectionHint}>
              Pick a category from the list, then add events to your plan.
            </Text>
            <CategoryDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              disabled={listBusy}
            />
            {listBusy ? (
              <View style={styles.filterLoading}>
                <ActivityIndicator size="small" color="#0f766e" />
                <Text style={styles.filterLoadingText}>Updating…</Text>
              </View>
            ) : null}
            {error ? (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>{error}</Text>
                <Text style={styles.bannerApi}>API: {API_BASE_URL}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {selectedCategory
                  ? "No events in this category"
                  : "No events yet"}
              </Text>
              <Text style={styles.emptyText}>
                {selectedCategory
                  ? "Try “All categories” or another option in the dropdown."
                  : "When your team adds events on the web admin, they appear here."}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <AddToPlanModal
        visible={planModalEvent !== null}
        event={planModalEvent}
        onClose={() => setPlanModalEvent(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  listHead: {
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  filterLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterLoadingText: {
    fontSize: 13,
    color: "#6b7280",
  },
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  muted: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  banner: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 8,
  },
  bannerText: { color: "#991b1b", fontSize: 14, marginBottom: 4 },
  bannerApi: { fontSize: 12, color: "#7f1d1d" },
  empty: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
