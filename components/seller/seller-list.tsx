"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash, Eye } from "@/icons";
import { Ban, CheckCircle } from "lucide-react";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";

export interface Storefront {
  id: number;
  seller_id: number;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  currency: string;
  status: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: string;
  pending_balance: string;
  withdraw_lock: boolean;
}

export interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  type: string;
  status: "active" | "disabled" | string;
  created_at: string;
  products_count?: number;
  seller_orders_count?: number;
  storefront?: Storefront | null;
  wallet?: Wallet | null;
}

const statusOptions: Option[] = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Blocked", value: "blocked" },
  { label: "Disabled", value: "disabled" },
];

const dateOptions: Option[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <TableRow
          key={idx}
          className="border-b last:border-0 border-gray-500/20 animate-pulse"
        >
          <TableCell className="pl-6 whitespace-nowrap">
            <div className="size-4 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-8 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </TableCell>
          <TableCell className="pr-6">
            <div className="flex gap-2">
              <div className="size-6 bg-gray-200 rounded" />
              <div className="size-6 bg-gray-200 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function StoreAvatar({
  logo,
  name,
  id,
}: {
  logo?: string | null;
  name: string;
  id: number;
}) {
  const fallbackSrc = `/images/seller/seller-1.png`;

  const initialSrc = logo
    ? logo.startsWith("http")
      ? logo
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${logo}`
    : fallbackSrc;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  return (
    <div className="size-8 relative rounded bg-gray-100 shrink-0 overflow-hidden">
      <Image
        src={imgSrc}
        alt={name || "Store Logo"}
        fill
        className="object-cover"
        unoptimized={imgSrc.startsWith("http")}
        onError={() => {
          if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
        }}
      />
    </div>
  );
}

export default function SellerList() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<Option | null>(null);
  const [dateSort, setDateSort] = useState<Option | null>(null);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Modals state
  const [sellerToToggleStatus, setSellerToToggleStatus] =
    useState<Seller | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/sellers", {
        params: {
          page: currentPage,
          status: status?.value || undefined,
          search: search || undefined,
        },
      });

      if (response.data?.status) {
        const paginatedData = response.data.data;
        setSellers(paginatedData.data);
        setTotalPages(paginatedData.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, status, search]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(sellers.map((s) => s.id));
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
    sellers.length > 0 && selectedRows.length === sellers.length;

  const handleToggleStatusConfirm = async () => {
    if (!sellerToToggleStatus) return;
    setIsActionLoading(true);

    const nextStatus =
      sellerToToggleStatus.status.toLowerCase() === "active"
        ? "disabled"
        : "active";

    try {
      const response = await apiClient.patch(
        `/sellers/${sellerToToggleStatus.id}/status`,
        {
          status: nextStatus,
        },
      );

      if (response.data?.status || response.status === 200) {
        setSellers((prev) =>
          prev.map((s) =>
            s.id === sellerToToggleStatus.id ? { ...s, status: nextStatus } : s,
          ),
        );
        setSellerToToggleStatus(null);
      }
    } catch (error) {
      console.error("Failed to update seller status:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-xl font-bold text-light-primary-text">
            All Seller
          </h3>

          <div className="flex items-center gap-3">
            <ExportButton<Seller>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Email", accessor: "email" },
                { header: "Phone", accessor: (row) => row.phone || "" },
                { header: "Store", accessor: (row) => row.storefront?.name || "" },
                { header: "Products", accessor: (row) => row.products_count ?? 0 },
                { header: "Status", accessor: "status" },
                { header: "Joined", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={sellers}
              filename="sellers"
              title="Sellers"
            />
          </div>
        </div>
        <div className="w-full flex-wrap flex justify-between gap-4 items-center">
          <SearchInput
            onSearch={(val: string) => {
              setSearch(val);
              setCurrentPage(1);
            }}
          />
          <div className="flex items-center gap-3">
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
            <div className="min-w-[140px]">
              <CustomSelect
                options={dateOptions}
                value={dateSort}
                onChange={setDateSort}
                placeholder="Date"
              />
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6 whitespace-nowrap">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="whitespace-nowrap">ID</TableHead>
            <TableHead className="whitespace-nowrap">Seller</TableHead>
            <TableHead className="whitespace-nowrap">Email</TableHead>
            <TableHead className="whitespace-nowrap">Phone Number</TableHead>
            <TableHead className="whitespace-nowrap">Store Name</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Total Item</TableHead>
            <TableHead className="whitespace-nowrap">Total Sales</TableHead>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="pr-6 whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : sellers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center py-8 text-gray-500"
              >
                No sellers found.
              </TableCell>
            </TableRow>
          ) : (
            sellers.map((item) => {
              const isActive = item.status.toLowerCase() === "active";
              const storeName = item.storefront?.name || "N/A";
              const totalItems = `${item.products_count ?? 0} pcs`;
              const totalSales = item.seller_orders_count;

              return (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                    #{item.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-light-primary-text whitespace-nowrap">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {item.phone || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StoreAvatar
                        logo={item.storefront?.logo}
                        name={storeName}
                        id={item.id}
                      />
                      <span>{storeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive ? "success" : "error"}>
                      {isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {totalItems}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {totalSales}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </TableCell>

                  <TableCell className="pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="icon"
                        className="hover:text-primary transition-colors"
                        href={`/sellers/details?id=${item.id}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Can permission="sellers.manage">
                        <Button
                          variant="icon"
                          className="hover:text-primary transition-colors"
                          href={`/sellers/edit?id=${item.id}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>
                      <Can permission="sellers.manage">
                        <Button
                          variant="icon"
                          className={`transition-colors ${isActive ? "hover:text-amber-500" : "hover:text-emerald-500"}`}
                          onClick={() => setSellerToToggleStatus(item)}
                          title={isActive ? "Disable Seller" : "Activate Seller"}
                        >
                          {isActive ? (
                            <Ban className="size-4" />
                          ) : (
                            <CheckCircle className="size-4" />
                          )}
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

      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Status Toggle Modal */}
      <DeleteModal
        isOpen={!!sellerToToggleStatus}
        onClose={() => setSellerToToggleStatus(null)}
        onConfirm={handleToggleStatusConfirm}
      />
    </div>
  );
}
