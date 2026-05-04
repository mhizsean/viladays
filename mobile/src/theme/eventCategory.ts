import type { EventCategory } from "../types/event";

export const CATEGORY_STYLE: Record<
  EventCategory,
  { bg: string; text: string }
> = {
  culture: { bg: "#dbeafe", text: "#1d4ed8" },
  food: { bg: "#dcfce7", text: "#15803d" },
  outdoor: { bg: "#ccfbf1", text: "#0f766e" },
  history: { bg: "#ffedd5", text: "#c2410c" },
  nightlife: { bg: "#f3e8ff", text: "#7e22ce" },
  shopping: { bg: "#fce7f3", text: "#be185d" },
  family: { bg: "#fef9c3", text: "#a16207" },
  art: { bg: "#ffe4e6", text: "#be123c" },
  sports: { bg: "#cffafe", text: "#0e7490" },
  other: { bg: "#f3f4f6", text: "#4b5563" },
};

export function formatEventWhen(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export function formatTimeRange(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${new Date(startIso).toLocaleTimeString("en-GB", opts)} — ${new Date(endIso).toLocaleTimeString("en-GB", opts)}`;
}
