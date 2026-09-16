import { Metadata } from "next";
import CustomerDetailsView from "@/components/customers/customer-details-view";

export const metadata: Metadata = {
  title: "Customer Details",
  description: "View customer details and order history",
};

export default function CustomerDetailsPage() {
  return <CustomerDetailsView />;
}
