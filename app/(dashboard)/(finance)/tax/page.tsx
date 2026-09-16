import type { Metadata } from "next";
import TaxTable from "@/components/finance/tax/tax-table";

export const metadata: Metadata = {
  title: "Tax Transactions",
  description: "View and manage tax transaction records and metrics.",
};

export default function TaxTransactionsPage() {
  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl">
      <TaxTable />
    </div>
  );
}