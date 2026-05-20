import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-forest text-white hover:bg-[#084636]",
  secondary: "border border-line bg-white text-ink hover:bg-mist",
  ghost: "bg-transparent text-graphite hover:bg-mist"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-forest/25 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      type={type}
      {...props}
    />
  );
}
