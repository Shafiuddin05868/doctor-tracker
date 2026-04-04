"use client";

import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  file?: File | null;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  fallbackText?: string;
}

export function ImageUpload({
  value,
  file,
  onFileChange,
  onClear,
  fallbackText = "DR",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;
  const displayUrl = previewUrl || value;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt="Profile" />
          ) : null}
          <AvatarFallback className="text-lg">{fallbackText}</AvatarFallback>
        </Avatar>

        {(displayUrl) && (
          <button
            type="button"
            onClick={() => {
              onClear();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-sm hover:bg-destructive/90"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0] ?? null;
            onFileChange(selected);
          }}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-2 h-3.5 w-3.5" />
          {displayUrl ? "Change Photo" : "Upload Photo"}
        </Button>
        <p className="text-xs text-muted-foreground">Optional. Max 5MB.</p>
      </div>
    </div>
  );
}
