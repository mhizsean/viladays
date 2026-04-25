import type { ButtonHTMLAttributes } from "react";

export type PillButtonProps = {
  isActive?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

export function PillButton({
  isActive,
  className,
  disabled,
  ...props
}: PillButtonProps) {
  const base =
    "px-4 py-1.5 rounded-full text-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30";
  const active = "bg-gray-900 text-white border-gray-900";
  const inactive =
    "bg-white text-gray-600 border-gray-200 hover:border-gray-400";
  const disabledStyles = "opacity-60 pointer-events-none";

  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        base,
        isActive ? active : inactive,
        disabled ? disabledStyles : "",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}

