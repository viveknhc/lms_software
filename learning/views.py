import uuid
from pathlib import Path

from django.conf import settings
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from learning.models import Lesson, Section
from learning.serializers import LessonSerializer, SectionSerializer


CHUNK_DIR = Path(settings.MEDIA_ROOT) / "_chunked_uploads"


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_video_chunk(request):
    """Receive a video file chunk and reassemble when all chunks arrive."""
    file = request.FILES.get("file")
    upload_id = request.POST.get("upload_id")
    chunk_index = request.POST.get("chunk_index")
    total_chunks = request.POST.get("total_chunks")
    filename = request.POST.get("filename")

    if not all([file, upload_id, chunk_index, total_chunks, filename]):
        return Response(
            {"error": "Missing required fields (file, upload_id, chunk_index, total_chunks, filename)"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    chunk_index = int(chunk_index)
    total_chunks = int(total_chunks)

    # Save chunk to temp directory
    chunk_dir = CHUNK_DIR / upload_id
    chunk_dir.mkdir(parents=True, exist_ok=True)
    chunk_path = chunk_dir / f"chunk_{chunk_index:06d}"

    with open(chunk_path, "wb+") as dest:
        for chunk in file.chunks():
            dest.write(chunk)

    # Check if all chunks received
    received = len(list(chunk_dir.iterdir()))

    if received >= total_chunks:
        # All chunks received — assemble the final file
        video_dir = Path(settings.MEDIA_ROOT) / "lesson_videos"
        video_dir.mkdir(parents=True, exist_ok=True)

        # Avoid filename collisions
        final_name = filename
        final_path = video_dir / final_name
        if final_path.exists():
            stem = Path(filename).stem
            ext = Path(filename).suffix
            final_name = f"{stem}_{uuid.uuid4().hex[:8]}{ext}"
            final_path = video_dir / final_name

        with open(final_path, "wb+") as dest:
            for i in range(total_chunks):
                chunk_path = chunk_dir / f"chunk_{i:06d}"
                if chunk_path.exists():
                    dest.write(chunk_path.read_bytes())
                    chunk_path.unlink()  # remove chunk

        # Cleanup chunk directory
        chunk_dir.rmdir()

        # Build URL
        file_url = f"{settings.MEDIA_URL}lesson_videos/{final_name}"
        request_scheme = "https" if request.is_secure() else "http"
        host = request.get_host()
        absolute_url = f"{request_scheme}://{host}{file_url}"

        return Response({"url": absolute_url, "file": file_url}, status=status.HTTP_201_CREATED)

    return Response(
        {"received": received, "total": total_chunks, "upload_id": upload_id},
        status=status.HTTP_200_OK,
    )


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["course"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related("section", "course").all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["section", "course", "content_type", "is_free"]
    ordering_fields = ["order", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # For unauthenticated or student users, show only free lessons if not enrolled
        # (Enrollment check can be added later when the full system is integrated)
        if not user.is_authenticated:
            qs = qs.filter(is_free=True)
        return qs
