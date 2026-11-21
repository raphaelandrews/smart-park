import { cn } from "@web/ui/lib/utils";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Section title with an optional trailing link/action ("Ver todos"). */
export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="text-[17px] leading-6 font-semibold sm:text-xl sm:leading-7">{title}</h2>
        {description ? (
          <p className="text-[13px] leading-[18px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
