import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role, User } from "@/types";
import { ApiError } from "@/lib/api";
import { authApi, type LoginPayload, type SignupPayload } from "@/lib/resources";

/**
 * Global frontend state = authentication only.
 * Clinical data lives in TanStack Query (see useClinicalQueries.ts) and is
 * never persisted in localStorage/sessionStorage.
 */
interface VitalynContextValue {
  user: User | null;
  /** Auth check against the server has finished. */
  hydrated: boolean;
  isAuthenticated: boolean;
  authError: unknown;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const Ctx = createContext<VitalynContextValue | null>(null);

export const authMeKey = ["auth", "me"] as const;

export function VitalynProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: authMeKey,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
    // A 401 simply means "signed out" — surfaced as null, not an error state.
    throwOnError: false,
  });

  const loginMutation = useMutation({ mutationFn: authApi.login });
  const signupMutation = useMutation({ mutationFn: authApi.signup });
  const logoutMutation = useMutation({ mutationFn: authApi.logout });

  const unauthorized = me.error instanceof ApiError && me.error.isUnauthorized;
  const user = me.data ?? null;

  const value = useMemo<VitalynContextValue>(
    () => ({
      user,
      hydrated: !me.isPending,
      isAuthenticated: !!user,
      authError: unauthorized ? null : (me.error ?? null),
      login: async (payload) => {
        const u = await loginMutation.mutateAsync(payload);
        qc.setQueryData(authMeKey, u);
        return u;
      },
      signup: async (payload) => {
        const u = await signupMutation.mutateAsync(payload);
        qc.setQueryData(authMeKey, u);
        return u;
      },
      logout: async () => {
        try {
          await logoutMutation.mutateAsync();
        } finally {
          qc.setQueryData(authMeKey, null);
          qc.clear();
        }
      },
    }),
    [user, me.isPending, me.error, unauthorized, loginMutation, signupMutation, logoutMutation, qc],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVitalyn() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVitalyn must be used inside VitalynProvider");
  return v;
}

export function roleHomePath(role: Role) {
  return role === "nurse" ? "/nurse" : "/doctor";
}
