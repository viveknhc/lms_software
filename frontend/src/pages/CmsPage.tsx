import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { cmsApi } from "../api/cms";
import type { Page } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CmsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    cmsApi.getPage(slug)
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!page) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Page not found</h2>
        <Link to="/" className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          {page.view_count > 0 && (
            <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <Eye className="h-4 w-4" /> {page.view_count} views
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border border-gray-200 p-8 sm:p-10">
          <div className="prose prose-gray max-w-none leading-relaxed whitespace-pre-wrap">
            {page.content}
          </div>
          {page.published_at && (
            <p className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4">
              Last updated: {new Date(page.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
