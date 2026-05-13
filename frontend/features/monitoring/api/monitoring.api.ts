import api from "@/lib/axios";

export const monitoringApi = {
  getHealth: () => api.get("/health"),
  getMetrics: () => api.get("/monitoring/metrics"),
};
