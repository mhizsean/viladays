import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../api/events";
import type { Event } from "../types/event";
import AddToPlanModal from "../components/AddToPlanModal";

const categoryColors: Record<string, string> = {
  culture: "bg-blue-50 text-blue-700 border-blue-100",
  food: "bg-green-50 text-green-700 border-green-100",
  outdoor: "bg-teal-50 text-teal-700 border-teal-100",
  history: "bg-orange-50 text-orange-700 border-orange-100",
  nightlife: "bg-purple-50 text-purple-700 border-purple-100",
  shopping: "bg-pink-50 text-pink-700 border-pink-100",
  family: "bg-yellow-50 text-yellow-700 border-yellow-100",
  art: "bg-rose-50 text-rose-700 border-rose-100",
  sports: "bg-cyan-50 text-cyan-700 border-cyan-100",
  other: "bg-gray-50 text-gray-700 border-gray-100",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CalendarPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_datetime);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });
  };

  const getDayEvents = (date: Date) => {
    if (!events) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_datetime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  const selectedDayEvents = selectedDate ? getDayEvents(selectedDate) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Calendar</h1>
      <p className="text-sm text-gray-500 mb-8">Browse events by date</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        {/* Calendar grid */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={prevMonth}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              ←
            </button>
            <span className="font-medium text-gray-900">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, index) => {
              if (!day)
                return (
                  <div
                    key={`empty-${index}`}
                    className="border-b border-r border-gray-50 min-h-[80px]"
                  />
                );

              const dayEvents = getEventsForDay(day);
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentMonth &&
                selectedDate?.getFullYear() === currentYear;

              return (
                <div
                  key={day}
                  onClick={() =>
                    setSelectedDate(new Date(currentYear, currentMonth, day))
                  }
                  className={`border-b border-r border-gray-50 min-h-[80px] p-1.5 cursor-pointer transition-colors ${
                    isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      isToday
                        ? "bg-gray-900 text-white font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded border truncate ${categoryColors[event.category]}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-400 px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          {!selectedDate ? (
            <div className="text-center text-gray-400 text-sm py-8">
              Click a day to see events
            </div>
          ) : (
            <>
              <h3 className="font-medium text-gray-900 mb-4">
                {selectedDate.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>

              {selectedDayEvents.length === 0 && (
                <p className="text-sm text-gray-400">No events on this day</p>
              )}

              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-100 rounded-lg p-3"
                  >
                    <div
                      className={`inline-block text-xs px-2 py-0.5 rounded border capitalize mb-2 ${categoryColors[event.category]}`}
                    >
                      {event.category}
                    </div>
                    <p className="font-medium text-sm text-gray-900 mb-1">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">
                      {event.location}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(event.start_datetime).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}{" "}
                      —{" "}
                      {new Date(event.end_datetime).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-xs py-1.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                    >
                      + Add to plan
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedEvent && (
        <AddToPlanModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
