import type {
  AdminDashboard,
  InstructorDashboard,
  StudentDashboard,
} from "../types";
import client from "./client";

export const analyticsApi = {
  studentDashboard: () =>
    client.get<StudentDashboard>("/analytics/dashboard/student/"),

  instructorDashboard: () =>
    client.get<InstructorDashboard>("/analytics/dashboard/instructor/"),

  adminDashboard: () =>
    client.get<AdminDashboard>("/analytics/dashboard/admin/"),
};
