"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import { apiClient } from "@/lib/axios";
import { Loader2, MailCheck } from "lucide-react";

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Option {
  value: string;
  label: string;
}

export default function AddAdminForm() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  // UI & loading states
  const [rolesList, setRolesList] = useState<Option[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch available roles from GET /roles
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const response = await apiClient.get("/roles");
      const rolesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      const formattedOptions: Option[] = rolesData.map((role: Role) => ({
        value: String(role.id),
        label: role.name,
      }));

      setRolesList(formattedOptions);

      // Pre-select the first role if available
      if (formattedOptions.length > 0) {
        setSelectedRoleId(formattedOptions[0].value);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setMessage({
        type: "error",
        text: "Failed to load roles list. Please try refreshing.",
      });
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handle invitation submission (POST /staff/invite)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !selectedRoleId) {
      setMessage({
        type: "error",
        text: "Please provide a valid email and select a role.",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        name: name,
        email: email,
        phone: phone,
        role_id: Number(selectedRoleId),
      };

      const response = await apiClient.post("/staff/invite", payload);

      if (response.data?.status || response.status === 200 || response.status === 201) {
        setMessage({
          type: "success",
          text: `Invitation successfully sent to ${email}!`,
        });
        setName("");
        setEmail("");
        setPhone("");

        // Redirect back to admin list after a brief delay
        setTimeout(() => {
          router.push("/admin-users");
        }, 1500);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Failed to send invite. Please check the details and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 border border-gray-100 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <PageHeader
          title="Invite Admin User"
          backHref="/admin-users"
          className="gap-4"
        />
      </div>

      {/* Invite Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MailCheck className="size-5 text-primary" /> Invitation Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6">
            <FloatingInput
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

            <FloatingInput
              label="Email Address"
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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6">

            {rolesLoading ? (
              <div className="flex items-center gap-2 h-12 px-4 border border-gray-200 rounded-lg text-sm text-gray-400">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Loading roles...</span>
              </div>
            ) : (
              <CustomFloatingSelect
                label="Assign Role"
                options={rolesList}
                value={selectedRoleId}
                onChange={(val) => setSelectedRoleId(val)}
              />
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <p
            className={`text-sm font-medium ${
              message.type === "success" ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}

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
            disabled={submitting || rolesLoading}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Send Invite
          </Button>
        </div>
      </form>
    </div>
  );
}