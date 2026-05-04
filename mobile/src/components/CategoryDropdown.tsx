import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EVENT_CATEGORIES } from "../constants/eventCategories";
import type { EventCategory } from "../types/event";

type Option = {
  key: string;
  value: EventCategory | undefined;
  label: string;
};

function capitalize(cat: EventCategory): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

type Props = {
  value: EventCategory | undefined;
  onChange: (next: EventCategory | undefined) => void;
  disabled?: boolean;
};

export function CategoryDropdown({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const options: Option[] = useMemo(
    () => [
      { key: "all", value: undefined, label: "All categories" },
      ...EVENT_CATEGORIES.map((c) => ({
        key: c,
        value: c,
        label: capitalize(c),
      })),
    ],
    [],
  );

  const displayLabel =
    value === undefined ? "All categories" : capitalize(value);

  const select = (v: EventCategory | undefined) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Category</Text>
        <Pressable
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.trigger,
            disabled && styles.triggerDisabled,
            pressed && !disabled && styles.triggerPressed,
          ]}
        >
          <Text style={styles.triggerText} numberOfLines={1}>
            {displayLabel}
          </Text>
          <Text style={styles.chevron} accessibilityLabel="Open category list">
            ▼
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Choose category</Text>
            <FlatList
              style={styles.optionList}
              data={options}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected =
                  item.value === undefined
                    ? value === undefined
                    : value === item.value;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() => select(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {selected ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerPressed: {
    backgroundColor: "#f9fafb",
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    marginRight: 8,
  },
  chevron: {
    fontSize: 12,
    color: "#6b7280",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  optionList: {
    maxHeight: 320,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  optionSelected: {
    backgroundColor: "#f0fdfa",
  },
  optionPressed: {
    backgroundColor: "#f9fafb",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  optionTextSelected: {
    color: "#0f766e",
    fontWeight: "600",
  },
  check: {
    fontSize: 16,
    color: "#0f766e",
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
});
