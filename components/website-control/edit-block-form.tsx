"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import StatusSelect, { Option } from "@/components/ui/status-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import {
  Loader2,
  Image as ImageIcon,
  Type as TypeIcon,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  HelpCircle,
  Layers,
} from "lucide-react";

const statusOptions: Option[] = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const componentOptions = [
  { value: "slider", label: "Slider" },
  { value: "banner", label: "Banner" },
  { value: "faq", label: "FAQ" },
  { value: "terms", label: "Terms" },
  { value: "policy", label: "Policy" },
  { value: "hero", label: "Hero" },
  { value: "testimonial", label: "Testimonial" },
  { value: "feature", label: "Feature" },
  { value: "about_us", label: "About Us" },
];

const typeOptions = [
  { value: "image", label: "Image" },
  { value: "text", label: "Text" },
  { value: "question", label: "Question" },
  { value: "multi", label: "Image and Text" },
];

interface FaqItem {
  question: string;
  answer: string;
}

interface MultiItem {
  image: string;
  imageFile?: File | null;
  imagePreview?: string;
  head: string;
  subtext: string;
}

/**
 * This previously never fetched anything, never saved anything, and had no
 * id at all (the "Save" button did nothing). Rebuilt to mirror
 * add-block-form.tsx's exact field/value structure per component+type
 * combination, with a fetch-and-prefill step and a real update call added.
 */
export default function EditBlockForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [component, setComponent] = useState<string>("slider");
  const [type, setType] = useState<string>("image");
  const [slug, setSlug] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const [faqList, setFaqList] = useState<FaqItem[]>([{ question: "", answer: "" }]);
  const [multiList, setMultiList] = useState<MultiItem[]>([
    { image: "", imageFile: null, imagePreview: "", head: "", subtext: "" },
  ]);

  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const loadContent = useCallback(async () => {
    if (!contentId) {
      toast.error("No block selected to edit.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.get(`/frontend-contents/${contentId}`);
      const data = res.data?.data || res.data;

      setComponent(data.component || "slider");
      setType(data.type || "image");
      setSlug(data.slug || "");
      setStatus(data.status ? statusOptions[0] : statusOptions[1]);

      const rawValue: string = data.value ?? "";

      if (data.type === "question") {
        try {
          const parsed = JSON.parse(rawValue);
          setFaqList(Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ question: "", answer: "" }]);
        } catch {
          setFaqList([{ question: "", answer: "" }]);
        }
      } else if (data.type === "multi") {
        try {
          const parsed = JSON.parse(rawValue);
          setMultiList(
            Array.isArray(parsed) && parsed.length > 0
              ? parsed.map((item: any) => ({ ...item, imageFile: null, imagePreview: item.image || "" }))
              : [{ image: "", imageFile: null, imagePreview: "", head: "", subtext: "" }],
          );
        } catch {
          setMultiList([{ image: "", imageFile: null, imagePreview: "", head: "", subtext: "" }]);
        }
      } else if (data.type === "image") {
        setValue(rawValue);
        setImagePreview(rawValue);
        setImageInputMode("url");
      } else {
        setValue(rawValue);
      }
    } catch (err: any) {
      console.error("Failed to load block:", err);
      toast.error(err?.response?.data?.message || "Failed to load block details.");
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue(previewUrl);
    }
  };

  const handleAddFaqField = () => setFaqList([...faqList, { question: "", answer: "" }]);
  const handleRemoveFaqField = (index: number) => setFaqList(faqList.filter((_, i) => i !== index));
  const handleFaqChange = (index: number, field: "question" | "answer", val: string) => {
    const updated = [...faqList];
    updated[index][field] = val;
    setFaqList(updated);
  };

  const handleAddMultiField = () =>
    setMultiList([...multiList, { image: "", imageFile: null, imagePreview: "", head: "", subtext: "" }]);
  const handleRemoveMultiField = (index: number) => setMultiList(multiList.filter((_, i) => i !== index));
  const handleMultiChange = (index: number, field: keyof MultiItem, val: any) => {
    const updated = [...multiList];
    updated[index] = { ...updated[index], [field]: val };
    setMultiList(updated);
  };
  const handleMultiFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const updated = [...multiList];
      updated[index] = { ...updated[index], imageFile: file, imagePreview: previewUrl, image: previewUrl };
      setMultiList(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) return;

    if (!component) return toast.error("Please select a component.");
    if (!type) return toast.error("Please select a content type.");
    if (!slug.trim()) return toast.error("Please enter a slug.");

    let finalValue = value.trim();
    let isMultipart = false;
    const formData = new FormData();

    if (type === "question") {
      const isValidFaq = faqList.some((item) => item.question.trim() && item.answer.trim());
      if (!isValidFaq) return toast.error("Please add at least one complete Question and Answer pair.");
      finalValue = JSON.stringify(faqList.filter((item) => item.question.trim() && item.answer.trim()));
    } else if (type === "multi") {
      const isValidMulti = multiList.some((item) => item.head.trim() || item.subtext.trim() || item.image);
      if (!isValidMulti) return toast.error("Please add at least one complete item containing content.");
      const hasFiles = multiList.some((item) => item.imageFile);
      if (hasFiles) isMultipart = true;
      finalValue = JSON.stringify(multiList);
    } else if (type === "image") {
      if (!finalValue && !imageFile) return toast.error("Please provide an image or value.");
      isMultipart = Boolean(imageFile && imageInputMode === "upload");
    } else {
      if (!finalValue) return toast.error("Please provide content text value.");
    }

    const statusValue = status?.value === "1" || status?.value === 1;

    formData.append("component", component);
    formData.append("type", type);
    formData.append("slug", slug.trim());
    formData.append("status", statusValue ? "1" : "0");
    formData.append("_method", "PUT");

    if (isMultipart) {
      if (type === "image" && imageFile) {
        formData.append("value", imageFile);
      } else if (type === "multi") {
        formData.append("value", JSON.stringify(multiList.map(({ imageFile, imagePreview, ...rest }) => rest)));
        multiList.forEach((item, idx) => {
          if (item.imageFile) formData.append(`multi_images[${idx}]`, item.imageFile);
        });
      } else {
        formData.append("value", finalValue);
      }
    } else {
      formData.append("value", finalValue);
    }

    try {
      setSubmitting(true);

      const response = isMultipart
        ? await apiClient.post(`/frontend-contents/${contentId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await apiClient.put(`/frontend-contents/${contentId}`, {
            component,
            type,
            slug: slug.trim(),
            value: finalValue,
            status: statusValue,
          });

      toast.success(response.data?.message || "Block updated successfully!");
      router.push("/website-control");
    } catch (err: any) {
      console.error("Error updating block:", err);
      toast.error(err?.response?.data?.message || "Failed to update block.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl mx-auto p-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center justify-between">
        <PageHeader title="Edit Block" backHref="/website-control" className="gap-4" />
        <div className="w-40">
          <StatusSelect options={statusOptions} value={status} onChange={setStatus} />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 sm:mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-center">
            <CustomFloatingSelect label="Component" options={componentOptions} value={component} onChange={setComponent} />
            <CustomFloatingSelect
              label="Type"
              options={typeOptions}
              value={type}
              onChange={(val) => {
                setType(val);
                setValue("");
                setImageFile(null);
                setImagePreview("");
              }}
            />
            <FloatingInput
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. home-banner"
              required
            />
          </div>

          <div className="pt-2">
            {type === "image" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("upload")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      imageInputMode === "upload" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      imageInputMode === "url" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Enter Image URL
                  </button>
                </div>

                {imageInputMode === "upload" ? (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-600 font-medium">
                        <span className="font-semibold text-teal-700">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : (
                  <FloatingInput
                    label="Image URL or Storage Link"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://storage.example.com/banners/image.png"
                    required
                  />
                )}

                {imagePreview && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Preview
                    </span>
                  </div>
                )}
              </div>
            ) : type === "question" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" /> FAQ Questions & Answers
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddFaqField}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs h-8 border-teal-600 text-teal-700 hover:bg-teal-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {faqList.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Item #{index + 1}</span>
                        {faqList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFaqField(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                        placeholder="Enter question here..."
                        className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                        required
                      />
                      <textarea
                        value={item.answer}
                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                        placeholder="Enter answer here..."
                        rows={3}
                        className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : type === "multi" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600" /> Multi Items (Image, Head Text & WYSIWYG Subtext)
                  </label>
                  <Button
                    type="button"
                    onClick={handleAddMultiField}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs h-8 border-teal-600 text-teal-700 hover:bg-teal-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {multiList.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 relative space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Multi Item #{index + 1}</span>
                        {multiList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMultiField(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">Item Image</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMultiFileChange(index, e)}
                            className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          />
                          <input
                            type="text"
                            value={item.image?.startsWith("blob:") ? "" : item.image}
                            onChange={(e) => handleMultiChange(index, "image", e.target.value)}
                            placeholder="Or paste image URL..."
                            className="flex-1 p-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-teal-600"
                          />
                        </div>
                        {item.imagePreview || item.image ? (
                          <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imagePreview || item.image}
                              alt="Preview"
                              className="object-cover h-full w-full"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Head Text</label>
                        <input
                          type="text"
                          value={item.head}
                          onChange={(e) => handleMultiChange(index, "head", e.target.value)}
                          placeholder="Enter main heading..."
                          className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-600">Subtext (WYSIWYG / Rich Content)</label>
                          <span className="text-[10px] text-gray-400">Supports HTML formatting</span>
                        </div>
                        <textarea
                          value={item.subtext}
                          onChange={(e) => handleMultiChange(index, "subtext", e.target.value)}
                          placeholder="Enter detailed subtext or rich HTML content..."
                          rows={4}
                          className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <TypeIcon className="w-3.5 h-3.5" /> Content Text Value
                </label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter block text content here..."
                  rows={4}
                  className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-8"
            onClick={() => router.push("/website-control")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8 bg-teal-700 hover:bg-teal-800 text-white min-w-[120px]"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
