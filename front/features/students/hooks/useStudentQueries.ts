import { useQuery } from "@tanstack/react-query";
import { studentService } from "../services/student.service";
import { StudentListParams } from "../types";
import { queryKeys } from "@/utils/queryKeys";

export const useStudentStats = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.students.stats,
    queryFn: () => studentService.getStats(),
    ...options,
  });
};

export const useMyStudentProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.students.detail("me"),
    queryFn: () => studentService.getMyProfile(),
    ...options,
    retry: false,
  });
};

export const useStudentById = (
  id: number | null,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.students.detail(id ?? 0),
    queryFn: () => studentService.getStudentById(id!),
    enabled: id !== null && (options?.enabled !== false),
    retry: false,
  });
};

export const useStudents = (
  params?: StudentListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => studentService.getStudents(params),
    ...options,
  });
};
