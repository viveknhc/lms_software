import type { Category, Course, Section } from "../types";
import client from "./client";

export const coursesApi = {
  listCategories: (params?: Record<string, string>) =>
    client.get<Category[]>("/courses/categories/", { params }),

  listCourses: (params?: Record<string, string>) =>
    client.get<Course[]>("/courses/courses/", { params }),

  getCourse: (slug: string) =>
    client.get<Course>(`/courses/courses/${slug}/`),

  getCourseSections: (slug: string) =>
    client.get<Section[]>(`/courses/courses/${slug}/sections/`),
};
