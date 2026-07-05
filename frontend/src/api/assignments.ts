import type { Assignment, Submission, Grade } from "../types";
import client from "./client";

export const assignmentsApi = {
  listAssignments: (params?: Record<string, string>) =>
    client.get<Assignment[]>("/assignments/assignments/", { params }),

  getAssignment: (id: number) =>
    client.get<Assignment>(`/assignments/assignments/${id}/`),

  submitAssignment: (assignmentId: number, data: { content?: string }) =>
    client.post<Submission>("/assignments/submissions/submit/", {
      assignment_id: assignmentId,
      ...data,
    }),

  listSubmissions: (params?: Record<string, string>) =>
    client.get<Submission[]>("/assignments/submissions/", { params }),
};
