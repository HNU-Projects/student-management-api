import { studentApi } from "../api/student.api";
import {
  StudentCreate,
  StudentUpdate,
  StudentListParams,
} from "../types";

export const studentService = {
  getStats: async () => {
    const response = await studentApi.getStats();
    return response.data;
  },

  getStudents: async (params?: StudentListParams) => {
    const response = await studentApi.getStudents(params);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await studentApi.getMyProfile();
    return response.data;
  },

  getStudentById: async (id: number) => {
    const response = await studentApi.getStudent(id);
    return response.data;
  },

  createStudent: async (data: StudentCreate) => {
    const response = await studentApi.createStudent(data);
    return response.data;
  },

  updateStudent: async (id: number, data: StudentUpdate) => {
    const response = await studentApi.updateStudent(id, data);
    return response.data;
  },

  deleteStudent: async (id: number) => {
    const response = await studentApi.deleteStudent(id);
    return response.data;
  },
};
