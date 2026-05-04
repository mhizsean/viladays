import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchItineraries, removeItineraryItem } from "../api/itinerary";
import { formatTimeRange } from "../theme/eventCategory";
import type { Itinerary, ItineraryItem } from "../types/itinerary";
import { AddToPlanModal } from "../components/AddToPlanModal";

function groupItemsByDay(
  items: ItineraryItem[],
): Record<number, ItineraryItem[]> {
  return items.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
    const day = item.day_index;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PlanScreen() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [customTripId, setCustomTripId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const data = await fetchItineraries();
      setItineraries(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const onRemove = (itineraryId: number, itemId: number, title: string) => {
    Alert.alert(
      "Remove from trip",
      `Remove "${title}" from this day?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setRemovingId(itemId);
            void (async () => {
              try {
                await removeItineraryItem(itineraryId, itemId);
                await load();
              } catch {
                Alert.alert("Error", "Could not remove item.");
              } finally {
                setRemovingId(null);
              }
            })();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerBlock}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.muted}>Loading your trips…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBlock}>
        <Text style={styles.errorText}>Could not load your trips.</Text>
        <Pressable style={styles.retry} onPress={() => void load()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (itineraries.length === 0) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.emptyWrap}
      >
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptyText}>
          Go to Explore, pick an event, and tap "Add to trip" to build your itinerary.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      {itineraries.map((itinerary) => {
        const byDay = groupItemsByDay(itinerary.items);
        const sortedDays = Object.keys(byDay)
          .map(Number)
          .sort((a, b) => a - b);
        return (
          <View key={itinerary.id} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{itinerary.name}</Text>
                <Text style={styles.cardDates}>
                  {formatShortDate(itinerary.start_date)} →{" "}
                  {formatShortDate(itinerary.end_date)}
                </Text>
              </View>
              <View style={styles.cardHeadRight}>
                <Text style={styles.count}>
                  {itinerary.items.length}{" "}
                  {itinerary.items.length === 1 ? "event" : "events"}
                </Text>
                <Pressable
                  style={styles.customBtn}
                  onPress={() => setCustomTripId(itinerary.id)}
                >
                  <Text style={styles.customBtnText}>+ Custom</Text>
                </Pressable>
              </View>
            </View>

            {itinerary.items.length === 0 ? (
              <Text style={styles.noItems}>No events added yet</Text>
            ) : null}

            {sortedDays.map((day) => (
              <View key={day}>
                <View style={styles.dayBar}>
                  <Text style={styles.dayLabel}>Day {day}</Text>
                </View>
                {byDay[day].map((item) => {
                  const isCustom = !item.event_id;
                  const title = isCustom ? item.custom_title : item.event?.title;
                  const location = isCustom ? item.custom_location : item.event?.location;
                  const startTime = isCustom ? item.custom_start_time : item.event?.start_datetime;
                  const endTime = isCustom ? item.custom_end_time : item.event?.end_datetime;

                  return (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemIcon}>
                        <Text>{isCustom ? "✏️" : "📍"}</Text>
                      </View>
                      <View style={styles.itemBody}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                          {isCustom && (
                            <View style={styles.customBadge}>
                              <Text style={styles.customBadgeText}>custom</Text>
                            </View>
                          )}
                        </View>
                        {location ? (
                          <Text style={styles.itemMeta} numberOfLines={1}>{location}</Text>
                        ) : null}
                        {startTime && endTime ? (
                          <Text style={styles.itemTime}>
                            {formatTimeRange(startTime, endTime)}
                          </Text>
                        ) : null}
                        {item.custom_notes ? (
                          <Text style={styles.itemNotes} numberOfLines={2}>
                            "{item.custom_notes}"
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        style={styles.removeBtn}
                        disabled={removingId === item.id}
                        onPress={() =>
                          onRemove(itinerary.id, item.id, title ?? "event")
                        }
                      >
                        <Text style={styles.removeBtnText}>
                          {removingId === item.id ? "…" : "Remove"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        );
      })}

      {/* Custom event modal — opened from trip card */}
      {customTripId !== null && (() => {
        const trip = itineraries.find(t => t.id === customTripId);
        return (
          <AddToPlanModal
            visible
            event={null}
            mode="custom"
            preselectedTripId={customTripId}
            tripStartDate={trip?.start_date}
            tripEndDate={trip?.end_date}
            onClose={() => {
              setCustomTripId(null);
              setLoading(true);
              void load();
            }}
          />
        );
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  centerBlock: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#f3f4f6", padding: 24,
  },
  muted: { marginTop: 12, fontSize: 14, color: "#6b7280" },
  errorText: { fontSize: 16, color: "#b91c1c", textAlign: "center", marginBottom: 16 },
  retry: { backgroundColor: "#0f766e", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  emptyWrap: { flexGrow: 1, justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#111827", marginBottom: 8 },
  emptyText: { fontSize: 15, color: "#6b7280", lineHeight: 22 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#e5e7eb", overflow: "hidden",
  },
  cardHead: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", padding: 16,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  cardHeadRight: { alignItems: "flex-end", gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#111827" },
  cardDates: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  count: { fontSize: 12, color: "#9ca3af" },
  customBtn: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  customBtnText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  noItems: { textAlign: "center", color: "#9ca3af", paddingVertical: 20, fontSize: 14 },
  dayBar: {
    backgroundColor: "#f9fafb", paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  dayLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  itemRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f9fafb",
  },
  itemIcon: {
    width: 40, height: 40, borderRadius: 8, backgroundColor: "#f3f4f6",
    alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 2,
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  itemTitle: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1 },
  customBadge: {
    backgroundColor: "#f3f4f6", borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  customBadgeText: { fontSize: 10, color: "#6b7280", fontWeight: "600" },
  itemMeta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  itemTime: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  itemNotes: { fontSize: 12, color: "#6b7280", fontStyle: "italic", marginTop: 4 },
  removeBtn: {
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8,
    borderWidth: 1, borderColor: "#fecaca", backgroundColor: "#fef2f2", marginLeft: 8,
  },
  removeBtnText: { fontSize: 12, fontWeight: "600", color: "#b91c1c" },
});
