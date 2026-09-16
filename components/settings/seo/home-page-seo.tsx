"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface HomepageSeoData {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export default function HomePageSeo() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<HomepageSeoData>({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  const fetchHomepageSeo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      if (response.data?.status && response.data?.data?.homepage_seo) {
        const seo = response.data.data.homepage_seo;
        setFormData({
          meta_title: seo.meta_title || "",
          meta_description: seo.meta_description || "",
          meta_keywords: seo.meta_keywords || "",
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch homepage SEO settings:", err);
      toast.error(err?.response?.data?.message || "Failed to load homepage SEO settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageSeo();
  }, [fetchHomepageSeo]);

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
      const response = await apiClient.post("/settings/seo/homepage", formData);
      toast.success(response.data?.message || "Homepage SEO settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save homepage SEO settings:", err);
      toast.error(err?.response?.data?.message || "Failed to save homepage SEO settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-500/20 flex items-center justify-center min-h-[250px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading Homepage SEO...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-light-primary-text">
          Homepage SEO
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <FloatingInput
            id="meta_title"
            label="Homepage Title"
            value={formData.meta_title}
            onChange={handleChange}
            required
          />
          <FloatingInput
            id="meta_keywords"
            label="Keywords"
            value={formData.meta_keywords}
            onChange={handleChange}
            required
          />
        </div>

        <FloatingTextarea
          id="meta_description"
          label="Homepage Description"
          value={formData.meta_description}
          onChange={handleChange}
          className="h-32 resize-none"
          required
        />
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
            "Save Homepage SEO"
          )}
        </Button>
      </div>
    </form>
  );
}