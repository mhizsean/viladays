export type EventCategory =
  | 'food'
  | 'culture'
  | 'outdoor'
  | 'nightlife'
  | 'shopping'
  | 'history'
  | 'family'
  | 'art'
  | 'sports'
  | 'other'

export interface Event {
  id: number
  title: string
  description: string | null
  category: EventCategory
  location: string
  image_url: string | null
  start_datetime: string
  end_datetime: string
  created_at: string
  updated_at: string
}