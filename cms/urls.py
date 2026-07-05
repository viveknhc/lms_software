from django.urls import path
from rest_framework.routers import DefaultRouter

from cms.views import (
    AnnouncementViewSet,
    BannerViewSet,
    BlogPostViewSet,
    FAQCategoryViewSet,
    FAQViewSet,
    PageViewSet,
    SiteSettingViewSet,
    public_announcements,
    public_banners,
    public_blog_categories,
    public_blog_detail,
    public_blog_list,
    public_faqs,
    public_featured_posts,
    public_footer_pages,
    public_page_detail,
    public_site_settings,
    public_sitemap,
)

router = DefaultRouter()
router.register(r"site-settings", SiteSettingViewSet, basename="cms-site-settings")
router.register(r"banners", BannerViewSet, basename="cms-banner")
router.register(r"blog-posts", BlogPostViewSet, basename="cms-blog-post")
router.register(r"faq-categories", FAQCategoryViewSet, basename="cms-faq-category")
router.register(r"faqs", FAQViewSet, basename="cms-faq")
router.register(r"announcements", AnnouncementViewSet, basename="cms-announcement")
router.register(r"pages", PageViewSet, basename="cms-page")

urlpatterns = [
    # Public endpoints (cached)
    path("public/site-settings/", public_site_settings, name="cms-public-site-settings"),
    path("public/banners/", public_banners, name="cms-public-banners"),
    path("public/blog/", public_blog_list, name="cms-public-blog-list"),
    path("public/blog/<slug:slug>/", public_blog_detail, name="cms-public-blog-detail"),
    path("public/blog/categories/", public_blog_categories, name="cms-public-blog-categories"),
    path("public/blog/featured/", public_featured_posts, name="cms-public-blog-featured"),
    path("public/faqs/", public_faqs, name="cms-public-faqs"),
    path("public/announcements/", public_announcements, name="cms-public-announcements"),
    path("public/pages/<slug:slug>/", public_page_detail, name="cms-public-page-detail"),
    path("public/footer-pages/", public_footer_pages, name="cms-public-footer-pages"),
    path("public/sitemap/", public_sitemap, name="cms-public-sitemap"),
] + router.urls
