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
  onClose: () => void;
  onSuccess?: () => void;
};

type DatePickerField = "start" | "end";

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
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

/** Local noon → ISO to avoid UTC date shifts for calendar-only values. */
function ymdToIsoMidday(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return new Date(ymd).toISOString();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function AddToPlanModal({
  visible,
  event,
  onClose,
  onSuccess,
}: Props) {
  const [view, setView] = useState<"select" | "create">("select");
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState<number | null>(
    null,
  );
  const [dayIndex, setDayIndex] = useState("1");
  const [newPlanName, setNewPlanName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [datePickerField, setDatePickerField] = useState<DatePickerField | null>(
    null,
  );

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = (e: { endCoordinates: { height: number } }) => {
      setKeyboardInset(e.endCoordinates.height);
    };
    const onHide = () => setKeyboardInset(0);
    const subShow = Keyboard.addListener(showEvt, onShow);
    const subHide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setKeyboardInset(0);
  }, [visible]);

  const reset = useCallback(() => {
    setView("select");
    setSelectedItineraryId(null);
    setDayIndex("1");
    setNewPlanName("");
    setNewStartDate("");
    setNewEndDate("");
    setCreateFormError(null);
    setSuccess(false);
    setLoadError(null);
    setDatePickerField(null);
  }, []);

  useEffect(() => {
    if (!visible || !event) return;
    reset();
    setLoadingPlans(true);
    void (async () => {
      try {
        const data = await fetchItineraries();
        setItineraries(data);
      } catch {
        setLoadError("Could not load your plans.");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, [visible, event, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = async () => {
    if (!event || !selectedItineraryId) return;
    const day = Math.max(1, parseInt(dayIndex, 10) || 1);
    setPending(true);
    try {
      await addItineraryItem(selectedItineraryId, {
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

  const handleCreate = async () => {
    if (!newPlanName.trim() || !newStartDate || !newEndDate) return;
    if (newEndDate < newStartDate) {
      setCreateFormError("End date must be on or after the start date.");
      return;
    }
    setCreateFormError(null);
    setPending(true);
    try {
      const created = await createItinerary({
        name: newPlanName.trim(),
        start_date: ymdToIsoMidday(newStartDate),
        end_date: ymdToIsoMidday(newEndDate),
      });
      setItineraries((prev) => [...prev, created]);
      setSelectedItineraryId(created.id);
      setDatePickerField(null);
      setView("select");
    } catch {
      setCreateFormError("Could not create plan.");
    } finally {
      setPending(false);
    }
  };

  if (!event) return null;

  const onDateChange = (
    field: DatePickerField,
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") setDatePickerField(null);
    if (event.type === "dismissed") {
      setDatePickerField(null);
      return;
    }
    if (!selectedDate) {
      if (Platform.OS === "android") setDatePickerField(null);
      return;
    }
    const ymd = formatYmd(selectedDate);
    if (field === "start") {
      setNewStartDate(ymd);
      setNewEndDate((end) => (end && end < ymd ? ymd : end));
    } else {
      setNewEndDate(ymd);
    }
    setCreateFormError(null);
    /* iOS inline/spinner: user taps “Done” to close; Android dialog closes itself. */
  };

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
              keyboardInset > 0 ? styles.sheetKeyboardOpen : null,
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
                <Text style={styles.successTitle}>Added to your plan</Text>
              </View>
            ) : view === "select" ? (
              <>
                <Text style={styles.title}>Add to plan</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {event.title}
                </Text>

                {loadingPlans ? (
                  <ActivityIndicator style={styles.loader} color="#0f766e" />
                ) : null}
                {loadError ? (
                  <Text style={styles.error}>{loadError}</Text>
                ) : null}

                {!loadingPlans && itineraries.length === 0 ? (
                  <Text style={styles.hint}>You have no plans yet.</Text>
                ) : null}

                {itineraries.map((itin) => (
                  <Pressable
                    key={itin.id}
                    style={[
                      styles.planRow,
                      selectedItineraryId === itin.id && styles.planRowSelected,
                    ]}
                    onPress={() => setSelectedItineraryId(itin.id)}
                  >
                    <Text style={styles.planName}>{itin.name}</Text>
                    <Text style={styles.planDates}>
                      {new Date(itin.start_date).toLocaleDateString("en-GB")} →{" "}
                      {new Date(itin.end_date).toLocaleDateString("en-GB")}
                    </Text>
                  </Pressable>
                ))}

                {selectedItineraryId ? (
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
                    <Text style={styles.secondaryBtnText}>+ New plan</Text>
                  </Pressable>
                  {selectedItineraryId ? (
                    <Pressable
                      style={[styles.primaryBtn, pending && styles.btnDisabled]}
                      onPress={() => void handleAdd()}
                      disabled={pending}
                    >
                      <Text style={styles.primaryBtnText}>
                        {pending ? "Adding…" : "Add to plan"}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Create a new plan</Text>
                <View style={styles.field}>
                  <Text style={styles.label}>Plan name</Text>
                  <TextInput
                    style={styles.input}
                    value={newPlanName}
                    onChangeText={(t) => {
                      setNewPlanName(t);
                      setCreateFormError(null);
                    }}
                    placeholder="My trip"
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
                        newStartDate ? styles.dateValue : styles.datePlaceholder
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
                      setView("select");
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
                      {pending ? "Creating…" : "Create plan"}
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
  kav: {
    flex: 1,
  },
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
    maxHeight: "88%",
  },
  /** Leave room above the keyboard so the sheet does not fill under it. */
  sheetKeyboardOpen: {
    maxHeight: "72%",
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
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
  planRowSelected: {
    borderColor: "#0f766e",
    backgroundColor: "#f0fdfa",
  },
  planName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  planDates: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  field: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
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
  dateValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  datePlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dateChevron: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
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
  dateDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f766e",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    flexWrap: "wrap",
  },
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
