import { useId, type ComponentPropsWithoutRef } from "react";

const textareaClassName =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export type FormTextAreaProps = {
  label: string;
  wrapperClassName?: string;
} & Omit<ComponentPropsWithoutRef<"textarea">, "className">;

export function FormTextArea({
  label,
  id: idProp,
  name,
  wrapperClassName,
  required,
  ...textareaProps
}: FormTextAreaProps) {
  const uid = useId();
  const id = idProp ?? (name != null ? `${uid}-${String(name)}` : uid);

  return (
    <div className={wrapperClassName}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        className={textareaClassName}
        {...textareaProps}
      />
    </div>
  );
}
