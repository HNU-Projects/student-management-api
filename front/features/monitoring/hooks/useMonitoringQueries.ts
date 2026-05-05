import { useQuery } from "@tanstack/react-query";
import { monitoringApi } from "../api/monitoring.api";

export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await monitoringApi.getHealth();
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10s
  });
};

export const useMetrics = () => {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await monitoringApi.getMetrics();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
};
