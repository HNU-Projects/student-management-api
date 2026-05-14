import api from "@/lib/axios";
import {
  StudentCreate,
  StudentUpdate,
  StudentResponse,
  StudentListParams,
} from "../types";

export const studentApi = {
  getStats: () =>
    api.get("/students/stats/summary"),

  getStudents: (params?: StudentListParams) =>
    api.get<StudentResponse[]>("/students/", { params }),

  getMyProfile: () =>
    api.get<StudentResponse>("/students/me"),

  getStudent: (id: number) =>
    api.get<StudentResponse>(`/students/${id}`),

  createStudent: (data: StudentCreate) =>
    api.post<StudentResponse>("/students/", data),

  updateStudent: (id: number, data: StudentUpdate) =>
    api.patch<StudentResponse>(`/students/${id}`, data),

  replaceStudent: (id: number, data: StudentCreate) =>
    api.put<StudentResponse>(`/students/${id}`, data),

  deleteStudent: (id: number) =>
    api.delete(`/students/${id}`),
};
