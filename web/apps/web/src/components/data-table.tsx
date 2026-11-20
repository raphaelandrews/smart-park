import { Skeleton } from "@web/ui/components/skeleton";
import { cn } from "@web/ui/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import type { SortState } from "@/lib/table";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** API field used by `sort=field,asc|desc`. Defaults to `id`. */
  sortField?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  footer?: ReactNode;
  skeletonRows?: number;
  className?: string;
  tableLabel?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Não há dados para exibir no momento.",
  emptyAction,
  sort,
  onSortChange,
  footer,
  skeletonRows = 6,
  className,
  tableLabel = "Tabela de dados",
}: DataTableProps<T>) {
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm" aria-label={tableLabel}>
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => {
                  const field = column.sortField ?? column.id;
                  const isSortable = Boolean(onSortChange) && column.sortable !== false;
                  const isActive = sort?.field === field;
                  const direction = isActive ? sort?.direction : undefined;
                  const sortIcon =
                    direction === "asc"
                      ? ArrowUp01Icon
                      : direction === "desc"
                        ? ArrowDown01Icon
                        : UnfoldMoreIcon;

                  return (
                    <th
                      key={column.id}
                      scope="col"
                      aria-sort={
                        isActive
                          ? direction === "asc"
                            ? "ascending"
                            : "descending"
                          : isSortable
                            ? "none"
                            : undefined
                      }
                      className={cn(
                        "px-4 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground",
                        column.headerClassName,
                      )}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!onSortChange) {
                              return;
                            }
                            onSortChange({
                              field,
                              direction: isActive && direction === "asc" ? "desc" : "asc",
                            });
                          }}
                          className="inline-flex items-center gap-1 transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          {column.header}
                          <HugeiconsIcon
                            icon={sortIcon}
                            strokeWidth={2}
                            className={cn("size-3", isActive ? "opacity-100" : "opacity-40")}
                          />
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody aria-busy={isLoading}>
              {isLoading
                ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-border last:border-b-0">
                      {columns.map((column) => (
                        <td key={column.id} className={cn("px-4 py-4", column.className)}>
                          <Skeleton className="h-4 w-full max-w-40" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-secondary/50"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={cn("px-4 py-4 align-middle", column.className)}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
      {footer ? <div className="border-t border-border px-4 py-3">{footer}</div> : null}
    </div>
  );
}
