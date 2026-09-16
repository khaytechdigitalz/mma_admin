"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import StatusSelect, { Option } from "@/components/ui/status-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Upload, Link as LinkIcon, Image as ImageIcon, FileText } from "lucide-react";

const statusOptions: Option[] = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export default function AddBlogForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  
  // Image Input Mode Toggle ("upload" or "url")
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Please enter a blog title.");
    if (!body.trim()) return toast.error("Please enter the blog body content.");

    const statusValue = status?.value === "1" || status?.value === 1 ? true : false;
    const hasMultipart = Boolean(imageFile && imageInputMode === "upload");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("body", body.trim());
    formData.append("status", statusValue ? "1" : "0");

    if (hasMultipart && imageFile) {
      formData.append("image", imageFile);
    } else if (imageInputMode === "url" && imageUrl.trim()) {
      formData.append("image", imageUrl.trim());
    }

    try {
      setSubmitting(true);
      
      const response = await apiClient.post(
        "/blogs",
        hasMultipart
          ? formData
          : {
              title: title.trim(),
              body: body.trim(),
              status: statusValue,
              image: imageInputMode === "url" ? imageUrl.trim() : undefined,
            },
        hasMultipart
          ? {
              headers: { "Content-Type": "multipart/form-data" },
            }
          : undefined
      );

      toast.success(response.data?.message || "Blog created successfully!");
      router.push("/blog-control");
    } catch (err: any) {
      console.error("Error creating blog:", err);
      toast.error(err?.response?.data?.message || "Failed to create blog.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center justify-between">
        <PageHeader
          title="Add New Blog"
          backHref="/blog-control"
          className="gap-4"
        />
        <div className="w-40">
          <StatusSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/25 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 sm:mb-6">
            Blog Information
          </h2>

          <div className="space-y-6">
            <FloatingInput
              label="Blog Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Understanding Financial Technology Trends"
              required
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Blog Body Content
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your blog content here..."
                rows={6}
                className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                required
              />
            </div>

            {/* Featured Image Section */}
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">
                Featured Image
              </label>

              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    imageInputMode === "upload"
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                    imageInputMode === "url"
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Image URL
                </button>
              </div>

              {imageInputMode === "upload" ? (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-600 font-medium">
                        <span className="font-semibold text-teal-700">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              ) : (
                <FloatingInput
                  label="Image URL Link"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.png"
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
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-8"
            onClick={() => router.push("/blog-control")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8 bg-teal-700 hover:bg-teal-800 text-white min-w-[120px]"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Blog"}
          </Button>
        </div>
      </div>
    </form>
  );
}