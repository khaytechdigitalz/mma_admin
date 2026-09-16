"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface PlatformWidgets {
  total_platform_earnings: number;
  total_fees_collected: number;
  total_taxes_collected: number;
  total_gross_volume: number;
  total_transactions: number;
}

interface EarningOverviewProps {
  widgets: PlatformWidgets | null;
  loading: boolean;
}

export default function EarningOverview({ widgets, loading }: EarningOverviewProps) {
  const formatCurrency = (val: number = 0) =>
    `₦${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cards = [
    {
      title: "Total Platform Earnings",
      value: formatCurrency(widgets?.total_platform_earnings),
      bgClass: "bg-[#DDF4F4]", // Soft Cyan
    },
    {
      title: "Total Fees Collected",
      value: formatCurrency(widgets?.total_fees_collected),
      bgClass: "bg-[#FFF5C0]", // Soft Yellow
    },
    {
      title: "Total Taxes Collected",
      value: formatCurrency(widgets?.total_taxes_collected),
      bgClass: "bg-[#FFE4D6]", // Soft Peach
    },
    {
      title: "Total Gross Volume",
      value: formatCurrency(widgets?.total_gross_volume),
      bgClass: "bg-[#E2F0D9]", // Soft Green
    },
    {
      title: "Total Transactions",
      value: widgets?.total_transactions.toLocaleString() || "0",
      bgClass: "bg-[#DDEBF7]", // Soft Blue
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl font-bold text-light-primary-text">
          Platform Earnings
        </h2> 
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((item, index) => (
          <div
            key={index}
            className={`${item.bgClass} p-5 rounded-2xl flex flex-col justify-between min-h-[100px]`}
          >
            <span className="text-xs font-semibold text-gray-700">
              {item.title}
            </span>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
              {loading ? "..." : item.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}