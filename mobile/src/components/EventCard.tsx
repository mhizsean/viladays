import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Event, EventCategory } from "../types/event";
import {
  CATEGORY_STYLE,
  formatEventWhen,
} from "../theme/eventCategory";

type Props = {
  event: Event;
  onAddToPlan: () => void;
};

export function EventCard({ event, onAddToPlan }: Props) {
  const chip =
    CATEGORY_STYLE[event.category as EventCategory] ??
    CATEGORY_STYLE.other;
  return (
    <View style={styles.card}>
      <View style={styles.cardImageWrap}>
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.cardImagePlaceholder}>📍</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
          <Text style={[styles.chipText, { color: chip.text }]}>
            {event.category}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <Text style={styles.cardMeta}>{event.location}</Text>
        <Text style={styles.cardWhen}>
          {formatEventWhen(event.start_datetime)}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
          ]}
          onPress={onAddToPlan}
        >
          <Text style={styles.addBtnText}>+ Add to plan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardImageWrap: {
    height: 140,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    fontSize: 40,
  },
  cardBody: {
    padding: 14,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  cardWhen: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  addBtnPressed: {
    opacity: 0.85,
    backgroundColor: "#f0fdfa",
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f766e",
  },
});
