import api from "@/lib/axios";

export const monitoringApi = {
  getHealth: () => api.get("/monitoring/health"),
  getMetrics: () => api.get("/monitoring/metrics"),
};
