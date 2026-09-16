"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import StatusSelect, { Option } from "@/components/ui/status-select";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

const statusOptions: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AddBrandForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);

  // Logo Upload State & Local Preview
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Handle File Selection
  const handleLogoSelect = (file: File | null) => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("name", name.trim());
    if (slug.trim()) formData.append("slug", slug.trim());
    if (status?.value) formData.append("status", String(status.value));
    if (logoFile) formData.append("logo", logoFile);

    try {
      await apiClient.post("brands", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Brand created successfully!");
      router.push("/categories/brands");
    } catch (error: any) {
      console.error("Failed to create brand:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create brand. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Create New Brand"
          backHref="/categories/brands"
          className="gap-4"
        />
        <div className="w-32">
          <StatusSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>

        {/* Logo Uploader Section */}
        <div className="max-w-full space-y-3">
          <FileUploader
            title="Upload Brand Logo"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
            description="Allowed *.jpeg, *.png, *.jpg, *.webp, *.gif"
            maxSizeText="Max size of 3.1 MB"
            onFileSelect={handleLogoSelect}
          />

          {/* Local Preview */}
          {logoPreview && (
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block font-medium">
                Logo Preview:
              </span>
              <div className="relative size-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                <Image
                  src={logoPreview}
                  alt="Brand Logo Preview"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleLogoSelect(null)}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
          <FloatingInput
            label="Brand Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FloatingInput
            label="Slug (Optional)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/categories/brands")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Brand"
          )}
        </Button>
      </div>
    </div>
  );
}