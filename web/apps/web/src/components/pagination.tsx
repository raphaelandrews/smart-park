import { Button } from "@web/ui/components/button";
import { formatNumber } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface PaginationProps {
  /** Zero-based page index, matching the Spring `Page` shape. */
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isFetching?: boolean;
}

export function Pagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  isFetching = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const firstItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const lastItem = Math.min((page + 1) * pageSize, totalElements);
  const isFirst = page <= 0;
  const isLast = page >= safeTotalPages - 1;

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando {formatNumber(firstItem)}–{formatNumber(lastItem)} de{" "}
        {formatNumber(totalElements)}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap">Itens por página</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm shadow-none outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-1">
          {isFetching ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="mr-1 size-3.5 animate-spin"
            />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Primeira página"
            disabled={isFirst}
            onClick={() => onPageChange(0)}
          >
            <HugeiconsIcon icon={ArrowLeftDoubleIcon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            disabled={isFirst}
            onClick={() => onPageChange(page - 1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <span className="px-2 whitespace-nowrap">
            Página {formatNumber(page + 1)} de {formatNumber(safeTotalPages)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Próxima página"
            disabled={isLast}
            onClick={() => onPageChange(page + 1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Última página"
            disabled={isLast}
            onClick={() => onPageChange(safeTotalPages - 1)}
          >
            <HugeiconsIcon icon={ArrowRightDoubleIcon} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
