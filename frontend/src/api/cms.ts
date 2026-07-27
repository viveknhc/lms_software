import client from "./client";
import type {
  Announcement,
  Banner,
  BlogPost,
  BlogPostDetail,
  FAQ,
  FAQCategory,
  Page,
  SiteSetting,
} from "../types";

export const cmsApi = {
  // Site settings
  getSiteSettings: () =>
    client.get<SiteSetting>("/cms/public/site-settings/"),

  // Banners
  getBanners: () =>
    client.get<Banner[]>("/cms/public/banners/"),

  // Blog
  listBlogPosts: (params?: Record<string, string>) =>
    client.get<BlogPost[]>("/cms/public/blog/", { params }),

  getBlogPost: (slug: string) =>
    client.get<BlogPostDetail>(`/cms/public/blog/${slug}/`),

  getBlogCategories: () =>
    client.get<Array<{ category: string; count: number }>>("/cms/public/blog/categories/"),

  getFeaturedPosts: () =>
    client.get<BlogPost[]>("/cms/public/blog/featured/"),

  // FAQs
  getFAQs: () =>
    client.get<{ categories: FAQCategory[]; uncategorized: FAQ[] }>("/cms/public/faqs/"),

  // Announcements
  getAnnouncements: () =>
    client.get<Announcement[]>("/cms/public/announcements/"),

  // Pages
  getPage: (slug: string) =>
    client.get<Page>(`/cms/public/pages/${slug}/`),

  // Footer pages
  getFooterPages: () =>
    client.get<Page[]>("/cms/public/footer-pages/"),
};
