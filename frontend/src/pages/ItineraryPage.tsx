import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getItineraries, removeItineraryItem } from "../api/itinerary";
import type { Itinerary, ItineraryItem } from "../types/itinerary";
import { Button } from "../components/Button";

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeRangeEnGB(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${new Date(startIso).toLocaleTimeString("en-GB", opts)} — ${new Date(endIso).toLocaleTimeString("en-GB", opts)}`;
}

function groupItemsByDay(
  items: ItineraryItem[],
): Record<number, ItineraryItem[]> {
  return items.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
    const day = item.day_index;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
}

function ItineraryCard({
  itinerary,
  onRemoveItem,
  removePending,
}: {
  itinerary: Itinerary;
  onRemoveItem: (itineraryId: number, itemId: number) => void;
  removePending: boolean;
}) {
  const byDay = groupItemsByDay(itinerary.items);
  const sortedDays = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-white border border-gray-100 rounded-xl mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="font-medium text-gray-900">{itinerary.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatShortDate(itinerary.start_date)} →{" "}
            {formatShortDate(itinerary.end_date)}
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {itinerary.items.length}{" "}
          {itinerary.items.length === 1 ? "event" : "events"}
        </div>
      </div>

      {itinerary.items.length === 0 && (
        <div className="px-6 py-8 text-center text-sm text-gray-400">
          No events added yet
        </div>
      )}

      {sortedDays.map((day) => (
        <div key={day}>
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">Day {day}</span>
          </div>
          {byDay[day].map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 border-b border-gray-50 flex items-center justify-between last:border-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                  📍
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {item.event.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {item.event.location}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeRangeEnGB(
                      item.event.start_datetime,
                      item.event.end_datetime,
                    )}
                  </p>
                  {item.custom_note && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {`"${item.custom_note}"`}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-xs shrink-0 px-3 py-1.5 text-red-600 border-red-100 hover:border-red-200 hover:bg-red-50 cursor-pointer"
                text="Remove"
                onClick={() => onRemoveItem(itinerary.id, item.id)}
                disabled={removePending}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const ItineraryPage = () => {
  const queryClient = useQueryClient();
  const {
    data: itineraries,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["itineraries"],
    queryFn: getItineraries,
  });

  const removeMutation = useMutation({
    mutationFn: ({
      itineraryId,
      itemId,
    }: {
      itineraryId: number;
      itemId: number;
    }) => removeItineraryItem(itineraryId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">My Plans</h1>
      <p className="text-sm text-gray-500 mb-8">Your personalized trip plans</p>

      {isLoading && (
        <div className="text-center text-gray-400 py-20">
          Loading your plans...
        </div>
      )}

      {isError && (
        <div className="text-center text-red-500 py-20">
          Failed to load your plans. Please try again.
        </div>
      )}

      {!isLoading && !isError && itineraries?.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <p className="mb-2">You have no plans set up yet.</p>
          <p className="text-sm text-gray-500">
            Go to Explore and add events to start building your trip
          </p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        itineraries &&
        itineraries.length > 0 &&
        itineraries.map((itinerary) => (
          <ItineraryCard
            key={itinerary.id}
            itinerary={itinerary}
            onRemoveItem={(itineraryId, itemId) =>
              removeMutation.mutate({ itineraryId, itemId })
            }
            removePending={removeMutation.isPending}
          />
        ))}
    </div>
  );
};

export default ItineraryPage;
