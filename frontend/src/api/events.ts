import client from "./clients";
import type { Event, EventCategory } from "../types/event";

export const getEvents = async (params?: {
    category?: EventCategory;
    date?: string;
}): Promise<Event[]> => {
    const response = await client.get<Event[]>("/events", { params });
    return response.data;
}

export const getEvent = async (id: number): Promise<Event> => {
    const response = await client.get<Event>(`/events/${id}`);
    return response.data;
}

