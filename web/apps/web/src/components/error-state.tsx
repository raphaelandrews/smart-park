import { Button } from "@web/ui/components/button";
import { getErrorMessage } from "@/api/errors";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({
  error,
  title = "Não foi possível carregar os dados",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-danger/30 bg-danger-bg/50 px-6 py-12 text-center"
    >
      <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-6 text-destructive" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
