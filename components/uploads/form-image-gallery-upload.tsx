"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageGalleryUpload } from "./image-gallery-upload";
import { toast } from "sonner";

interface FormImageGalleryUploadProps {
  name: string;
  label: string;
  description?: string;
  maxFiles?: number;
  disabled?: boolean;
}

export function FormImageGalleryUpload({
  name,
  label,
  description,
  maxFiles = 5,
  disabled,
}: FormImageGalleryUploadProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ImageGalleryUpload
              value={field.value || []}
              onChange={field.onChange}
              onError={(error) => {
                toast.error("Upload Error", {
                  description: error,
                });
              }}
              maxFiles={maxFiles}
              disabled={disabled}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}