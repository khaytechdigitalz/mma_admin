"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Supported backend types: 'select', 'radio', 'text', 'color'
const typeOptions = [
  { value: "select", label: "Select (Dropdown)" },
  { value: "radio", label: "Radio Button" },
  { value: "text", label: "Text Input" },
  { value: "color", label: "Color Swatch" },
  { value: "checkbox", label: "Checkbox" },
];

export default function AddAttributeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("select");
  const [values, setValues] = useState<string[]>([""]);

  // Value Field Handlers
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

  // Submission
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Attribute name is required.");
      return;
    }

    if (!type) {
      toast.error("Please select an attribute type.");
      return;
    }

    // Filter out empty values
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
      await apiClient.post("attributes", payload);
      toast.success("Attribute created successfully!");
      router.push("/categories/attributes");
    } catch (error: any) {
      console.error("Failed to create attribute:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create attribute. Please try again."
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
          title="Create New Attribute"
          backHref="/categories/attributes"
        />
      </div>

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
              Saving...
            </>
          ) : (
            "Save Attribute"
          )}
        </Button>
      </div>
    </div>
  );
}