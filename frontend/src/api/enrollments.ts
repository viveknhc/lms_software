import type {
  CourseProgress,
  Enrollment,
  LessonProgress,
} from "../types";
import client from "./client";

export const enrollmentsApi = {
  listEnrollments: (params?: Record<string, string>) =>
    client.get<Enrollment[]>("/enrollments/enrollments/", { params }),

  listCourseProgress: (params?: Record<string, string>) =>
    client.get<CourseProgress[]>("/enrollments/course-progress/", { params }),

  listLessonProgress: (params?: Record<string, string>) =>
    client.get<LessonProgress[]>("/enrollments/lesson-progress/", { params }),

  updateLessonProgress: (id: number, data: Partial<LessonProgress>) =>
    client.patch<LessonProgress>(`/enrollments/lesson-progress/${id}/`, data),

  createLessonProgress: (data: Partial<LessonProgress>) =>
    client.post<LessonProgress>("/enrollments/lesson-progress/", data),
};
