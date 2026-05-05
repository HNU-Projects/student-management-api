import { authApi } from "../api/auth.api";
import { UserRegister, UserLogin, EmailUpdate, PasswordUpdate } from "../types";

export const authService = {
  login: async (data: UserLogin) => {
    const response = await authApi.login(data);
    return response.data;
  },

  register: async (userData: UserRegister) => {
    const response = await authApi.register(userData);
    return response.data;
  },

  getMe: async () => {
    const response = await authApi.getMe();
    return response.data;
  },

  updateEmail: async (data: EmailUpdate) => {
    const response = await authApi.updateEmail(data);
    return response.data;
  },

  updatePassword: async (data: PasswordUpdate) => {
    const response = await authApi.updatePassword(data);
    return response.data;
  },

  getUsers: async () => {
    const response = await authApi.getUsers();
    return response.data;
  },

  createUser: async (userData: UserRegister) => {
    const response = await authApi.createUser(userData);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await authApi.deleteUser(userId);
    return response.data;
  },
};
