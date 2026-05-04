import { api } from "./client";
import type { Event, EventCategory } from "../types/event";

export async function fetchEvents(params?: {
  category?: EventCategory;
  date?: string;
}): Promise<Event[]> {
  const response = await api.get<Event[]>("/events", { params });
  return response.data;
}
