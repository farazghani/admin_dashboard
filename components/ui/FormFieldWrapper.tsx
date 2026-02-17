import { Input } from "@/components/ui/input"

type Props = {
  label: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function FormFieldWrapper({ label, error, ...props }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input {...props} />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
