import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { UserRegister, UserLogin, EmailUpdate, PasswordUpdate, NameUpdate } from "../types";
import { queryKeys } from "@/utils/queryKeys";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useAuthMutations = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('Auth');
  const ts = useTranslations('Settings'); // For generic messages

  const updateNameMutation = useMutation({
    mutationFn: (data: NameUpdate) => authService.updateName(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });

  const adminUpdateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number, data: UserRegister }) => authService.adminUpdateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.users });
    },
  });



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
        
        toast.success(t('login_success_title', { defaultValue: "Login Successful" }), {
          description: t('login_success_desc', { name: user.full_name, defaultValue: `Welcome back, ${user.full_name}!` }),
        });
      } catch {
        // If getMe fails, still redirect to dashboard
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
        router.push("/dashboard");
        toast.success(t('login_success_title', { defaultValue: "Login Successful" }));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || t('login_failed_desc', { defaultValue: "Invalid email or password" });
      toast.error(t('login_failed_title', { defaultValue: "Login Failed" }), {
        description: message,
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: UserRegister) => authService.register(data),
    onSuccess: () => {
      toast.success(t('register_success_title', { defaultValue: "Registration Successful" }), {
        description: t('register_success_desc', { defaultValue: "Your account has been created. Please log in." }),
      });
      router.push("/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || t('register_failed_desc', { defaultValue: "Could not complete registration" });
      toast.error(t('register_failed_title', { defaultValue: "Registration Failed" }), {
        description: message,
      });
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
    updateNameMutation,
    adminUpdateUserMutation,
    logout,
  };

};

