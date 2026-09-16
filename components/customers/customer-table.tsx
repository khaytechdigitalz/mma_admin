"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/axios";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { ExportButton } from "@/components/ui/export-button";
import DeleteModal from "../ui/delete-modal";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  type: string;
  status: "active" | "pending" | "disabled" | "blocked";
  last_login: string | null;
  created_at: string;
  orders_count: number;
}

interface CustomersPaginatedResponse {
  status: boolean;
  data: {
    current_page: number;
    last_page: number;
    total: number;
    data: Customer[];
  };
}

const STATUS_OPTIONS: Option[] = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "disabled", label: "Disabled" },
  { value: "blocked", label: "Blocked" },
];

export default function CustomerTable() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Option>(STATUS_OPTIONS[0]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CustomersPaginatedResponse>("/customers", {
        params: {
          search: search || undefined,
          status: selectedStatus.value || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
        },
      });

      if (response.data?.status) {
        setCustomers(response.data.data.data);
        setLastPage(response.data.data.last_page);
      }
    } catch (err: any) {
      console.error("Failed to load customers:", err);
      setError(err?.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    try {
      setIsDeleting(true);
      await apiClient.delete(`/customers/${selectedCustomer.id}`);
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      console.error("Failed to delete customer:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (statusState: Customer["status"]) => {
    switch (statusState) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "disabled":
        return "bg-gray-100 text-gray-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchInput
          onSearch={(val: string) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name or email..."
        />

        <CustomSelect
          options={STATUS_OPTIONS}
          value={selectedStatus}
          onChange={(val: any) => {
            const selectedOption =
              typeof val === "object"
                ? val
                : STATUS_OPTIONS.find((opt) => opt.value === val) || STATUS_OPTIONS[0];

            setSelectedStatus(selectedOption);
            setPage(1);
          }}
          placeholder="Select Status"
        />

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:border-primary text-gray-700"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none focus:border-primary text-gray-700"
        />
      </div>

      <div className="flex justify-end">
        <ExportButton<Customer>
          columns={[
            { header: "ID", accessor: "id" },
            { header: "Name", accessor: "name" },
            { header: "Email", accessor: "email" },
            { header: "Phone", accessor: (row) => row.phone || "" },
            { header: "Orders", accessor: "orders_count" },
            { header: "Status", accessor: "status" },
            { header: "Joined", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
          ]}
          data={customers}
          filename="customers"
          title="Customers"
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500 animate-pulse">Loading customers...</div>
      ) : error ? (
        <div className="py-6 text-center text-sm text-red-500">{error}</div>
      ) : customers.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">No customers found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Orders</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-9 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        <Image
                          src={
                            customer.avatar
                              ? customer.avatar.startsWith("http")
                                ? customer.avatar
                                : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${customer.avatar}`
                              : "/images/user/user_01.png"
                          }
                          alt={customer.name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-600">{customer.phone || "N/A"}</td>
                  <td className="p-3.5 font-medium">{customer.orders_count}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                        customer.status
                      )}`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Action Icon Button */}
                      <button
                        onClick={() => router.push(`/customers/${customer.id}`)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                        title="View Customer Details"
                      >
                        <Eye className="size-4" />
                      </button>

                      {/* Delete Action Icon Button */}
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {page} of {lastPage}
          </span>
          <button
            disabled={page === lastPage}
            onClick={() => setPage((prev) => Math.min(prev + 1, lastPage))}
            className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Modal Component */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        description={
          selectedCustomer
            ? `Are you sure you want to delete ${selectedCustomer.name}? This action cannot be undone.`
            : "Are you sure you want to delete this customer?"
        }
      />
    </div>
  );
}