import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../api/events";
import type { Event, EventCategory } from "../types/event";
import { CategoryFilter } from "../components/CategoryFilter";
import { Button } from "../components/Button";
import AddToTripModal from "../components/AddToTripModal";
import EventDetailModal from "../components/EventDetailModal";
import { useAuth } from "../contexts/AuthContext";

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
  onView,
  onAddToPlan,
  showAddToPlan,
}: {
  event: Event;
  onView: () => void;
  onAddToPlan: () => void;
  showAddToPlan: boolean;
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
        <div className={`flex gap-2 ${showAddToPlan ? "" : ""}`}>
          <Button variant="outline" fullWidth text="View" onClick={onView} />
          {showAddToPlan && (
            <Button
              variant="outline"
              fullWidth
              text="+ Add to plan"
              onClick={onAddToPlan}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const EventsPage = () => {
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | undefined
  >();
  const [viewingEvent, setViewingEvent] = useState<Event | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  const {
    data: allEvents,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  const availableCategories = useMemo<EventCategory[]>(() => {
    if (!allEvents) return [];
    const seen = new Set<EventCategory>();
    for (const e of allEvents) seen.add(e.category);
    return Array.from(seen);
  }, [allEvents]);

  const events = useMemo(() => {
    if (!allEvents) return [];
    if (!selectedCategory) return allEvents;
    return allEvents.filter((e) => e.category === selectedCategory);
  }, [allEvents, selectedCategory]);

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
        categories={availableCategories}
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

      {!isLoading && events.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          No events found for this category.
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showAddToPlan={!isAdmin}
              onView={() => setViewingEvent(event)}
              onAddToPlan={() => setSelectedEvent(event)}
            />
          ))}
        </div>
      )}

      {viewingEvent && (
        <EventDetailModal
          event={viewingEvent}
          onClose={() => setViewingEvent(undefined)}
          onAddToPlan={() => {
            setSelectedEvent(viewingEvent);
            setViewingEvent(undefined);
          }}
        />
      )}

      {selectedEvent && (
        <AddToTripModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(undefined)}
        />
      )}
    </div>
  );
};

export default EventsPage;
