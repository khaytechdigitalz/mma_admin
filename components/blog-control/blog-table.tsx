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
import { Trash, Pencil, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import CustomSelect, { Option } from "../ui/custom-select";
import DeleteModal from "@/components/ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";
import { toast } from "sonner";

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  body: string;
  image: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

const statusOptions: Option[] = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "0" },
];

export default function BlogTable() {
  const [data, setData] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Fetch Blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };

      if (statusFilter?.value !== undefined && statusFilter?.value !== null) {
        params.status = statusFilter.value;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiClient.get("/blogs", { params });
      const paginatedData = response.data?.data;

      if (paginatedData) {
        setData(paginatedData.data || []);
        setCurrentPage(paginatedData.current_page || 1);
        setTotalPages(paginatedData.last_page || 1);
      }
    } catch (err: any) {
      console.error("Failed to fetch blogs:", err);
      toast.error(err?.response?.data?.message || "Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Toggle Status (if your backend supports status updates, or toggle locally/via endpoint)
  const handleToggleStatus = async (blog: BlogItem) => {
    try {
      setTogglingId(blog.id);
      // Assuming you have an update endpoint or toggle endpoint
      const response = await apiClient.patch(`/blogs/${blog.id}/toggle-status`, {
        title: blog.title,
        body: blog.body,
        status: !blog.status,
      });
      toast.success(response.data?.message || "Blog status updated successfully!");
      
      setData((prev) =>
        prev.map((item) => (item.id === blog.id ? { ...item, status: !item.status } : item))
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error(err?.response?.data?.message || "Failed to update blog status.");
      fetchBlogs();
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (blogToDelete === null) return;
    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/blogs/${blogToDelete}`);
      toast.success(response.data?.message || "Blog deleted successfully!");
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch (err: any) {
      console.error("Failed to delete blog:", err);
      toast.error(err?.response?.data?.message || "Failed to delete blog.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isValidImageUrl = (url: string | null) => {
    return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
  };

  return (
    <div className="bg-white rounded-2xl w-full space-y-4">
      {/* Top Header & Add Blog Button */}
      <div className="p-4 sm:p-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Manage Blogs
          </h3>

          <div className="flex items-center gap-3">
            <Can permission="frontend_contents.create">
              <Button href="/blog-control/add">Add Blog</Button>
            </Can>
            <ExportButton<BlogItem>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Title", accessor: "title" },
                { header: "Slug", accessor: "slug" },
                { header: "Status", accessor: (row) => (row.status ? "Active" : "Inactive") },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={data}
              filename="blogs"
              title="Blog Posts"
            />
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex justify-between items-center pt-2 flex-wrap gap-4">
          <div className="w-full sm:w-[250px]">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            />
          </div>

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
              Blog Title / Excerpt
            </TableHead>
            <TableHead className="text-light-primary-text">Slug</TableHead>
            <TableHead className="text-light-primary-text">Status</TableHead>
            <TableHead className="pr-6 text-light-primary-text">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center">
                <div className="flex justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                  <span className="text-sm text-gray-500">Loading blogs...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-sm text-gray-500">
                No blogs found.
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
                    {isValidImageUrl(item.image) ? (
                      <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                        <Image
                          src={item.image!}
                          alt={item.title || "Blog Preview"}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="size-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-400 truncate max-w-[280px]">
                        {item.body}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text font-normal whitespace-nowrap">
                  {item.slug}
                </TableCell>
                <TableCell>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.status}
                      disabled={togglingId === item.id}
                      onChange={() => handleToggleStatus(item)}
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
                        href={`/blog-control/edit?id=${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="frontend_contents.delete">
                      <Button
                        variant="icon"
                        className="hover:text-red-500 transition-colors"
                        onClick={() => {
                          setBlogToDelete(item.id);
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
            setBlogToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}