"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { X, Upload, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadMultipleFiles,
  deleteFile,
  validateImageFile,
} from "@/lib/upload";
import { cn } from "@/lib/utils";

interface ImageGalleryUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function ImageGalleryUpload({
  value = [],
  onChange,
  onError,
  maxFiles = 5,
  disabled = false,
  className,
}: ImageGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding files would exceed max
    if (value.length + files.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate all files first
    const invalidFiles = files.filter(
      (file) => !validateImageFile(file).valid
    );
    if (invalidFiles.length > 0) {
      onError?.("Some files are invalid. Only JPEG, PNG, WebP, and GIF up to 5MB are allowed.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMultipleFiles(files, "products/gallery");

      if (result.errors.length > 0) {
        onError?.(result.errors.join(", "));
      }

      if (result.urls.length > 0) {
        onChange([...value, ...result.urls]);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];
    setDeletingIndex(index);

    try {
      await deleteFile(urlToRemove);
      const newUrls = value.filter((_, i) => i !== index);
      onChange(newUrls);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = value.length < maxFiles;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={disabled || uploading || !canAddMore}
        className="hidden"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Existing images */}
        {value.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden group"
          >
            <Image
              src={url}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover"
            />

            {/* Remove button */}
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
                disabled={disabled || deletingIndex === index}
              >
                {deletingIndex === index ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Image number */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canAddMore && (
          <div
            onClick={handleClick}
            className={cn(
              "relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Plus className="h-8 w-8 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Add Image</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500">
        {value.length} / {maxFiles} images uploaded
        {canAddMore && " • Click to add more"}
      </p>
    </div>
  );
}