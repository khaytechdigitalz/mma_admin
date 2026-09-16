"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { Loader2, Eye, EyeOff, ShieldCheck, KeyRound, User } from "lucide-react";

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface StaffDetail {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  roles?: Role[];
}

export interface Option {
  value: string;
  label: string;
}

export default function EditAdminForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  // General Loading & Staff Data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State - Profile
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State - Password
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordSaving, setPasswordSaving] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State - Role
  const [rolesList, setRolesList] = useState<Option[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleSaving, setRoleSaving] = useState<boolean>(false);
  const [roleMessage, setRoleMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch Roles and Staff details
  const fetchData = useCallback(async () => {
    if (!id) {
      setError("No admin ID provided in URL parameters.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch available roles
      const rolesRes = await apiClient.get("/roles");
      if (rolesRes.data?.status || Array.isArray(rolesRes.data?.data)) {
        const fetchedRoles = Array.isArray(rolesRes.data)
          ? rolesRes.data
          : rolesRes.data?.data || [];

        setRolesList(
          fetchedRoles.map((r: Role) => ({
            value: String(r.id),
            label: r.name,
          }))
        );
      }

      // 2. Fetch staff details
      const staffRes = await apiClient.get(`/staff/${id}`);
      if (staffRes.data?.status) {
        const staff: StaffDetail = staffRes.data.data;
        setName(staff.name || "");
        setEmail(staff.email || "");
        setPhone(staff.phone || "");

        if (staff.roles && staff.roles.length > 0) {
          setSelectedRoleId(String(staff.roles[0].id));
        }
      } else {
        setError("Failed to fetch staff details.");
      }
    } catch (err: any) {
      console.error("Error fetching admin details:", err);
      setError(
        err?.response?.data?.message || "An error occurred while loading details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 1. Handle Update Profile Submission (PUT /staff/[id])
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await apiClient.post(`/staff/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status || res.status === 200) {
        setProfileMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // 2. Handle Password Reset Submission (PUT /staff/[id]/password)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const res = await apiClient.put(`/staff/${id}/password`, {
        password: password,
      });

      if (res.data?.status || res.status === 200) {
        setPasswordMessage({ type: "success", text: "Password reset successfully!" });
        setPassword("");
      }
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to reset password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  // 3. Handle Role Update Submission (PUT /staff/[id]/role)
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;

    setRoleSaving(true);
    setRoleMessage(null);

    try {
      const res = await apiClient.put(`/staff/${id}/role`, {
        role_id: Number(selectedRoleId),
      });

      if (res.data?.status || res.status === 200) {
        setRoleMessage({ type: "success", text: "Role updated successfully!" });
      }
    } catch (err: any) {
      setRoleMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update role.",
      });
    } finally {
      setRoleSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-white rounded-2xl p-6">
        <Loader2 className="size-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-gray-500">Loading admin user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl w-full p-6 text-center my-8">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <Button onClick={() => router.back()} size="sm" variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs">
        <PageHeader
          title={`Edit Admin #${id}`}
          backHref="/admin-users"
          className="gap-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Basic Information */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs space-y-6"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
              <User className="size-5 text-primary" /> Basic Information
            </h2>

            {/* Avatar Uploader */}
            <div>
              <FileUploader
                title="Upload User image"
                accept="image/*"
                description="Allowed *.jpeg, *.jpg, *.png, *.gif"
                maxSizeText="Max size of 3.1 MB"
                className="w-full mx-auto"
                onFileSelect={(files) => {
                  if (!files) {
                    setAvatarFile(null);
                  } else if (Array.isArray(files)) {
                    setAvatarFile(files[0] || null);
                  } else {
                    setAvatarFile(files);
                  }
                }}
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <FloatingInput
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FloatingInput
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {profileMessage && (
              <p
                className={`text-xs font-medium ${
                  profileMessage.type === "success"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {profileMessage.text}
              </p>
            )}

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
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column (1/3): Role Update & Password Reset */}
        <div className="space-y-6">
          {/* Update Role Section */}
          <form
            onSubmit={handleUpdateRole}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs space-y-4"
          >
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
              <ShieldCheck className="size-5 text-primary" /> Admin Role
            </h2>

            <CustomFloatingSelect
              label="Select Role"
              options={rolesList}
              value={selectedRoleId}
              onChange={(val) => setSelectedRoleId(val)}
            />

            {roleMessage && (
              <p
                className={`text-xs font-medium ${
                  roleMessage.type === "success"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {roleMessage.text}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full sm:w-auto px-6"
                disabled={roleSaving}
              >
                {roleSaving ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Update Role
              </Button>
            </div>
          </form>

          {/* Password Reset Section */}
          <form
            onSubmit={handleResetPassword}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs space-y-4"
          >
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
              <KeyRound className="size-5 text-primary" /> Reset Password
            </h2>

            <div className="relative">
              <FloatingInput
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {passwordMessage && (
              <p
                className={`text-xs font-medium ${
                  passwordMessage.type === "success"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {passwordMessage.text}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="warning"
                size="sm"
                className="w-full sm:w-auto px-6"
                disabled={passwordSaving}
              >
                {passwordSaving ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}