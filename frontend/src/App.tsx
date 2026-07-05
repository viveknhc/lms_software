import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LessonPlayer from "./pages/LessonPlayer";
import QuizPage from "./pages/QuizPage";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import Notifications from "./pages/Notifications";
import MyCourses from "./pages/MyCourses";
import NotFound from "./pages/NotFound";

// New pages
import InstructorCourses from "./pages/instructor/MyCourses";
import CourseBuilder from "./pages/instructor/CourseBuilder";
import QuizCreator from "./pages/instructor/QuizCreator";
import GradeAssignments from "./pages/instructor/GradeAssignments";
import StudentAssignments from "./pages/student/Assignments";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import Reports from "./pages/admin/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#1f2937",
            color: "#fff",
            fontSize: "14px",
          },
        }}
      />
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/certificates/verify" element={<Certificates />} />

            {/* Protected - any authenticated user */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute requiredRole="student">
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/learn"
              element={
                <ProtectedRoute requiredRole="student">
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/:quizId"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <Certificates />
                </ProtectedRoute>
              }
            />

            {/* Instructor routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <InstructorCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:courseId"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <CourseBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/quiz/new"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <QuizCreator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/quiz/:quizId/edit"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <QuizCreator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/grade"
              element={
                <ProtectedRoute requiredRole="instructor">
                  <GradeAssignments />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/assignments"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PaymentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
