"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { apiClient } from "@/lib/axios";
import { PageHeader } from "@/components/ui/page-header";
import CustomerDetailsOrderHistory from "./customer-details-order-history";
import { Mail01Icon, PhoneIcon, MapMarkerIcon, CalendarIcon } from "@/icons";
import { Button } from "@/components/ui/button";

export interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: "active" | "pending" | "disabled" | "blocked";
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
}

export interface OrderItem {
  id: number;
  order_no: string;
  user_id: number;
  seller_id: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  transaction_ref: string;
  subtotal: string;
  tax_amount: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  shipping_country: string;
  shipping_state: string;
  shipping_address: ShippingAddress | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrders {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  data: OrderItem[];
}

export interface CustomerDetailsApiResponse {
  status: boolean;
  data: {
    customer: CustomerData;
    summary: SummaryData;
    orders: PaginatedOrders;
  };
}

export default function CustomerDetailsView() {
  const params = useParams();
  const customerId = params?.id;

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [ordersData, setOrdersData] = useState<PaginatedOrders | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [statusReason, setStatusReason] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CustomerDetailsApiResponse>(
        `/customers/${customerId}?orders_per_page=10&page=${page}`
      );

      if (response.data?.status) {
        const { customer, summary, orders } = response.data.data;
        setCustomer(customer);
        setSummary(summary);
        setOrdersData(orders);
        setSelectedStatus(customer.status);
      }
    } catch (err: any) {
      console.error("Failed to fetch customer details:", err);
      const errMsg = err?.response?.data?.message || "Failed to load customer details.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [customerId, page]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // Handle Update Status Submit
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    try {
      setStatusSubmitting(true);
      const response = await apiClient.patch(`/customers/${customerId}/status`, {
        status: selectedStatus,
        reason: statusReason,
      });

      if (customer) {
        setCustomer({ ...customer, status: selectedStatus as CustomerData["status"] });
      }
      setIsStatusModalOpen(false);
      setStatusReason("");
      toast.success(response.data?.message || "Status updated successfully!");
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error(err?.response?.data?.message || "Failed to update customer status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Handle Send Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    try {
      setEmailSubmitting(true);
      const response = await apiClient.post(`/customers/${customerId}/sendmail`, {
        subject: emailSubject,
        message: emailMessage,
      });

      setIsEmailModalOpen(false);
      setEmailSubject("");
      setEmailMessage("");
      toast.success(response.data?.message || "Email sent successfully!");
    } catch (err: any) {
      console.error("Failed to send email:", err);
      toast.error(err?.response?.data?.message || "Failed to send email.");
    } finally {
      setEmailSubmitting(false);
    }
  };

  // Helper for status badge styling
  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "disabled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "blocked":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  if (loading && !customer) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-sm text-gray-500 animate-pulse">
        Loading customer details...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-sm text-red-500">
        {error || "Customer not found."}
      </div>
    );
  }

  // Derive address if present in latest order shipping_address
  const latestOrderAddress = ordersData?.data?.[0]?.shipping_address;
  const formattedAddress = latestOrderAddress
    ? `${latestOrderAddress.address || ""}, ${latestOrderAddress.city || ""}, ${latestOrderAddress.state || ""}`
    : "No address recorded";

  return (
    <div className="space-y-4 sm:space-y-6 bg-white rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Customer Details" backHref="/customers" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            className="rounded-lg"
            onClick={() => {
              setSelectedStatus(customer.status);
              setIsStatusModalOpen(true);
            }}
          >
            Update Status
          </Button>

          <Button
            variant="outline"
            size="xs"
            className="rounded-lg"
            onClick={() => setIsEmailModalOpen(true)}
          >
            Send Email
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-accent-1/60 rounded-2xl relative overflow-hidden border border-gray-500/10">
        <h3 className="text-lg border-gray-500/20 px-6 py-4 font-bold border-b text-light-primary-text">
          Basic Information
        </h3>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
            {/* Avatar */}
            <div className="relative size-16 sm:size-25 rounded-full overflow-hidden bg-white shrink-0 border-3 border-white flex items-center justify-center">
              <Image
                src={
                  customer.avatar
                    ? customer.avatar.startsWith("http")
                      ? customer.avatar
                      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${customer.avatar}`
                    : "/images/customer/user_01.png"
                }
                alt={customer.name}
                width={100}
                height={100}
                className="object-cover"
                unoptimized
                onError={(e) => {
                  e.currentTarget.src = "/images/customer/user_01.png";
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-light-primary-text">
                  {customer.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getStatusBadgeStyles(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div className="flex items-center gap-2 text-light-primary-text">
                  <Mail01Icon className="size-4 shrink-0 text-light-primary-text" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-light-primary-text">
                  <PhoneIcon className="size-4 shrink-0 text-light-primary-text" />
                  <span className="text-sm">{customer.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-light-primary-text">
                  <MapMarkerIcon className="size-4 shrink-0 text-light-primary-text" />
                  <span
                    className="text-sm truncate max-w-[280px]"
                    title={formattedAddress}
                  >
                    {formattedAddress}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-light-primary-text">
                  <CalendarIcon className="size-4 shrink-0 text-light-primary-text" />
                  <span className="text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <CustomerDetailsOrderHistory
        summary={summary}
        ordersData={ordersData}
        currentPage={page}
        onPageChange={setPage}
      />

      {/* Update Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 border border-gray-500/20 shadow-lg">
            <h3 className="text-lg font-bold text-light-primary-text">
              Update Customer Status
            </h3>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-light-secondary-text mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="disabled">Disabled</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-secondary-text mb-1">
                  Reason
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for status change"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="rounded-lg"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={statusSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="xs"
                  className="rounded-lg"
                  disabled={statusSubmitting}
                >
                  {statusSubmitting ? "Updating..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 border border-gray-500/20 shadow-lg">
            <h3 className="text-lg font-bold text-light-primary-text">
              Send Email
            </h3>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-light-secondary-text mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-secondary-text mb-1">
                  Message
                </label>
                <textarea
                  required
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter message content"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="rounded-lg"
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={emailSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="xs"
                  className="rounded-lg"
                  disabled={emailSubmitting}
                >
                  {emailSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}