export interface UploadedFile {
  url: string;
  path: string;
  name: string;
  size: number;
}

export interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
}