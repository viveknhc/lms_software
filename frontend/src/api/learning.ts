import type { Lesson, Section } from "../types";
import client from "./client";

export const learningApi = {
  listSections: (params?: Record<string, string>) =>
    client.get<Section[]>("/learning/sections/", { params }),

  listLessons: (params?: Record<string, string>) =>
    client.get<Lesson[]>("/learning/lessons/", { params }),

  getLesson: (id: number) =>
    client.get<Lesson>(`/learning/lessons/${id}/`),

  createLesson: (data: Partial<Lesson>) =>
    client.post<Lesson>("/learning/lessons/", data),

  updateLesson: (id: number, data: Partial<Lesson>) =>
    client.patch<Lesson>(`/learning/lessons/${id}/`, data),

  deleteLesson: (id: number) =>
    client.delete(`/learning/lessons/${id}/`),
};
