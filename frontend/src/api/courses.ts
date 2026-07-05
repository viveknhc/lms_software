import type { Category, Course, Section } from "../types";
import client from "./client";

export const coursesApi = {
  listCategories: (params?: Record<string, string>) =>
    client.get<Category[]>("/courses/categories/", { params }),

  createCategory: (data: Partial<Category>) =>
    client.post<Category>("/courses/categories/", data),

  listCourses: (params?: Record<string, string>) =>
    client.get<Course[]>("/courses/courses/", { params }),

  getCourse: (slug: string) =>
    client.get<Course>(`/courses/courses/${slug}/`),

  createCourse: (data: Partial<Course>) =>
    client.post<Course>("/courses/courses/", data),

  updateCourse: (id: number, data: Partial<Course>) =>
    client.patch<Course>(`/courses/courses/${id}/`, data),

  deleteCourse: (id: number) =>
    client.delete(`/courses/courses/${id}/`),

  getCourseSections: (slug: string) =>
    client.get<Section[]>(`/courses/courses/${slug}/sections/`),

  createSection: (data: Partial<Section>) =>
    client.post<Section>("/learning/sections/", data),

  updateSection: (id: number, data: Partial<Section>) =>
    client.patch<Section>(`/learning/sections/${id}/`, data),

  deleteSection: (id: number) =>
    client.delete(`/learning/sections/${id}/`),
};
