"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { Loader2, PackageSearch } from "lucide-react";

interface FlashSaleProduct {
  id: number;
  name: string;
}

/**
 * Lists the products actually included in this flash sale (from the real
 * /flash-sales/{id} response's `products` array). Previously this panel
 * showed a single hardcoded fake "Product Name" with a fabricated category,
 * description, slug, and seller that the API doesn't return - rather than
 * invent fields your backend doesn't provide, this shows what's real.
 */
export default function FlashSaleBasicInfo() {
  const params = useParams();
  const flashSaleId = params?.id as string;

  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flashSaleId) return;

    const fetchSale = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/flash-sales/${flashSaleId}`);
        const data = response.data?.data || response.data;
        setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (err: any) {
        console.error("Failed to fetch flash sale products:", err);
        setError(err?.response?.data?.message || "Failed to load included products.");
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [flashSaleId]);

  return (
    <div className="bg-white rounded-2xl border border-gray-500/20">
      <h2 className="text-lg font-bold text-light-primary-text border-b border-gray-500/20 px-6 pb-4 pt-6">
        Included Products
      </h2>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-teal-700" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <PackageSearch className="size-8 text-gray-300" />
            <p className="text-sm text-light-secondary-text">
              No products are attached to this flash sale.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-light-primary-text font-medium">{product.name}</span>
                <span className="text-light-secondary-text">#{product.id}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
