import RoleistTable from "@/components/roles/roles-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Roles",
  description: "Manage admin roles and their permissions.",
};

export default function AdminUsersPage() {
  return <RoleistTable />;
}
