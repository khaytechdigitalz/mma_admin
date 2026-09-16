"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GlobalSeoData {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  meta_image: string;
}

export default function GlobalPageSeo() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<GlobalSeoData>({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    meta_image: "",
  });

  const fetchGlobalSeo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      if (response.data?.status && response.data?.data?.global_seo) {
        const seo = response.data.data.global_seo;
        setFormData({
          meta_title: seo.meta_title || "",
          meta_description: seo.meta_description || "",
          meta_keywords: seo.meta_keywords || "",
          meta_image: seo.meta_image || "",
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch global SEO settings:", err);
      toast.error(err?.response?.data?.message || "Failed to load global SEO settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalSeo();
  }, [fetchGlobalSeo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await apiClient.post("/settings/seo/global", formData);
      toast.success(response.data?.message || "Global SEO settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save global SEO settings:", err);
      toast.error(err?.response?.data?.message || "Failed to save global SEO settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-500/20 flex items-center justify-center min-h-[250px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading Global SEO...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-light-primary-text">
          Global SEO Settings
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FloatingInput
            id="meta_title"
            label="Default Meta Title"
            value={formData.meta_title}
            onChange={handleChange}
            required
          />
          <FloatingInput
            id="meta_keywords"
            label="Default Keywords"
            value={formData.meta_keywords}
            onChange={handleChange}
            required
          />
        </div>

        <FloatingTextarea
          id="meta_description"
          label="Default Meta Description"
          value={formData.meta_description}
          onChange={handleChange}
          className="h-32 resize-none"
          required
        />

        <div className="pt-2">
          <FileUploader
            title="Global OpenGraph (OG) Image"
            description="Allowed *.jpeg, *.jpg, *.png, *.webp"
            maxSizeText="Max size of 3.1 MB"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full px-6 bg-teal-700 hover:bg-teal-800 text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save Global SEO"
          )}
        </Button>
      </div>
    </form>
  );
}