import { Button } from "@web/ui/components/button";
import { useForm, useStore } from "@tanstack/react-form";
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/api/errors";
import { useAuth } from "@/auth/auth-context";
import { applyServerFieldErrors, resolvePostLoginPath } from "@/auth/form-utils";
import { GoogleSignInButton, isGoogleConfigured } from "@/components/auth/google-sign-in-button";
import { FormPasswordField, FormTextField } from "@/components/forms/tanstack-fields";
import { loginSchema } from "@/lib/validation";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const finish = useCallback(
    (role: string | undefined) => {
      window.location.assign(resolvePostLoginPath(redirectTo, role));
    },
    [redirectTo],
  );

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
      onSubmit: loginSchema,
    },
    listeners: {
      onChange: () => setError(null),
    },
    onSubmit: async ({ value, formApi }) => {
      setError(null);
      const parsed = loginSchema.safeParse(value);
      if (!parsed.success) {
        return;
      }

      try {
        const response = await login(parsed.data);
        finish(response.user?.role);
      } catch (loginError) {
        applyServerFieldErrors(formApi, loginError);
        setError(getErrorMessage(loginError));
      }
    },
  });

  const formSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isSubmitting = formSubmitting || googleSubmitting;

  useEffect(() => {
    submittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      if (submittingRef.current) {
        return;
      }
      setGoogleSubmitting(true);
      setError(null);
      try {
        const response = await loginWithGoogle({ idToken });
        finish(response.user?.role);
      } catch (googleError) {
        setError(getErrorMessage(googleError));
        setGoogleSubmitting(false);
      }
    },
    [finish, loginWithGoogle],
  );

  const handleGoogleError = useCallback((googleError: unknown) => {
    setError(getErrorMessage(googleError));
    setGoogleSubmitting(false);
  }, []);

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

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="grid gap-4"
        noValidate
      >
        <form.Field name="email">
          {(field) => (
            <FormTextField
              field={field}
              id="login-email"
              label="Email"
              type="email"
              placeholder="voce@exemplo.com"
              autoComplete="email"
              inputMode="email"
              maxLength={255}
              spellCheck={false}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <FormPasswordField
              field={field}
              id="login-password"
              label="Senha"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              maxLength={72}
            />
          )}
        </form.Field>

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
