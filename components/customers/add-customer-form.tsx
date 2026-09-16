"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import StatusSelect, { Option } from "@/components/ui/status-select";
import FileUploader from "@/components/ui/file-uploader";

const statusOptions: Option[] = [
  { value: 1, label: "Active" },
  { value: 2, label: "Inactive" },
  { value: 3, label: "Pending" },
];

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "bd", label: "Bangladesh" },
  { value: "in", label: "India" },
];

export default function AddCustomerForm() {
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [country, setCountry] = useState("");

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PageHeader
            title="Create New Customer"
            backHref="/customers"
            className="gap-4"
          />
        </div>
        <div className="w-34">
          <StatusSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20">
        <h2 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
          Basic Information
        </h2>

        {/* Customer Profile Image - Centered and Large */}
        <div className="mb-6 flex justify-center">
          <div className="w-full">
            <FileUploader
              title="Customer Profile Image"
              accept="image/*"
              description="Allowed *.jpeg, *.jpg, *.png, *.gif"
              maxSizeText="Max size of 3.1 MB"
              className="w-full"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 sm:space-y-6">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Full Name" />
            <FloatingInput label="Email" type="email" />
          </div>

          {/* Phone Number & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Phone Number" type="tel" />
            <CustomFloatingSelect
              label="Country"
              options={countryOptions}
              value={country}
              onChange={setCountry}
            />
          </div>

          {/* Address */}
          <FloatingTextarea label="Address" rows={4} className="h-32" />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="px-6">
          Cancel
        </Button>
        <Button variant="primary" className="px-6">
          Save
        </Button>
      </div>
    </div>
  );
}
