"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";

interface CustomerStatisticsResponse {
  status: boolean;
  data: {
    status_counts: {
      pending: number;
      active: number;
      blocked: number;
      disabled: number;
      total: number;
    };
    registrations: {
      today: number;
      this_week: number;
      this_month: number;
      this_year: number;
    };
    chart_data: Array<{
      month: string;
      count: number;
    }>;
  };
}

export default function CustomerStatistics() {
  const [data, setData] = useState<CustomerStatisticsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<CustomerStatisticsResponse>("/customers/statistics");
        if (response.data?.status) {
          setData(response.data.data);
        }
      } catch (err: any) {
        console.error("Failed to load customer statistics:", err);
        setError(err?.response?.data?.message || "Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error || "No data available."}</div>;
  }

  const { status_counts, chart_data } = data;
  const maxChartCount = Math.max(...chart_data.map((item) => item.count), 1);

  const statCards = [
    { title: "Total Customers", value: status_counts.total, bgColor: "bg-[#E2F5F4]", textColor: "text-gray-900" },
    { title: "Active", value: status_counts.active, bgColor: "bg-[#FEF8CD]", textColor: "text-gray-900" },
    { title: "Pending", value: status_counts.pending, bgColor: "bg-[#FBE2D3]", textColor: "text-gray-900" },
    { title: "Disabled", value: status_counts.disabled, bgColor: "bg-[#FCE8F3]", textColor: "text-gray-900" },
    { title: "Blocked", value: status_counts.blocked, bgColor: "bg-[#D6E8FE]", textColor: "text-blue-950" },
  ];

  return (
    <div className="space-y-6">
      {/* Widget Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-5 rounded-2xl ${card.bgColor} transition-shadow duration-200`}>
            <p className="text-xs font-medium text-gray-700 mb-2">{card.title}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${card.textColor}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Registration Trends Chart Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Customer Registration Trends</h3>
            <p className="text-xs text-gray-500">Monthly breakdown for current year</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <span>This Month: <strong className="text-gray-900">{data.registrations.this_month}</strong></span>
            <span>This Year: <strong className="text-gray-900">{data.registrations.this_year}</strong></span>
          </div>
        </div>

        {/* Lightweight Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-44 pt-6 border-b border-gray-100">
          {chart_data.map((item, idx) => {
            const heightPercent = Math.max((item.count / maxChartCount) * 100, 6);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="relative w-full flex justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-7 bg-gray-900 text-white text-[10px] py-0.5 px-2 rounded-md shadow">
                    {item.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[28px] bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-200"
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-500">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}