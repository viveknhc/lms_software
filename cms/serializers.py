from rest_framework import serializers

from cms.models import Announcement, Banner, BlogPost, FAQ, FAQCategory, Page, SiteSetting


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = [
            "id",
            "site_name",
            "site_tagline",
            "logo",
            "favicon",
            "phone",
            "email",
            "address",
            "facebook_url",
            "twitter_url",
            "linkedin_url",
            "youtube_url",
            "instagram_url",
            "default_meta_title",
            "default_meta_description",
            "google_analytics_id",
            "cache_ttl_seconds",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "subtitle",
            "description",
            "image",
            "mobile_image",
            "link_url",
            "link_text",
            "button_style",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class BlogPostListSerializer(serializers.ModelSerializer):
    """Compact serializer for blog listings (excludes full content)."""
    author_name = serializers.SerializerMethodField(read_only=True)
    time_ago = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "featured_image",
            "author",
            "author_name",
            "category",
            "tags",
            "is_featured",
            "view_count",
            "published_at",
            "time_ago",
            "created_at",
        ]
        read_only_fields = ["id", "view_count", "created_at"]

    def get_author_name(self, obj):
        return str(obj.author) if obj.author else None

    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        if obj.published_at:
            return timesince(obj.published_at, timezone.now())
        return None


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for blog detail view (includes content + SEO)."""
    author_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "featured_image",
            "author",
            "author_name",
            "category",
            "tags",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "og_image",
            "is_featured",
            "view_count",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "view_count", "created_at", "updated_at"]

    def get_author_name(self, obj):
        return str(obj.author) if obj.author else None


class FAQCategorySerializer(serializers.ModelSerializer):
    faq_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FAQCategory
        fields = ["id", "name", "slug", "description", "order", "is_active", "faq_count"]
        read_only_fields = ["id"]

    def get_faq_count(self, obj):
        return obj.faqs.filter(is_active=True).count()


class FAQSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FAQ
        fields = [
            "id",
            "category",
            "category_name",
            "question",
            "answer",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "content",
            "link_url",
            "link_text",
            "announcement_type",
            "is_active",
            "is_dismissible",
            "starts_at",
            "expires_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "featured_image",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "og_image",
            "is_published",
            "show_in_footer",
            "footer_order",
            "view_count",
            "published_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "view_count", "created_at", "updated_at"]
