import { Avatar, AvatarFallback } from "@web/ui/components/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@web/ui/components/breadcrumb";
import { Button } from "@web/ui/components/button";
import { Separator } from "@web/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@web/ui/components/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellDotIcon,
  Car01Icon,
  CreditCardIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SquareParkingIcon,
  TagsIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { to: "/admin/vehicles", label: "Veículos", icon: Car01Icon },
  { to: "/admin/parking-spaces", label: "Vagas", icon: SquareParkingIcon },
  { to: "/admin/parking-space-types", label: "Tipos de vaga", icon: TagsIcon },
  { to: "/admin/tariffs", label: "Tarifas", icon: ReceiptTextIcon },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket01Icon },
  { to: "/admin/payments", label: "Pagamentos", icon: CreditCardIcon },
] as const;

const navGroups = [
  { label: "Visão geral", items: adminNavItems.slice(0, 1) },
  { label: "Gestão", items: adminNavItems.slice(1) },
];

function isActivePath(pathname: string, to: string) {
  return to === "/admin"
    ? pathname === "/admin" || pathname === "/admin/"
    : pathname.startsWith(to);
}

function readSidebarOpen() {
  if (typeof document === "undefined") {
    return true;
  }
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/);
  return match?.[1] !== "false";
}

function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Smart Park" render={<Link to="/admin" />}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-ink text-primary">
                <HugeiconsIcon icon={SquareParkingIcon} strokeWidth={2} className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Smart Park</span>
                <span className="truncate text-xs text-muted-foreground">
                  Gestão de estacionamento
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActivePath(pathname, item.to)}
                      tooltip={item.label}
                      render={<Link to={item.to} />}
                      className="data-active:border data-active:border-primary-200 data-active:bg-primary-50 data-active:text-primary-900"
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 rounded-md p-2 text-left text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
              <Avatar>
                <AvatarFallback className="bg-primary-100 text-primary-900">OP</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">Operador</span>
                <span className="truncate text-xs text-muted-foreground">Administrador</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const current = adminNavItems.find((item) => isActivePath(pathname, item.to)) ?? adminNavItems[0];

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link to="/admin" />}>Smart Park</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{current.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative rounded-xl bg-card"
            aria-label="Notificações"
          >
            <HugeiconsIcon icon={BellDotIcon} strokeWidth={2} className="size-5" />
            <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-danger" />
          </Button>
        </header>

        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 p-4 pt-6 md:p-6 md:pt-6 lg:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
