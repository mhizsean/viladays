import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getItineraries, removeItineraryItem } from "../api/itinerary";
import type { Itinerary, ItineraryItem } from "../types/itinerary";
import { Button } from "../components/Button";
import AddToTripModal from "../components/AddToTripModal";
import { useState } from "react";

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

function ItemRow({
  item,
  onRemove,
  removePending,
}: {
  item: ItineraryItem;
  onRemove: () => void;
  removePending: boolean;
}) {
  const isCustom = !item.event_id;
  const title = isCustom ? item.custom_title : item.event?.title;
  const location = isCustom ? item.custom_location : item.event?.location;
  const startTime = isCustom ? item.custom_start_time : item.event?.start_datetime;
  const endTime = isCustom ? item.custom_end_time : item.event?.end_datetime;

  return (
    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between last:border-0">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
          {isCustom ? "✏️" : "📍"}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-medium text-sm text-gray-900 truncate">{title}</p>
            {isCustom && (
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
                custom
              </span>
            )}
          </div>
          {location && (
            <p className="text-xs text-gray-400 truncate">{location}</p>
          )}
          {startTime && endTime && (
            <p className="text-xs text-gray-400">
              {formatTimeRangeEnGB(startTime, endTime)}
            </p>
          )}
          {item.custom_notes && (
            <p className="text-xs text-gray-500 mt-1 italic">
              {`"${item.custom_notes}"`}
            </p>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="text-xs shrink-0 px-3 py-1.5 text-red-600 border-red-100 hover:border-red-200 hover:bg-red-50 cursor-pointer"
        text="Remove"
        onClick={onRemove}
        disabled={removePending}
      />
    </div>
  );
}

function TripCard({
  itinerary,
  onRemoveItem,
  removePending,
  onAddCustom,
}: {
  itinerary: Itinerary;
  onRemoveItem: (itineraryId: number, itemId: number) => void;
  removePending: boolean;
  onAddCustom: (itineraryId: number) => void;
}) {
  const byDay = groupItemsByDay(itinerary.items);
  const sortedDays = Object.keys(byDay).map(Number).sort((a, b) => a - b);

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
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {itinerary.items.length}{" "}
            {itinerary.items.length === 1 ? "event" : "events"}
          </span>
          <Button
            variant="outline"
            text="+ Custom event"
            className="text-xs px-3 py-1.5"
            onClick={() => onAddCustom(itinerary.id)}
          />
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
            <ItemRow
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(itinerary.id, item.id)}
              removePending={removePending}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const ItineraryPage = () => {
  const queryClient = useQueryClient();
  const [customTripId, setCustomTripId] = useState<number | null>(null);

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
      <h1 className="text-2xl font-medium text-gray-900 mb-1">My Trips</h1>
      <p className="text-sm text-gray-500 mb-8">Your personalised trip itineraries</p>

      {isLoading && (
        <div className="text-center text-gray-400 py-20">
          Loading your trips...
        </div>
      )}

      {isError && (
        <div className="text-center text-red-500 py-20">
          Failed to load your trips. Please try again.
        </div>
      )}

      {!isLoading && !isError && itineraries?.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <p className="mb-2">You have no trips set up yet.</p>
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
          <TripCard
            key={itinerary.id}
            itinerary={itinerary}
            onRemoveItem={(itineraryId, itemId) =>
              removeMutation.mutate({ itineraryId, itemId })
            }
            removePending={removeMutation.isPending}
            onAddCustom={(id) => setCustomTripId(id)}
          />
        ))}

      {customTripId !== null && (() => {
        const trip = itineraries?.find(t => t.id === customTripId);
        return (
          <AddToTripModal
            mode="custom"
            preselectedTripId={customTripId}
            tripStartDate={trip?.start_date}
            tripEndDate={trip?.end_date}
            onClose={() => {
              setCustomTripId(null);
              queryClient.invalidateQueries({ queryKey: ["itineraries"] });
            }}
          />
        );
      })()}
    </div>
  );
};

export default ItineraryPage;
