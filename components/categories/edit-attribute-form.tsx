"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react";

// Supported backend types
const typeOptions = [
  { value: "select", label: "Select (Dropdown)" },
  { value: "radio", label: "Radio Button" },
  { value: "text", label: "Text Input" },
  { value: "color", label: "Color Swatch" },
  { value: "checkbox", label: "Checkbox" },
];

function EditAttributeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attributeId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("select");
  const [values, setValues] = useState<string[]>([""]);

  // Fetch Attribute Details
  const fetchAttributeDetails = useCallback(async () => {
    if (!attributeId) {
      setError("No attribute ID specified in the URL.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`attributes/${attributeId}`);
      const data = res?.data?.data;

      if (data) {
        setName(data.name || "");
        setType(data.type || "select");

        if (Array.isArray(data.values) && data.values.length > 0) {
          setValues(data.values.map((v: { value: string }) => v.value));
        } else {
          setValues([""]);
        }
      } else {
        throw new Error("Failed to parse attribute details.");
      }
    } catch (err: any) {
      console.error("Error fetching attribute:", err);
      setError(
        err?.response?.data?.message || "Failed to load attribute details."
      );
    } finally {
      setIsLoading(false);
    }
  }, [attributeId]);

  useEffect(() => {
    fetchAttributeDetails();
  }, [fetchAttributeDetails]);

  // Dynamic Value Handlers
  const handleValueChange = (index: number, val: string) => {
    const updated = [...values];
    updated[index] = val;
    setValues(updated);
  };

  const handleAddValue = () => {
    setValues((prev) => [...prev, ""]);
  };

  const handleRemoveValue = (index: number) => {
    if (values.length === 1) {
      setValues([""]);
      return;
    }
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission Handler
  const handleSubmit = async () => {
    if (!attributeId) {
      toast.error("Invalid attribute ID.");
      return;
    }

    if (!name.trim()) {
      toast.error("Attribute name is required.");
      return;
    }

    if (!type) {
      toast.error("Please select an attribute type.");
      return;
    }

    const formattedValues = values
      .map((val) => val.trim())
      .filter((val) => val !== "")
      .map((val) => ({ value: val }));

    if (formattedValues.length === 0) {
      toast.error("Please provide at least one valid value for this attribute.");
      return;
    }

    const payload = {
      name: name.trim(),
      type: type,
      values: formattedValues,
    };

    setIsSubmitting(true);

    try {
      await apiClient.put(`attributes/${attributeId}`, payload);
      toast.success("Attribute updated successfully!");
      router.push("/categories/attributes");
    } catch (err: any) {
      console.error("Failed to update attribute:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update attribute. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center justify-between">
        <PageHeader
          title="Edit Attribute"
          backHref="/categories/attributes"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-light-secondary-text">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading attribute details...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 m-6 gap-3 text-red-500 bg-red-50/50 rounded-xl border border-red-100">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAttributeDetails}>
            Retry Loading
          </Button>
        </div>
      ) : (
        <>
          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FloatingInput
                  label="Attribute Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <CustomFloatingSelect
                  label="Attribute Type *"
                  options={typeOptions}
                  value={type}
                  onChange={setType}
                />
              </div>

              {/* Dynamic Values Section */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Attribute Values *
                    </h3>
                    <p className="text-xs text-gray-500">
                      Add option choices for this attribute (e.g. Red, Blue, Small, Medium)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddValue}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="size-4" />
                    Add Value
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {values.map((val, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <FloatingInput
                          label={`Value ${index + 1}`}
                          value={val}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                        />
                      </div>
                      {values.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove value"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="px-6"
              onClick={() => router.push("/categories/attributes")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="px-6"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Attribute"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function EditAttributeForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-white rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <EditAttributeContent />
    </Suspense>
  );
}