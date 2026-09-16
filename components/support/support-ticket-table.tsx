"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { Eye, Message01Icon, BannedIcon } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { ExportButton } from "@/components/ui/export-button";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Ticket {
  id: number;
  ticket_id: string;
  user_id: number;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Metrics {
  open: number;
  replied: number;
  closed: number;
  total: number;
}

const statusOptions: Option[] = [
  { label: "Open", value: "open" },
  { label: "Replied", value: "replied" },
  { label: "Closed", value: "closed" },
];

const priorityOptions: Option[] = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function SupportTicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ open: 0, replied: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<Option | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Fetch Tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };

      if (statusFilter?.value) {
        params.status = statusFilter.value;
      }
      if (priorityFilter?.value) {
        params.priority = priorityFilter.value;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiClient.get("/tickets", { params });
      const responseData = response.data;

      if (responseData?.status) {
        setMetrics(responseData.metrics || { open: 0, replied: 0, closed: 0, total: 0 });
        const paginated = responseData.data;
        setTickets(paginated.data || []);
        setCurrentPage(paginated.current_page || 1);
        setTotalPages(paginated.last_page || 1);
      }
    } catch (err: any) {
      console.error("Failed to fetch support tickets:", err);
      toast.error(err?.response?.data?.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tickets.map((t) => t.id));
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

  const isAllSelected = tickets.length > 0 && selectedRows.length === tickets.length;

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "success";
      case "replied":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-[#E0F7FA] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.total}</h4>
             
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-[#FFFDE7] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Open Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.open}</h4>
            
          </div>
        </div>

        {/* Replied Tickets */}
        <div className="bg-[#E3F2FD] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Replied Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.replied}</h4>
            
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="bg-[#F3E5F5] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Closed Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.closed}</h4>
            
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl w-full">
        <div className="p-4 sm:p-6 pb-4">
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-light-primary-text leading-7">
              Support & Ticket
            </h3>
            <ExportButton<Ticket>
              columns={[
                { header: "Ticket ID", accessor: "ticket_id" },
                { header: "Subject", accessor: "subject" },
                { header: "Customer", accessor: (row) => row.user?.name || "" },
                { header: "Priority", accessor: "priority" },
                { header: "Status", accessor: "status" },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={tickets}
              filename="support-tickets"
              title="Support Tickets"
            />
          </div>

          <div className="w-full flex justify-between gap-4 items-center flex-wrap">
            {/* Search */}
            <div className="w-full sm:w-72">
              <SearchInput
                onSearch={(val: string) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-visible flex-wrap pb-2 sm:pb-0">
              <div className="min-w-[130px]">
                <CustomSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Status"
                />
              </div>
              <div className="min-w-[130px]">
                <CustomSelect
                  options={priorityOptions}
                  value={priorityFilter}
                  onChange={(val) => {
                    setPriorityFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Priority"
                />
              </div>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
              <TableHead className="whitespace-nowrap pl-6">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">User ID</TableHead>
              <TableHead className="whitespace-nowrap">Type / Priority</TableHead>
              <TableHead className="whitespace-nowrap">Subject</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="pr-6 whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    <span className="text-sm text-gray-500">Loading tickets...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-sm text-gray-500">
                  No support tickets found.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, Boolean(checked))
                      }
                    />
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-light-secondary-text whitespace-nowrap">
                    {item.ticket_id}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    #{item.user_id} {item.user?.name ? `(${item.user.name})` : ""}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap capitalize">
                    <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 font-medium">
                      {item.priority || "Normal"}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-sm text-light-secondary-text max-w-[300px] truncate"
                    title={item.subject}
                  >
                    {item.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status) as any}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Link href={`/support/${item.id}`}>
                        <Button
                          variant="icon"
                          className="hover:text-primary transition-colors"
                        >
                          <Message01Icon className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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