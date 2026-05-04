import { useCallback, useState } from "react";
import type { Event, EventCategory } from "../types/event";
import {
  emptyAdminEventForm,
  eventToAdminFormValues,
  adminFormValuesToApiPayload,
  type AdminEventFormValues,
} from "../lib/adminEventForm";
import { useAdminEventsPanel } from "../hooks/useAdminEventsPanel";
import { AdminPageHeader } from "../components/admin/AdminPageHeader";
import { AdminEventForm } from "../components/admin/AdminEventForm";
import { AdminEventsTable } from "../components/admin/AdminEventsTable";

const AdminPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<AdminEventFormValues>(emptyAdminEventForm);

  const resetFormAndClose = useCallback(() => {
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyAdminEventForm());
  }, []);

  const { eventsQuery, createMutation, updateMutation, deleteMutation } =
    useAdminEventsPanel({ onSaved: resetFormAndClose });

  const { data: events, isLoading } = eventsQuery;

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setForm(eventToAdminFormValues(event));
    setShowForm(true);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = adminFormValuesToApiPayload(form);
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCancel = () => {
    resetFormAndClose();
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) =>
      name === "category"
        ? { ...prev, category: value as EventCategory }
        : { ...prev, [name]: value },
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AdminPageHeader
        title="Admin"
        description="Manage events"
        showNewButton={!showForm}
        onNewClick={() => setShowForm(true)}
      />

      {showForm && (
        <AdminEventForm
          form={form}
          mode={editingEvent ? "edit" : "create"}
          isSaving={isSaving}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
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
        <AdminEventsTable
          events={events}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
          isDeletePending={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminPage;
