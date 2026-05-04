import type { Event, EventCategory } from "../types/event";

export type AdminEventFormValues = {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  image_url: string;
  start_datetime: string;
  end_datetime: string;
};

export function emptyAdminEventForm(): AdminEventFormValues {
  return {
    title: "",
    description: "",
    category: "culture",
    location: "",
    image_url: "",
    start_datetime: "",
    end_datetime: "",
  };
}

export function eventToAdminFormValues(event: Event): AdminEventFormValues {
  return {
    title: event.title,
    description: event.description ?? "",
    category: event.category,
    location: event.location,
    image_url: event.image_url ?? "",
    start_datetime: event.start_datetime.slice(0, 16),
    end_datetime: event.end_datetime.slice(0, 16),
  };
}

/** Payload for create / update API from datetime-local form values. */
export function adminFormValuesToApiPayload(
  form: AdminEventFormValues,
): Omit<Event, "id" | "created_at" | "updated_at"> {
  return {
    title: form.title,
    description: form.description || null,
    category: form.category,
    location: form.location,
    image_url: form.image_url || null,
    start_datetime: new Date(form.start_datetime).toISOString(),
    end_datetime: new Date(form.end_datetime).toISOString(),
  };
}
