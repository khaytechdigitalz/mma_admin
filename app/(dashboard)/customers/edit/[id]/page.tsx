import { Metadata } from "next";
import EditCustomerForm from "@/components/customers/edit-customer-form";

export const metadata: Metadata = {
  title: "Edit Customer",
  description: "Edit customer details",
};

export default function EditCustomerPage() {
  return <EditCustomerForm />;
}
