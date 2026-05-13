import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { UserRegister, UserLogin, EmailUpdate, PasswordUpdate } from "../types";
import { queryKeys } from "@/utils/queryKeys";
import { useRouter } from "@/i18n/routing";

export const useAuthMutations = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: UserLogin) => authService.login(data),
    onSuccess: async (data) => {
      // Store the token
      localStorage.setItem("token", data.access_token);

      // Fetch user data to determine role-based redirect
      try {
        const user = await authService.getMe();
        queryClient.setQueryData(queryKeys.auth.user, user);

        // Role-based redirect
        if (user.role === "admin") {
          router.push("/dashboard");
        } else if (user.role === "student") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch {
        // If getMe fails, still redirect to dashboard
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: UserRegister) => authService.register(data),
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(queryKeys.auth.user, null);
    queryClient.clear();
    router.push("/login");
  };

  const updateEmailMutation = useMutation({
    mutationFn: (data: EmailUpdate) => authService.updateEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordUpdate) => authService.updatePassword(data),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: UserRegister) => authService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.list });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => authService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.list });
    },
  });

  return {
    loginMutation,
    registerMutation,
    createUserMutation,
    deleteUserMutation,
    updateEmailMutation,
    updatePasswordMutation,
    logout,
  };
};
