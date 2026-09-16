"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Pencil, Trash, Eye, UserIcon, Mail01Icon, PhoneIcon } from "@/icons";
import { Ban, CheckCircle } from "lucide-react";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { Seller } from "./seller-list";
import { ExportButton } from "@/components/ui/export-button";

const statusOptions: Option[] = [
  { label: "Active", value: "active" },
  { label: "Disabled", value: "disabled" },
];

const dateOptions: Option[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

function GridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="border border-gray-500/20 rounded-2xl p-1.5 animate-pulse bg-white"
        >
          <div className="h-25 bg-gray-200 rounded-t-xl mb-4" />
          <div className="flex justify-end px-2 gap-2">
            <div className="size-6 bg-gray-200 rounded" />
            <div className="size-6 bg-gray-200 rounded" />
            <div className="size-6 bg-gray-200 rounded" />
          </div>
          <div className="bg-gray-100 rounded-2xl p-4 mt-4 space-y-3">
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-3 w-1/3 bg-gray-200 rounded" />
            <div className="space-y-2 py-2 border-y border-gray-200">
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between pt-2">
              <div className="h-8 w-1/3 bg-gray-200 rounded" />
              <div className="h-8 w-1/3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function StoreAvatar({ logo, name, id }: { logo?: string | null; name: string; id: number }) {
  const fallbackSrc = `/images/seller/seller-1.png`;

  const initialSrc = logo
    ? logo.startsWith("http")
      ? logo
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${logo}`
    : fallbackSrc;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  return (
    <div className="size-20 rounded-full ring-3 ring-white overflow-hidden relative bg-gray-100 shrink-0">
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

export default function SellerGridView() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<Option | null>(null);
  const [dateSort, setDateSort] = useState<Option | null>(null);

  // Modals state
  const [sellerToToggleStatus, setSellerToToggleStatus] = useState<Seller | null>(null);
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

  const handleToggleStatusConfirm = async () => {
    if (!sellerToToggleStatus) return;
    setIsActionLoading(true);

    const nextStatus =
      sellerToToggleStatus.status.toLowerCase() === "active" ? "disabled" : "active";

    try {
      const response = await apiClient.patch(`/sellers/${sellerToToggleStatus.id}/status`, {
        status: nextStatus,
      });

      if (response.data?.status || response.status === 200) {
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerToToggleStatus.id ? { ...s, status: nextStatus } : s))
        );
        setSellerToToggleStatus(null);
      }
    } catch (error) {
      console.error("Failed to update seller status:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl w-full p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
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
              { header: "Status", accessor: "status" },
              { header: "Joined", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
            ]}
            data={sellers}
            filename="sellers"
            title="Sellers"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <SearchInput
          onSearch={(val: string) => {
            setSearch(val);
            setCurrentPage(1);
          }}
        />
        <div className="flex flex-wrap gap-3">
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

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          <GridSkeleton />
        </div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No sellers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          {sellers.map((item) => {
            const isActive = item.status.toLowerCase() === "active";
            const storeName = item.storefront?.name || "N/A";
            const totalItems = `${item.products_count ?? 0} pcs`;
            const totalSales = item.seller_orders_count;
            const bannerSrc = item.storefront?.banner
              ? item.storefront.banner.startsWith("http")
                ? item.storefront.banner
                : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${item.storefront.banner}`
              : `/images/seller/seller-grid/seller_banner_${String(((item.id % 10) + 1)).padStart(2, "0")}.png`;

            return (
              <div
                key={item.id}
                className="border border-gray-500/20 rounded-2xl overflow-hidden transition-shadow p-1.5 bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Banner & Avatar */}
                  <div className="relative mb-4">
                    <div className="h-25 relative w-full rounded-t-xl overflow-hidden">
                      <Image
                      src={bannerSrc}
                      alt={ "Store Banner"}
                      fill
                      className="object-cover"
                      unoptimized={bannerSrc.startsWith("http")}
                    />
                      <div className="absolute inset-0 bg-black/10 z-0" />
                      <div className="absolute bottom-4 right-4 z-10">
                        <Badge variant={isActive ? "success" : "error"}>
                          {isActive ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </div>

                    <div className="absolute top-14 left-4">
                      <StoreAvatar
                        logo={item.storefront?.logo}
                        name={storeName}
                        id={item.id}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end px-2 gap-1">
                    <Button
                      variant="icon"
                      className="hover:text-primary transition-colors"
                      href={`/sellers/details?id=${item.id}`}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="icon"
                      className="hover:text-primary transition-colors"
                      href={`/sellers/edit?id=${item.id}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
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
                  </div>

                  {/* Info Card */}
                  <div className="bg-accent-2 rounded-2xl px-4 py-3 mt-4">
                    <div className="border-gray-500/20 pt-1 border-b pb-4">
                      <h3 className="text-sm font-semibold text-light-primary-text leading-5.5 truncate">
                        {storeName}
                      </h3>
                      <p className="text-sm text-light-primary-text leading-5.5">
                        Seller ID: #{item.id}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5 py-4 border-b border-gray-500/20">
                      <div className="flex items-center gap-2">
                        <UserIcon className="size-4 shrink-0 text-light-primary-text" />
                        <span className="truncate text-sm text-light-secondary-text">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail01Icon className="size-4 shrink-0 text-light-primary-text" />
                        <span className="truncate text-sm text-light-secondary-text">
                          {item.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="size-4 shrink-0 text-light-primary-text" />
                        <span className="truncate text-sm text-light-secondary-text">
                          {item.phone || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-between items-center pt-4">
                      <div>
                        <p className="text-sm font-bold text-light-primary-text mb-1">
                          {totalItems}
                        </p>
                        <p className="text-xs text-light-secondary-text">
                          Total Product
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-light-primary-text mb-1">
                          {totalSales}
                        </p>
                        <p className="text-xs text-light-secondary-text">
                          Total Sales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="sm:pt-6 pt-4 flex justify-end border-t border-gray-500/20 mt-6">
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