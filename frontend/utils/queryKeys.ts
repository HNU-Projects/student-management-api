export const queryKeys = {
  auth: {
    user: ["user"] as const,
    list: ["users", "list"] as const,
    login: ["login"] as const,
  },
  students: {
    all: ["students"] as const,
    list: (params?: Record<string, unknown>) =>
      ["students", "list", params] as const,
    detail: (id: number | string) => ["students", "detail", id] as const,
    stats: ["students", "stats"] as const,
  },
};
