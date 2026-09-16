"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import SellerList from "@/components/seller/seller-list";
import SellerGridView from "@/components/seller/seller-grid-view";
      import SellerStatistics from "@/components/seller/seller-statistics";

export default function SellersPage() {
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <div className="space-y-4">

      {/* Toggle Controls */}
      <div className="flex justify-end items-center">
        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <List className="size-4" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              view === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="size-4" />
            <span>Grid</span>
          </button>
        </div>
      </div>


      
            <SellerStatistics />

      {/* Dynamic View Display */}
      {view === "list" ? <SellerList /> : <SellerGridView />}
      
    </div>
  );
}