import type { Event } from "../types/event";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  event: Event;
  onClose: () => void;
  onAddToPlan: () => void;
};

function formatWhen(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const startTime = s.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const endTime = e.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${startTime} – ${endTime}`;
}

const EventDetailModal = ({ event, onClose, onAddToPlan }: Props) => {
  const { isAdmin } = useAuth();

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-gray-100 flex items-center justify-center text-5xl">
            📍
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
            <button
              onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize mb-4">
            {event.category}
          </span>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <p>📍 {event.location}</p>
            <p>🕐 {formatWhen(event.start_datetime, event.end_datetime)}</p>
          </div>

          {event.description && (
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {event.description}
            </p>
          )}

          {!isAdmin && (
            <button
              onClick={onAddToPlan}
              className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              + Add to plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
