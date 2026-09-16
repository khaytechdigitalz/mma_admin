"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Pencil, Trash } from "@/icons";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "../common/search-input";
import DeleteModal from "../ui/delete-modal";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// --- Types ---
interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  created_at: string;
  updated_at: string;
}

interface Attribute {
  id: number;
  name: string;
  slug: string | null;
  type: "select" | "radio" | "text" | "color" | string;
  created_at: string;
  updated_at: string;
  values?: AttributeValue[];
}

interface APIPaginatedResponse {
  current_page: number;
  data: Attribute[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

const typeOptions: Option[] = [
  { label: "All Types", value: "" },
  { label: "Select", value: "select" },
  { label: "Radio", value: "radio" },
  { label: "Text", value: "text" },
  { label: "Color", value: "color" },
];

export default function AttributeList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<Option | null>(null);

  const [attributesData, setAttributesData] = useState<APIPaginatedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Row Selection State
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Delete State
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch Attributes from Backend
  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get("attributes", {
        params: {
          page: currentPage,
          per_page: 15,
          with_vals: 1,
          ...(searchQuery && { search: searchQuery }),
          ...(selectedType?.value && { type: selectedType.value }),
        },
      });

      const data = res?.data?.data;
      if (data) {
        setAttributesData(data);
      } else {
        throw new Error("Invalid response structure received from API.");
      }
    } catch (err: any) {
      console.error("Failed to fetch attributes:", err);
      setError(
        err?.response?.data?.message || "An error occurred while fetching attributes."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedType]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  // Solution 2 Search Handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeChange = (option: Option | null) => {
    setSelectedType(option);
    setCurrentPage(1);
  };

  // Checkbox handlers
  const attributesList = attributesData?.data || [];
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(attributesList.map((attr) => attr.id));
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
    attributesList.length > 0 && selectedRows.length === attributesList.length;

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!attributeToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`attributes/${attributeToDelete.id}`);
      toast.success("Attribute deleted successfully!");
      setAttributeToDelete(null);
      fetchAttributes();
    } catch (err: any) {
      console.error("Failed to delete attribute:", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete attribute. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = attributesData?.last_page || 1;

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-100 shadow-sm">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-light-primary-text leading-7.5">
            Attributes List
          </h3>
          <div className="flex items-center gap-2">
            <Can permission="attributes.create">
              <Button href="/categories/attributes/add">Create Attributes</Button>
            </Can>
            <ExportButton<Attribute>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Slug", accessor: "slug" },
                { header: "Type", accessor: "type" },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={attributesList}
              filename="attributes"
              title="Attributes"
            />
          </div>
        </div>

        <div className="flex-col lg:flex-row flex justify-between gap-4 lg:items-center">
          {/* Search Input using Solution 2 */}
          <div className="w-full lg:max-w-md">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search attributes by name..."
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="min-w-[140px]">
              <CustomSelect
                options={typeOptions}
                value={selectedType}
                onChange={handleTypeChange}
                placeholder="Filter by Type"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-light-secondary-text">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Fetching attributes...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 m-6 gap-3 text-red-500 bg-red-50/50 rounded-xl border border-red-100">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAttributes}>
            Try Again
          </Button>
        </div>
      ) : attributesList.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Attribute Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Values</TableHead>
              <TableHead>Display Type</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributesList.map((item) => {
              const formattedValues = item.values?.length
                ? item.values.map((v) => v.value).join(", ")
                : "—";

              return (
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
                  <TableCell className="font-normal whitespace-nowrap text-sm text-light-secondary-text">
                    #{item.id}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap text-sm text-light-primary-text">
                    {item.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-mono text-light-secondary-text">
                    {item.slug ? `/${item.slug}` : "—"}
                  </TableCell>
                  <TableCell className="min-w-60 text-sm text-light-secondary-text max-w-[280px] truncate">
                    {formattedValues}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="info" className="capitalize">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-light-secondary-text">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="pr-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Can permission="attributes.edit">
                        <Button
                          variant="icon"
                          href={`/categories/attributes/edit?id=${item.id}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>
                      <Can permission="attributes.delete">
                        <Button
                          variant="icon"
                          className="hover:text-red-600 transition-colors"
                          onClick={() => setAttributeToDelete(item)}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 border-t border-gray-100">
          <p className="text-sm text-light-secondary-text">No attributes found.</p>
        </div>
      )}

      {/* Dynamic Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(attributeToDelete)}
        onClose={() => setAttributeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        // isLoading={isDeleting}
      />
    </div>
  );
}