import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getItineraries, removeItineraryItem } from "../api/itinerary";

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

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 py-20">
        Loading your plans...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-20">
        Failed to load your plans. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1>My Plans</h1>
      <p>Your personalized trip plans</p>

      {itineraries && itineraries.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <p className="mb-2"> You have no plans set up yet.</p>
          <p className="text-sm text-gray-500">
            Go to Explore and add events to start building your trip
          </p>
        </div>
      )}

      {itineraries && itineraries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {itineraries.map((itinerary) => (
            <div key={itinerary.id}>
              <h2>{itinerary.name}</h2>
            </div>
          ))}
        </div>
      )}

      {itineraries &&
        itineraries.map((itinerary) => {
          const groupedByDay = itinerary.items.reduce(
            (acc, item) => {
              const day = item.day_index;
              if (!acc[day]) acc[day] = [];
              acc[day].push(item);
              return acc;
            },
            {} as Record<number, typeof itinerary.items>,
          );

          const sortedDays = Object.keys(groupedByDay).map(Number).sort();

          return (
            <div
              key={itinerary.id}
              className="bg-white border border-gray-100 rounded-xl mb-6 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="font-medium text-gray-900">
                    {itinerary.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(itinerary.start_date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}{" "}
                    →{" "}
                    {new Date(itinerary.end_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
                    <span className="text-xs font-medium text-gray-500">
                      Day {day}
                    </span>
                  </div>
                  {groupedByDay[day].map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 border-b border-gray-50 flex items-center justify-between last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                          📍
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {item.event.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.event.location}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              item.event.start_datetime,
                            ).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            —{" "}
                            {new Date(
                              item.event.end_datetime,
                            ).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {item.custom_note && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{item.custom_note}"
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          removeMutation.mutate({
                            itineraryId: itinerary.id,
                            itemId: item.id,
                          })
                        }
                        disabled={removeMutation.isPending}
                        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );
};

export default ItineraryPage;
