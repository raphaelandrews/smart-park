import { cn } from "@web/ui/lib/utils";
import type { ReactNode } from "react";

export type StatusTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-input bg-muted text-muted-foreground",
  brand: "border-primary-200 bg-primary-50 text-primary-800",
  success: "border-success/20 bg-success-bg text-success",
  warning: "border-warning/20 bg-warning-bg text-warning",
  danger: "border-danger/20 bg-danger-bg text-danger",
  info: "border-info/20 bg-info-bg text-info",
};

interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ tone = "neutral", children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-3 py-0.5 text-xs leading-none font-medium whitespace-nowrap tabular-nums",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
