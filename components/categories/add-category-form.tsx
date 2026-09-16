"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import StatusSelect, { Option } from "@/components/ui/status-select";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

const statusOptions: Option[] = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const priorityOptions = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

export default function AddCategoryForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field States
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(""); 

  // File States & Previews
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // File Selection Handlers
  const handleIconSelect = (file: File | null) => {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(file);
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    } else {
      setIconPreview(null);
    }
  };

  const handleBannerSelect = (file: File | null) => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    if (file) {
      setBannerPreview(URL.createObjectURL(file));
    } else {
      setBannerPreview(null);
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("name", name.trim());

    if (priority) {
      formData.append("priority", priority);
    }

    if (status?.value !== undefined) {
      formData.append("status", String(status.value));
    }
 

    if (iconFile) {
      formData.append("icon", iconFile);
    }

    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    try {
      await apiClient.post("categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Category created successfully!");
      router.push("/categories");
    } catch (error: any) {
      console.error("Failed to create category:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create category. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center justify-between">
        <PageHeader
          title="Create New Category"
          backHref="/categories"
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
        <h2 className="text-lg font-bold text-light-primary-text">
          Basic Information
        </h2>

        {/* File Uploaders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Icon Upload */}
          <div className="space-y-3">
            <FileUploader
              title="Upload Category Icon"
              accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
              description="Allowed *.jpeg, *.png, *.jpg, *.webp, *.svg"
              maxSizeText="Max size 2.0 MB"
              onFileSelect={handleIconSelect}
            />
            {iconPreview && (
              <div className="relative size-16 rounded-lg border border-gray-200 overflow-hidden group">
                <Image
                  src={iconPreview}
                  alt="Icon Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleIconSelect(null)}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>

          {/* Banner Upload */}
          <div className="space-y-3">
            <FileUploader
              title="Upload Category Banner"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              description="Allowed *.jpeg, *.png, *.jpg, *.webp"
              maxSizeText="Max size 2.0 MB"
              onFileSelect={handleBannerSelect}
            />
            {bannerPreview && (
              <div className="relative h-16 w-32 rounded-lg border border-gray-200 overflow-hidden group">
                <Image
                  src={bannerPreview}
                  alt="Banner Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleBannerSelect(null)}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FloatingInput
            label="Category Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <CustomFloatingSelect
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
          />
        </div>
      </div>
 
      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 sm:pt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/categories")}
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
              Saving...
            </>
          ) : (
            "Save Category"
          )}
        </Button>
      </div>
    </div>
  );
}