from django.db import models
from django.utils.text import slugify


class SEOMeta(models.Model):
    """Abstract base with common SEO fields for public content models."""

    meta_title = models.CharField(
        max_length=70, blank=True, verbose_name="Meta Title",
        help_text="SEO title (recommended: 50-60 characters)",
    )
    meta_description = models.CharField(
        max_length=160, blank=True, verbose_name="Meta Description",
        help_text="SEO description (recommended: 150-160 characters)",
    )
    meta_keywords = models.CharField(
        max_length=255, blank=True, verbose_name="Meta Keywords",
    )
    og_image = models.ImageField(
        upload_to="seo/", blank=True, null=True, verbose_name="OG Image",
        help_text="Open Graph image for social sharing",
    )

    class Meta:
        abstract = True


class SiteSetting(models.Model):
    """Singleton model for site-wide configuration and contact info."""

    site_name = models.CharField(max_length=200, default="LMS", verbose_name="Site Name")
    site_tagline = models.CharField(max_length=300, blank=True, verbose_name="Tagline")
    logo = models.ImageField(upload_to="site/", blank=True, null=True, verbose_name="Logo")
    favicon = models.ImageField(upload_to="site/", blank=True, null=True, verbose_name="Favicon")
    # Contact info
    phone = models.CharField(max_length=20, blank=True, verbose_name="Phone Number")
    email = models.EmailField(blank=True, verbose_name="Email Address")
    address = models.TextField(blank=True, verbose_name="Address")
    # Social links
    facebook_url = models.URLField(blank=True, verbose_name="Facebook URL")
    twitter_url = models.URLField(blank=True, verbose_name="Twitter/X URL")
    linkedin_url = models.URLField(blank=True, verbose_name="LinkedIn URL")
    youtube_url = models.URLField(blank=True, verbose_name="YouTube URL")
    instagram_url = models.URLField(blank=True, verbose_name="Instagram URL")
    # Default SEO
    default_meta_title = models.CharField(
        max_length=70, blank=True, verbose_name="Default Meta Title",
    )
    default_meta_description = models.CharField(
        max_length=160, blank=True, verbose_name="Default Meta Description",
    )
    # Analytics
    google_analytics_id = models.CharField(
        max_length=50, blank=True, verbose_name="Google Analytics ID",
    )
    # Cache TTL
    cache_ttl_seconds = models.PositiveIntegerField(
        default=300, verbose_name="Cache TTL (seconds)",
        help_text="How long to cache public CMS pages (default: 5 minutes)",
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "site_settings"
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        # Enforce singleton
        if not self.pk and SiteSetting.objects.exists():
            return
        super().save(*args, **kwargs)


class Banner(models.Model):
    """Homepage hero banner / slider."""

    title = models.CharField(max_length=200, verbose_name="Title")
    subtitle = models.CharField(max_length=400, blank=True, verbose_name="Subtitle")
    description = models.TextField(blank=True, verbose_name="Description")
    image = models.ImageField(upload_to="banners/", verbose_name="Banner Image")
    mobile_image = models.ImageField(
        upload_to="banners/", blank=True, null=True,
        verbose_name="Mobile Image",
        help_text="Optional: optimized image for mobile devices",
    )
    link_url = models.URLField(blank=True, verbose_name="Link URL")
    link_text = models.CharField(max_length=100, blank=True, verbose_name="Link Text")
    button_style = models.CharField(
        max_length=20, default="primary", verbose_name="Button Style",
        choices=[
            ("primary", "Primary"),
            ("secondary", "Secondary"),
            ("outline", "Outline"),
        ],
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "banners"
        verbose_name = "Banner"
        verbose_name_plural = "Banners"
        ordering = ["order"]

    def __str__(self):
        return self.title


class BlogPost(SEOMeta):
    """Blog article with SEO support."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=300, verbose_name="Title")
    slug = models.SlugField(max_length=300, unique=True, verbose_name="Slug")
    excerpt = models.TextField(
        max_length=500, blank=True, verbose_name="Excerpt",
        help_text="Short summary shown in blog listings",
    )
    content = models.TextField(verbose_name="Content")
    featured_image = models.ImageField(
        upload_to="blog/", blank=True, null=True, verbose_name="Featured Image",
    )
    author = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True,
        related_name="blog_posts", verbose_name="Author",
    )
    category = models.CharField(
        max_length=100, blank=True, verbose_name="Category",
        help_text="e.g. News, Tutorial, Announcement",
    )
    tags = models.CharField(
        max_length=500, blank=True, verbose_name="Tags",
        help_text="Comma-separated tags",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT,
        verbose_name="Status",
    )
    is_featured = models.BooleanField(default=False, verbose_name="Featured Post")
    view_count = models.PositiveIntegerField(default=0, verbose_name="View Count")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Published At")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "blog_posts"
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "-published_at"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:300]
        super().save(*args, **kwargs)


class FAQCategory(models.Model):
    """Category grouping for FAQs."""

    name = models.CharField(max_length=100, verbose_name="Name")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Description")
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")

    class Meta:
        db_table = "faq_categories"
        verbose_name = "FAQ Category"
        verbose_name_plural = "FAQ Categories"
        ordering = ["order"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:100]
        super().save(*args, **kwargs)


class FAQ(models.Model):
    """Frequently Asked Question."""

    category = models.ForeignKey(
        FAQCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="faqs", verbose_name="Category",
    )
    question = models.CharField(max_length=500, verbose_name="Question")
    answer = models.TextField(verbose_name="Answer")
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "faqs"
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"
        ordering = ["order"]

    def __str__(self):
        return self.question


class Announcement(models.Model):
    """Site-wide announcement (e.g. maintenance, promotion)."""

    title = models.CharField(max_length=300, verbose_name="Title")
    content = models.TextField(blank=True, verbose_name="Content")
    link_url = models.URLField(blank=True, verbose_name="Link URL")
    link_text = models.CharField(max_length=100, blank=True, verbose_name="Link Text")
    announcement_type = models.CharField(
        max_length=20, default="info", verbose_name="Type",
        choices=[
            ("info", "Information"),
            ("warning", "Warning"),
            ("success", "Success"),
            ("promotion", "Promotion"),
        ],
    )
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    is_dismissible = models.BooleanField(default=True, verbose_name="Is Dismissible")
    starts_at = models.DateTimeField(verbose_name="Starts At")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Expires At")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "announcements"
        verbose_name = "Announcement"
        verbose_name_plural = "Announcements"
        ordering = ["-starts_at"]

    def __str__(self):
        return self.title


class Page(SEOMeta):
    """Static page (About, Contact, Terms, Privacy, etc.)."""

    title = models.CharField(max_length=300, verbose_name="Title")
    slug = models.SlugField(max_length=300, unique=True, verbose_name="Slug")
    content = models.TextField(verbose_name="Content", help_text="Page content (HTML supported)")
    featured_image = models.ImageField(
        upload_to="pages/", blank=True, null=True, verbose_name="Featured Image",
    )
    is_published = models.BooleanField(default=False, verbose_name="Is Published")
    show_in_footer = models.BooleanField(
        default=False, verbose_name="Show in Footer",
        help_text="Show a link in the site footer",
    )
    footer_order = models.PositiveIntegerField(
        default=0, verbose_name="Footer Order",
    )
    view_count = models.PositiveIntegerField(default=0, verbose_name="View Count")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Published At")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "pages"
        verbose_name = "Page"
        verbose_name_plural = "Pages"
        ordering = ["title"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:300]
        super().save(*args, **kwargs)
