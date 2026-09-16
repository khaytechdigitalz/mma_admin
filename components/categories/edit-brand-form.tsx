"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import FileUploader from "@/components/ui/file-uploader";
import StatusSelect, { Option } from "@/components/ui/status-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, X, Package } from "lucide-react";

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

const getFullImageUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_BASE_URL}/${path.replace(/^\//, "")}`;
};

const statusOptions: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface BrandDetails {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export default function EditBrandForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);

  // Existing Logo & New Upload Preview
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch Brand Details
  useEffect(() => {
    if (!brandId) {
      setIsLoading(false);
      return;
    }

    const fetchBrandDetails = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`brands/${brandId}`);
        const data: BrandDetails = res?.data?.data;

        if (data) {
          setName(data.name || "");
          setSlug(data.slug || "");

          // Match Status
          const currentStatus = statusOptions.find(
            (opt) => opt.value === data.status
          ) || statusOptions[0];
          setStatus(currentStatus);

          // Set existing logo path
          setExistingLogo(getFullImageUrl(data.logo));
        }
      } catch (error: any) {
        console.error("Failed to fetch brand details:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load brand details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandDetails();
  }, [brandId]);

  // Handle Logo Selection
  const handleLogoSelect = (file: File | null) => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  // Submit Updated Brand Data
  const handleSubmit = async () => {
    if (!brandId) {
      toast.error("Invalid Brand ID.");
      return;
    }

    if (!name.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("_method", "POST");
    formData.append("name", name.trim());
    if (slug.trim()) formData.append("slug", slug.trim());
    if (status?.value) formData.append("status", String(status.value));
    if (logoFile) formData.append("logo", logoFile);

    try {
      await apiClient.post(`brands/${brandId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Brand updated successfully!");
      router.push("/categories/brands");
    } catch (error: any) {
      console.error("Failed to update brand:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update brand. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-gray-500">Loading brand details...</p>
      </div>
    );
  }

  if (!brandId) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <Package className="size-12 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-800">Missing Brand ID</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          No valid brand ID was provided in the URL parameters.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/categories/brands")}
        >
          Back to Brands
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit Brand"
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

        {/* Logo Upload Section */}
        <div className="max-w-full space-y-3">
          <FileUploader
            title="Upload Brand Logo"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
            description="Allowed *.jpeg, *.png, *.jpg, *.webp, *.gif"
            maxSizeText="Max size of 3.1 MB"
            onFileSelect={handleLogoSelect}
          />

          {/* Image Preview Container */}
          {(logoPreview || existingLogo) && (
            <div className="space-y-1">
              <span className="text-xs text-gray-400 block font-medium">
                {logoPreview ? "New Logo Preview:" : "Current Logo:"}
              </span>
              <div className="relative size-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                <Image
                  src={logoPreview || existingLogo!}
                  alt="Brand Logo"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => handleLogoSelect(null)}
                    className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                )}
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
            label="Slug"
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
              Updating...
            </>
          ) : (
            "Save Brand"
          )}
        </Button>
      </div>
    </div>
  );
}