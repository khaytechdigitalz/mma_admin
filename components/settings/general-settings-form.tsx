"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GeneralSettings {
  site_name: string;
  site_email: string;
  site_phone: string;
  site_currency: string;
  currency_symbol: string;
  logo?: File | string | null;
}

const currencyOptions = [
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
  { label: "GBP (£)", value: "GBP" },
  { label: "NGN (₦)", value: "NGN" },
];

export default function GeneralSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<GeneralSettings>({
    site_name: "",
    site_email: "",
    site_phone: "",
    site_currency: "USD",
    currency_symbol: "$",
    logo: null,
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/settings");
        if (response.data?.status && response.data?.data?.general) {
          const general = response.data.data.general;
          setFormData({
            site_name: general.site_name || "",
            site_email: general.site_email || "",
            site_phone: general.site_phone || "",
            site_currency: general.site_currency || "USD",
            currency_symbol: general.currency_symbol || "$",
            logo: general.logo || null, // Existing logo URL path if stored
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch settings:", err);
        toast.error(err?.response?.data?.message || "Failed to load system settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (val: string) => {
    let symbol = "$";
    if (val === "EUR") symbol = "€";
    if (val === "GBP") symbol = "£";
    if (val === "NGN") symbol = "₦";

    setFormData((prev) => ({
      ...prev,
      site_currency: val,
      currency_symbol: symbol,
    }));
  };

  const handleLogoSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Construct FormData for multipart file upload
      const data = new FormData();
      data.append("site_name", formData.site_name);
      data.append("site_email", formData.site_email);
      data.append("site_phone", formData.site_phone);
      data.append("site_currency", formData.site_currency);
      data.append("currency_symbol", formData.currency_symbol);

      // Append logo file if a new File object was selected
      if (formData.logo instanceof File) {
        data.append("logo", formData.logo);
      }

      const response = await apiClient.post("/settings/general", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data?.message || "General settings updated successfully!");
    } catch (err: any) {
      console.error("Failed to update general settings:", err);
      toast.error(err?.response?.data?.message || "Failed to update general settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-500/20 p-12 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-500/20 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg leading-7 font-bold text-light-primary-text">
          General Information
        </h2>
      </div>

      {/* Left Column - Site Logo / Graphic Uploader */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full xl:w-[376px] xl:aspect-square shrink-0">
          <FileUploader
            title="Site Logo / Image"
            description="Allowed *.jpeg, *.jpg, *.png, *.webp"
            maxSizeText="Max size of 2 MB"
            onFileSelect={handleLogoSelect} // Change this to match your FileUploader component's expected prop (e.g., onFileSelect, onDrop, etc.)
            className="h-full"
          />
        </div>

        {/* Right Column - Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 w-full content-start">
          <FloatingInput
            id="site_name"
            label="Site Name"
            value={formData.site_name}
            onChange={handleChange}
            required
          />

          <FloatingInput
            id="site_email"
            label="Site Email Address"
            value={formData.site_email}
            onChange={handleChange}
            type="email"
            required
          />

          <FloatingInput
            id="site_phone"
            label="Phone Number"
            value={formData.site_phone}
            onChange={handleChange}
            required
          />

          <CustomFloatingSelect
            label="Site Currency"
            options={currencyOptions}
            value={formData.site_currency}
            onChange={handleCurrencyChange}
          />

          <FloatingInput
            id="currency_symbol"
            label="Currency Symbol"
            value={formData.currency_symbol}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full px-8 bg-teal-700 hover:bg-teal-800 text-white min-w-[140px]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}