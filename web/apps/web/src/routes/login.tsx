import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/auth/auth-context";
import { resolvePostLoginPath } from "@/auth/form-utils";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search.redirect === "string" ? search.redirect : undefined;
    return redirect ? { redirect } : {};
  },
  component: LoginPage,
});

function LoginPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const search = Route.useSearch();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.assign(resolvePostLoginPath(search.redirect, user?.role));
    }
  }, [isAuthenticated, isLoading, search.redirect, user?.role]);

  return (
    <AuthLayout
      title="Entrar"
      description="Use seu email e senha ou entre com sua conta Google para acessar o Smart Park."
      footer={
        <p>
          Não tem uma conta?{" "}
          <Link
            to="/register"
            search={{ redirect: search.redirect }}
            className="font-medium text-primary-700 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <LoginForm redirectTo={search.redirect} />
    </AuthLayout>
  );
}
