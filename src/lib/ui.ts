import clsx from "clsx";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "light";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  accent: "bg-cobalt text-white hover:bg-cobalt-deep",
  outline: "border border-line bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-sand",
  light: "bg-white text-ink hover:bg-sand",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

/** Class names for buttons and button-looking links. */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
