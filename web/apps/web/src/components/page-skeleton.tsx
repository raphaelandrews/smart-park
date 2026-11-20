import { Skeleton } from "@web/ui/components/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="space-y-2 border-b pb-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-80 max-w-full" />
      </div>
      <div className="space-y-2 border p-3">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
