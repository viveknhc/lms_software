from django.conf import settings
from django.db.models import Count, F, Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from cms.models import Announcement, Banner, BlogPost, FAQ, FAQCategory, Page, SiteSetting
from cms.serializers import (
    AnnouncementSerializer,
    BannerSerializer,
    BlogPostDetailSerializer,
    BlogPostListSerializer,
    FAQCategorySerializer,
    FAQSerializer,
    PageSerializer,
    SiteSettingSerializer,
)


def get_cache_ttl():
    """Get cache TTL from settings or default to 5 minutes."""
    try:
        site_setting = SiteSetting.objects.first()
        if site_setting and site_setting.cache_ttl_seconds:
            return site_setting.cache_ttl_seconds
    except Exception:
        pass
    return getattr(settings, "CMS_CACHE_TTL", 300)


class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


# ---------------------------------------------------------------------------
# PUBLIC (cached) endpoints
# ---------------------------------------------------------------------------


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_site_settings(request):
    """Public site info: name, logo, contact, social links."""
    site_setting = SiteSetting.objects.first()
    if not site_setting:
        return Response({})
    serializer = SiteSettingSerializer(site_setting)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_banners(request):
    """Active homepage banners, ordered."""
    banners = Banner.objects.filter(is_active=True)
    serializer = BannerSerializer(banners, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_blog_list(request):
    """Published blog posts, paginated, ordered by published_at."""
    posts = BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED).select_related(
        "author"
    )
    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(posts, request)
    if page is not None:
        serializer = BlogPostListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    serializer = BlogPostListSerializer(posts, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_blog_detail(request, slug):
    """Single blog post by slug, increments view count."""
    try:
        post = BlogPost.objects.get(
            slug=slug, status=BlogPost.Status.PUBLISHED
        )
    except BlogPost.DoesNotExist:
        raise NotFound("Blog post not found.")

    # Increment view count (lightweight)
    BlogPost.objects.filter(id=post.id).update(view_count=F("view_count") + 1)
    post.view_count += 1  # for serializer

    serializer = BlogPostDetailSerializer(post)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_faqs(request):
    """Active FAQs grouped by category."""
    categories = FAQCategory.objects.filter(is_active=True).prefetch_related(
        "faqs"
    )
    categories_data = FAQCategorySerializer(categories, many=True).data

    # Also include un-categorized FAQs
    uncategorized = FAQ.objects.filter(
        category__isnull=True, is_active=True
    )
    uncategorized_data = FAQSerializer(uncategorized, many=True).data

    return Response({
        "categories": categories_data,
        "uncategorized": uncategorized_data,
    })


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_announcements(request):
    """Active announcements (not expired)."""
    now = timezone.now()
    announcements = Announcement.objects.filter(
        is_active=True,
        starts_at__lte=now,
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gte=now)
    )
    serializer = AnnouncementSerializer(announcements, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_page_detail(request, slug):
    """Published static page by slug."""
    try:
        page = Page.objects.get(slug=slug, is_published=True)
    except Page.DoesNotExist:
        raise NotFound("Page not found.")

    # Increment view count
    Page.objects.filter(id=page.id).update(view_count=F("view_count") + 1)
    page.view_count += 1

    serializer = PageSerializer(page)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_footer_pages(request):
    """Pages marked for footer display."""
    pages = Page.objects.filter(
        is_published=True, show_in_footer=True
    ).order_by("footer_order")
    serializer = PageSerializer(pages, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_featured_posts(request):
    """Featured blog posts for homepage."""
    posts = BlogPost.objects.filter(
        status=BlogPost.Status.PUBLISHED, is_featured=True
    ).select_related("author")[:6]
    serializer = BlogPostListSerializer(posts, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
@method_decorator(vary_on_headers("Accept"))
def public_blog_categories(request):
    """List of blog categories with post counts."""
    categories = (
        BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED)
        .exclude(category="")
        .values("category")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    return Response(list(categories))


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@method_decorator(cache_page(get_cache_ttl()))
def public_sitemap(request):
    """Sitemap for search engines — lists all public URLs."""
    now = timezone.now()

    # Static pages
    pages = Page.objects.filter(is_published=True).values("slug", "updated_at")
    page_urls = [
        {
            "loc": f"/api/cms/public/pages/{p['slug']}/",
            "lastmod": p["updated_at"].isoformat() if p["updated_at"] else now.isoformat(),
            "changefreq": "monthly",
            "priority": 0.8,
        }
        for p in pages
    ]

    # Blog posts
    posts = BlogPost.objects.filter(
        status=BlogPost.Status.PUBLISHED
    ).values("slug", "updated_at", "published_at")
    post_urls = [
        {
            "loc": f"/api/cms/public/blog/{p['slug']}/",
            "lastmod": (p["updated_at"] or p["published_at"] or now).isoformat(),
            "changefreq": "weekly",
            "priority": 0.6,
        }
        for p in posts
    ]

    return Response({
        "urls": page_urls + post_urls,
    })


# ---------------------------------------------------------------------------
# ADMIN CRUD endpoints
# ---------------------------------------------------------------------------


class SiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]

    def get_queryset(self):
        return SiteSetting.objects.all()[:1]

    def perform_create(self, serializer):
        if SiteSetting.objects.exists():
            raise ValidationError(
                {"detail": "Site settings already exist. Use PUT/PATCH to update."}
            )
        serializer.save()


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    filterset_fields = ["is_active"]
    ordering_fields = ["order", "created_at"]


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.select_related("author").all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    filterset_fields = ["status", "category", "is_featured"]
    search_fields = ["title", "content", "excerpt"]
    ordering_fields = ["-published_at", "-created_at", "view_count"]

    def get_serializer_class(self):
        if self.action == "list":
            return BlogPostListSerializer
        return BlogPostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class FAQCategoryViewSet(viewsets.ModelViewSet):
    queryset = FAQCategory.objects.all()
    serializer_class = FAQCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    search_fields = ["name", "description"]


class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.select_related("category").all()
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    filterset_fields = ["category", "is_active"]
    search_fields = ["question", "answer"]


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    filterset_fields = ["is_active", "announcement_type"]
    ordering_fields = ["-starts_at", "-created_at"]


class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    filterset_fields = ["is_published", "show_in_footer"]
    search_fields = ["title", "content"]
    lookup_field = "slug"
