import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@web/ui/components/avatar";
import { Button } from "@web/ui/components/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Car01Icon,
  ChevronRightIcon,
  CreditCardIcon,
  Logout01Icon,
  SquareParkingIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "@/auth/auth-context";
import { SectionHeader } from "@/components/section-header";
import { getInitials } from "@/lib/labels";

const quickActions = [
  {
    title: "Meus veículos",
    description: "Gerencie placas e modelos",
    href: "#veiculos",
    icon: Car01Icon,
  },
  {
    title: "Sessões",
    description: "Acompanhe entradas e saídas",
    href: "#sessoes",
    icon: Ticket01Icon,
  },
  {
    title: "Pagamentos",
    description: "Histórico e pendências",
    href: "#pagamentos",
    icon: CreditCardIcon,
  },
] as const;

export function DriverHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-3 px-6">
        <Link to="/my" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-primary">
            <HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-medium">Smart Park</span>
            <span className="block text-xs text-muted-foreground">Área do motorista</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm leading-5 font-medium">{user?.name ?? "Motorista"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Avatar size="lg">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} /> : null}
            <AvatarFallback className="bg-primary-100 text-primary-900">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-full bg-card shadow-floating sm:size-10"
            aria-label="Sair"
            onClick={() => void logout()}
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function DriverQuickActions() {
  return (
    <section className="space-y-5">
      <SectionHeader title="Atalhos" description="Acesso rápido para o que você precisa." />
      <div className="-mr-6 flex snap-x gap-3 overflow-x-auto pb-2 pl-2 pr-6 [scrollbar-width:none] lg:mr-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {quickActions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="group w-[168px] shrink-0 snap-start rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 lg:w-auto"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-[72px] shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary-100 group-hover:text-primary-900">
                <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-6" />
              </span>
              <HugeiconsIcon
                icon={ChevronRightIcon}
                strokeWidth={2}
                className="mt-1 size-5 shrink-0 text-muted-foreground"
              />
            </div>
            <span className="mt-3 block truncate text-base leading-6 font-medium">
              {action.title}
            </span>
            <span className="block text-[13px] leading-[18px] text-muted-foreground">
              {action.description}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
