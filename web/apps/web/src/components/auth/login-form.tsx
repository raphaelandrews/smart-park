import { Button } from "@web/ui/components/button";
import { Input } from "@web/ui/components/input";
import { Label } from "@web/ui/components/label";
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { getErrorMessage } from "@/api/errors";
import { useAuth } from "@/auth/auth-context";
import { fieldErrorsFromZod, mergeFieldErrors, resolvePostLoginPath } from "@/auth/form-utils";
import { GoogleSignInButton, isGoogleConfigured } from "@/components/auth/google-sign-in-button";
import { PasswordField } from "@/components/auth/password-field";
import { loginSchema } from "@/lib/validation";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    submittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const finish = useCallback(
    (role: string | undefined) => {
      window.location.assign(resolvePostLoginPath(redirectTo, role));
    },
    [redirectTo],
  );

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      if (submittingRef.current) {
        return;
      }
      setIsSubmitting(true);
      setError(null);
      setFieldErrors({});
      try {
        const response = await loginWithGoogle({ idToken });
        finish(response.user?.role);
      } catch (googleError) {
        setError(getErrorMessage(googleError));
        setIsSubmitting(false);
      }
    },
    [finish, loginWithGoogle],
  );

  const handleGoogleError = useCallback((googleError: unknown) => {
    setError(getErrorMessage(googleError));
    setIsSubmitting(false);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const response = await login(parsed.data);
      finish(response.user?.role);
    } catch (loginError) {
      setFieldErrors((current) => mergeFieldErrors(current, loginError));
      setError(getErrorMessage(loginError));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-bg px-3 py-2.5 text-sm text-danger"
        >
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? <p className="text-xs text-danger">{fieldErrors.email}</p> : null}
        </div>

        <PasswordField
          id="login-password"
          label="Senha"
          value={password}
          onChange={setPassword}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          error={fieldErrors.password}
        />

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
          ) : null}
          Entrar
        </Button>
      </form>

      {isGoogleConfigured ? (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isSubmitting}
          />
        </>
      ) : null}
    </div>
  );
}
