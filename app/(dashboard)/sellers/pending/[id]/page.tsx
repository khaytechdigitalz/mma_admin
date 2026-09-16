import OrderListTable from "@/components/seller/details/order-list-table";
import RecentAddStockTable from "@/components/seller/details/recent-add-stock-table";
import RecentSoldOutTable from "@/components/seller/details/recent-sold-out-table";
import SellerDetailsOverview from "@/components/seller/details/seller-details-overview";
import { PageHeader } from "@/components/ui/page-header";
import { LongArrowLeftIcon } from "@/icons";
import Link from "next/link";

export default function PendingSellerDetailPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white rounded-2xl">
      {/* Header */}
      <div>
        <PageHeader title="Details" backHref="/sellers" />
      </div>

      {/* Overview Section */}
      <SellerDetailsOverview />

      {/* Tables Section */}
      <div className="space-y-4">
        <RecentAddStockTable />
        <RecentSoldOutTable />
        <OrderListTable />
      </div>
    </div>
  );
}
