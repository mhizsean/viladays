import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents } from "../api/events";
import { createEvent, updateEvent, deleteEvent } from "../api/events";
import type { Event, EventCategory } from "../types/event";

const categories: EventCategory[] = [
  "culture",
  "food",
  "outdoor",
  "history",
  "nightlife",
  "shopping",
  "family",
  "art",
  "sports",
  "other",
];

const emptyForm = {
  title: "",
  description: "",
  category: "culture" as EventCategory,
  location: "",
  image_url: "",
  start_datetime: "",
  end_datetime: "",
};

const AdminPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEditingEvent(null);
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      category: event.category,
      location: event.location,
      image_url: event.image_url || "",
      start_datetime: event.start_datetime.slice(0, 16),
      end_datetime: event.end_datetime.slice(0, 16),
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      start_datetime: new Date(form.start_datetime).toISOString(),
      end_datetime: new Date(form.end_datetime).toISOString(),
    };
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyForm);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Manage events</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
          >
            + New event
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
          <h2 className="font-medium text-gray-900 mb-4">
            {editingEvent ? "Edit event" : "Create event"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start date & time
                </label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={form.start_datetime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End date & time
                </label>
                <input
                  type="datetime-local"
                  name="end_datetime"
                  value={form.end_datetime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 text-sm py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 text-sm py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingEvent
                    ? "Save changes"
                    : "Create event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-400 py-20">Loading events...</div>
      )}

      {events && events.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          No events yet. Create your first one.
        </div>
      )}

      {events && events.length > 0 && (
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
                {new Date(event.start_datetime).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-400">{event.location}</span>
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => handleEdit(event)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(event.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
