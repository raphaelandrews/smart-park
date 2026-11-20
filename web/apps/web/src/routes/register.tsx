import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/auth/auth-context";
import { resolvePostLoginPath } from "@/auth/form-utils";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search.redirect === "string" ? search.redirect : undefined;
    return redirect ? { redirect } : {};
  },
  component: RegisterPage,
});

function RegisterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const search = Route.useSearch();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.assign(resolvePostLoginPath(search.redirect, user?.role));
    }
  }, [isAuthenticated, isLoading, search.redirect, user?.role]);

  return (
    <AuthLayout
      title="Criar conta"
      description="Cadastre-se para acompanhar seus veículos, sessões e pagamentos."
      footer={
        <p>
          Já tem uma conta?{" "}
          <Link
            to="/login"
            search={{ redirect: search.redirect }}
            className="font-medium text-primary-700 hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm redirectTo={search.redirect} />
    </AuthLayout>
  );
}
