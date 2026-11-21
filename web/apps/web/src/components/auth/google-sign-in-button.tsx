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

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-5 shrink-0">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
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
  const gisRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!googleClientId || !containerRef.current || !gisRef.current) {
      return;
    }

    let cancelled = false;

    const positionGoogleFrame = () => {
      const iframe = gisRef.current?.querySelector("iframe");
      if (!iframe) {
        return false;
      }
      iframe.style.position = "absolute";
      iframe.style.top = "2px";
      iframe.style.left = "0";
      iframe.style.opacity = "0";
      return true;
    };

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current || !gisRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            void onSuccess(response.credential).catch(onError);
          },
        });

        const width = Math.min(400, containerRef.current.clientWidth || 400);
        window.google.accounts.id.renderButton(gisRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
          locale: "pt-BR",
        });

        if (!positionGoogleFrame()) {
          requestAnimationFrame(() => {
            if (!cancelled) {
              positionGoogleFrame();
            }
          });
        }

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
        "relative h-11 w-full overflow-hidden rounded-[6px] bg-background focus-within:ring-2 focus-within:ring-ring/60",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div ref={gisRef} className="absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-[6px] border border-input bg-background text-sm font-medium"
      >
        <GoogleLogo />
        Continuar com o Google
      </div>
    </div>
  );
}
