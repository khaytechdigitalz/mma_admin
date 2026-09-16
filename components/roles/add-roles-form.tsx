"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/axios";
import { Loader2, ShieldPlus } from "lucide-react";
import { toast } from "sonner";

export interface Permission {
  id: number;
  name: string;
  slug: string;
  group: string;
  description?: string;
}

export type PermissionGroups = Record<string, Permission[]>;

export default function AddRoleForm() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // UI & loading states
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroups>({});
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch permissions from GET /roles/permissions
  const fetchPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    try {
      const response = await apiClient.get("/roles/permissions");
      if (response.data?.status) {
        setPermissionGroups(response.data.data || {});
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      toast.error("Failed to load permissions matrix. Please try refreshing.");
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Handle individual permission toggle
  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Handle select/deselect all for a specific permission group
  const toggleGroupPermissions = (groupKey: string) => {
    const groupPerms = permissionGroups[groupKey] || [];
    const groupPermIds = groupPerms.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Remove all ids of this group
      setSelectedPermissions((prev) => prev.filter((id) => !groupPermIds.includes(id)));
    } else {
      // Add all ids of this group (ensuring uniqueness)
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPermIds])));
    }
  };

  // Handle form submission (POST /roles)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please provide a role name.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      };

      const response = await apiClient.post("/roles", payload);

      if (response.data?.status || response.status === 200 || response.status === 201) {
        toast.success(`Role "${name}" successfully created!`);

        // Redirect back to admin-roles list after a brief delay
        setTimeout(() => {
          router.push("/admin-roles");
        }, 1500);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to create role. Please check your inputs and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Format group key into a readable title (e.g., "frontend_contents" -> "Frontend Contents")
  const formatGroupName = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 border border-gray-100 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <PageHeader
          title="Create New Role"
          backHref="/admin-roles"
          className="gap-4"
        />
      </div>

      {/* Role Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldPlus className="size-5 text-primary" /> Role Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput
              label="Role Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FloatingInput
              label="Description (Optional)"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assign Permissions</h3>
              <p className="text-sm text-gray-500">
                Select the access levels and actions permitted for this role.
              </p>
            </div>
            {!loadingPermissions && Object.keys(permissionGroups).length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  const allIds = Object.values(permissionGroups)
                    .flat()
                    .map((p) => p.id);
                  if (selectedPermissions.length === allIds.length) {
                    setSelectedPermissions([]);
                  } else {
                    setSelectedPermissions(allIds);
                  }
                }}
              >
                {selectedPermissions.length === Object.values(permissionGroups).flat().length
                  ? "Deselect All"
                  : "Select All Permissions"}
              </Button>
            )}
          </div>

          {loadingPermissions ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>Loading permission matrix...</span>
            </div>
          ) : Object.keys(permissionGroups).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No permissions found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(permissionGroups).map(([groupKey, permissions]) => {
                const groupIds = permissions.map((p) => p.id);
                const isAllGroupSelected =
                  groupIds.length > 0 &&
                  groupIds.every((id) => selectedPermissions.includes(id));

                return (
                  <div
                    key={groupKey}
                    className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/30"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="font-semibold text-sm text-gray-900">
                        {formatGroupName(groupKey)}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroupPermissions(groupKey)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {isAllGroupSelected ? "Deselect Group" : "Select Group"}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {permissions.map((permission) => {
                        const isChecked = selectedPermissions.includes(permission.id);
                        return (
                          <label
                            key={permission.id}
                            className="flex items-start gap-2.5 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => togglePermission(permission.id)}
                              className="mt-0.5"
                            />
                            <div className="leading-tight">
                              <p className="font-medium">{permission.name}</p>
                              {permission.description && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="px-6"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-6"
            disabled={submitting || loadingPermissions}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Create Role
          </Button>
        </div>
      </form>
    </div>
  );
}