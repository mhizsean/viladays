import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getItineraries,
  createItinerary,
  addItineraryItem,
} from "../api/itinerary";
import type { Event } from "../types/event";

type Props =
  | { mode?: "event"; event: Event; preselectedTripId?: number; tripStartDate?: string; tripEndDate?: string; onClose: () => void }
  | { mode: "custom"; event?: never; preselectedTripId?: number; tripStartDate?: string; tripEndDate?: string; onClose: () => void };

type View = "select" | "create" | "custom-form";

/** Format ISO date string to datetime-local min/max value */
function toLocalMin(iso: string) {
  return iso.slice(0, 10) + "T00:00";
}
function toLocalMax(iso: string) {
  return iso.slice(0, 10) + "T23:59";
}

const AddToTripModal = ({ mode = "event", event, preselectedTripId, tripStartDate, tripEndDate, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>(mode === "custom" ? "custom-form" : "select");
  const [selectedTripId, setSelectedTripId] = useState<number | null>(preselectedTripId ?? null);
  const [dayIndex, setDayIndex] = useState(1);

  // Create trip form
  const [newTripName, setNewTripName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  // Custom event form
  const [customTitle, setCustomTitle] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [customDay, setCustomDay] = useState(1);
  const [customFormError, setCustomFormError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const { data: itineraries, isLoading } = useQuery({
    queryKey: ["itineraries"],
    queryFn: getItineraries,
  });

  // Derive date bounds: prefer props (when opened from trip card), else look up selected trip
  const tripBounds = useMemo(() => {
    const start = tripStartDate ?? itineraries?.find(t => t.id === selectedTripId)?.start_date;
    const end = tripEndDate ?? itineraries?.find(t => t.id === selectedTripId)?.end_date;
    if (!start || !end) return null;
    return { min: toLocalMin(start), max: toLocalMax(end) };
  }, [tripStartDate, tripEndDate, itineraries, selectedTripId]);

  const createMutation = useMutation({
    mutationFn: createItinerary,
    onSuccess: (newTrip) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setSelectedTripId(newTrip.id);
      setView(mode === "custom" ? "custom-form" : "select");
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      tripId,
      data,
    }: {
      tripId: number;
      data: Parameters<typeof addItineraryItem>[1];
    }) => addItineraryItem(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleAddEvent = () => {
    if (!selectedTripId || !event) return;
    addItemMutation.mutate({
      tripId: selectedTripId,
      data: { event_id: event.id, day_index: dayIndex },
    });
  };

  const handleAddCustom = () => {
    if (!customTitle.trim()) { setCustomFormError("Title is required."); return; }
    if (!selectedTripId) { setCustomFormError("Please select a trip first."); return; }
    if (customStartTime && customEndTime && customEndTime < customStartTime) {
      setCustomFormError("End time must be after start time.");
      return;
    }
    if (tripBounds) {
      if (customStartTime && (customStartTime < tripBounds.min || customStartTime > tripBounds.max)) {
        setCustomFormError(`Start time must be within the trip dates (${tripBounds.min.slice(0,10)} – ${tripBounds.max.slice(0,10)}).`);
        return;
      }
      if (customEndTime && (customEndTime < tripBounds.min || customEndTime > tripBounds.max)) {
        setCustomFormError(`End time must be within the trip dates (${tripBounds.min.slice(0,10)} – ${tripBounds.max.slice(0,10)}).`);
        return;
      }
    }
    setCustomFormError(null);
    addItemMutation.mutate({
      tripId: selectedTripId,
      data: {
        custom_title: customTitle.trim(),
        custom_location: customLocation.trim() || undefined,
        custom_start_time: customStartTime || undefined,
        custom_end_time: customEndTime || undefined,
        custom_notes: customNotes.trim() || undefined,
        day_index: customDay,
      },
    });
  };

  const handleCreate = () => {
    if (!newTripName || !newStartDate || !newEndDate) return;
    if (newEndDate < newStartDate) {
      setCreateFormError("End date must be on or after the start date.");
      return;
    }
    setCreateFormError(null);
    createMutation.mutate({
      name: newTripName,
      start_date: new Date(newStartDate).toISOString(),
      end_date: new Date(newEndDate).toISOString(),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-medium text-gray-900">Added to your trip</p>
          </div>

        ) : view === "custom-form" ? (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Add your own event</h2>
            <p className="text-sm text-gray-500 mb-4">Add an event not listed on the platform</p>

            {tripBounds && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-4">
                Event times must be between <span className="font-medium">{tripBounds.min.slice(0,10)}</span> and <span className="font-medium">{tripBounds.max.slice(0,10)}</span>
              </p>
            )}

            {/* Trip selector (only shown if no preselectedTripId) */}
            {preselectedTripId === undefined && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip</label>
                {isLoading ? (
                  <p className="text-sm text-gray-400">Loading trips...</p>
                ) : (
                  <div className="space-y-2">
                    {itineraries?.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTripId(t.id); setCustomStartTime(""); setCustomEndTime(""); }}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                          selectedTripId === t.id
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-medium text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(t.start_date).toLocaleDateString("en-GB")} →{" "}
                          {new Date(t.end_date).toLocaleDateString("en-GB")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner at The Witchery"
                  value={customTitle}
                  onChange={(e) => { setCustomTitle(e.target.value); setCustomFormError(null); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Mile, Edinburgh"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                  <input
                    type="datetime-local"
                    value={customStartTime}
                    min={tripBounds?.min}
                    max={tripBounds?.max}
                    onChange={(e) => { setCustomStartTime(e.target.value); setCustomFormError(null); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                  <input
                    type="datetime-local"
                    value={customEndTime}
                    min={customStartTime || tripBounds?.min}
                    max={tripBounds?.max}
                    onChange={(e) => { setCustomEndTime(e.target.value); setCustomFormError(null); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <input
                  type="number"
                  min={1}
                  value={customDay}
                  onChange={(e) => setCustomDay(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  placeholder="Any notes about this event..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </div>

            {customFormError && (
              <p className="text-sm text-red-600 mb-3">{customFormError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 text-sm py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustom}
                disabled={addItemMutation.isPending}
                className="flex-1 text-sm py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {addItemMutation.isPending ? "Saving..." : "Save event"}
              </button>
            </div>
          </>

        ) : view === "select" ? (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Add to trip</h2>
            {event && <p className="text-sm text-gray-500 mb-4">Adding: {event.title}</p>}

            {isLoading && <p className="text-sm text-gray-400">Loading your trips...</p>}

            {itineraries && itineraries.length === 0 && (
              <p className="text-sm text-gray-400 mb-4">You have no trips yet.</p>
            )}

            {itineraries && itineraries.length > 0 && (
              <div className="space-y-2 mb-4">
                {itineraries.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selectedTripId === trip.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium text-gray-900">{trip.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(trip.start_date).toLocaleDateString("en-GB")} →{" "}
                      {new Date(trip.end_date).toLocaleDateString("en-GB")}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedTripId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <input
                  type="number"
                  min={1}
                  value={dayIndex}
                  onChange={(e) => setDayIndex(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setView("create")}
                className="flex-1 text-sm py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                + New trip
              </button>
              {selectedTripId && (
                <button
                  onClick={handleAddEvent}
                  disabled={addItemMutation.isPending}
                  className="flex-1 text-sm py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {addItemMutation.isPending ? "Adding..." : "Add to trip"}
                </button>
              )}
            </div>
          </>

        ) : (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create a new trip</h2>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip name</label>
                <input
                  type="text"
                  placeholder="My Edinburgh trip"
                  value={newTripName}
                  onChange={(e) => { setNewTripName(e.target.value); setCreateFormError(null); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewStartDate(v);
                    setCreateFormError(null);
                    if (v && newEndDate && newEndDate < v) setNewEndDate(v);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                <input
                  type="date"
                  value={newEndDate}
                  min={newStartDate || undefined}
                  onChange={(e) => { setNewEndDate(e.target.value); setCreateFormError(null); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            {createFormError && (
              <p className="text-sm text-red-600 mb-3">{createFormError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setView(mode === "custom" ? "custom-form" : "select")}
                className="flex-1 text-sm py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || Boolean(newStartDate && newEndDate && newEndDate < newStartDate)}
                className="flex-1 text-sm py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? "Creating..." : "Create trip"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToTripModal;
