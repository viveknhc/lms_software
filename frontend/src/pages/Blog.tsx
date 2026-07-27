import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight, Clock, Search } from "lucide-react";
import { cmsApi } from "../api/cms";
import type { BlogPost } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    Promise.all([
      cmsApi.listBlogPosts(),
      cmsApi.getBlogCategories(),
    ]).then(([postsRes, catsRes]) => {
      setPosts(postsRes.data);
      setCategories(catsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="mt-2 text-gray-600">Tips, tutorials, and insights from our community</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-300"
              />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory("")}
                    className={`block w-full text-left rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      !activeCategory ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All Posts
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.category}
                      onClick={() => setActiveCategory(cat.category)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        activeCategory === cat.category ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.category}</span>
                      <span className="text-xs text-gray-400">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posts Grid */}
          <div className="lg:col-span-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No posts found</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
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
                      <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{post.author_name || "Anonymous"}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.time_ago || "Recently"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
