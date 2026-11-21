import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@web/ui/lib/utils";
import type { ReactNode } from "react";

interface InfoStripProps {
  icon: IconSvgElement;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Inset gray summary strip from the checkout reference (ETA/time card). The
 * illustration/icon sits directly on the strip — no tile behind it.
 */
export function InfoStrip({ icon, title, description, action, className }: InfoStripProps) {
  return (
    <div
      data-slot="info-strip"
      className={cn("flex items-center gap-4 rounded-xl bg-secondary px-5 py-4", className)}
    >
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className="size-11 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xl leading-[26px] font-semibold text-balance tabular-nums">{title}</p>
        {description ? (
          <p className="text-[13px] leading-[18px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
