import type { Event } from './event'

export interface ItineraryItem {
  id: number
  event_id: number | null
  day_index: number
  custom_note: string | null
  event: Event | null

  custom_title: string | null
  custom_location: string | null
  custom_start_time: string | null
  custom_end_time: string | null
  custom_notes: string | null
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
  event_id?: number
  day_index: number
  custom_note?: string

  custom_title?: string
  custom_location?: string
  custom_start_time?: string
  custom_end_time?: string
  custom_notes?: string
}
