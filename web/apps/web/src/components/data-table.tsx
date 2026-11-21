import { Button } from "@web/ui/components/button";
import { Skeleton } from "@web/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@web/ui/components/table";
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
  emptyIcon?: ReactNode;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  footer?: ReactNode;
  skeletonRows?: number;
  className?: string;
  tableLabel?: string;
  /**
   * Optional mobile composition. When provided, the table is hidden below `md` and
   * rows are rendered as media rows instead of a horizontally scrolling table.
   */
  mobileRow?: (row: T) => ReactNode;
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
  emptyIcon,
  sort,
  onSortChange,
  footer,
  skeletonRows = 6,
  className,
  tableLabel = "Tabela de dados",
  mobileRow,
}: DataTableProps<T>) {
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          icon={emptyIcon}
        />
      ) : (
        <>
          {mobileRow ? (
            <div className="divide-y divide-border md:hidden">
              {isLoading
                ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4 px-2 py-6">
                      <Skeleton className="size-[88px] shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2 pt-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  ))
                : rows.map((row) => <div key={getRowId(row)}>{mobileRow(row)}</div>)}
            </div>
          ) : null}
          <div className={cn(mobileRow && "hidden md:block")}>
            <Table className="border-collapse text-left" aria-label={tableLabel}>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
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
                      <TableHead
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
                          "h-auto px-4 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground",
                          column.headerClassName,
                        )}
                      >
                        {isSortable ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!onSortChange) {
                                return;
                              }
                              onSortChange({
                                field,
                                direction: isActive && direction === "asc" ? "desc" : "asc",
                              });
                            }}
                            className="-ml-2 h-8 gap-1 px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                          >
                            {column.header}
                            <HugeiconsIcon
                              icon={sortIcon}
                              strokeWidth={2}
                              className={cn("size-3", isActive ? "opacity-100" : "opacity-40")}
                            />
                          </Button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody aria-busy={isLoading}>
                {isLoading
                  ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                      <TableRow key={rowIndex} className="border-border">
                        {columns.map((column) => (
                          <TableCell key={column.id} className={cn("px-4 py-4", column.className)}>
                            <Skeleton className="h-4 w-full max-w-40" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map((row) => (
                      <TableRow key={getRowId(row)} className="border-border hover:bg-secondary/50">
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            className={cn("px-4 py-4 align-middle", column.className)}
                          >
                            {column.cell(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {footer ? <div className="border-t border-border px-4 py-3">{footer}</div> : null}
    </div>
  );
}
