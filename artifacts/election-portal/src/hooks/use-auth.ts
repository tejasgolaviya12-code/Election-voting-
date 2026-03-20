import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetCurrentUser, 
  getGetCurrentUserQueryKey,
  useLoginUser,
  useLogoutUser,
  useRegisterUser,
  type LoginRequest,
  type RegisterRequest
} from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, isError } = useGetCurrentUser({
    query: {
      retry: false,
      staleTime: Infinity,
    }
  });

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), data.user);
        setLocation(data.user.role === 'admin' ? '/admin' : '/');
      },
    }
  });

  const registerMutation = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), data.user);
        setLocation('/');
      },
    }
  });

  const logoutMutation = useLogoutUser({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
        queryClient.clear();
        setLocation('/login');
      },
    }
  });

  return {
    user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
  };
}
