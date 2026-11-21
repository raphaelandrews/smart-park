import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getGetCurrentUserQueryKey,
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  logout as logoutRequest,
  register as registerRequest,
  useGetCurrentUser,
  type AuthResponseDTO,
  type GoogleLoginRequestDTO,
  type LoginRequestDTO,
  type RegisterRequestDTO,
  type UserResponseDTO,
} from "@/api/generated";

import { AUTH_UNAUTHORIZED_EVENT, clearAccessToken, getAccessToken, setAccessToken } from "./token";

interface AuthContextValue {
  user: UserResponseDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (input: LoginRequestDTO) => Promise<AuthResponseDTO>;
  register: (input: RegisterRequestDTO) => Promise<AuthResponseDTO>;
  loginWithGoogle: (input: GoogleLoginRequestDTO) => Promise<AuthResponseDTO>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(() => getAccessToken());

  const meQuery = useGetCurrentUser({
    query: {
      enabled: Boolean(token),
      retry: false,
      staleTime: 5 * 60_000,
      meta: { skipGlobalErrorToast: true },
    },
  });

  const applyToken = useCallback(
    (response: AuthResponseDTO) => {
      if (!response.accessToken) {
        throw new Error("A resposta de autenticação não contém um token.");
      }
      setAccessToken(response.accessToken);
      setTokenState(response.accessToken);
      queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
      return response;
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginRequestDTO) => {
      const response = (await loginRequest(input)).data;
      return applyToken(response);
    },
    [applyToken],
  );

  const register = useCallback(
    async (input: RegisterRequestDTO) => {
      const response = (await registerRequest(input)).data;
      return applyToken(response);
    },
    [applyToken],
  );

  const loginWithGoogle = useCallback(
    async (input: GoogleLoginRequestDTO) => {
      const response = (await loginWithGoogleRequest(input)).data;
      return applyToken(response);
    },
    [applyToken],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // The local session is cleared even if the server call fails.
    }
    clearAccessToken();
    setTokenState(null);
    queryClient.clear();
    await router.navigate({ to: "/login", replace: true });
  }, [queryClient, router]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAccessToken();
      setTokenState(null);
      queryClient.clear();

      if (router.state.location.pathname === "/login") {
        return;
      }

      const redirectTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      void router.navigate({
        to: "/login",
        search: { redirect: redirectTo },
        replace: true,
      });
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [queryClient, router]);

  const user = token ? (meQuery.data?.data ?? null) : null;
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "ADMIN",
      isLoading: Boolean(token) && meQuery.isPending,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, token, meQuery.isPending, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
