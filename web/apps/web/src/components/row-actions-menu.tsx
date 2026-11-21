import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@web/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@web/ui/components/dropdown-menu";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";

export interface RowAction {
  label: string;
  icon?: IconSvgElement;
  onSelect: () => void;
  destructive?: boolean;
  hidden?: boolean;
}

interface RowActionsMenuProps {
  items: RowAction[];
  label?: string;
}

/**
 * Quiet row affordance: bare overflow dots, no circle or border. Used on mobile
 * media rows for edit/close/deactivate actions.
 */
export function RowActionsMenu({ items, label = "Mais opções" }: RowActionsMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="relative -mr-1 rounded-md text-subtle-foreground after:absolute after:-inset-2.5 hover:text-foreground"
            aria-label={label}
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          {visibleItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              variant={item.destructive ? "destructive" : "default"}
              onClick={item.onSelect}
            >
              {item.icon ? (
                <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-4" />
              ) : null}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
