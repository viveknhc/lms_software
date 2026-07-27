import client from "./client";
import type { User } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface StudentFee {
  id: number;
  student: number;
  student_name: string;
  course: number;
  course_title: string;
  total_fee: string;
  paid_amount: string;
  due_amount: string;
  due_date: string;
  paid_date: string | null;
  status: "paid" | "partial" | "unpaid" | "overdue";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorSalary {
  id: number;
  instructor: number;
  instructor_name: string;
  courses_taught: string[];
  commission_percentage: string;
  total_revenue: string;
  bonus: string;
  deductions: string;
  net_salary: string;
  month: number;
  year: number;
  payment_status: "paid" | "pending" | "cancelled";
  payment_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AccountsDashboard {
  total_collected_fees: string;
  total_pending_fees: string;
  fee_collection_rate: number;
  total_students_with_fees: number;
  students_with_outstanding: number;
  total_salary_paid: string;
  total_salary_pending: string;
  total_instructors_with_salary: number;
  instructors_with_pending: number;
  recent_fees: StudentFee[];
  recent_salaries: InstructorSalary[];
}

// ============================================================================
// API
// ============================================================================

export const financeApi = {
  dashboard: () => client.get<AccountsDashboard>("/finance/accounts/dashboard/"),

  listStudentFees: (params?: Record<string, string>) =>
    client.get<StudentFee[]>("/finance/student-fees/", { params }),
  getStudentFee: (id: number) =>
    client.get<StudentFee>(`/finance/student-fees/${id}/`),
  createStudentFee: (data: Partial<StudentFee>) =>
    client.post<StudentFee>("/finance/student-fees/", data),
  updateStudentFee: (id: number, data: Partial<StudentFee>) =>
    client.patch<StudentFee>(`/finance/student-fees/${id}/`, data),

  listInstructorSalaries: (params?: Record<string, string>) =>
    client.get<InstructorSalary[]>("/finance/instructor-salaries/", { params }),
  getInstructorSalary: (id: number) =>
    client.get<InstructorSalary>(`/finance/instructor-salaries/${id}/`),
  createInstructorSalary: (data: Partial<InstructorSalary>) =>
    client.post<InstructorSalary>("/finance/instructor-salaries/", data),
  updateInstructorSalary: (id: number, data: Partial<InstructorSalary>) =>
    client.patch<InstructorSalary>(`/finance/instructor-salaries/${id}/`, data),
};
