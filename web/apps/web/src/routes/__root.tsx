import { HeadContent, Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@web/ui/components/button";
import { Toaster } from "@web/ui/components/sonner";
import { TooltipProvider } from "@web/ui/components/tooltip";

import { getErrorMessage } from "@/api/errors";
import { AuthProvider } from "@/auth/auth-context";

import "../index.css";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: RootErrorComponent,
  head: () => ({
    meta: [
      {
        title: "Smart Park — Gestão de estacionamento",
      },
      {
        name: "description",
        content: "Gestão de vagas, veículos, tickets e pagamentos do Smart Park.",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <TooltipProvider>
        <AuthProvider>
          <Outlet />
          <Toaster richColors />
        </AuthProvider>
      </TooltipProvider>
    </>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl font-medium tracking-tight">404</p>
      <div className="space-y-1">
        <h1 className="text-sm font-medium">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
      </div>
      <Button nativeButton={false} render={<Link to="/" />}>
        Voltar ao início
      </Button>
    </div>
  );
}

function RootErrorComponent({ error }: { error: unknown }) {
  return (
    <div
      role="alert"
      className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-8 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-sm font-medium">Algo deu errado</h1>
        <p className="max-w-md text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Recarregar página
      </Button>
    </div>
  );
}
