from django.contrib import admin

from cms.models import Announcement, Banner, BlogPost, FAQ, FAQCategory, Page, SiteSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ["site_name", "phone", "email", "updated_at"]
    fieldsets = [
        ("Site Identity", {"fields": ["site_name", "site_tagline", "logo", "favicon"]}),
        ("Contact Info", {"fields": ["phone", "email", "address"]}),
        ("Social Links", {"fields": ["facebook_url", "twitter_url", "linkedin_url", "youtube_url", "instagram_url"]}),
        ("SEO", {"fields": ["default_meta_title", "default_meta_description"]}),
        ("Analytics & Cache", {"fields": ["google_analytics_id", "cache_ttl_seconds"]}),
    ]


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ["title", "order", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["title", "subtitle"]
    list_editable = ["order", "is_active"]


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "status", "category", "is_featured", "view_count", "published_at"]
    list_filter = ["status", "category", "is_featured"]
    search_fields = ["title", "content", "excerpt"]
    prepopulated_fields = {"slug": ["title"]}
    date_hierarchy = "published_at"


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "order", "is_active"]
    list_editable = ["order", "is_active"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ["question", "category", "order", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["question", "answer"]
    list_editable = ["order", "is_active"]


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ["title", "announcement_type", "is_active", "starts_at", "expires_at"]
    list_filter = ["announcement_type", "is_active"]
    search_fields = ["title", "content"]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "is_published", "show_in_footer", "view_count"]
    list_filter = ["is_published", "show_in_footer"]
    search_fields = ["title", "content"]
    prepopulated_fields = {"slug": ["title"]}
