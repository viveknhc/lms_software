import type { Assignment, Grade, Submission } from "../types";
import client from "./client";

export const assignmentsApi = {
  listAssignments: (params?: Record<string, string>) =>
    client.get<Assignment[]>("/assignments/assignments/", { params }),

  getAssignment: (id: number) =>
    client.get<Assignment>(`/assignments/assignments/${id}/`),

  createAssignment: (data: Partial<Assignment>) =>
    client.post<Assignment>("/assignments/assignments/", data),

  updateAssignment: (id: number, data: Partial<Assignment>) =>
    client.patch<Assignment>(`/assignments/assignments/${id}/`, data),

  deleteAssignment: (id: number) =>
    client.delete(`/assignments/assignments/${id}/`),

  submitAssignment: (assignmentId: number, data: { content?: string }) =>
    client.post<Submission>("/assignments/submissions/submit/", {
      assignment_id: assignmentId,
      ...data,
    }),

  listSubmissions: (params?: Record<string, string>) =>
    client.get<Submission[]>("/assignments/submissions/", { params }),

  getSubmission: (id: number) =>
    client.get<Submission>(`/assignments/submissions/${id}/`),

  gradeSubmission: (submissionId: number, data: { points_earned: number; feedback?: string }) =>
    client.post<Grade>(`/assignments/submissions/${submissionId}/grade/`, data),

  listGrades: (params?: Record<string, string>) =>
    client.get<Grade[]>("/assignments/grades/", { params }),
};
