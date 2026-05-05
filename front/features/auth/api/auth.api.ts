import api from "@/lib/axios";
import { Token, User, UserRegister, UserLogin, EmailUpdate, PasswordUpdate } from "../types";

export const authApi = {
  login: (data: UserLogin) => 
    api.post<Token>("/auth/login", data),

  register: (userData: UserRegister) => 
    api.post<User>("/auth/register", userData),

  getMe: () => 
    api.get<User>("/users/me"),

  updateEmail: (data: EmailUpdate) =>
    api.put<User>("/users/me/email", data),

  updatePassword: (data: PasswordUpdate) =>
    api.put<{ detail: string }>("/users/me/password", data),

  getUsers: () =>
    api.get<User[]>("/users/"),

  createUser: (userData: UserRegister) =>
    api.post<User>("/users/", userData),

  deleteUser: (userId: number) =>
    api.delete(`/users/${userId}`),
};
