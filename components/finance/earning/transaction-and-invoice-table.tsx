"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TransactionIcon, Eye } from "@/icons";
import SearchInput from "@/components/common/search-input";

export interface PlatformTransaction {
  id: number;
  order_id: number;
  user_id: number;
  transaction_ref: string;
  payment_gateway: string;
  amount: string | number;
  fee: number;
  total_amount: number;
  tax: number;
  currency: string;
  status: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  order: {
    id: number;
    order_no: string;
    payment_status: string;
  } | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface TableProps {
  transactions: PlatformTransaction[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (ref: string) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export default function TransactionAndInvoiceTable({
  transactions,
  pagination,
  loading,
  onPageChange,
  onDateFromChange,
  onDateToChange,
}: TableProps) {
  const [activeTab, setActiveTab] = useState<"transactions" >(
    "transactions"
  );
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transactions.map((t) => t.id));
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
    transactions.length > 0 && selectedRows.length === transactions.length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full mt-2">
      {/* Tabs */}
      <div className="flex px-4 sm:px-6 pt-4 border-b border-gray-500/20 gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`pb-4 flex items-center gap-2 text-sm font-semibold transition-colors border-b-3 whitespace-nowrap ${
            activeTab === "transactions"
              ? "border-primary-dark text-primary-dark"
              : "border-transparent text-light-secondary-text hover:text-light-primary-text"
          }`}
        >
          <TransactionIcon
            className={`size-5 ${
              activeTab === "transactions" ? "" : "text-light-secondary-text"
            }`}
          />
          Transactions
        </button>
        
      </div>

      <div className="p-4 sm:p-6 sm:pb-4">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
          

          {/* Date Range Inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start xl:justify-end">
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-700"
              onChange={(e) => onDateFromChange(e.target.value)}
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-700"
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No platform earnings records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) =>
                      toggleSelectAll(Boolean(checked))
                    }
                  />
                </TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order No</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((item) => {
                const isSelected = selectedRows.includes(item.id);

                return (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                  >
                    <TableCell className="pl-6 whitespace-nowrap">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleSelectRow(item.id, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-light-secondary-text whitespace-nowrap">
                      {item.transaction_ref}
                    </TableCell>
                    <TableCell className="text-light-secondary-text whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.user?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.user?.email || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                      {item.order?.order_no || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                      <Badge variant="info">{item.payment_gateway}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-teal-700 whitespace-nowrap">
                      {item.currency} {Number(item.fee).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {item.currency}{" "}
                      {Number(item.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          item.status === "successful" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-light-secondary-text whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </TableCell>
                     
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
            {pagination.total} entries
          </span>
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}