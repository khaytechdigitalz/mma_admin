import { Metadata } from "next";
import AddCustomerForm from "@/components/customers/add-customer-form";

export const metadata: Metadata = {
  title: "Add New Customer",
  description: "Create a new customer account",
};

export default function AddCustomerPage() {
  return <AddCustomerForm />;
}
