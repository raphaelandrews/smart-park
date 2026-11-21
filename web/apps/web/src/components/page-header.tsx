import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-[17px] leading-6 font-semibold text-balance sm:text-[28px] sm:leading-[34px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-[18px] text-muted-foreground sm:text-sm sm:leading-5">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
