import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = {
  variant?: "outline" | "solid";
  fullWidth?: boolean;
  /** Label when you omit `children`. `children` wins if both are set. */
  text?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "outline",
  fullWidth,
  className,
  type = "button",
  text,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    outline:
      "border border-gray-200 bg-white text-gray-900 hover:border-gray-400",
    solid: "border border-gray-900 bg-gray-900 text-white hover:bg-gray-800",
  };

  const content = children ?? text;

  return (
    <button
      type={type}
      className={[
        base,
        variants[variant],
        fullWidth ? "w-full" : "",
        variant === "outline" ? "py-1.5" : "py-2",
        className ?? "",
      ].join(" ")}
      {...rest}
    >
      {content}
    </button>
  );
}
