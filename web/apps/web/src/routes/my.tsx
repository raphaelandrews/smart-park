import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@web/ui/components/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Car01Icon, Logout01Icon, SquareParkingIcon } from "@hugeicons/core-free-icons";

import { useAuth } from "@/auth/auth-context";
import { requireAuthenticated } from "@/auth/session";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getRoleLabel } from "@/lib/labels";

export const Route = createFileRoute("/my")({
  beforeLoad: requireAuthenticated,
  component: MyHomePage,
});

function MyHomePage() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Link to="/my" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
              <HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-4" />
            </span>
            <span className="text-sm font-semibold">Smart Park</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 md:p-6">
        <PageHeader
          title={`Olá, ${user?.name ?? "motorista"}!`}
          description="Sua área para acompanhar veículos, sessões e pagamentos."
          actions={
            <StatusBadge tone={isAdmin ? "brand" : "info"}>{getRoleLabel(user?.role)}</StatusBadge>
          }
        />

        <section className="rounded-2xl bg-secondary p-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <EmptyState
              icon={<HugeiconsIcon icon={Car01Icon} strokeWidth={2} className="size-5" />}
              title="Área do motorista em breve"
              description="Aqui você poderá cadastrar seus veículos, acompanhar a sessão ativa e pagar pelo estacionamento."
            />
          </div>
        </section>

        {isAdmin ? (
          <Button nativeButton={false} variant="ink" render={<Link to="/admin" />}>
            Ir para o painel administrativo
          </Button>
        ) : null}
      </main>
    </div>
  );
}
