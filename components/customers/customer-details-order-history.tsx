"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { Eye } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { PaginatedOrders } from "./customer-details-view";

// Updated SummaryData interface matching your API response
export interface SummaryData {
  total_orders: number;
  delivered_orders: number;
  pending_orders: number;
  processing_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  cancelled_orders: number;
  returned_orders: number;
  total_spent_value: string;
}

interface CustomerDetailsOrderHistoryProps {
  summary: SummaryData | null;
  ordersData: PaginatedOrders | null;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Strictly typed variant list matching your Badge component definition
type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "success-outline"
  | "info"
  | "default"
  | "warning-outline"
  | "error-outline"
  | "info-outline"
  | "active";

const paymentStatusOptions = [
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Refunded", value: "refunded" },
];

const statusOptions = [
  { label: "Delivered", value: "delivered" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Cancelled", value: "cancelled" },
];

const dateOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

export default function CustomerDetailsOrderHistory({
  summary,
  ordersData,
  currentPage,
  onPageChange,
}: CustomerDetailsOrderHistoryProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);
  const [dateSort, setDateSort] = useState<Option | null>(null);
  const [search, setSearch] = useState("");

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.last_page || 1;

  // Local filtering & search on the current page batch
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = search
      ? order.order_no.toLowerCase().includes(search.toLowerCase()) ||
        order.transaction_ref.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesPayment = paymentStatus?.value
      ? order.payment_status.toLowerCase() === String(paymentStatus.value).toLowerCase()
      : true;

    const matchesStatus = status?.value
      ? order.order_status.toLowerCase() === String(status.value).toLowerCase()
      : true;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredOrders.map((o) => o.id));
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
    filteredOrders.length > 0 && selectedRows.length === filteredOrders.length;

  const getOrderStatusBadgeVariant = (orderStatus: string): BadgeVariant => {
    switch (orderStatus.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
      case "processing":
      case "confirmed":
      case "shipped":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-500/20">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-500/20">
        <h3 className="text-lg sm:text-xl font-bold text-light-primary-text">
          Order History
        </h3>
      </div>

      {/* Complete Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 px-4 pt-4 sm:pt-6 sm:px-6 pb-0">
        <div className="bg-accent-7/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Total Orders
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.total_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-2/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Delivered
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.delivered_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-3/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Pending
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.pending_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-5/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Processing
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.processing_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-6/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Confirmed
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.confirmed_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-2/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Shipped
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.shipped_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-4/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Cancelled
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.cancelled_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-1/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Returned
          </span>
          <span className="text-base font-bold text-light-primary-text">
            {summary?.returned_orders ?? 0} 
          </span>
        </div>
        <div className="bg-accent-1/60 p-3 sm:p-4 rounded-xl flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-light-secondary-text truncate">
            Total Spent
          </span>
          <span className="text-base font-bold text-light-primary-text truncate">
            ${summary?.total_spent_value ?? "0.00"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 p-4 sm:p-6">
        <SearchInput
          onSearch={(val: string) => setSearch(val)}
          placeholder="Search by Order No or Ref..."
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[140px]">
            <CustomSelect
              options={paymentStatusOptions}
              value={paymentStatus}
              onChange={setPaymentStatus}
              placeholder="Payment status"
            />
          </div>
          <div className="min-w-[100px]">
            <CustomSelect
              options={statusOptions}
              value={status}
              onChange={setStatus}
              placeholder="Status"
            />
          </div>
          <div className="min-w-[100px]">
            <CustomSelect
              options={dateOptions}
              value={dateSort}
              onChange={setDateSort}
              placeholder="Date"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-500/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-500/20">
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Order No</TableHead>
              <TableHead>Transaction Ref</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead className="pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-white"
                >
                  <TableCell className="pl-6 whitespace-nowrap py-4">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-semibold whitespace-nowrap text-sm text-light-primary-text">
                    {item.order_no}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    {item.transaction_ref}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap capitalize text-light-secondary-text">
                    {item.payment_method.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-sm font-medium whitespace-nowrap text-light-primary-text">
                    ${item.total_amount}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        item.payment_status === "paid"
                          ? "success-outline"
                          : "warning"
                      }
                      className="rounded-full capitalize"
                    >
                      {item.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={getOrderStatusBadgeVariant(item.order_status)}
                      className="capitalize"
                    >
                      {item.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="pr-6 whitespace-nowrap">
                    <Button
                      className="hover:text-primary"
                      variant="icon"
                      href={`/orders/details/?id=${item.id}`}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 sm:p-6 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}