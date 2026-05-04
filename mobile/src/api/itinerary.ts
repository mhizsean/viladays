import { api } from "./client";
import type {
  Itinerary,
  ItineraryCreate,
  ItineraryItem,
  ItineraryItemCreate,
} from "../types/itinerary";

export async function fetchItineraries(): Promise<Itinerary[]> {
  const response = await api.get<Itinerary[]>("/itineraries/");
  return response.data;
}

export async function createItinerary(
  data: ItineraryCreate,
): Promise<Itinerary> {
  const response = await api.post<Itinerary>("/itineraries/", data);
  return response.data;
}

export async function addItineraryItem(
  itineraryId: number,
  data: ItineraryItemCreate,
): Promise<ItineraryItem> {
  const response = await api.post<ItineraryItem>(
    `/itineraries/${itineraryId}/items`,
    data,
  );
  return response.data;
}

export async function removeItineraryItem(
  itineraryId: number,
  itemId: number,
): Promise<void> {
  await api.delete(`/itineraries/${itineraryId}/items/${itemId}`);
}
