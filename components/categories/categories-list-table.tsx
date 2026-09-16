"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { Loader2, Layers } from "lucide-react";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";
import type { ExportColumn } from "@/lib/export";

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL;

const getFullImageUrl = (path: string | null) => {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_BASE_URL}/${path.replace(/^\//, "")}`;
};

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  banner: string | null;
  priority: number;
  status: "active" | "inactive" | string;
  created_at: string;
  updated_at: string;
  products_count: number;
}

const statusOptions: Option[] = [
  { label: "All Status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const sortOptions: Option[] = [
  { label: "Newest", value: "desc" },
  { label: "Oldest", value: "asc" },
];

export default function CategoriesListTable() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);
  const [selectedSort, setSelectedSort] = useState<Option | null>(null);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedStatus?.value) params.status = selectedStatus.value;
      if (selectedSort?.value) params.sort_order = selectedSort.value;

      const res = await apiClient.get("categories", { params });
      const responseData = res?.data?.data;

      if (responseData) {
        setCategories(responseData.data || []);
        setTotalPages(responseData.last_page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedStatus, selectedSort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(categories.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllSelected =
    categories.length > 0 && selectedRows.length === categories.length;

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`categories/${deletingId}`);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-light-primary-text leading-7.5">
            Categories List
          </h3>
          <div className="flex items-center gap-2">
            <Can permission="categories.create">
              <Button
                href="/categories/add"
                className="rounded-full bg-primary-dark hover:bg-primary text-white"
              >
                Create Category
              </Button>
            </Can>
            <ExportButton<CategoryItem>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Products", accessor: "products_count" },
                { header: "Priority", accessor: "priority" },
                { header: "Status", accessor: "status" },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={categories}
              filename="categories"
              title="Categories"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          {/* Search Input */}
         <SearchInput
            onSearch={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
          />
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="min-w-[140px]">
              <CustomSelect
                options={statusOptions}
                value={selectedStatus}
                onChange={(option) => {
                  setSelectedStatus(option);
                  setCurrentPage(1);
                }}
                placeholder="Status"
              />
            </div>
            <div className="min-w-[140px]">
              <CustomSelect
                options={sortOptions}
                value={selectedSort}
                onChange={(option) => {
                  setSelectedSort(option);
                  setCurrentPage(1);
                }}
                placeholder="Sort By"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Icon / Image</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead>Products Count</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-start pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-sm font-medium text-gray-500">
                    Loading categories...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Layers className="size-8 text-gray-300" />
                  <span className="text-sm font-medium text-gray-500">
                    No categories found.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRows.includes(category.id)}
                    onCheckedChange={(checked) =>
                      toggleSelectRow(category.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                  #{category.id}
                </TableCell>
                <TableCell>
                  <div className="size-9 relative rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
                    <Image
                      src={getFullImageUrl(category.icon)}
                      alt={category.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  <div>
                    <span>{category.name}</span>
                    <span className="block text-xs text-gray-400 font-mono">
                      {category.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {category.products_count ?? 0}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {category.priority}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    variant={category.status === "active" ? "success" : "default"}
                    className="capitalize text-xs"
                  >
                    {category.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {formatDate(category.created_at)}
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap">
                  <div className="flex items-center justify-start gap-1">
                    <Can permission="categories.edit">
                      <Button
                        variant="icon"
                        href={`/categories/edit?id=${category.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="categories.delete">
                      <Button
                        variant="icon"
                        className="hover:text-error transition-colors"
                        onClick={() => handleDeleteClick(category.id)}
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

      {/* Pagination Footer */}
      {!isLoading && categories.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeletingId(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}