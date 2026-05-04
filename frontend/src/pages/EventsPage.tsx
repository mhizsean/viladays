import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../api/events";
import type { Event, EventCategory } from "../types/event";
import { EVENT_CATEGORIES } from "../constants/eventCategories";
import { CategoryFilter } from "../components/CategoryFilter";
import { Button } from "../components/Button";
import AddToPlanModal from "../components/AddToPlanModal";

const CATEGORY_CHIP: Record<EventCategory, { bg: string; text: string }> = {
  culture: { bg: "bg-blue-50", text: "text-blue-700" },
  food: { bg: "bg-green-50", text: "text-green-700" },
  outdoor: { bg: "bg-teal-50", text: "text-teal-700" },
  history: { bg: "bg-orange-50", text: "text-orange-700" },
  nightlife: { bg: "bg-purple-50", text: "text-purple-700" },
  shopping: { bg: "bg-pink-50", text: "text-pink-700" },
  family: { bg: "bg-yellow-50", text: "text-yellow-700" },
  art: { bg: "bg-rose-50", text: "text-rose-700" },
  sports: { bg: "bg-cyan-50", text: "text-cyan-700" },
  other: { bg: "bg-gray-50", text: "text-gray-700" },
};

function formatEventCardWhen(iso: string): string {
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

function categoryChipClass(category: EventCategory): string {
  const c = CATEGORY_CHIP[category];
  return `${c.bg} ${c.text}`;
}

function EventCard({
  event,
  onAddToPlan,
}: {
  event: Event;
  onAddToPlan: () => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
      <div className="h-36 bg-gray-100 flex items-center justify-center text-4xl">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          "📍"
        )}
      </div>
      <div className="p-4">
        <div
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded mb-2 capitalize ${categoryChipClass(event.category)}`}
        >
          {event.category}
        </div>
        <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
        <p className="text-xs text-gray-500 mb-1">{event.location}</p>
        <p className="text-xs text-gray-400 mb-4">
          {formatEventCardWhen(event.start_datetime)}
        </p>
        <Button
          variant="outline"
          fullWidth
          text="+ Add to plan"
          onClick={onAddToPlan}
        />
      </div>
    </div>
  );
}

const EventsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | undefined
  >();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["events", selectedCategory],
    queryFn: () => getEvents({ category: selectedCategory }),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">
        Explore Edinburgh
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Discover events and add them to your trip plan
      </p>

      <CategoryFilter<EventCategory>
        className="mb-8"
        categories={EVENT_CATEGORIES}
        value={selectedCategory}
        onChange={setSelectedCategory}
        allLabel="All"
        isDisabled={isLoading}
      />

      {isLoading && (
        <div className="text-center text-gray-400 py-20">Loading events...</div>
      )}

      {isError && (
        <div className="text-center text-red-500 py-20">
          Failed to load events. Please try again.
        </div>
      )}

      {events && events.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          No events found for this category.
        </div>
      )}

      {events && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onAddToPlan={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {selectedEvent && (
        <AddToPlanModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(undefined)}
        />
      )}
    </div>
  );
};

export default EventsPage;
