import { HugeiconsIcon } from "@hugeicons/react";
import { SquareParkingIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const highlights = [
  "Vagas, tickets e pagamentos em um só lugar.",
  "Acesso seguro com email ou conta Google.",
  "Visão clara da operação do estacionamento.",
];

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_1fr]">
        <aside className="hidden flex-col justify-between bg-primary-50 p-10 lg:flex">
          <Link to="/login" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-primary">
              <HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-5" />
            </span>
            <span className="text-sm font-semibold">Smart Park</span>
          </Link>

          <div className="space-y-5">
            <h2 className="max-w-sm text-[28px] leading-[34px] font-semibold">
              Estacionamento organizado, do portão ao caixa.
            </h2>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Entre para acompanhar veículos, sessões e pagamentos com uma operação simples e
              transparente.
            </p>
            <ul className="space-y-3">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-3" />
                  </span>
                  <span className="text-foreground/80">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">Smart Park · Gestão de estacionamento</p>
        </aside>

        <main className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
              <HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-4" />
            </span>
            <span className="text-sm font-semibold">Smart Park</span>
          </div>

          <h1 className="text-[28px] leading-[34px] font-semibold">{title}</h1>
          <p className="mt-2 max-w-sm text-sm leading-5 text-muted-foreground">{description}</p>

          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </main>
      </div>
    </div>
  );
}
