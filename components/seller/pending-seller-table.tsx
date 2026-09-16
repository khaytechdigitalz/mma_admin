"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Loader2, Store } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchInput from "../common/search-input";
import { apiClient } from "@/lib/axios";
import type { Seller } from "./seller-list";
import { ExportButton } from "@/components/ui/export-button";

export default function PendingSellerTable() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchPendingSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Reuses the same /sellers endpoint the main seller list uses -
      // "pending" is already one of the accepted status filter values there.
      const response = await apiClient.get("/sellers", {
        params: { page: currentPage, status: "pending", search: search || undefined },
      });

      if (response.data?.status) {
        const paginatedData = response.data.data;
        setSellers(paginatedData.data);
        setTotalPages(paginatedData.last_page);
      }
    } catch (err: any) {
      console.error("Failed to fetch pending sellers:", err);
      setError(err?.response?.data?.message || "Failed to load pending sellers.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchPendingSellers();
  }, [fetchPendingSellers]);

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Pending Seller
          </h3>
          <ExportButton<Seller>
            columns={[
              { header: "ID", accessor: "id" },
              { header: "Name", accessor: "name" },
              { header: "Email", accessor: "email" },
              { header: "Phone", accessor: (row) => row.phone || "" },
              { header: "Store", accessor: (row) => row.storefront?.name || "" },
              { header: "Date", accessor: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : "") },
            ]}
            data={sellers}
            filename="pending-sellers"
            title="Pending Sellers"
          />
        </div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <SearchInput onSearch={(q) => { setSearch(q); setCurrentPage(1); }} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead>ID</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Store Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-teal-700 mx-auto" />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-red-500 text-sm">
                {error}
              </TableCell>
            </TableRow>
          ) : sellers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm text-gray-500">
                No pending seller applications.
              </TableCell>
            </TableRow>
          ) : (
            sellers.map((seller) => (
              <TableRow
                key={seller.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="font-normal whitespace-nowrap text-sm text-light-secondary-text">
                  #{seller.id}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                  {seller.name}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                  {seller.email}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                  {seller.phone || "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="size-8 relative rounded-lg shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {seller.storefront?.logo ? (
                        <Image
                          src={seller.storefront.logo}
                          alt={seller.storefront?.name || seller.name}
                          width={32}
                          height={32}
                          className="object-cover rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <Store className="size-4 text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm text-light-secondary-text">
                      {seller.storefront?.name || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="warning">Pending</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                  {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap">
                  <Button href={`/sellers/pending/${seller.id}`} size="xs">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && sellers.length > 0 && (
        <div className="p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
