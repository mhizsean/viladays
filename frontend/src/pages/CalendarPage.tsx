import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../api/events";
import type { Event, EventCategory } from "../types/event";
import AddToTripModal from "../components/AddToTripModal";
import { useAuth } from "../contexts/AuthContext";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const CATEGORY_COLOR: Record<EventCategory, { dot: string; pill: string }> = {
  culture:   { dot: "bg-blue-400",   pill: "bg-blue-50 text-blue-700 border-blue-100" },
  food:      { dot: "bg-green-400",  pill: "bg-green-50 text-green-700 border-green-100" },
  outdoor:   { dot: "bg-teal-400",   pill: "bg-teal-50 text-teal-700 border-teal-100" },
  history:   { dot: "bg-orange-400", pill: "bg-orange-50 text-orange-700 border-orange-100" },
  nightlife: { dot: "bg-purple-400", pill: "bg-purple-50 text-purple-700 border-purple-100" },
  shopping:  { dot: "bg-pink-400",   pill: "bg-pink-50 text-pink-700 border-pink-100" },
  family:    { dot: "bg-yellow-400", pill: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  art:       { dot: "bg-rose-400",   pill: "bg-rose-50 text-rose-700 border-rose-100" },
  sports:    { dot: "bg-cyan-400",   pill: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  other:     { dot: "bg-gray-400",   pill: "bg-gray-50 text-gray-700 border-gray-100" },
};

function eventsOnDay(events: Event[] | undefined, year: number, month: number, day: number): Event[] {
  if (!events?.length) return [];
  return events.filter((e) => {
    const d = new Date(e.start_datetime);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });
}

function buildCells(firstDayOfWeek: number, daysInMonth: number): (number | null)[] {
  // firstDayOfWeek from JS Date is 0=Sun; we display Mon-first so shift
  const offset = (firstDayOfWeek + 6) % 7;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const CalendarPage = () => {
  const { isAdmin } = useAuth();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth((m) => {
      if (m === 0) { setCurrentYear((y) => y - 1); return 11; }
      return m - 1;
    });
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth((m) => {
      if (m === 11) { setCurrentYear((y) => y + 1); return 0; }
      return m + 1;
    });
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  const cells = useMemo(() => buildCells(firstDayOfMonth, daysInMonth), [firstDayOfMonth, daysInMonth]);

  const selectedDayEvents = useMemo(
    () => selectedDate
      ? eventsOnDay(events, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      : [],
    [events, selectedDate],
  );

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse events by date</p>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={goToToday}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-400 text-gray-600 transition-colors"
          >
            Today
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="font-semibold text-gray-900 text-base">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-3 tracking-wide uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day == null) {
                return <div key={`e-${i}`} className="min-h-24 border-b border-r border-gray-50 bg-gray-50/50" />;
              }

              const dayEvents = eventsOnDay(events, currentYear, currentMonth, day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                  className={`min-h-24 border-b border-r border-gray-100 p-2 cursor-pointer transition-all group
                    ${isSelected ? "bg-gray-900" : isToday ? "bg-gray-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                        ${isSelected ? "bg-white text-gray-900" : isToday ? "bg-gray-900 text-white" : "text-gray-500 group-hover:text-gray-900"}`}
                    >
                      {day}
                    </span>
                    {hasEvents && !isSelected && (
                      <span className="text-xs text-gray-400 font-medium">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate
                          ${isSelected ? "bg-white/15 text-white" : `${CATEGORY_COLOR[event.category].pill} border`}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-white" : CATEGORY_COLOR[event.category].dot}`} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className={`text-xs px-1.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col">
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl mb-3">📅</div>
              <p className="text-sm font-medium text-gray-700 mb-1">Select a day</p>
              <p className="text-xs text-gray-400">Click any date to see events</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                  {selectedDate.toLocaleDateString("en-GB", { weekday: "long" })}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {selectedDayEvents.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "event" : "events"}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No events on this day</p>
                  </div>
                ) : (
                  selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors"
                    >
                      {event.image_url && (
                        <img src={event.image_url} alt={event.title} className="w-full h-24 object-cover" />
                      )}
                      <div className="p-3">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border capitalize mb-2 font-medium ${CATEGORY_COLOR[event.category].pill}`}>
                          {event.category}
                        </span>
                        <p className="font-semibold text-sm text-gray-900 mb-1">{event.title}</p>
                        <p className="text-xs text-gray-400 mb-0.5">📍 {event.location}</p>
                        <p className="text-xs text-gray-400 mb-3">
                          🕐 {formatTime(event.start_datetime)} – {formatTime(event.end_datetime)}
                        </p>
                        {!isAdmin && (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-xs py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors font-medium"
                          >
                            + Add to trip
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedEvent && (
        <AddToTripModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
