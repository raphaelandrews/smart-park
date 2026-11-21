import { Button } from "@web/ui/components/button";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TableActions({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Desativar",
  disabled = false,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={editLabel}
          onClick={onEdit}
          disabled={disabled}
          className="relative size-10 rounded-md after:absolute after:-inset-1 sm:size-8"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={deleteLabel}
          onClick={onDelete}
          disabled={disabled}
          className="relative size-10 rounded-md text-muted-foreground after:absolute after:-inset-1 hover:text-danger sm:size-8"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
