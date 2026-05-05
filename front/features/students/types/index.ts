export type Gender = "male" | "female";
export type StudentStatus = "active" | "graduated" | "suspended";

export interface StudentCreate {
  university_id: string;
  name: string;
  birth_date?: string | null;
  gender?: Gender | null;
  phone_number?: string | null;
  gpa?: number;
  department: string;
  enrollment_date: string;
  status?: StudentStatus;
  user_id: number;
}

export interface StudentUpdate {
  university_id?: string | null;
  name?: string | null;
  birth_date?: string | null;
  gender?: Gender | null;
  phone_number?: string | null;
  gpa?: number | null;
  department?: string | null;
  enrollment_date?: string | null;
  status?: StudentStatus | null;
}

export interface StudentResponse {
  id: number;
  user_id: number;
  university_id: string;
  name: string;
  birth_date?: string | null;
  gender?: Gender | null;
  phone_number?: string | null;
  gpa: number;
  department: string;
  enrollment_date: string;
  status: StudentStatus;
}

export interface StudentListParams {
  [key: string]: any;
  search?: string;
  department?: string;
  status?: string;
  gpa_min?: number;
  gpa_max?: number;
  skip?: number;
  limit?: number;
}
