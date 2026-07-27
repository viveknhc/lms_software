import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Eye, User } from "lucide-react";
import { cmsApi } from "../api/cms";
import type { BlogPostDetail } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    cmsApi.getBlogPost(slug)
      .then((res) => setPost(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Post not found</h2>
        <Link to="/blog" className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          {post.featured_image && (
            <img src={post.featured_image} alt={post.title} className="w-full aspect-[2/1] object-cover" />
          )}
          <div className="p-8 sm:p-10">
            {post.category && (
              <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 mb-3">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {post.author_name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {post.author_name}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {post.view_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {post.view_count} views
                </span>
              )}
            </div>

            {post.excerpt && (
              <p className="mt-6 text-lg text-gray-600 italic border-l-4 border-indigo-200 pl-4">{post.excerpt}</p>
            )}

            <div className="mt-8 prose prose-gray max-w-none leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

            {post.tags && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {post.tags.split(",").map((tag) => (
                    <span key={tag.trim()} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
