import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchEvents } from "../api/events";
import { AddToPlanModal } from "../components/AddToPlanModal";
import { CATEGORY_STYLE, formatEventWhen } from "../theme/eventCategory";
import type { Event, EventCategory } from "../types/event";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function eventsOnCalendarDay(
  events: Event[],
  year: number,
  monthIndex: number,
  dayOfMonth: number,
): Event[] {
  return events.filter((event) => {
    const d = new Date(event.start_datetime);
    return (
      d.getFullYear() === year &&
      d.getMonth() === monthIndex &&
      d.getDate() === dayOfMonth
    );
  });
}

function buildMonthCells(firstDayOfMonth: number, daysInMonth: number) {
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function padToWeeks(cells: (number | null)[]): (number | null)[] {
  const out = [...cells];
  while (out.length % 7 !== 0) out.push(null);
  return out;
}

export function CalendarScreen() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [planModalEvent, setPlanModalEvent] = useState<Event | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch {
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells = useMemo(
    () => padToWeeks(buildMonthCells(firstDayOfMonth, daysInMonth)),
    [firstDayOfMonth, daysInMonth],
  );

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return eventsOnCalendarDay(
      events,
      currentYear,
      currentMonth,
      selectedDay,
    );
  }, [events, currentYear, currentMonth, selectedDay]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.hint}>
          Tap a date to see events, then add them to your plan.
        </Text>

        <View style={styles.calCard}>
          <View style={styles.calNav}>
            <Pressable onPress={prevMonth} hitSlop={12}>
              <Text style={styles.navArrow}>←</Text>
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable onPress={nextMonth} hitSlop={12}>
              <Text style={styles.navArrow}>→</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((d) => (
              <View key={d} style={styles.weekCell}>
                <Text style={styles.weekLabel}>{d}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, ri) => (
            <View key={ri} style={styles.weekRow}>
              {row.map((day, di) => {
                const now = new Date();
                const isSel = day !== null && selectedDay === day;
                const isToday =
                  day !== null &&
                  now.getDate() === day &&
                  now.getMonth() === currentMonth &&
                  now.getFullYear() === currentYear;
                const count =
                  day !== null
                    ? eventsOnCalendarDay(
                        events,
                        currentYear,
                        currentMonth,
                        day,
                      ).length
                    : 0;
                return (
                  <Pressable
                    key={di}
                    style={styles.dayCell}
                    disabled={day === null}
                    onPress={() => day !== null && setSelectedDay(day)}
                  >
                    {day !== null ? (
                      <View
                        style={[
                          styles.dayInner,
                          isSel && styles.dayInnerSelected,
                          isToday && !isSel && styles.dayInnerToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNum,
                            isSel && styles.dayNumSelected,
                          ]}
                        >
                          {day}
                        </Text>
                        {count > 0 ? (
                          <View style={styles.dot} />
                        ) : (
                          <View style={styles.dotPlaceholder} />
                        )}
                      </View>
                    ) : (
                      <View style={styles.dayEmpty} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {selectedDay !== null ? (
          <View style={styles.daySection}>
            <Text style={styles.daySectionTitle}>
              {selectedDay}{" "}
              {MONTHS[currentMonth].slice(0, 3)} {currentYear}
            </Text>
            {selectedDayEvents.length === 0 ? (
              <Text style={styles.none}>No events on this day.</Text>
            ) : (
              selectedDayEvents.map((ev) => {
                const chip =
                  CATEGORY_STYLE[ev.category as EventCategory] ??
                  CATEGORY_STYLE.other;
                return (
                  <View key={ev.id} style={styles.evCard}>
                    <View
                      style={[styles.evChip, { backgroundColor: chip.bg }]}
                    >
                      <Text style={[styles.evChipText, { color: chip.text }]}>
                        {ev.category}
                      </Text>
                    </View>
                    <Text style={styles.evTitle}>{ev.title}</Text>
                    <Text style={styles.evMeta}>{ev.location}</Text>
                    <Text style={styles.evWhen}>
                      {formatEventWhen(ev.start_datetime)}
                    </Text>
                    <Pressable
                      style={styles.evAdd}
                      onPress={() => setPlanModalEvent(ev)}
                    >
                      <Text style={styles.evAddText}>+ Add to plan</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <Text style={styles.pickHint}>Select a day to see events.</Text>
        )}
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  hint: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  calCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingBottom: 8,
    marginBottom: 16,
  },
  calNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  navArrow: { fontSize: 22, color: "#6b7280", paddingHorizontal: 8 },
  monthTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  weekRow: {
    flexDirection: "row",
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekLabel: { fontSize: 11, fontWeight: "600", color: "#9ca3af" },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 52,
    padding: 2,
  },
  dayInner: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInnerSelected: {
    backgroundColor: "#0f766e",
  },
  dayInnerToday: {
    borderWidth: 1,
    borderColor: "#0f766e",
  },
  dayNum: { fontSize: 14, fontWeight: "600", color: "#111827" },
  dayNumSelected: { color: "#fff" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0f766e",
    marginTop: 2,
  },
  dotPlaceholder: { height: 6 },
  dayEmpty: { flex: 1 },
  daySection: {
    marginTop: 4,
  },
  daySectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  none: { fontSize: 14, color: "#9ca3af" },
  pickHint: { fontSize: 14, color: "#9ca3af", marginTop: 8 },
  evCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  evChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  evChipText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  evTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  evMeta: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  evWhen: { fontSize: 12, color: "#9ca3af", marginBottom: 10 },
  evAdd: {
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  evAddText: { fontSize: 15, fontWeight: "600", color: "#0f766e" },
});
