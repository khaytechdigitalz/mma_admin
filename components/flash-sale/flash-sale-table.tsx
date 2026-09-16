"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash } from "@/icons";
import { Tag, Zap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";

interface Product {
  id: number;
  name: string;
}

interface FlashSaleItem {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  discount_type: "percentage" | "flat";
  discount: string;
  product_ids: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products?: Product[];
}

interface Metrics {
  total: number;
  active: number;
  inactive: number;
}

const statusOptions: Option[] = [
  { label: "All Status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function FlashSaleTable() {
  const [loading, setLoading] = useState(true);
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, active: 0, inactive: 0 });

  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<Option | null>(null);

  // Modal & Row Selection State
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);

  // Fetch Flash Sales Records
  const fetchFlashSales = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/flash-sales", {
        params: {
          page: currentPage,
          search: searchQuery.trim(),
          status: status?.value || undefined,
        },
      });

      if (response.data?.status || response.status === 200) {
        const responseData = response.data;
        
        if (responseData.metrics) {
          setMetrics(responseData.metrics);
        }

        const paginated = responseData.data;
        if (paginated) {
          setFlashSales(paginated.data || []);
          setLastPage(paginated.last_page || 1);
        }
      }
    } catch (err: any) {
      console.error("Error fetching flash sales:", err);
      toast.error(err?.response?.data?.message || "Failed to load flash sales records.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, status]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFlashSales();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchFlashSales]);

  // Row Selection Handlers
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(flashSales.map((item) => item.id));
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
    flashSales.length > 0 && selectedRows.length === flashSales.length;

  // Toggle Status Action (PATCH /flash-sales/[id]/toggle-status)
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      setTogglingStatusId(id);
      
      // Optimistic state update
      setFlashSales((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: !currentStatus } : item
        )
      );

      const response = await apiClient.patch(`/flash-sales/${id}/toggle-status`);
      toast.success(response.data?.message || "Flash sale status updated successfully!");
      fetchFlashSales();
    } catch (err: any) {
      console.error("Error toggling status:", err);
      // Revert state on failure
      setFlashSales((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_active: currentStatus } : item
        )
      );
      toast.error(err?.response?.data?.message || "Failed to toggle status.");
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Single & Batch Delete Action (DELETE /flash-sales/[id])
  const openSingleDeleteModal = (id: number) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete) {
        await apiClient.delete(`/flash-sales/${itemToDelete}`);
        toast.success("Flash sale deleted successfully.");
      } else if (selectedRows.length > 0) {
        await Promise.all(
          selectedRows.map((id) => apiClient.delete(`/flash-sales/${id}`))
        );
        toast.success(`${selectedRows.length} flash sales deleted successfully.`);
        setSelectedRows([]);
      }

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchFlashSales();
    } catch (err: any) {
      console.error("Error deleting flash sale:", err);
      toast.error(err?.response?.data?.message || "Failed to delete record(s).");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-light-primary-text leading-7">
              Flash Sales
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage time-sensitive marketing campaigns and product discounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedRows.length > 0 && (
              <Can permission="flash_sales.delete">
                <Button
                  variant="outline"
                  className="rounded-full border-red-200 text-red-600 hover:bg-red-50 px-4 text-xs font-semibold"
                  onClick={() => {
                    setItemToDelete(null);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  Delete Selected ({selectedRows.length})
                </Button>
              </Can>
            )}
            <Can permission="flash_sales.create">
              <Button
                href="/flash-sales/add"
                className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6"
              >
                Create Flash
              </Button>
            </Can>
            <ExportButton<FlashSaleItem>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Title", accessor: "title" },
                { header: "Discount", accessor: (row) => (row.discount_type === "flat" ? `$${row.discount}` : `${row.discount}%`) },
                { header: "Start Date", accessor: (row) => new Date(row.start_date).toLocaleDateString() },
                { header: "End Date", accessor: (row) => new Date(row.end_date).toLocaleDateString() },
                { header: "Status", accessor: (row) => (row.is_active ? "Active" : "Inactive") },
              ]}
              data={flashSales}
              filename="flash-sales"
              title="Flash Sales"
            />
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="size-10 rounded-lg bg-teal-100/60 flex items-center justify-center text-teal-700 shrink-0">
              <Zap className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Campaigns</p>
              <h4 className="text-lg font-bold text-gray-900">{metrics.total}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="size-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700">Active Flash Sales</p>
              <h4 className="text-lg font-bold text-emerald-900">{metrics.active}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="size-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700">Inactive Flash Sales</p>
              <h4 className="text-lg font-bold text-amber-900">{metrics.inactive}</h4>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="w-full md:w-auto flex justify-between gap-4 items-center flex-wrap">
          <SearchInput
            placeholder="Search flash sales..."
            onSearch={(val: string) => handleSearchChange(val)}
          />

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="min-w-[140px]">
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setCurrentPage(1);
                }}
                placeholder="Status"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
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
            <TableHead>Title</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  <span className="text-xs font-medium text-gray-500">
                    Loading flash sale campaigns...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : flashSales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center justify-center gap-1">
                  <Tag className="w-8 h-8 text-gray-300 mb-1" />
                  <p className="text-sm font-medium text-gray-700">No flash sales found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search query or filters.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            flashSales.map((item) => {
              const productCount = item.products?.length || item.product_ids?.length || 0;
              const isToggling = togglingStatusId === item.id;

              return (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap text-sm text-light-secondary-text">
                    #{item.id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.title}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                      <Tag className="w-3.5 h-3.5 text-teal-600" />
                      {productCount} {productCount === 1 ? "Product" : "Products"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-medium text-teal-700">
                    {item.discount_type === "percentage"
                      ? `${item.discount}% OFF`
                      : `₦${Number(item.discount).toLocaleString()} OFF`}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                    {formatDate(item.start_date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                    {formatDate(item.end_date)}
                  </TableCell>
                  
                  {/* Status Toggle Switch */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Can permission="flash_sales.edit">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.is_active}
                          disabled={isToggling}
                          onClick={() => handleToggleStatus(item.id, item.is_active)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            item.is_active ? "bg-teal-700" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                              item.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          >
                            {isToggling && (
                              <Loader2 className="w-3 h-3 animate-spin text-teal-700" />
                            )}
                          </span>
                        </button>
                      </Can>
                      <span className={`text-xs font-semibold ${item.is_active ? "text-teal-700" : "text-gray-500"}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap pr-6">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="icon"
                        className="hover:text-primary transition-colors"
                        href={`/flash-sales/${item.id}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Can permission="flash_sales.edit">
                        <Button
                          variant="icon"
                          className="hover:text-primary transition-colors"
                          href={`/flash-sales/edit/${item.id}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>
                      <Can permission="flash_sales.delete">
                        <Button
                          variant="icon"
                          className="hover:text-red-500 transition-colors"
                          onClick={() => openSingleDeleteModal(item.id)}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {!loading && flashSales.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Page {currentPage} of {lastPage}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}