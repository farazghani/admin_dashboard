"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function SingleImageUpload({
  name,
  label,
}: {
  name: string
  label: string
}) {
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <Input
        type="file"
        name={name}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]

          if (!file) return

          if (!file.type.startsWith("image/")) {
            alert("Only image files allowed")
            return
          }

          setPreview(URL.createObjectURL(file))
        }}
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="h-32 w-32 rounded-md object-cover border"
        />
      )}
    </div>
  )
}
