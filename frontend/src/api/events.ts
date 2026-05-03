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

export const createEvent = async (data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> => {
  const response = await client.post<Event>('/events/', data)
  return response.data
}

export const updateEvent = async (id: number, data: Partial<Event>): Promise<Event> => {
  const response = await client.put<Event>(`/events/${id}`, data)
  return response.data
}

export const deleteEvent = async (id: number): Promise<void> => {
  await client.delete(`/events/${id}`)
}