import PendingSellerTable from "@/components/seller/pending-seller-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pending Sellers",
  description: "Review and approve pending seller registrations.",
};

export default function PendingSellerPage() {
  return <PendingSellerTable />;
}
