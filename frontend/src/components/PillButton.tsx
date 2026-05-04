import type { ButtonHTMLAttributes } from "react";

export type PillButtonProps = {
  isActive?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

/** Matches floating-nav “pill” style: active = solid black, inactive = text only + hover wash. */
export function PillButton({
  isActive,
  className,
  disabled,
  ...props
}: PillButtonProps) {
  const base =
    "rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2";
  const active = "bg-gray-900 text-white";
  const inactive =
    "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent";
  const disabledStyles = "opacity-50 pointer-events-none";

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
