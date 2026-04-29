import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getItineraries,
  createItinerary,
  addItineraryItem,
} from "../api/itinerary";
import type { Event } from "../types/event";

type Props = {
  event: Event;
  onClose: () => void;
};

const AddToPlanModal = ({ event, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"select" | "create">("select");
  const [selectedItineraryId, setSelectedItineraryId] = useState<number | null>(
    null,
  );
  const [dayIndex, setDayIndex] = useState(1);
  const [newPlanName, setNewPlanName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: itineraries, isLoading } = useQuery({
    queryKey: ["itineraries"],
    queryFn: getItineraries,
  });

  const createMutation = useMutation({
    mutationFn: createItinerary,
    onSuccess: (newItinerary) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setSelectedItineraryId(newItinerary.id);
      setView("select");
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      itineraryId,
      eventId,
      day,
    }: {
      itineraryId: number;
      eventId: number;
      day: number;
    }) => addItineraryItem(itineraryId, { event_id: eventId, day_index: day }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleAdd = () => {
    if (!selectedItineraryId) return;
    addItemMutation.mutate({
      itineraryId: selectedItineraryId,
      eventId: event.id,
      day: dayIndex,
    });
  };

  const handleCreate = () => {
    if (!newPlanName || !newStartDate || !newEndDate) return;
    if (newEndDate < newStartDate) {
      setCreateFormError("End date must be on or after the start date.");
      return;
    }
    setCreateFormError(null);
    createMutation.mutate({
      name: newPlanName,
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
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-medium text-gray-900">Added to your plan</p>
          </div>
        ) : view === "select" ? (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Add to plan
            </h2>
            <p className="text-sm text-gray-500 mb-4">Adding: {event.title}</p>

            {isLoading && (
              <p className="text-sm text-gray-400">Loading your plans...</p>
            )}

            {itineraries && itineraries.length === 0 && (
              <p className="text-sm text-gray-400 mb-4">
                You have no plans yet.
              </p>
            )}

            {itineraries && itineraries.length > 0 && (
              <div className="space-y-2 mb-4">
                {itineraries.map((itin) => (
                  <button
                    key={itin.id}
                    onClick={() => setSelectedItineraryId(itin.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selectedItineraryId === itin.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium text-gray-900">{itin.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(itin.start_date).toLocaleDateString("en-GB")} →{" "}
                      {new Date(itin.end_date).toLocaleDateString("en-GB")}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedItineraryId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
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
                + New plan
              </button>
              {selectedItineraryId && (
                <button
                  onClick={handleAdd}
                  disabled={addItemMutation.isPending}
                  className="flex-1 text-sm py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {addItemMutation.isPending ? "Adding..." : "Add to plan"}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Create a new plan
            </h2>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan name
                </label>
                <input
                  type="text"
                  placeholder="My Edinburgh trip"
                  value={newPlanName}
                  onChange={(e) => {
                    setNewPlanName(e.target.value);
                    setCreateFormError(null);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewStartDate(v);
                    setCreateFormError(null);
                    if (v && newEndDate && newEndDate < v) {
                      setNewEndDate(v);
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End date
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  min={newStartDate || undefined}
                  onChange={(e) => {
                    setNewEndDate(e.target.value);
                    setCreateFormError(null);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            {createFormError && (
              <p className="text-sm text-red-600 mb-3">{createFormError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setView("select")}
                className="flex-1 text-sm py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  createMutation.isPending ||
                  Boolean(
                    newStartDate &&
                      newEndDate &&
                      newEndDate < newStartDate,
                  )
                }
                className="flex-1 text-sm py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? "Creating..." : "Create plan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToPlanModal;
