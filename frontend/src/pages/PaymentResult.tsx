import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { paymentsApi, type PaymentResult as PaymentResultType } from "../api/payments";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<PaymentResultType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId && status) {
      // Cancelled or direct status param from cancelled URL
      setResult({
        status,
        message:
          status === "cancelled"
            ? "Payment was cancelled. No charges were made."
            : "Payment is being processed.",
      });
      setLoading(false);
      return;
    }

    if (sessionId) {
      // Poll for payment status (webhook might take a moment)
      let cancelled = false;

      const checkStatus = async () => {
        if (cancelled) return;
        try {
          const { data } = await paymentsApi.getPaymentStatus(sessionId);
          setResult(data);
          setLoading(false);
          // Stop polling once we get a final status
          if (data.status === "completed" || data.status === "success" || data.status === "cancelled" || data.status === "failed") {
            cancelled = true;
          }
        } catch {
          setResult({
            status: "pending",
            message: "Unable to verify payment status. Please check your enrollments.",
          });
          setLoading(false);
        }
      };

      // Check immediately
      checkStatus();

      // Poll every 3s until resolved
      const interval = setInterval(() => {
        if (!cancelled) checkStatus();
      }, 3000);

      // Hard stop after 30 seconds
      const timeout = setTimeout(() => {
        cancelled = true;
        setLoading(false);
        clearInterval(interval);
      }, 30000);

      return () => {
        cancelled = true;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [sessionId, status]);

  if (loading) return <LoadingSpinner />;

  const isSuccess = result?.status === "completed" || result?.status === "success";
  const isCancelled = result?.status === "cancelled";
  const isPending = result?.status === "pending" || result?.status === "unknown";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
      <div className="w-full text-center">
        {/* Icon */}
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-green-100"
              : isCancelled
                ? "bg-gray-100"
                : "bg-amber-100"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-10 w-10 text-green-600" />
          ) : isCancelled ? (
            <XCircle className="h-10 w-10 text-gray-500" />
          ) : (
            <Clock className="h-10 w-10 text-amber-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          {isSuccess
            ? "Payment Successful! 🎉"
            : isCancelled
              ? "Payment Cancelled"
              : "Processing Payment..."}
        </h1>

        {/* Message */}
        <p className="mt-3 text-gray-500">{result?.message}</p>

        {isSuccess && result?.course_slug && (
          <Link
            to={`/courses/${result.course_slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Go to Course
          </Link>
        )}

        {isSuccess && !result?.course_slug && (
          <Link
            to="/my-courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            My Courses
          </Link>
        )}

        {isCancelled && (
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Browse Courses
          </Link>
        )}

        {isPending && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying payment...
            </div>
            <Link
              to="/my-courses"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Check My Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
