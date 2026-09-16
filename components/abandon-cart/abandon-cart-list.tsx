"use client";

import { useCallback, useEffect, useState } from "react";
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
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "../common/search-input";
import { apiClient } from "@/lib/axios";
import { ExportButton } from "@/components/ui/export-button";

import {
  SendNotificationModal,
  SendBulkNotificationModal,
  DeleteCartModal,
  CartDetailsModal,
} from "@/components/abandon-cart/abandoned-cart-modals";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Abandoned", value: "abandoned" },
  { label: "Recovered", value: "recovered" },
];

const hoursOptions = [
  { label: "24 Hours", value: "24" },
  { label: "48 Hours", value: "48" },
  { label: "72 Hours", value: "72" },
];

export default function AbandonOrderTable() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Option | null>(null);
  const [hours, setHours] = useState<Option | null>({ label: "24 Hours", value: "24" });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal State Controls
  const [activeCartForDetails, setActiveCartForDetails] = useState<any | null>(null);
  const [activeCartForNotify, setActiveCartForNotify] = useState<any | null>(null);
  const [activeCartForDelete, setActiveCartForDelete] = useState<number | null>(null);
  const [isBulkNotifyOpen, setIsBulkNotifyOpen] = useState(false);

  const fetchAbandonedCarts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
        hours: hours?.value || 24,
        status: status?.value || undefined,
        search: search || undefined,
      };

      const res = await apiClient.get("abandoned-carts", { params });
      if (res?.data?.status && res?.data?.data) {
        setCarts(res.data.data.data || []);
        setCurrentPage(res.data.data.current_page || 1);
        setTotalPages(
          Math.ceil((res.data.data.total || 0) / (res.data.data.per_page || 15))
        );
      }
    } catch (err) {
      console.error("Failed to fetch abandoned carts:", err);
    }  finally {
      setLoading(false);
    }
  }, [currentPage, hours, status, search]);

  useEffect(() => {
    fetchAbandonedCarts();
  }, [fetchAbandonedCarts]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(carts.map((c) => String(c.id)));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllSelected =
    carts.length > 0 && selectedRows.length === carts.length;

  return (
    <div className="bg-white rounded-2xl w-full">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">
            Abandoned Cart
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsBulkNotifyOpen(true)}
            >
              Send Bulk Reminders
            </Button>
            <ExportButton<any>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Customer", accessor: (row) => row.user?.name || "Guest" },
                { header: "Email", accessor: (row) => row.user?.email || "" },
                { header: "Items", accessor: (row) => row.items?.length || 0 },
                { header: "Total", accessor: (row) => `$${parseFloat(row.grand_total || 0).toFixed(2)}` },
                { header: "Date", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={carts}
              filename="abandoned-carts"
              title="Abandoned Carts"
            />
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          {/* Search 
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          */}
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[120px]">
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={setStatus}
                placeholder="Status"
              />
            </div>
            <div className="min-w-[120px]">
              <CustomSelect
                options={hoursOptions}
                value={hours}
                onChange={setHours}
                placeholder="Time Horizon"
              />
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Cart ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Placed By</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Loading abandoned carts...
              </TableCell>
            </TableRow>
          ) : carts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No abandoned carts found.
              </TableCell>
            </TableRow>
          ) : (
            carts.map((cart) => (
              <TableRow
                key={cart.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRows.includes(String(cart.id))}
                    onCheckedChange={(checked) =>
                      toggleSelectRow(String(cart.id), checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-normal text-sm text-light-secondary-text">
                  #{cart.id}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {new Date(cart.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text">
                  <div>
                    <p className="font-medium text-light-primary-text">
                      {cart.user?.name || "Guest"}
                    </p>
                    <p className="text-xs">{cart.user?.email || "N/A"}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-light-primary-text whitespace-nowrap">
                  ${parseFloat(cart.grand_total).toFixed(2)}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {cart.items?.length || 0} Item(s)
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setActiveCartForDetails(cart)}
                    >
                      View
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setActiveCartForNotify(cart)}
                    >
                      Remind
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setActiveCartForDelete(cart.id)}
                    >
                      Clear
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="py-4 sm:py-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Action Modals */}
      <SendNotificationModal
        cartId={activeCartForNotify?.id || null}
        userEmail={activeCartForNotify?.user?.email}
        isOpen={!!activeCartForNotify}
        onClose={() => setActiveCartForNotify(null)}
        onSuccess={fetchAbandonedCarts}
      />

      <SendBulkNotificationModal
        isOpen={isBulkNotifyOpen}
        onClose={() => setIsBulkNotifyOpen(false)}
        onSuccess={fetchAbandonedCarts}
      />

      <DeleteCartModal
        cartId={activeCartForDelete}
        isOpen={!!activeCartForDelete}
        onClose={() => setActiveCartForDelete(null)}
        onSuccess={fetchAbandonedCarts}
      />

      <CartDetailsModal
        cart={activeCartForDetails}
        isOpen={!!activeCartForDetails}
        onClose={() => setActiveCartForDetails(null)}
      />
    </div>
  );
}