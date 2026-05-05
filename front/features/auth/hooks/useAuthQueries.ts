import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { queryKeys } from "@/utils/queryKeys";

export const useAuthQueries = () => {
  const getMeQuery = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getMe(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const useUsers = (options?: { enabled?: boolean }) => useQuery({
    queryKey: queryKeys.auth.list,
    queryFn: () => authService.getUsers(),
    enabled: options?.enabled,
  });

  return {
    getMeQuery,
    useUsers,
  };
};
