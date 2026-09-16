"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Plus, CheckCircle2, XCircle, Loader2, AlertCircle, Trash2, Edit3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import SearchInput from "../common/search-input";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";

// --- Types ---
interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface APIPaginatedResponse {
  current_page: number;
  data: Brand[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

const getLogoUrl = (logoPath: string | null) => {
  if (!logoPath) return "/images/brands/placeholder.png";
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
  return `${STORAGE_BASE_URL}/${logoPath.replace(/^\//, "")}`;
};

export default function BrandList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [brandsData, setBrandsData] = useState<APIPaginatedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal states
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch Brands via Axios apiClient
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get("brands", {
        params: {
          page: currentPage,
          ...(searchQuery && { search: searchQuery }),
        },
      });

      const data = res?.data?.data;
      if (data) {
        setBrandsData(data);
      } else {
        throw new Error("Invalid response structure received from API.");
      }
    } catch (err: any) {
      console.error("Failed to fetch brands:", err);
      setError(
        err?.response?.data?.message || "An error occurred while fetching brands."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Trigger Delete Confirmation Modal
  const confirmDelete = (e: React.MouseEvent, brand: Brand) => {
    e.preventDefault();
    e.stopPropagation();
    setBrandToDelete(brand);
    setDeleteError(null);
  };

  // Execute Brand Deletion
  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await apiClient.delete(`brands/${brandToDelete.id}`);
      setBrandToDelete(null);
      fetchBrands(); // Refresh list after successful delete
    } catch (err: any) {
      console.error("Failed to delete brand:", err);
      setDeleteError(
        err?.response?.data?.message || "Failed to delete the brand. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const brands = brandsData?.data || [];
  const totalBrands = brandsData?.total || 0;
  const totalPages = brandsData?.last_page || 1;

  return (
    <div className="space-y-6">
      {/* Top Header & Counter Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-light-secondary-text uppercase tracking-wider">
              Total Brands
            </p>
            <h4 className="text-2xl font-bold text-light-primary-text mt-0.5">
              {loading && !brandsData ? "..." : totalBrands}
            </h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl w-full p-4 sm:p-6 border border-gray-100 shadow-sm">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-light-primary-text leading-7">
              Brand List
            </h3>
            <p className="text-xs text-light-secondary-text mt-0.5">
              Manage and organize product manufacturers and brands
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Can permission="brands.create">
              <Button href="/categories/brands/add" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Brand
              </Button>
            </Can>
            <ExportButton<Brand>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Slug", accessor: "slug" },
                { header: "Status", accessor: "status" },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={brands}
              filename="brands"
              title="Brands"
            />
          </div>
        </div>

        {/* Search Input using Solution 2 */}
        <div className="relative mb-6">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search brands by name or slug..."
          />
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-light-secondary-text">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Fetching brands...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500 bg-red-50/50 rounded-xl border border-red-100">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchBrands}>
              Try Again
            </Button>
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                {/* Brand Logo Container */}
                <div className="relative h-24 w-full flex justify-center bg-[#F8FAFC] items-center p-3 rounded-t-xl group-hover:bg-gray-100/80 transition-colors">
                  <div className="relative w-full h-full">
                    <Image
                      src={getLogoUrl(brand.logo)}
                      alt={brand.name}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  </div>

                  {/* Top Action Overlay Badges */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    {brand.status === "active" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Brand Info */}
                <div className="py-3 px-4 bg-white border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-light-primary-text truncate">
                    {brand.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] font-mono text-light-secondary-text truncate max-w-[65%]">
                      /{brand.slug}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${
                        brand.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {brand.status}
                    </span>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                    <Can permission="brands.edit">
                      <Link
                        href={`/categories/brands/edit?id=${brand.id}`}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        title="Edit Brand"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </Can>
                    <Can permission="brands.delete">
                      <button
                        type="button"
                        onClick={(e) => confirmDelete(e, brand)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Can>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-xl">
            <p className="text-sm text-light-secondary-text">No brands found.</p>
          </div>
        )}

        {/* Dynamic Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-end pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Warning Confirmation Modal */}
      {brandToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Brand</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{brandToDelete.name}"</span>? 
              This will permanently remove the brand from your product catalog.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setBrandToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                onClick={handleDeleteBrand}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Brand
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}