import CustomerStatistics from "@/components/customers/customer-statistics";
import CustomerTable from "@/components/customers/customer-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
  description: "View and manage your customers.",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <CustomerStatistics />
      <CustomerTable />
    </div>
  );
}