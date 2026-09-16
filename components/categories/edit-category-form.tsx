"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import StatusSelect, { Option } from "@/components/ui/status-select";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Package,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  FolderTree,
} from "lucide-react";

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

const priorityOptions = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

interface CategoryDetails {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  banner: string | null;
  priority: number;
  status: string;
}

interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  priority: number;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditCategoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category Form States
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("1");

  // Existing Image URLs
  const [existingIcon, setExistingIcon] = useState<string | null>(null);
  const [existingBanner, setExistingBanner] = useState<string | null>(null);

  // File Upload Previews
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Subcategory Table States
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(false);

  // Drawer / Modal States for Subcategories
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryPriority, setSubCategoryPriority] = useState("1");
  const [subCategoryStatus, setSubCategoryStatus] = useState("active");
  const [isDrawerSubmitting, setIsDrawerSubmitting] = useState(false);
  const [isFetchingSubcategoryDetails, setIsFetchingSubcategoryDetails] = useState(false);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSubcategory, setDeletingSubcategory] = useState<SubCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Category Details
  useEffect(() => {
    if (!categoryId) {
      setIsLoading(false);
      return;
    }

    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`categories/${categoryId}`);
        const data: CategoryDetails = res?.data?.data;

        if (data) {
          setName(data.name || "");
          setPriority(String(data.priority ?? 1));
          const isCategoryActive = data.status === "active";
          setStatus(isCategoryActive ? statusOptions[0] : statusOptions[1]);
          setExistingIcon(getFullImageUrl(data.icon));
          setExistingBanner(getFullImageUrl(data.banner));
        }
      } catch (error) {
        console.error("Failed to fetch category details:", error);
        toast.error("Failed to load category details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // Fetch Subcategories
  const fetchSubcategories = useCallback(async () => {
    if (!categoryId) return;

    setIsSubcategoriesLoading(true);
    try {
      const res = await apiClient.get(`subcategories?category_id=${categoryId}`);
      setSubcategories(res?.data?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      toast.error("Failed to load subcategories.");
    } finally {
      setIsSubcategoriesLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId, fetchSubcategories]);

  // File Handlers
  const handleIconSelect = (file: File | null) => {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(file);
    setIconPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBannerSelect = (file: File | null) => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  // Submit Category Changes
  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error("Invalid category ID.");
      return;
    }

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("_method", "POST");
    formData.append("name", name.trim());

    if (priority) formData.append("priority", priority);
    if (status?.value !== undefined) formData.append("status", String(status.value));
    if (iconFile) formData.append("icon", iconFile);
    if (bannerFile) formData.append("banner", bannerFile);

    try {
      await apiClient.post(`categories/${categoryId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Category updated successfully!");
      router.push("/categories");
    } catch (error: any) {
      console.error("Failed to update category:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update category. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subcategory Drawer Handlers
  const handleOpenCreateDrawer = () => {
    setEditingSubcategoryId(null);
    setSubCategoryName("");
    setSubCategoryPriority("1");
    setSubCategoryStatus("active");
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = async (sub: SubCategory) => {
    setEditingSubcategoryId(sub.id);
    setIsDrawerOpen(true);
    setIsFetchingSubcategoryDetails(true);

    try {
      const res = await apiClient.get(`subcategories/${sub.id}`);
      const details = res?.data?.data || sub;
      setSubCategoryName(details.name || "");
      setSubCategoryPriority(String(details.priority ?? 1));
      setSubCategoryStatus(details.status || "active");
    } catch (error) {
      console.error("Failed to fetch subcategory details:", error);
      toast.error("Failed to load subcategory details.");
      // Fallback to local table state
      setSubCategoryName(sub.name);
      setSubCategoryPriority(String(sub.priority ?? 1));
      setSubCategoryStatus(sub.status || "active");
    } finally {
      setIsFetchingSubcategoryDetails(false);
    }
  };

  const handleSaveSubcategory = async () => {
    if (!subCategoryName.trim()) {
      toast.error("Subcategory name is required.");
      return;
    }

    setIsDrawerSubmitting(true);
    try {
      if (editingSubcategoryId) {
        // Edit Subcategory
        await apiClient.put(`subcategories/${editingSubcategoryId}`, {
          category_id: Number(categoryId),
          name: subCategoryName.trim(),
          priority: Number(subCategoryPriority),
          status: subCategoryStatus,
        });
        toast.success("Subcategory updated successfully!");
      } else {
        // Create Subcategory
        await apiClient.post("subcategories", {
          category_id: Number(categoryId),
          name: subCategoryName.trim(),
          priority: Number(subCategoryPriority),
          status: subCategoryStatus,
        });
        toast.success("Subcategory created successfully!");
      }

      setIsDrawerOpen(false);
      fetchSubcategories();
    } catch (error: any) {
      console.error("Failed to save subcategory:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save subcategory. Please try again."
      );
    } finally {
      setIsDrawerSubmitting(false);
    }
  };

  // Delete Subcategory Handlers
  const handleOpenDeleteModal = (sub: SubCategory) => {
    setDeletingSubcategory(sub);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubcategory = async () => {
    if (!deletingSubcategory) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`subcategories/${deletingSubcategory.id}`);
      toast.success("Subcategory deleted successfully!");
      setIsDeleteModalOpen(false);
      setDeletingSubcategory(null);
      fetchSubcategories();
    } catch (error: any) {
      console.error("Failed to delete subcategory:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete subcategory."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-gray-500">Loading category details...</p>
      </div>
    );
  }

  if (!categoryId) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <Package className="size-12 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-800">Missing Category ID</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          No valid category ID was provided in the URL parameters.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/categories")}>
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex gap-4 flex-col sm:flex-row sm:items-center justify-between">
        <PageHeader title="Edit Category" backHref="/categories" className="gap-4" />
        <div className="w-32">
          <StatusSelect options={statusOptions} value={status} onChange={setStatus} />
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
        <h2 className="text-lg font-bold text-light-primary-text">Basic Information</h2>

        {/* Uploaders Grid */}
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
            {(iconPreview || existingIcon) && (
              <div className="space-y-1">
                <span className="text-xs text-gray-400 block font-medium">
                  {iconPreview ? "New Icon Preview:" : "Current Icon:"}
                </span>
                <div className="relative size-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                  <Image
                    src={iconPreview || existingIcon!}
                    alt="Icon"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {iconPreview && (
                    <button
                      type="button"
                      onClick={() => handleIconSelect(null)}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
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
            {(bannerPreview || existingBanner) && (
              <div className="space-y-1">
                <span className="text-xs text-gray-400 block font-medium">
                  {bannerPreview ? "New Banner Preview:" : "Current Banner:"}
                </span>
                <div className="relative h-16 w-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                  <Image
                    src={bannerPreview || existingBanner!}
                    alt="Banner"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => handleBannerSelect(null)}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Inputs */}
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

      {/* Subcategories Table Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-light-primary-text flex items-center gap-2">
              <FolderTree className="size-5 text-primary" />
              Subcategories
            </h2>
            <p className="text-xs text-gray-500">
              Manage subcategories associated with this category.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateDrawer}
            className="flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Add Subcategory
          </Button>
        </div>

        {/* Subcategory Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isSubcategoriesLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <Loader2 className="size-6 animate-spin mx-auto text-primary mb-2" />
                    Fetching subcategories...
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No subcategories found for this category.
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => {
                  const isActive = sub.status === "active" || sub.status === "1";
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        #{sub.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{sub.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {sub.slug}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          Priority {sub.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditDrawer(sub)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                            title="Edit Subcategory"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(sub)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
              Updating...
            </>
          ) : (
            "Update Category"
          )}
        </Button>
      </div>

      {/* Slide-over Side Drawer for Create/Edit Subcategory */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingSubcategoryId ? "Edit Subcategory" : "Add Subcategory"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              {isFetchingSubcategoryDetails ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-xs text-gray-500">Loading subcategory details...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <FloatingInput
                    label="Subcategory Name *"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                  />

                  <CustomFloatingSelect
                    label="Priority"
                    options={priorityOptions}
                    value={subCategoryPriority}
                    onChange={setSubCategoryPriority}
                  />

                  <CustomFloatingSelect
                    label="Status"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    value={subCategoryStatus}
                    onChange={setSubCategoryStatus}
                  />
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t pt-4 flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
                disabled={isDrawerSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveSubcategory}
                disabled={isDrawerSubmitting || isFetchingSubcategoryDetails}
              >
                {isDrawerSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editingSubcategoryId ? (
                  "Update Subcategory"
                ) : (
                  "Create Subcategory"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Subcategory</h3>
            </div>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                "{deletingSubcategory?.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="info"
                size="sm"
                onClick={handleDeleteSubcategory}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}