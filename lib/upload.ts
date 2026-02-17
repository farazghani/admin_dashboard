import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

export const supabaseAdmin = createClient(
  supabaseUrl || "",
  serviceRoleKey || supabaseAnonKey || ""
);
export const STORAGE_BUCKET = "product-images";

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename (WITHOUT folder prefix)
 */
export function generateFileName(file: File): string {
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${random}.${fileExt}`;
}

/**
 * Upload single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  folder: string = "products"
): Promise<{ url: string | null; error: string | null; path: string | null }> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error || "Invalid file", path: null };
    }

    // Generate filename WITHOUT folder prefix
    const fileName = generateFileName(file);
    
    // Build complete path: folder/filename
    const filePath = `${folder}/${fileName}`;

    console.log("Uploading to path:", filePath); // Debug log

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: null, error: error.message, path: null };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

    console.log("Upload successful:", publicUrl); // Debug log

    return { url: publicUrl, error: null, path: data.path };
  } catch (error) {
    console.error("Upload exception:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Upload failed",
      path: null,
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string = "products"
): Promise<{
  urls: string[];
  errors: string[];
  paths: string[];
}> {
  const results = await Promise.allSettled(
    files.map((file) => uploadFile(file, folder))
  );

  const urls: string[] = [];
  const errors: string[] = [];
  const paths: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      if (result.value.url) {
        urls.push(result.value.url);
        if (result.value.path) {
          paths.push(result.value.path);
        }
      } else if (result.value.error) {
        errors.push(`File ${index + 1}: ${result.value.error}`);
      }
    } else {
      errors.push(`File ${index + 1}: ${result.reason}`);
    }
  });

  return { urls, errors, paths };
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  urlOrPath: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    let filePath: string;

    // Check if it's a URL or path
    if (urlOrPath.startsWith("http")) {
      // Extract path from URL
      const urlParts = urlOrPath.split(`${STORAGE_BUCKET}/`);
      if (urlParts.length < 2) {
        return { success: false, error: "Invalid URL format" };
      }
      filePath = urlParts[1];
    } else {
      filePath = urlOrPath;
    }

    console.log("Deleting file at path:", filePath); // Debug log

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Delete exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(
  urlsOrPaths: string[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const paths = urlsOrPaths.map((urlOrPath) => {
      if (urlOrPath.startsWith("http")) {
        const urlParts = urlOrPath.split(`${STORAGE_BUCKET}/`);
        return urlParts.length >= 2 ? urlParts[1] : urlOrPath;
      }
      return urlOrPath;
    });

    console.log("Deleting files at paths:", paths); // Debug log

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Get file size from URL (helper for displaying file info)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}