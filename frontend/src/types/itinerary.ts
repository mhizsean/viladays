import type { Event } from './event'

export interface ItineraryItem {
  id: number
  event_id: number
  day_index: number
  custom_note: string | null
  event: Event
}

export interface Itinerary {
  id: number
  name: string
  start_date: string
  end_date: string
  created_at: string
  items: ItineraryItem[]
}

export interface ItineraryCreate {
  name: string
  start_date: string
  end_date: string
}

export interface ItineraryItemCreate {
  event_id: number
  day_index: number
  custom_note?: string
}