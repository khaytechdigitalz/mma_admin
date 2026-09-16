"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/axios";
import { Loader2, Tag, CalendarIcon, PackageSearch } from "lucide-react";

interface CouponDetail {
  id: number;
  name: string;
  code: string;
  discount: number;
  discount_type: "percentage" | "flat";
  start_date: string;
  end_date: string;
  is_active: boolean;
  products?: Array<{ id: number; name: string }>;
}

/**
 * This file didn't exist at all - coupon-details.tsx imported it, which
 * meant /coupon/[id] would fail to compile/render entirely. Built for real
 * against the same GET /coupons/{id} shape edit-coupon-form.tsx already uses.
 */
export default function CouponInfo() {
  const params = useParams();
  const couponId = params?.id as string;

  const [coupon, setCoupon] = useState<CouponDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!couponId) return;

    const fetchCoupon = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/coupons/${couponId}`);
        setCoupon(response.data?.data || response.data);
      } catch (err: any) {
        console.error("Failed to fetch coupon:", err);
        setError(err?.response?.data?.message || "Failed to load coupon.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [couponId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-500/20 p-10 flex justify-center">
        <Loader2 className="size-6 animate-spin text-teal-700" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="bg-white rounded-2xl border border-gray-500/20 p-10 text-center text-sm text-red-500">
        {error || "Coupon not found."}
      </div>
    );
  }

  const discountLabel =
    coupon.discount_type === "flat" ? `$${coupon.discount}` : `${coupon.discount}%`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl border border-gray-500/20">
        <h2 className="text-lg border-b border-gray-500/20 font-bold text-light-primary-text px-6 py-4">
          Coupon Information
        </h2>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="size-16 shrink-0 rounded-lg bg-teal-50 flex items-center justify-center">
                <Tag className="size-7 text-teal-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-light-primary-text text-lg">{coupon.name}</h3>
                <p className="text-sm text-light-secondary-text font-mono">{coupon.code}</p>
              </div>
            </div>
            <Badge variant={coupon.is_active ? "success" : "error"}>
              {coupon.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-accent-1/60 rounded-xl p-6">
              <p className="text-xs text-light-secondary-text font-medium mb-1">Discount</p>
              <p className="text-lg font-bold text-light-primary-text">{discountLabel}</p>
            </div>
            <div className="bg-accent-2/60 rounded-xl p-6">
              <p className="text-xs text-light-secondary-text font-medium mb-1">Start Date</p>
              <p className="text-lg font-bold text-light-primary-text">
                {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : "-"}
              </p>
            </div>
            <div className="bg-accent-3/60 rounded-xl p-6">
              <p className="text-xs text-light-secondary-text font-medium mb-1">End Date</p>
              <p className="text-lg font-bold text-light-primary-text">
                {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-500/20">
        <h2 className="text-lg font-bold text-light-primary-text border-b border-gray-500/20 px-6 pb-4 pt-6">
          Applicable Products
        </h2>
        <div className="p-6">
          {!coupon.products || coupon.products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <PackageSearch className="size-8 text-gray-300" />
              <p className="text-sm text-light-secondary-text">
                This coupon applies storewide (no specific products attached).
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {coupon.products.map((product) => (
                <li key={product.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-light-primary-text font-medium">{product.name}</span>
                  <span className="text-light-secondary-text">#{product.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
