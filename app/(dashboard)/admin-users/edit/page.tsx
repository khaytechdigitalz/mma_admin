import { Metadata } from "next";
import EditAdminForm from "@/components/admin/edit-admin-form";

export const metadata: Metadata = {
  title: "Edit Admin",
  description: "Edit admin user",
};

export default function EditAdminPage() {
  return <EditAdminForm />;
}
