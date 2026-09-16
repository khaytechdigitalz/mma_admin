"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { BannedIcon } from "@/icons";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "@/components/common/search-input";
import TaxMetrics, { TaxWidgets } from "./tax-metrics";
import { apiClient } from "@/lib/axios";
import { ExportButton } from "@/components/ui/export-button";

export interface TaxTransaction {
  id: number;
  order_id: number;
  user_id: number;
  transaction_ref: string;
  payment_gateway: string;
  amount: string;
  fee: number;
  total_amount: number;
  tax: number;
  currency: string;
  status: string;
  gateway_response?: {
    data?: {
      payment_type?: string;
      processor_response?: string;
    };
    status?: string;
    message?: string;
  };
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
  seller?: {
    id: number;
    name: string;
    email: string;
  } | null;
  order?: {
    id: number;
    order_no: string;
    payment_status: string;
  };
}

export default function TaxTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  const [transactions, setTransactions] = useState<TaxTransaction[]>([]);
  const [widgets, setWidgets] = useState<TaxWidgets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [transactionRef, setTransactionRef] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState<Option | null>(null);

  // User Options for Customer Filter
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Selected Checkboxes
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Fetch Users for Customer Filter Dropdown
  const fetchCustomers = async () => {
    try {
      setLoadingUsers(true);
      const res = await apiClient.get("/customers");
      const customerData = res.data?.data?.data || res.data?.data || [];

      const formattedOptions: Option[] = customerData.map((cust: any) => ({
        label: `${cust.name || cust.first_name || "User"} (${cust.email})`,
        value: String(cust.id),
      }));

      setUserOptions(formattedOptions);
    } catch (err) {
      console.error("Failed to load customer options:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Tax Transactions
  const fetchTaxTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
        per_page: perPage,
      };

      if (transactionRef) params.transaction_ref = transactionRef;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedUser?.value) params.user_id = selectedUser.value;

      const response = await apiClient.get("/transactions/tax/all", { params });

      if (response.data?.status) {
        setTransactions(response.data.data.data || []);
        setWidgets(response.data.widgets || null);
        setTotalPages(response.data.data.last_page || 1);
      } else {
        setError("Failed to fetch tax records.");
      }
    } catch (err) {
      console.error("Error loading tax records:", err);
      setError("An error occurred while fetching tax records.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, transactionRef, dateFrom, dateTo, selectedUser]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchTaxTransactions();
  }, [fetchTaxTransactions]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transactions.map((item) => item.id));
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
      case "success":
      case "paid":
        return <Badge variant="success">Successful</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "failed":
      case "cancelled":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="w-full">
      {/* Metrics Widget */}
      <TaxMetrics widgets={widgets} loading={loading} />

      {/* Main Table & Filters Box */}
      <div className="bg-white rounded-2xl w-full border border-gray-500/20 overflow-hidden">
        <div className="p-4 sm:p-6 pb-4">
          <div className="flex justify-between items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-light-primary-text leading-7">
              Tax Records
            </h3>

            <div className="flex items-center gap-3">
              <ExportButton<TaxTransaction>
                columns={[
                  { header: "Ref", accessor: "transaction_ref" },
                  { header: "Order ID", accessor: "order_id" },
                  { header: "Gateway", accessor: "payment_gateway" },
                  { header: "Amount", accessor: "amount" },
                  { header: "Tax", accessor: "tax" },
                  { header: "Total", accessor: "total_amount" },
                  { header: "Currency", accessor: "currency" },
                  { header: "Status", accessor: "status" },
                ]}
                data={transactions}
                filename="tax-records"
                title="Tax Records"
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="w-full flex justify-between gap-4 items-center flex-wrap">
            {/* Search Input for Transaction Ref */}
            <div className="w-full sm:w-auto">
              <SearchInput
                placeholder="Search by transaction ref..."
                onSearch={(val) => {
                  setTransactionRef(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Filter Dropdowns & Inputs */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              {/* User Selector Filter */}
              <div className="min-w-[180px]">
                <CustomSelect
                  options={userOptions}
                  value={selectedUser}
                  onChange={(val) => {
                    setSelectedUser(val);
                    setCurrentPage(1);
                  }}
                  placeholder={
                    loadingUsers ? "Loading users..." : "Select User"
                  }
                />
              </div>

              {/* Date From */}
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-700"
                aria-label="Date From"
              />

              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-700"
                aria-label="Date To"
              />

              {/* Clear Filters Button */}
              {(transactionRef || dateFrom || dateTo || selectedUser) && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-red-500 hover:text-red-600 text-xs"
                  onClick={() => {
                    setTransactionRef("");
                    setDateFrom("");
                    setDateTo("");
                    setSelectedUser(null);
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Ref & Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Tax Collected</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    Loading tax records...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-10 text-sm text-red-500 font-medium"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    No tax transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                  >
                    <TableCell className="pl-6 whitespace-nowrap">
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={(checked) =>
                          toggleSelectRow(item.id, !!checked)
                        }
                      />
                    </TableCell>

                    {/* Transaction Ref & Order No */}
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-xs text-gray-900 font-mono">
                        {item.transaction_ref}
                      </div>
                      {item.order && (
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Order: {item.order.order_no}
                        </div>
                      )}
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.user?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.user?.email || ""}
                      </div>
                    </TableCell>

                    {/* Payment Gateway */}
                    <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                      {item.payment_gateway}
                    </TableCell>

                    {/* Base Amount */}
                    <TableCell className="text-sm text-gray-700 whitespace-nowrap font-medium">
                      {item.currency}{" "}
                      {Number(item.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Fee */}
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {item.currency}{" "}
                      {Number(item.fee).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Tax Collected */}
                    <TableCell className="text-sm font-semibold text-teal-800 whitespace-nowrap">
                      {item.currency}{" "}
                      {Number(item.tax).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {item.currency}{" "}
                      {Number(item.total_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="icon"
                          className="hover:text-red-500 transition-colors"
                          title="Restrict/Ban"
                        >
                          <BannedIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}