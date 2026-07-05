import type { Attempt, Quiz, QuizDetail } from "../types";
import client from "./client";

export const quizzesApi = {
  listQuizzes: (params?: Record<string, string>) =>
    client.get<Quiz[]>("/assessments/quizzes/", { params }),

  getQuiz: (id: number) =>
    client.get<QuizDetail>(`/assessments/quizzes/${id}/`),

  createQuiz: (data: Partial<Quiz>) =>
    client.post<Quiz>("/assessments/quizzes/", data),

  updateQuiz: (id: number, data: Partial<Quiz>) =>
    client.patch<Quiz>(`/assessments/quizzes/${id}/`, data),

  deleteQuiz: (id: number) =>
    client.delete(`/assessments/quizzes/${id}/`),

  startAttempt: (quizId: number) =>
    client.post<Attempt>("/assessments/attempts/start/", {
      quiz_id: quizId,
    }),

  submitAttempt: (attemptId: number, answers: Array<{ question_id: number; selected_option_ids: number[] }>) =>
    client.post<Attempt>(`/assessments/attempts/${attemptId}/submit/`, {
      answers,
    }),

  listAttempts: (params?: Record<string, string>) =>
    client.get<Attempt[]>("/assessments/attempts/", { params }),
};
