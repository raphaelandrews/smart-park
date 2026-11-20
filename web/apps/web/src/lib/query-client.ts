import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage, isApiError } from "@/api/errors";

function shouldRetry(failureCount: number, error: unknown): boolean {
  // Never retry client errors: validation, auth, not found, conflicts, rate limit.
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

/**
 * Single query client for the app.
 *
 * Screens that already render an inline `ErrorState` can opt out of the global toast
 * with `meta: { skipGlobalErrorToast: true }`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalErrorToast) {
        return;
      }
      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalErrorToast) {
        return;
      }
      toast.error(getErrorMessage(error));
    },
  }),
});
