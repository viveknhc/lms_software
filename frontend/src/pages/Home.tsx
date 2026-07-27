import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  Video,
  Users,
  Globe,
  Shield,
  Zap,
  Layers,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
  Quote,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../api/courses";
import { cmsApi } from "../api/cms";
import type { Course, Banner, FAQ, FAQCategory, BlogPost } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

// ── Feature Data ─────────────────────────────────────────────────────

const platformFeatures = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Well-organized courses with sections, lessons, and clear learning paths. Progress tracking keeps you on target.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Video,
    title: "Video & Multimedia",
    description: "HD video lessons with custom player, text content, documents, and interactive quizzes — all in one place.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn verifiable certificates upon course completion. Share them on LinkedIn or download as PDF.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Detailed dashboards for students, instructors, and admins. Track progress, performance, and revenue.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Multi-Role System",
    description: "Three integrated roles — Students learn, Instructors create, Admins manage. All in one platform.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Secure & Scalable",
    description: "JWT authentication, role-based access, Stripe payments, and cloud-ready architecture.",
    gradient: "from-red-500 to-rose-500",
  },
];

const studentFeatures = [
  { icon: BookOpen, title: "Browse & Enroll", description: "Discover courses across categories. Enroll in free courses or purchase premium ones." },
  { icon: Play, title: "Watch & Learn", description: "HD video player with speed controls, transcripts, and progress tracking." },
  { icon: FileText, title: "Submit Assignments", description: "Complete and submit assignments. Get graded with detailed feedback from instructors." },
  { icon: HelpCircle, title: "Take Quizzes", description: "Single choice, multiple choice, true/false. Auto-graded with instant results." },
  { icon: Award, title: "Earn Certificates", description: "Complete courses and earn verifiable certificates to showcase your skills." },
  { icon: TrendingUp, title: "Track Progress", description: "Personal dashboard with completion stats, grades, and learning activity." },
];

const instructorFeatures = [
  { icon: Layers, title: "Course Builder", description: "Drag-and-drop course builder. Add sections, lessons, videos, and quizzes intuitively." },
  { icon: Video, title: "Upload Content", description: "Chunked video uploads, text editor, document attachments. All content types supported." },
  { icon: HelpCircle, title: "Quiz Creator", description: "Create quizzes with multiple question types. Set passing scores and time limits." },
  { icon: FileText, title: "Grade Assignments", description: "Review submissions, assign grades, and provide personalized feedback to students." },
  { icon: BarChart3, title: "View Analytics", description: "Track enrollments, completion rates, revenue, and student engagement metrics." },
  { icon: Globe, title: "Global Reach", description: "Publish courses to students worldwide. Set your own pricing and manage content." },
];

const adminFeatures = [
  { icon: Users, title: "User Management", description: "Create, suspend, and manage all users. Filter by role, status, and activity." },
  { icon: BookOpen, title: "Course Oversight", description: "Review and approve courses. Manage categories and content across the platform." },
  { icon: Shield, title: "Payment Management", description: "Monitor transactions, process refunds, and view complete payment history." },
  { icon: BarChart3, title: "System Reports", description: "Generate comprehensive reports on users, courses, revenue, and platform growth." },
];

const stats = [
  { label: "Active Students", value: "2,500+", icon: Users },
  { label: "Courses", value: "50+", icon: BookOpen },
  { label: "Instructors", value: "100+", icon: GraduationCap },
  { label: "Certificates Issued", value: "1,200+", icon: Award },
];

const testimonials = [
  {
    quote: "This platform transformed how I learn programming. The structured courses and hands-on assignments made all the difference.",
    author: "Alex Thompson",
    role: "Student, Python Course",
    rating: 5,
  },
  {
    quote: "As an instructor, I love how easy it is to create and manage courses. The content builder is intuitive and powerful.",
    author: "Sarah Johnson",
    role: "Instructor, Programming",
    rating: 5,
  },
  {
    quote: "Managing our institution's online learning has never been easier. The admin dashboard gives us complete control.",
    author: "David Kim",
    role: "Administrator",
    rating: 5,
  },
];

// ── Blog Card ────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        {post.featured_image ? (
          <img src={post.featured_image} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <BookOpen className="h-10 w-10 text-indigo-300" />
        )}
      </div>
      <div className="p-5">
        {post.category && (
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-600 mb-2">
            {post.category}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          {post.author_name && <span>{post.author_name}</span>}
          {post.time_ago && <span>{post.time_ago}</span>}
        </div>
      </div>
    </Link>
  );
}

// ── FAQ Accordion ────────────────────────────────────────────────────

function FAQAccordion({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span>{faq.question}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

// ── Star Rating ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN HOME PAGE
// ============================================================================

export default function Home() {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqData, setFaqData] = useState<{ categories: FAQCategory[]; uncategorized: FAQ[] } | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [statsData, setStatsData] = useState(stats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      coursesApi.listCourses({ status: "published" }),
      cmsApi.getBanners(),
      cmsApi.getFAQs(),
      cmsApi.getFeaturedPosts(),
    ]).then((results) => {
      if (results[0].status === "fulfilled") {
        setFeaturedCourses(results[0].value.data.slice(0, 6));
      }
      if (results[1].status === "fulfilled") {
        setBanners(results[1].value.data);
      }
      if (results[2].status === "fulfilled") {
        setFaqData(results[2].value.data);
      }
      if (results[3].status === "fulfilled") {
        setBlogPosts(results[3].value.data);
      }
      setLoading(false);
    });
  }, []);

  // ── Hero Banner ──────────────────────────────────────────────
  const heroBanner = banners.length > 0 ? banners[0] : null;

  return (
    <div>
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-white/10 px-4 py-1.5 text-sm text-indigo-100 mb-6">
                <Zap className="h-3.5 w-3.5" />
                <span>The Ultimate Learning Management System</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {heroBanner?.title || "Learn Without Limits"}
              </h1>
              <p className="mt-6 text-lg leading-8 text-indigo-100">
                {heroBanner?.description || "A modern learning management system built for students, instructors, and administrators. Create, manage, and track courses with powerful tools."}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to={user ? "/courses" : "/register"}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  {user ? "Browse Courses" : "Get Started Free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Explore Courses
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-indigo-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  <span>Lifetime access</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden shadow-2xl">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                      <p className="mt-4 text-sm text-white/70">Platform Overview</p>
                    </div>
                  </div>
                </div>
                {/* Floating stats */}
                <div className="absolute -bottom-4 -left-4 rounded-xl bg-white px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span className="font-semibold text-gray-900">2,500+</span>
                    <span className="text-gray-500">students</span>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 rounded-xl bg-white px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    <span className="font-semibold text-gray-900">50+</span>
                    <span className="text-gray-500">courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ════════ STATS BAR ════════ */}
      <section className="relative -mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 sm:grid-cols-4">
            {statsData.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ PLATFORM FEATURES ════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 mb-4">
              Platform Features
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              A complete learning ecosystem designed for modern education — from content creation to certification.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-sm`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-600 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Three Simple Steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Start your learning journey in minutes. No complicated setup required.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Create Account", description: "Sign up as a student or instructor. It's free and takes less than a minute.", icon: Users },
              { step: "02", title: "Explore & Enroll", description: "Browse our course catalog, read descriptions, and enroll in courses that interest you.", icon: BookOpen },
              { step: "03", title: "Learn & Grow", description: "Watch lessons, complete assignments, take quizzes, and earn certificates.", icon: GraduationCap },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="mt-4">
                  <span className="text-xs font-bold tracking-widest text-indigo-500">{item.step}</span>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FOR STUDENTS ════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 mb-4">
                For Students
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                A Complete Learning Experience
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                From the moment you enroll to the moment you earn your certificate, every step is designed to maximize your learning.
              </p>
              <div className="mt-8 space-y-4">
                {studentFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border border-blue-100">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">JD</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">James Wilson</p>
                      <p className="text-xs text-gray-500">Computer Science Student</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 w-3/4 rounded-full bg-blue-500" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress: 75%</span>
                      <span>Grade: A-</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>3 certificates earned</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-xl bg-white px-4 py-3 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-gray-900">1,200+</span>
                  <span className="text-gray-500">certificates issued</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FOR INSTRUCTORS ════════ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1 relative">
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 border border-purple-100">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">SJ</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Python Instructor</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Course revenue</span>
                      <span className="font-semibold text-gray-900">$4,250</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Active students</span>
                      <span className="font-semibold text-gray-900">342</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Avg rating</span>
                      <StarRating rating={5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block rounded-full bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-600 mb-4">
                For Instructors
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Powerful Tools for Course Creators
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Build engaging courses with our intuitive content builder. Upload videos, create quizzes, and track student progress — all from one dashboard.
              </p>
              <div className="mt-8 space-y-4">
                {instructorFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition-all hover:-translate-y-0.5"
              >
                Start Teaching <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FOR ADMINISTRATORS ════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-600 mb-4">
                For Administrators
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Full Control Over Your Platform
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Comprehensive admin dashboard with user management, course oversight, payment tracking, and detailed reporting.
              </p>
              <div className="mt-8 space-y-4">
                {adminFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 border border-amber-100">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform Health</span>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">All Systems Go</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Active Users", value: "486", color: "bg-blue-500", pct: "80" },
                      { label: "Storage Used", value: "45 GB", color: "bg-purple-500", pct: "45" },
                      { label: "API Requests", value: "12.5k/hr", color: "bg-green-500", pct: "65" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="font-medium text-gray-900">{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ PRICING ════════ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-600 mb-4">
              Pricing
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Start learning for free. Upgrade to premium courses when you're ready.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for getting started",
                features: ["Access to free courses", "Basic progress tracking", "Community support", "1 certificate"],
                cta: "Get Started",
                popular: false,
                gradient: "from-gray-50 to-gray-100",
              },
              {
                name: "Student Pro",
                price: "$29",
                period: "/month",
                desc: "For serious learners",
                features: ["All courses included", "HD video streaming", "Priority support", "Unlimited certificates", "Assignment feedback", "Quiz analytics"],
                cta: "Start Free Trial",
                popular: true,
                gradient: "from-indigo-50 to-purple-50",
              },
              {
                name: "Instructor",
                price: "$99",
                period: "/month",
                desc: "For course creators",
                features: ["Create unlimited courses", "Revenue analytics", "Student management", "Custom certificates", "API access", "Priority support"],
                cta: "Become Instructor",
                popular: false,
                gradient: "from-purple-50 to-pink-50",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all hover:shadow-xl ${plan.popular ? "border-indigo-300 bg-white shadow-lg scale-105" : "border-gray-200 bg-white hover:-translate-y-1"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className={`rounded-xl bg-gradient-to-br ${plan.gradient} p-4 mb-6`}>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURED COURSES ════════ */}
      {featuredCourses.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 mb-4">
                  Courses
                </span>
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
                  className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
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
                        {parseFloat(course.price) === 0 ? "Free" : `$${parseFloat(course.price).toFixed(2)}`}
                      </span>
                    </div>
                    {course.section_count > 0 && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {course.section_count} sections
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ TESTIMONIALS ════════ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-600 mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Hear from students, instructors, and administrators who use our platform.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-all">
                <Quote className="h-8 w-8 text-indigo-100 mb-4" />
                <p className="text-sm text-gray-600 leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-sm font-bold text-indigo-600">
                    {t.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ BLOG ════════ */}
      {blogPosts.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 mb-4">
                  Blog
                </span>
                <h2 className="text-3xl font-bold text-gray-900">Latest from Our Blog</h2>
                <p className="mt-2 text-gray-600">Tips, tutorials, and insights from our community</p>
              </div>
              <Link
                to="/blog"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════ FAQ ════════ */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 mb-4">
              FAQ
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Everything you need to know about our platform
            </p>
          </div>
          <div className="mt-10 space-y-3">
            {faqData && faqData.uncategorized.length > 0 ? (
              faqData.uncategorized.map((faq) => (
                <FAQAccordion key={faq.id} faq={faq} />
              ))
            ) : (
              <>
                {[
                  { q: "Is there a free plan available?", a: "Yes! We offer free courses that you can access without any payment. Upgrade to premium for full access." },
                  { q: "Can I become an instructor?", a: "Absolutely! Sign up as an instructor and start creating courses. Our course builder makes it easy." },
                  { q: "How do certificates work?", a: "Certificates are automatically issued when you complete a course. They include a verification code for authenticity." },
                  { q: "What payment methods do you accept?", a: "We accept all major credit cards and PayPal. Payments are securely processed through Stripe." },
                  { q: "Can I get a refund?", a: "Yes, we offer a 30-day money-back guarantee for all paid courses. Contact support for assistance." },
                ].map((faq) => (
                  <FAQAccordion key={faq.q} faq={{ id: 0, category: null, category_name: null, question: faq.q, answer: faq.a, order: 0, is_active: true, created_at: "", updated_at: "" }} />
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8 sm:p-12">
              <div className="text-center">
                <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white mb-4">
                  Get In Touch
                </span>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-indigo-100">
                  Join thousands of students and instructors. Start your learning journey today.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                  <Mail className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm text-white">support@lmsplatform.com</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                  <Phone className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm text-white">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                  <MapPin className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm text-white">San Francisco, CA</span>
                </div>
              </div>
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  to={user ? "/courses" : "/register"}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  {user ? "Browse Courses" : "Create Free Account"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
