import type { Event } from "../../types/event";
import { formatEventListDate } from "../../lib/formatEventDate";

type AdminEventsTableProps = {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  isDeletePending: boolean;
};

export function AdminEventsTable({
  events,
  onEdit,
  onDelete,
  isDeletePending,
}: AdminEventsTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 gap-4">
        <span>Title</span>
        <span>Category</span>
        <span>Date</span>
        <span>Location</span>
        <span>Actions</span>
      </div>
      {events.map((event) => (
        <div
          key={event.id}
          className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-4 border-b border-gray-50 last:border-0 items-center gap-4"
        >
          <span className="text-sm font-medium text-gray-900">
            {event.title}
          </span>
          <span className="text-xs capitalize text-gray-500">
            {event.category}
          </span>
          <span className="text-xs text-gray-400">
            {formatEventListDate(event.start_datetime)}
          </span>
          <span className="text-xs text-gray-400">{event.location}</span>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => onEdit(event)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              disabled={isDeletePending}
              className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
