import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  ChevronRight,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../api/courses";
import type { Course } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Learn with well-organized courses featuring sections, lessons, and progress tracking.",
  },
  {
    icon: GraduationCap,
    title: "Interactive Learning",
    description: "Video lessons, documents, quizzes, and assignments all in one place.",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn certificates upon course completion to showcase your achievements.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and insights.",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => {
    coursesApi.listCourses({ status: "published" }).then((res) => {
      setFeaturedCourses(res.data.slice(0, 6));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn Without Limits
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              A modern learning management system built for students, instructors, and administrators. 
              Create, manage, and track courses with powerful tools.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to={user ? "/courses" : "/register"}
                className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-all hover:shadow-md"
              >
                {user ? "Browse Courses" : "Get Started"}
                <ArrowRight className="ml-2 inline h-4 w-4" />
              </Link>
              <Link
                to="/courses"
                className="rounded-xl border border-indigo-400/40 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to learn
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A complete platform for online education
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:border-indigo-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
                <p className="mt-2 text-gray-600">Start learning from our top courses</p>
              </div>
              <Link
                to="/courses"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-12 w-12 text-indigo-300" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.short_description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{course.instructor_name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${parseFloat(course.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600"
              >
                View all courses <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!user && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12">
              <h2 className="text-3xl font-bold text-white">
                Ready to start learning?
              </h2>
              <p className="mt-4 text-lg text-indigo-100">
                Join thousands of students already learning on our platform.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-all"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
