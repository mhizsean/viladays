import type { EventCategory } from "../types/event";

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  "culture",
  "food",
  "outdoor",
  "history",
  "nightlife",
  "shopping",
  "family",
  "art",
  "sports",
  "other",
] as const;
