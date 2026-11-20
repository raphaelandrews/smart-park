import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@web/ui/components/empty";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/page-header";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <section className="rounded-2xl bg-secondary p-2">
        <Empty className="min-h-72 rounded-xl border border-dashed border-[#d4d4d4] bg-card">
          <EmptyHeader>
            {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
            <EmptyTitle>Nada por aqui ainda</EmptyTitle>
            <EmptyDescription>
              Os registros aparecerão aqui quando forem cadastrados.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    </div>
  );
}
