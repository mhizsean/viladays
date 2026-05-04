import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addItineraryItem,
  createItinerary,
  fetchItineraries,
} from "../api/itinerary";
import type { Itinerary } from "../types/itinerary";
import type { Event } from "../types/event";

type Props = {
  visible: boolean;
  event: Event | null;
  mode?: "event" | "custom";
  preselectedTripId?: number;
  tripStartDate?: string;
  tripEndDate?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

type DatePickerField = "start" | "end";
type PlanModalStep = "select" | "create" | "custom-form";

function calcDayIndex(selected: Date, tripStartDateStr: string): number {
  const eventDate = new Date(selected);
  eventDate.setHours(0, 0, 0, 0);
  const tripStart = new Date(new Date(tripStartDateStr).toDateString());
  const diffDays = Math.round((eventDate.getTime() - tripStart.getTime()) / 86400000);
  return Math.max(1, diffDays + 1);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, mo, d] = t.split("-").map(Number);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
    return null;
  return dt;
}

function formatDisplayYmd(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ymdToIsoMidday(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return new Date(ymd).toISOString();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}


export function AddToPlanModal({
  visible,
  event,
  mode = "event",
  preselectedTripId,
  tripStartDate,
  tripEndDate,
  onClose,
  onSuccess,
}: Props) {
  const tripMinDate = tripStartDate ? new Date(new Date(tripStartDate).toDateString()) : null;
  const tripMaxDate = tripEndDate ? (() => { const d = new Date(new Date(tripEndDate).toDateString()); d.setHours(23, 59, 59); return d; })() : null;
  const [view, setView] = useState<PlanModalStep>(
    mode === "custom" ? "custom-form" : "select",
  );
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(
    preselectedTripId ?? null,
  );
  const [dayIndex, setDayIndex] = useState("1");

  // Create trip form
  const [newTripName, setNewTripName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [datePickerField, setDatePickerField] =
    useState<DatePickerField | null>(null);

  // Custom event form
  const [customTitle, setCustomTitle] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customStartTime, setCustomStartTime] = useState<Date | null>(null);
  const [customEndTime, setCustomEndTime] = useState<Date | null>(null);
  const [customNotes, setCustomNotes] = useState("");
  const [customDay, setCustomDay] = useState("1");
  const [customFormError, setCustomFormError] = useState<string | null>(null);
  const [timePickerField, setTimePickerField] = useState<
    "customStart" | "customEnd" | null
  >(null);

  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = (e: { endCoordinates: { height: number } }) =>
      setKeyboardInset(e.endCoordinates.height);
    const onHide = () => setKeyboardInset(0);
    const s1 = Keyboard.addListener(showEvt, onShow);
    const s2 = Keyboard.addListener(hideEvt, onHide);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setKeyboardInset(0);
  }, [visible]);

  const reset = useCallback(() => {
    setView(mode === "custom" ? "custom-form" : "select");
    setSelectedTripId(preselectedTripId ?? null);
    setDayIndex("1");
    setNewTripName("");
    setNewStartDate("");
    setNewEndDate("");
    setCreateFormError(null);
    setSuccess(false);
    setLoadError(null);
    setDatePickerField(null);
    setTimePickerField(null);
    setCustomTitle("");
    setCustomLocation("");
    setCustomNotes("");
    setCustomStartTime(null);
    setCustomEndTime(null);
    setCustomDay("1");
    setCustomFormError(null);
  }, [mode, preselectedTripId]);

  useEffect(() => {
    if (!visible) return;
    reset();
    if (preselectedTripId !== undefined) return; // trip already known, skip fetch for now
    setLoadingTrips(true);
    void (async () => {
      try {
        const data = await fetchItineraries();
        setItineraries(data);
      } catch {
        setLoadError("Could not load your trips.");
      } finally {
        setLoadingTrips(false);
      }
    })();
  }, [visible, reset, preselectedTripId]);

  // Also fetch trips for custom mode when no preselectedTripId
  useEffect(() => {
    if (!visible || preselectedTripId !== undefined) return;
    setLoadingTrips(true);
    void (async () => {
      try {
        const data = await fetchItineraries();
        setItineraries(data);
      } catch {
        setLoadError("Could not load your trips.");
      } finally {
        setLoadingTrips(false);
      }
    })();
  }, [visible, preselectedTripId]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAddEvent = async () => {
    if (!event || !selectedTripId) return;
    const day = Math.max(1, parseInt(dayIndex, 10) || 1);
    setPending(true);
    try {
      await addItineraryItem(selectedTripId, {
        event_id: event.id,
        day_index: day,
      });
      setSuccess(true);
      onSuccess?.();
      setTimeout(handleClose, 1200);
    } catch {
      setLoadError("Could not add event. Try again.");
    } finally {
      setPending(false);
    }
  };

  const handleAddCustom = async () => {
    if (!customTitle.trim()) {
      setCustomFormError("Title is required.");
      return;
    }
    if (!selectedTripId) {
      setCustomFormError("Please select a trip first.");
      return;
    }
    if (customStartTime && customEndTime && customEndTime < customStartTime) {
      setCustomFormError("End time must be after start time.");
      return;
    }
    if (tripMinDate && tripMaxDate) {
      if (customStartTime && (customStartTime < tripMinDate || customStartTime > tripMaxDate)) {
        setCustomFormError(`Start time must be within the trip dates.`);
        return;
      }
      if (customEndTime && (customEndTime < tripMinDate || customEndTime > tripMaxDate)) {
        setCustomFormError(`End time must be within the trip dates.`);
        return;
      }
    }
    setCustomFormError(null);
    const day = Math.max(1, parseInt(customDay, 10) || 1);
    setPending(true);
    try {
      await addItineraryItem(selectedTripId, {
        custom_title: customTitle.trim(),
        custom_location: customLocation.trim() || undefined,
        custom_start_time: customStartTime?.toISOString(),
        custom_end_time: customEndTime?.toISOString(),
        custom_notes: customNotes.trim() || undefined,
        day_index: day,
      });
      setSuccess(true);
      onSuccess?.();
      setTimeout(handleClose, 1200);
    } catch {
      setCustomFormError("Could not save event. Try again.");
    } finally {
      setPending(false);
    }
  };

  const handleCreate = async () => {
    if (!newTripName.trim() || !newStartDate || !newEndDate) return;
    if (newEndDate < newStartDate) {
      setCreateFormError("End date must be on or after start date.");
      return;
    }
    setCreateFormError(null);
    setPending(true);
    try {
      const created = await createItinerary({
        name: newTripName.trim(),
        start_date: ymdToIsoMidday(newStartDate),
        end_date: ymdToIsoMidday(newEndDate),
      });
      setItineraries((prev) => [...prev, created]);
      setSelectedTripId(created.id);
      setDatePickerField(null);
      setView(mode === "custom" ? "custom-form" : "select");
    } catch {
      setCreateFormError("Could not create trip.");
    } finally {
      setPending(false);
    }
  };

  const onDateChange = (
    field: DatePickerField,
    e: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === "android") setDatePickerField(null);
    if (e.type === "dismissed") {
      setDatePickerField(null);
      return;
    }
    if (!selected) return;
    const ymd = formatYmd(selected);
    if (field === "start") {
      setNewStartDate(ymd);
      setNewEndDate((end) => (end && end < ymd ? ymd : end));
    } else setNewEndDate(ymd);
    setCreateFormError(null);
  };

  const onTimeChange = (
    field: "customStart" | "customEnd",
    e: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === "android") setTimePickerField(null);
    if (e.type === "dismissed") {
      setTimePickerField(null);
      return;
    }
    if (!selected) return;
    if (field === "customStart") {
      setCustomStartTime(selected);
      if (tripStartDate) setCustomDay(String(calcDayIndex(selected, tripStartDate)));
    } else {
      setCustomEndTime(selected);
    }
    setCustomFormError(null);
  };

  if (mode !== "custom" && !event) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[
              styles.sheet,
              keyboardInset > 0 && styles.sheetKeyboardOpen,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator
              nestedScrollEnabled
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 24 + keyboardInset },
              ]}
            >
              {success ? (
                <View style={styles.successBox}>
                  <Text style={styles.successEmoji}>✓</Text>
                  <Text style={styles.successTitle}>Added to your trip</Text>
                </View>
              ) : view === "custom-form" ? (
                <>
                  <Text style={styles.title}>Add your own event</Text>
                  <Text style={styles.subtitle}>
                    Something not listed on the platform
                  </Text>

                  {/* Trip picker (when no preselectedTripId) */}
                  {preselectedTripId === undefined && (
                    <View style={styles.field}>
                      <Text style={styles.label}>Trip</Text>
                      {loadingTrips ? (
                        <ActivityIndicator
                          style={styles.loader}
                          color="#0f766e"
                        />
                      ) : null}
                      {itineraries.map((t) => (
                        <Pressable
                          key={t.id}
                          style={[
                            styles.planRow,
                            selectedTripId === t.id && styles.planRowSelected,
                          ]}
                          onPress={() => setSelectedTripId(t.id)}
                        >
                          <Text style={styles.planName}>{t.name}</Text>
                          <Text style={styles.planDates}>
                            {new Date(t.start_date).toLocaleDateString("en-GB")}{" "}
                            → {new Date(t.end_date).toLocaleDateString("en-GB")}
                          </Text>
                        </Pressable>
                      ))}
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => setView("create")}
                      >
                        <Text style={styles.secondaryBtnText}>+ New trip</Text>
                      </Pressable>
                    </View>
                  )}

                  <View style={styles.field}>
                    <Text style={styles.label}>Event title *</Text>
                    <TextInput
                      style={styles.input}
                      value={customTitle}
                      onChangeText={(t) => {
                        setCustomTitle(t);
                        setCustomFormError(null);
                      }}
                      placeholder="e.g. Dinner at The Witchery"
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                      style={styles.input}
                      value={customLocation}
                      onChangeText={setCustomLocation}
                      placeholder="e.g. Royal Mile, Edinburgh"
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Start time</Text>
                    <Pressable
                      style={styles.dateButton}
                      onPress={() => setTimePickerField("customStart")}
                    >
                      <Text
                        style={
                          customStartTime
                            ? styles.dateValue
                            : styles.datePlaceholder
                        }
                      >
                        {customStartTime
                          ? customStartTime.toLocaleString("en-GB")
                          : "Select start time"}
                      </Text>
                      <Text style={styles.dateChevron}>▼</Text>
                    </Pressable>
                    {timePickerField === "customStart" && (
                      <DateTimePicker
                        value={customStartTime ?? tripMinDate ?? new Date()}
                        mode="datetime"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        minimumDate={tripMinDate ?? undefined}
                        maximumDate={tripMaxDate ?? undefined}
                        onChange={(e, d) => onTimeChange("customStart", e, d)}
                      />
                    )}
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>End time</Text>
                    <Pressable
                      style={styles.dateButton}
                      onPress={() => setTimePickerField("customEnd")}
                    >
                      <Text
                        style={
                          customEndTime
                            ? styles.dateValue
                            : styles.datePlaceholder
                        }
                      >
                        {customEndTime
                          ? customEndTime.toLocaleString("en-GB")
                          : "Select end time"}
                      </Text>
                      <Text style={styles.dateChevron}>▼</Text>
                    </Pressable>
                    {timePickerField === "customEnd" && (
                      <DateTimePicker
                        value={customEndTime ?? customStartTime ?? tripMinDate ?? new Date()}
                        mode="datetime"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        minimumDate={customStartTime ?? tripMinDate ?? undefined}
                        maximumDate={tripMaxDate ?? undefined}
                        onChange={(e, d) => onTimeChange("customEnd", e, d)}
                      />
                    )}
                  </View>
                  {timePickerField !== null && Platform.OS === "ios" && (
                    <Pressable
                      style={styles.dateDoneBtn}
                      onPress={() => setTimePickerField(null)}
                    >
                      <Text style={styles.dateDoneText}>Done</Text>
                    </Pressable>
                  )}
                  <View style={styles.field}>
                    <Text style={styles.label}>Day number</Text>
                    <TextInput
                      style={styles.input}
                      value={customDay}
                      onChangeText={setCustomDay}
                      keyboardType="number-pad"
                      placeholder="1"
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { height: 72, textAlignVertical: "top" },
                      ]}
                      value={customNotes}
                      onChangeText={setCustomNotes}
                      placeholder="Any notes about this event…"
                      multiline
                    />
                  </View>

                  {customFormError ? (
                    <Text style={styles.error}>{customFormError}</Text>
                  ) : null}

                  <View style={styles.row}>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={handleClose}
                    >
                      <Text style={styles.secondaryBtnText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.primaryBtn, pending && styles.btnDisabled]}
                      onPress={() => void handleAddCustom()}
                      disabled={pending}
                    >
                      <Text style={styles.primaryBtnText}>
                        {pending ? "Saving…" : "Save event"}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : view === "select" ? (
                <>
                  <Text style={styles.title}>Add to trip</Text>
                  {event && (
                    <Text style={styles.subtitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                  )}

                  {loadingTrips ? (
                    <ActivityIndicator style={styles.loader} color="#0f766e" />
                  ) : null}
                  {loadError ? (
                    <Text style={styles.error}>{loadError}</Text>
                  ) : null}
                  {!loadingTrips && itineraries.length === 0 ? (
                    <Text style={styles.hint}>You have no trips yet.</Text>
                  ) : null}

                  {itineraries.map((itin) => (
                    <Pressable
                      key={itin.id}
                      style={[
                        styles.planRow,
                        selectedTripId === itin.id && styles.planRowSelected,
                      ]}
                      onPress={() => setSelectedTripId(itin.id)}
                    >
                      <Text style={styles.planName}>{itin.name}</Text>
                      <Text style={styles.planDates}>
                        {new Date(itin.start_date).toLocaleDateString("en-GB")}{" "}
                        → {new Date(itin.end_date).toLocaleDateString("en-GB")}
                      </Text>
                    </Pressable>
                  ))}

                  {selectedTripId ? (
                    <View style={styles.field}>
                      <Text style={styles.label}>Day number</Text>
                      <TextInput
                        style={styles.input}
                        value={dayIndex}
                        onChangeText={setDayIndex}
                        keyboardType="number-pad"
                        placeholder="1"
                      />
                    </View>
                  ) : null}

                  <View style={styles.row}>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() => {
                        setDatePickerField(null);
                        setView("create");
                      }}
                    >
                      <Text style={styles.secondaryBtnText}>+ New trip</Text>
                    </Pressable>
                    {selectedTripId ? (
                      <Pressable
                        style={[
                          styles.primaryBtn,
                          pending && styles.btnDisabled,
                        ]}
                        onPress={() => void handleAddEvent()}
                        disabled={pending}
                      >
                        <Text style={styles.primaryBtnText}>
                          {pending ? "Adding…" : "Add to trip"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Create a new trip</Text>
                  <View style={styles.field}>
                    <Text style={styles.label}>Trip name</Text>
                    <TextInput
                      style={styles.input}
                      value={newTripName}
                      onChangeText={(t) => {
                        setNewTripName(t);
                        setCreateFormError(null);
                      }}
                      placeholder="My Edinburgh trip"
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Start date</Text>
                    <Pressable
                      style={styles.dateButton}
                      onPress={() => setDatePickerField("start")}
                    >
                      <Text
                        style={
                          newStartDate
                            ? styles.dateValue
                            : styles.datePlaceholder
                        }
                      >
                        {newStartDate
                          ? formatDisplayYmd(newStartDate)
                          : "Select start date"}
                      </Text>
                      <Text style={styles.dateChevron}>▼</Text>
                    </Pressable>
                    {datePickerField === "start" ? (
                      <DateTimePicker
                        value={parseYmd(newStartDate) ?? new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        maximumDate={parseYmd(newEndDate) ?? undefined}
                        onChange={(e, d) => onDateChange("start", e, d)}
                      />
                    ) : null}
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>End date</Text>
                    <Pressable
                      style={styles.dateButton}
                      onPress={() => setDatePickerField("end")}
                    >
                      <Text
                        style={
                          newEndDate ? styles.dateValue : styles.datePlaceholder
                        }
                      >
                        {newEndDate
                          ? formatDisplayYmd(newEndDate)
                          : "Select end date"}
                      </Text>
                      <Text style={styles.dateChevron}>▼</Text>
                    </Pressable>
                    {datePickerField === "end" ? (
                      <DateTimePicker
                        value={
                          parseYmd(newEndDate) ??
                          parseYmd(newStartDate) ??
                          new Date()
                        }
                        mode="date"
                        display={Platform.OS === "ios" ? "inline" : "default"}
                        minimumDate={parseYmd(newStartDate) ?? undefined}
                        onChange={(e, d) => onDateChange("end", e, d)}
                      />
                    ) : null}
                  </View>
                  {datePickerField !== null && Platform.OS === "ios" ? (
                    <Pressable
                      style={styles.dateDoneBtn}
                      onPress={() => setDatePickerField(null)}
                    >
                      <Text style={styles.dateDoneText}>Done</Text>
                    </Pressable>
                  ) : null}
                  {createFormError ? (
                    <Text style={styles.error}>{createFormError}</Text>
                  ) : null}
                  <View style={styles.row}>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() => {
                        setDatePickerField(null);
                        setView(mode === "custom" ? "custom-form" : "select");
                      }}
                    >
                      <Text style={styles.secondaryBtnText}>Back</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.primaryBtn, pending && styles.btnDisabled]}
                      onPress={() => void handleCreate()}
                      disabled={pending}
                    >
                      <Text style={styles.primaryBtnText}>
                        {pending ? "Creating…" : "Create trip"}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Pressable style={styles.cancelWrap} onPress={handleClose}>
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    maxHeight: "90%",
  },
  sheetKeyboardOpen: { maxHeight: "72%" },
  scrollContent: { flexGrow: 1 },
  title: { fontSize: 20, fontWeight: "600", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  loader: { marginVertical: 16 },
  hint: { fontSize: 14, color: "#9ca3af", marginBottom: 12 },
  error: { fontSize: 14, color: "#b91c1c", marginBottom: 8 },
  planRow: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  planRowSelected: { borderColor: "#0f766e", backgroundColor: "#f0fdfa" },
  planName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  planDates: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dateValue: { fontSize: 16, color: "#111827", fontWeight: "500" },
  datePlaceholder: { fontSize: 16, color: "#9ca3af" },
  dateChevron: { fontSize: 12, color: "#6b7280", marginLeft: 8 },
  dateDoneBtn: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#f0fdfa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#99f6e4",
  },
  dateDoneText: { fontSize: 16, fontWeight: "600", color: "#0f766e" },
  row: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" },
  secondaryBtn: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  primaryBtn: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  btnDisabled: { opacity: 0.6 },
  cancelWrap: { marginTop: 16, alignItems: "center" },
  cancel: { fontSize: 15, color: "#6b7280" },
  successBox: { alignItems: "center", paddingVertical: 24 },
  successEmoji: {
    fontSize: 40,
    color: "#0f766e",
    marginBottom: 8,
    fontWeight: "700",
  },
  successTitle: { fontSize: 17, fontWeight: "600", color: "#111827" },
});
