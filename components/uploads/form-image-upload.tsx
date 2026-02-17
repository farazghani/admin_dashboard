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
import { ImageUpload } from "./image-upload";
import { toast } from "sonner";

interface FormImageUploadProps {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function FormImageUpload({
  name,
  label,
  description,
  disabled,
}: FormImageUploadProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              onError={(error) => {
                toast.error("Upload Error", {
                  description: error,
                });
              }}
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