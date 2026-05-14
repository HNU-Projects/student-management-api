import api from "@/lib/axios";
import { Token, User, UserRegister, UserLogin, EmailUpdate, PasswordUpdate, NameUpdate } from "../types";

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

  updateName: (data: NameUpdate) =>
    api.put<User>("/users/me/name", data),


  getUsers: () =>
    api.get<User[]>("/users/"),

  createUser: (userData: UserRegister) =>
    api.post<User>("/users/", userData),

  adminUpdateUser: (userId: number, userData: UserRegister) =>
    api.put<User>(`/users/${userId}`, userData),

  deleteUser: (userId: number) =>

    api.delete(`/users/${userId}`),
};
