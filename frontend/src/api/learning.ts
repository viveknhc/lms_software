import type { Lesson, Section } from "../types";
import client from "./client";

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB per chunk

function generateUploadId(): string {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadVideo(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = generateUploadId();
  let loadedBytes = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk, file.name);
    formData.append("upload_id", uploadId);
    formData.append("chunk_index", String(i));
    formData.append("total_chunks", String(totalChunks));
    formData.append("filename", file.name);

    const response = await client.post<{ url?: string; received?: number; total?: number }>(
      "/learning/upload-video/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    loadedBytes += chunk.size;

    if (onProgress) {
      onProgress({
        loaded: loadedBytes,
        total: file.size,
        percentage: Math.round((loadedBytes / file.size) * 100),
      });
    }

    // If all chunks were sent, the response contains the final URL
    if (response.data.url) {
      return response.data.url;
    }
  }

  throw new Error("Upload failed — no URL returned");
}

export const learningApi = {
  listSections: (params?: Record<string, string>) =>
    client.get<Section[]>("/learning/sections/", { params }),

  listLessons: (params?: Record<string, string>) =>
    client.get<Lesson[]>("/learning/lessons/", { params }),

  getLesson: (id: number) =>
    client.get<Lesson>(`/learning/lessons/${id}/`),

  createLesson: (data: Partial<Lesson>) =>
    client.post<Lesson>("/learning/lessons/", data),

  updateLesson: (id: number, data: Partial<Lesson>) =>
    client.patch<Lesson>(`/learning/lessons/${id}/`, data),

  deleteLesson: (id: number) =>
    client.delete(`/learning/lessons/${id}/`),
};
