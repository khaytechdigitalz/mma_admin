"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/axios";
import { Loader2, CalendarIcon, DeliveryBoxIcon, DiscountTagIcon } from "lucide-react";

interface FlashSaleDetail {
  id: number;
  title: string;
  discount: number;
  discount_type: "percentage" | "flat";
  start_date: string;
  end_date: string;
  is_active: boolean;
  image?: string | null;
  products?: Array<{ id: number; name: string }>;
}

export default function FlashSaleInfo() {
  const params = useParams();
  const flashSaleId = params?.id as string;

  const [sale, setSale] = useState<FlashSaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flashSaleId) return;

    const fetchSale = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/flash-sales/${flashSaleId}`);
        setSale(response.data?.data || response.data);
      } catch (err: any) {
        console.error("Failed to fetch flash sale:", err);
        setError(err?.response?.data?.message || "Failed to load flash sale.");
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [flashSaleId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-500/20 p-10 flex justify-center">
        <Loader2 className="size-6 animate-spin text-teal-700" />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="bg-white rounded-2xl border border-gray-500/20 p-10 text-center text-sm text-red-500">
        {error || "Flash sale not found."}
      </div>
    );
  }

  const discountLabel =
    sale.discount_type === "flat" ? `$${sale.discount}` : `${sale.discount}%`;

  return (
    <div className="bg-white rounded-2xl border border-gray-500/20">
      <h2 className="text-lg border-b border-gray-500/20 font-bold text-light-primary-text px-6 py-4">
        Flash Sales Information
      </h2>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="size-23 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {sale.image ? (
                <Image src={sale.image} alt={sale.title} width={92} height={92} className="object-cover w-full h-full" unoptimized />
              ) : (
                <DiscountTagIcon className="size-8 text-gray-300" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-light-primary-text text-lg">{sale.title}</h3>
              <p className="text-sm text-light-secondary-text">#{sale.id}</p>
            </div>
          </div>
          <Badge variant={sale.is_active ? "success" : "error"}>
            {sale.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-accent-1/60 rounded-xl p-6">
            <p className="text-xs text-light-secondary-text font-medium mb-1">Discount</p>
            <p className="text-lg font-bold text-light-primary-text">{discountLabel}</p>
          </div>
          <div className="bg-accent-2/60 rounded-xl p-6">
            <p className="text-xs text-light-secondary-text font-medium mb-1">Start Date</p>
            <p className="text-lg font-bold text-light-primary-text">
              {sale.start_date ? new Date(sale.start_date).toLocaleDateString() : "-"}
            </p>
          </div>
          <div className="bg-accent-3/60 rounded-xl p-6">
            <p className="text-xs text-light-secondary-text font-medium mb-1">End Date</p>
            <p className="text-lg font-bold text-light-primary-text">
              {sale.end_date ? new Date(sale.end_date).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 bg-gray-100 p-6 rounded-2xl gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-warning-lighter flex items-center justify-center shrink-0">
              <DeliveryBoxIcon className="size-6 text-warning-dark" />
            </div>
            <div>
              <p className="text-xs leading-4.5 text-light-secondary-text">Total Products in Sale</p>
              <p className="text-sm leading-5.5 font-semibold text-light-primary-text">
                {sale.products?.length ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-warning-lighter flex items-center justify-center shrink-0">
              <CalendarIcon className="size-6 text-warning-dark" />
            </div>
            <div>
              <p className="text-xs leading-4.5 text-light-secondary-text">Status</p>
              <p className="text-sm leading-5.5 font-semibold text-light-primary-text">
                {sale.is_active ? "Currently Running" : "Not Active"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
