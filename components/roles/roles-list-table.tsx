"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Pencil } from "@/icons";
import { Trash2, AlertTriangle, Loader2, ShieldCheck, Users } from "lucide-react";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permissions_count: number;
  users_count: number;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <TableRow
          key={idx}
          className="border-b last:border-0 border-gray-500/20 animate-pulse"
        >
          <TableCell className="pl-6 whitespace-nowrap">
            <div className="size-4 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-8 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-60 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </TableCell>
          <TableCell className="pr-6">
            <div className="flex items-center gap-2">
              <div className="size-6 bg-gray-200 rounded" />
              <div className="size-6 bg-gray-200 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Delete modal state
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pagination states (if server-side pagination is added later)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/roles", {
        params: { page: currentPage },
      });

      if (response.data?.status) {
        // Handles both direct array responses or paginated Laravel resource collections
        const resultData = response.data.data;
        if (Array.isArray(resultData)) {
          setRoles(resultData);
          setTotalPages(1);
        } else {
          setRoles(resultData.data || []);
          setTotalPages(resultData.last_page || 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(roles.map((item) => item.id));
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

  const isAllSelected = roles.length > 0 && selectedRows.length === roles.length;

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);

    try {
      const response = await apiClient.delete(`/roles/${roleToDelete.id}`);

      if (response.data?.status || response.status === 200 || response.status === 204) {
        setRoles((prev) => prev.filter((item) => item.id !== roleToDelete.id));
        setRoleToDelete(null);
      }
    } catch (error) {
      console.error(`Failed to delete role #${roleToDelete.id}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleVariant = (
    roleName: string
  ): "success" | "warning" | "error" | "info" | "default" => {
    const lower = roleName.toLowerCase();
    if (lower.includes("super") || lower.includes("master")) return "error";
    if (lower.includes("manager") || lower.includes("finance")) return "warning";
    if (lower.includes("admin")) return "info";
    return "success";
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-light-primary-text">
              Roles & Permissions
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage system roles and access levels for administrative users.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Can permission="roles.manage">
              <Button href="/admin-roles/add" size="xs">
                Create New Role
              </Button>
            </Can>
            <ExportButton<Role>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Description", accessor: (row) => row.description || "" },
                { header: "Permissions", accessor: "permissions_count" },
                { header: "Users", accessor: "users_count" },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={roles}
              filename="roles"
              title="Roles & Permissions"
            />
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
            <TableHead>ID</TableHead>
            <TableHead>Role Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Assigned Users</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No roles found.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((item) => (
              <TableRow
                key={item.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRows.includes(item.id)}
                    onCheckedChange={(checked) =>
                      toggleSelectRow(item.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-normal whitespace-nowrap text-sm text-light-secondary-text">
                  #{item.id}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-light-primary-text font-medium">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleVariant(item.name)}>
                      {item.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text max-w-xs truncate">
                  {item.description || "No description provided."}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>{item.permissions_count} permissions</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-4 text-gray-400" />
                    <span>{item.users_count} users</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Can permission="roles.manage">
                      <Button
                        variant="icon"
                        href={`/admin-roles/edit?id=${item.id}`}
                        className="hover:text-primary transition-colors"
                        title="Edit Role"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Can>
                    <Can permission="roles.manage">
                      <Button
                        variant="icon"
                        onClick={() => setRoleToDelete(item)}
                        className="hover:text-red-600 transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Role</h3>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete the role{" "}
              <span className="font-semibold text-gray-900">
                {roleToDelete.name}
              </span>
              ? This action cannot be undone and may affect users assigned to this profile.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setRoleToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteRole}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Delete Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}