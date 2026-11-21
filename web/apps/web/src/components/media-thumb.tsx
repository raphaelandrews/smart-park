import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@web/ui/lib/utils";

interface MediaThumbProps {
  icon: IconSvgElement;
  /** `sm` for dense table rows (40px), `md` for mobile media rows (88px). */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Neutral identity tile used in tables and mobile media rows. Mirrors the product
 * thumbnails from the checkout reference without requiring photos.
 */
export function MediaThumb({ icon, size = "md", className }: MediaThumbProps) {
  return (
    <span
      data-slot="media-thumb"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground",
        size === "sm" ? "size-10" : "size-[88px] md:size-[72px]",
        className,
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className={size === "sm" ? "size-5" : "size-6"} />
    </span>
  );
}
