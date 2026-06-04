import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue text-white hover:bg-azure",
  secondary: "border border-line bg-graphite text-white hover:border-blue/60",
  ghost: "bg-transparent text-silver hover:bg-white/5 hover:text-white"
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
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      type={type}
      {...props}
    />
  );
}
