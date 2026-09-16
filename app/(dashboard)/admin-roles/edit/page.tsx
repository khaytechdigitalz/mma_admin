import { Metadata } from "next";
import EditRoleForm from "@/components/roles/edit-roles-form";

export const metadata: Metadata = {
  title: "Edit Admin",
  description: "Edit admin user",
};

export default function EditAdminPage() {
  return <EditRoleForm />;
}
