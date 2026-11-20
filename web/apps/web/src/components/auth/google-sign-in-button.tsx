import { cn } from "@web/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const isGoogleConfigured = Boolean(googleClientId);

const SCRIPT_ID = "google-identity-services";

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.google) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Não foi possível carregar o login com Google.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Não foi possível carregar o login com Google."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}: {
  onSuccess: (idToken: string) => Promise<void>;
  onError: (error: unknown) => void;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!googleClientId || !containerRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            void onSuccess(response.credential).catch(onError);
          },
        });

        const width = Math.min(360, containerRef.current.clientWidth || 360);
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
          locale: "pt-BR",
        });
        setReady(true);
      })
      .catch(onError);

    return () => {
      cancelled = true;
    };
  }, [onError, onSuccess]);

  if (!googleClientId) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-busy={!ready}
      className={cn(
        "flex min-h-10 w-full justify-center [&>div]:max-w-full",
        disabled && "pointer-events-none opacity-50",
      )}
    />
  );
}
