import { useId, type ComponentPropsWithoutRef } from "react";

const baseInputClassName =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export type FormTextFieldProps = {
  label: string;
  /** Classes on the outer wrapper (e.g. layout in a grid). */
  wrapperClassName?: string;
  /** Extra classes on the `<input>` (after base styles). */
  inputClassName?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "className">;

export function FormTextField({
  label,
  id: idProp,
  name,
  wrapperClassName,
  inputClassName,
  required,
  ...inputProps
}: FormTextFieldProps) {
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
      <input
        id={id}
        name={name}
        required={required}
        className={[baseInputClassName, inputClassName].filter(Boolean).join(" ")}
        {...inputProps}
      />
    </div>
  );
}
