import type { AdminEventFormValues } from "../../lib/adminEventForm";
import { EVENT_CATEGORIES } from "../../constants/eventCategories";
import { FormTextField } from "../FormTextField";
import { FormSelect } from "../FormSelect";
import { FormTextArea } from "../FormTextArea";
import { Button } from "../Button";

type AdminEventFormProps = {
  form: AdminEventFormValues;
  mode: "create" | "edit";
  isSaving: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function AdminEventForm({
  form,
  mode,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: AdminEventFormProps) {
  const submitLabel = isSaving
    ? "Saving..."
    : mode === "edit"
      ? "Save changes"
      : "Create event";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
      <h2 className="font-medium text-gray-900 mb-4">
        {mode === "edit" ? "Edit event" : "Create event"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            label="Title"
            name="title"
            value={form.title}
            onChange={onChange}
            required
          />
          <FormSelect
            label="Category"
            name="category"
            value={form.category}
            onChange={onChange}
          >
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FormSelect>
        </div>
        <FormTextField
          label="Location"
          name="location"
          value={form.location}
          onChange={onChange}
          required
        />
        <FormTextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={onChange}
          rows={3}
        />
        <FormTextField
          label="Image URL"
          name="image_url"
          value={form.image_url}
          onChange={onChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormTextField
            label="Start date & time"
            type="datetime-local"
            name="start_datetime"
            value={form.start_datetime}
            onChange={onChange}
            required
          />
          <FormTextField
            label="End date & time"
            type="datetime-local"
            name="end_datetime"
            value={form.end_datetime}
            onChange={onChange}
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            text="Cancel"
            onClick={onCancel}
          />
          <Button
            type="submit"
            variant="solid"
            fullWidth
            text={submitLabel}
            disabled={isSaving}
          />
        </div>
      </form>
    </div>
  );
}
