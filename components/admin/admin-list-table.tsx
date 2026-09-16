"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { Pencil, BannedIcon } from "@/icons";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/axios";
import { Can } from "@/components/auth/can";
import { ExportButton } from "@/components/ui/export-button";

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  type: string;
  status: "active" | "disabled" | string;
  created_at: string;
  roles?: Role[];
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
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gray-200 rounded-lg shrink-0" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="h-5 w-9 bg-gray-200 rounded-full shrink-0" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          </TableCell>
          <TableCell className="pr-6">
            <div className="flex items-center gap-2">
              <div className="size-6 bg-gray-200 rounded" />
              <div className="size-6 bg-gray-200 rounded" />
              <div className="size-6 bg-gray-200 rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function AvatarImage({
  avatar,
  id,
  name,
}: {
  avatar?: string | null;
  id: number;
  name: string;
}) {
  const fallbackNum = String(((id || 1) % 12) + 1).padStart(2, "0");
  const fallbackSrc = `/images/admin/user_01.png`;

  const initialSrc = avatar
    ? avatar.startsWith("http")
      ? avatar
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${avatar}`
    : fallbackSrc;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  return (
    <Image
      src={imgSrc}
      alt={name}
      width={32}
      height={32}
      className="object-cover size-full rounded-lg"
      unoptimized={imgSrc.startsWith("http")}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default function AdminListTable() {
  const [staffMembers, setStaffMembers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/staff", {
        params: { page: currentPage },
      });

      if (response.data?.status) {
        setStaffMembers(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch staff members:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(staffMembers.map((item) => item.id));
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
    staffMembers.length > 0 && selectedRows.length === staffMembers.length;

  const handleToggleStatus = async (user: StaffUser) => {
    const nextStatus = user.status.toLowerCase() === "active" ? "disabled" : "active";
    setUpdatingId(user.id);

    try {
      const response = await apiClient.patch(`/staff/${user.id}/status`, {
        status: nextStatus,
      });

      if (response.data?.status || response.status === 200) {
        setStaffMembers((prev) =>
          prev.map((item) =>
            item.id === user.id ? { ...item, status: nextStatus } : item
          )
        );
      }
    } catch (error) {
      console.error(`Failed to update status for staff #${user.id}:`, error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const response = await apiClient.delete(`/staff/${userToDelete.id}`);

      if (response.data?.status || response.status === 200 || response.status === 204) {
        setStaffMembers((prev) => prev.filter((item) => item.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } catch (error) {
      console.error(`Failed to delete staff #${userToDelete.id}:`, error);
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
    if (lower.includes("master")) return "error";
    if (lower.includes("manager")) return "warning";
    if (lower.includes("admin")) return "info";
    return "success";
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-light-primary-text">
            Admin Users
          </h3>
          <div className="flex items-center gap-2.5">
            <ExportButton<StaffUser>
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Name", accessor: "name" },
                { header: "Email", accessor: "email" },
                { header: "Phone", accessor: (row) => row.phone || "" },
                { header: "Role", accessor: (row) => row.roles?.map((r) => r.name).join(", ") || "" },
                { header: "Status", accessor: "status" },
                { header: "Created", accessor: (row) => new Date(row.created_at).toLocaleDateString() },
              ]}
              data={staffMembers}
              filename="admin-users"
              title="Admin Users"
            />
            <Can permission="staff.manage">
              <Button href="/admin-users/add" size="xs">
                Invite Admin User
              </Button>
            </Can>
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
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : staffMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No admin staff members found.
              </TableCell>
            </TableRow>
          ) : (
            staffMembers.map((item) => {
              const isActive = item.status.toLowerCase() === "active";
              const isUpdating = updatingId === item.id;

              return (
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
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    <div className="flex items-center gap-2">
                      <div className="size-8 relative shrink-0 overflow-hidden bg-gray-100 rounded-lg">
                        <AvatarImage
                          avatar={item.avatar}
                          id={item.id}
                          name={item.name}
                        />
                      </div>
                      <span className="font-medium text-light-primary-text">
                        {item.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.roles && item.roles.length > 0 ? (
                        item.roles.map((role) => (
                          <Badge key={role.id} variant={getRoleVariant(role.name)}>
                            {role.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="default">Staff</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {item.status?.toLowerCase() !== "pending" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(item)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isActive ? "bg-emerald-500" : "bg-gray-300"
                          } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      )}
                      <Badge variant={isActive ? "success" : "error"}>
                        {isActive ? "Active" : item.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Can permission="staff.manage">
                        <Button
                          variant="icon"
                          href={`/admin-users/edit?id=${item.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>
                      <Can permission="staff.manage">
                        <Button
                          variant="icon"
                          onClick={() => handleToggleStatus(item)}
                          className="hover:text-amber-600 transition-colors"
                          title={isActive ? "Disable User" : "Enable User"}
                        >
                          <BannedIcon className="w-4 h-4" />
                        </Button>
                      </Can>
                      <Can permission="staff.delete">
                        <Button
                          variant="icon"
                          onClick={() => setUserToDelete(item)}
                          className="hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Admin User
              </h3>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {userToDelete.name}
              </span>{" "}
              ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}