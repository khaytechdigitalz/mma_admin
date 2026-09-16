"use client";

import React from "react";

export interface TaxWidgets {
  total_successful_transaction_count: number;
  total_successful_transaction_value: string | number;
  total_tax_collected_value: number | string;
  total_transaction_amount_value: number | string;
}

interface Props {
  widgets?: TaxWidgets | null;
  loading?: boolean;
}

export default function TaxMetrics({ widgets, loading }: Props) {
  const metricsCards = [
    {
      label: "Total Successful Tx Count",
      value: widgets?.total_successful_transaction_count ?? 0,
      bgClass: "bg-[#c2dcfc]", // Soft blue
      isCurrency: false,
    },
    {
      label: "Successful Tx Value",
      value: widgets?.total_successful_transaction_value ?? 0,
      bgClass: "bg-[#fef2a0]", // Soft yellow
      isCurrency: true,
    },
    {
      label: "Total Tax Collected",
      value: widgets?.total_tax_collected_value ?? 0,
      bgClass: "bg-[#c3f0aa]", // Soft green
      isCurrency: true,
    },
    {
      label: "Total Transaction Amount",
      value: widgets?.total_transaction_amount_value ?? 0,
      bgClass: "bg-[#fde2f4]", // Soft pink
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricsCards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bgClass} rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-sm`}
        >
          <p className="text-xs font-semibold text-gray-700">{card.label}</p>
          <p className="text-xl font-bold text-gray-900 mt-2">
            {loading ? (
              <span className="text-sm text-gray-500 animate-pulse">
                Loading...
              </span>
            ) : card.isCurrency ? (
              `₦${Number(card.value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            ) : (
              Number(card.value).toLocaleString()
            )}
          </p>
        </div>
      ))}
    </div>
  );
}