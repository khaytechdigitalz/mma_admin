import AdminListTable from "@/components/admin/admin-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users",
  description: "Manage admin users and their permissions.",
};

export default function AdminUsersPage() {
  return <AdminListTable />;
}
