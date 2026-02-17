"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function MultipleImageUpload({
  name,
  label,
}: {
  name: string
  label: string
}) {
  const [previews, setPreviews] = useState<string[]>([])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <Input
        type="file"
        name={name}
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = e.target.files
          if (!files) return

          const imagePreviews: string[] = []

          for (const file of Array.from(files)) {
            if (file.type.startsWith("image/")) {
              imagePreviews.push(
                URL.createObjectURL(file)
              )
            }
          }

          setPreviews(imagePreviews)
        }}
      />

      {previews.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {previews.map((src, index) => (
            <img
              key={index}
              src={src}
              className="h-24 w-24 object-cover rounded-md border"
            />
          ))}
        </div>
      )}
    </div>
  )
}
