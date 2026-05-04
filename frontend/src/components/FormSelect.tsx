import {
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

const selectClassName =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export type FormSelectProps = {
  label: string;
  wrapperClassName?: string;
} & Omit<ComponentPropsWithoutRef<"select">, "className" | "children"> & {
  children: ReactNode;
};

export function FormSelect({
  label,
  id: idProp,
  name,
  wrapperClassName,
  required,
  children,
  ...selectProps
}: FormSelectProps) {
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
      <select
        id={id}
        name={name}
        required={required}
        className={selectClassName}
        {...selectProps}
      >
        {children}
      </select>
    </div>
  );
}
