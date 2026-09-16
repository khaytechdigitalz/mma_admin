"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Pencil, Type as TypeIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import CustomSelect, { Option } from "../ui/custom-select";
import DeleteModal from "@/components/ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { toast } from "sonner";

interface FrontendContent {
  id: number;
  component: string;
  type: string;
  slug: string;
  value: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "0" },
];

const componentOptions: Option[] = [
  { label: "Slider", value: "slider" },
  { label: "Banner", value: "banner" },
  { label: "FAQ", value: "faq" },
  { label: "Terms", value: "terms" },
  { label: "Policy", value: "policy" },
  { label: "Hero", value: "hero" },
  { label: "Testimonial", value: "testimonial" },
  { label: "Feature", value: "feature" },
  { label: "About Us", value: "about_us" },
];

export default function HomePageBlockTable() {
  const [data, setData] = useState<FrontendContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters & State
  const [statusFilter, setStatusFilter] = useState<Option | null>(null);
  const [activeTab, setActiveTab] = useState<string>("slider"); // Default tab

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Fetch Frontend Contents
  const fetchContents = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };

      if (activeTab) {
        params.component = activeTab;
      }
      if (statusFilter?.value !== undefined && statusFilter?.value !== null) {
        params.status = statusFilter.value;
      }

      const response = await apiClient.get("/frontend-contents", { params });
      const paginatedData = response.data?.data;

      if (paginatedData) {
        setData(paginatedData.data || []);
        setCurrentPage(paginatedData.current_page || 1);
        setTotalPages(paginatedData.last_page || 1);
      }
    } catch (err: any) {
      console.error("Failed to fetch frontend contents:", err);
      toast.error(err?.response?.data?.message || "Failed to load home page contents.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, statusFilter]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // Toggle Status via PATCH endpoint
  const handleToggleStatus = async (id: number) => {
    try {
      setTogglingId(id);
      const response = await apiClient.patch(`/frontend-contents/${id}/toggle-status`);
      toast.success(response.data?.message || "Status updated successfully!");
      
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: !item.status } : item))
      );
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      toast.error(err?.response?.data?.message || "Failed to update status.");
      fetchContents();
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (contentToDelete === null) return;
    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/frontend-contents/${contentToDelete}`);
      toast.success(response.data?.message || "Block deleted successfully!");
      setIsDeleteModalOpen(false);
      setContentToDelete(null);
      fetchContents();
    } catch (err: any) {
      console.error("Failed to delete content:", err);
      toast.error(err?.response?.data?.message || "Failed to delete block.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isValidImageUrl = (url: string) => {
    return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
  };

  return (
    <div className="bg-white rounded-2xl w-full space-y-4">
      {/* Top Header & Add Block Button */}
      <div className="p-4 sm:p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Website Control
          </h3>

          <div className="flex items-center gap-3">
            <Can permission="frontend_contents.create">
              <Button href="/website-control/add">Add Block</Button>
            </Can>
            
          </div>
        </div>

        {/* Component Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
          {componentOptions.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(String(tab.value));
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex justify-between items-center pt-4 flex-wrap gap-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Viewing: <span className="text-teal-700 font-bold capitalize">{activeTab.replace(/_/g, " ")}</span> blocks
          </span>

          <div className="w-full sm:w-[150px]">
            <CustomSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              placeholder="Filter Status"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="pl-6 text-light-primary-text">
              Block Name / Value Preview
            </TableHead>
            <TableHead className="text-light-primary-text">Slug</TableHead>
            <TableHead className="text-light-primary-text">Type</TableHead>
            <TableHead className="text-light-primary-text">Status</TableHead>
            <TableHead className="pr-6 text-light-primary-text">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                  <span className="text-sm text-gray-500">Loading contents...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-sm text-gray-500">
                No blocks found for this component.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    {item.type === "image" && isValidImageUrl(item.value) ? (
                      <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                        <Image
                          src={item.value}
                          alt={item.slug || "Preview"}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : item.type === "image" ? (
                      <div className="size-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                        <TypeIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {item.component?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-400 truncate max-w-[240px]">
                        {item.value}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text font-normal whitespace-nowrap">
                  {item.slug}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text font-normal whitespace-nowrap capitalize">
                  {item.type}
                </TableCell>
                <TableCell>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.status}
                      disabled={togglingId === item.id}
                      onChange={() => handleToggleStatus(item.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    <span className="ml-2 text-xs font-medium text-gray-600">
                      {item.status ? "Active" : "Inactive"}
                    </span>
                  </label>
                </TableCell>

                <TableCell className="pr-6">
                  <div className="flex items-center gap-1">
                    <Can permission="frontend_contents.edit">
                      <Button
                        variant="icon"
                        href={`/website-control/edit?id=${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="frontend_contents.delete">
                      <Button
                        variant="icon"
                        className="hover:text-red-500 transition-colors pl-0"
                        onClick={() => {
                          setContentToDelete(item.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="p-6 border-t border-gray-500/25 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setContentToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}