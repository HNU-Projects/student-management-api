import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "../services/student.service";
import { StudentCreate, StudentUpdate } from "../types";
import { queryKeys } from "@/utils/queryKeys";

export const useStudentMutations = () => {
  const queryClient = useQueryClient();

  const createStudentMutation = useMutation({
    mutationFn: (data: StudentCreate) => studentService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.stats });
    },
    onError: (error) => {
      console.error("Create student failed:", error);
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StudentUpdate }) =>
      studentService.updateStudent(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.stats });
    },
    onError: (error) => {
      console.error("Update student failed:", error);
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.stats });
    },
    onError: (error) => {
      console.error("Delete student failed:", error);
    },
  });

  return {
    createStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
  };
};
