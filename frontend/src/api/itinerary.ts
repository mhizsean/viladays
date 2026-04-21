import client from "./clients";
import type { Itinerary, ItineraryCreate, ItineraryItemCreate  } from "../types/itinerary";

export const createItinerary = async (data: ItineraryCreate): Promise<Itinerary> => {
    const response = await client.post<Itinerary>("/itineraries", data);
    return response.data;
}

export const getItineraries = async (): Promise<Itinerary[]> => {
    const response = await client.get<Itinerary[]>("/itineraries");
    return response.data;
}

export const getItinerary = async (id: number): Promise<Itinerary> => {
    const response = await client.get<Itinerary>(`/itineraries/${id}`);
    return response.data;
}

export const addItineraryItem = async (id: number, data: ItineraryItemCreate): Promise<Itinerary> => {
    const response = await client.post(`/itineraries/${id}/items`, data);
    return response.data;
}

export const removeItineraryItem = async (itineraryId: number, itemId: number): Promise<void> => {
    await client.delete(`/itineraries/${itineraryId}/items/${itemId}`);
}