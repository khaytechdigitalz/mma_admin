"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { apiClient } from "@/lib/axios";
import { SearchIcon } from "@/icons";
import { Loader2, Package, Users, ShoppingCart } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResultItem {
  id: number | string;
  label: string;
  sublabel?: string;
  href: string;
}

/**
 * Global cross-entity search (products/customers/orders), triggered from the
 * header search icon. Previously this rendered a static "Wireless Bluetooth
 * Headphones"-style fake product list with an "Add/Remove" toggle UX that
 * didn't correspond to any real search or action - replaced with real,
 * debounced lookups against the same endpoints the individual list pages use.
 */
export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ResultItem[]>([]);
  const [customers, setCustomers] = useState<ResultItem[]>([]);
  const [orders, setOrders] = useState<ResultItem[]>([]);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setProducts([]);
      setCustomers([]);
      setOrders([]);
      setSearched(false);
    }
  }

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setCustomers([]);
      setOrders([]);
      setSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.allSettled([
          apiClient.get("/products", { params: { search: query, per_page: 5 } }),
          apiClient.get("/customers", { params: { search: query, per_page: 5 } }),
          apiClient.get("orders", { params: { order_no: query, per_page: 5 } }),
        ]);

        if (productsRes.status === "fulfilled") {
          const list = productsRes.value.data?.data?.data || [];
          setProducts(
            list.map((p: any) => ({ id: p.id, label: p.name, href: `/products/edit/${p.id}` })),
          );
        }
        if (customersRes.status === "fulfilled") {
          const list = customersRes.value.data?.data?.data || [];
          setCustomers(
            list.map((c: any) => ({ id: c.id, label: c.name, sublabel: c.email, href: `/customers/${c.id}` })),
          );
        }
        if (ordersRes.status === "fulfilled") {
          const list = ordersRes.value.data?.data?.data || [];
          setOrders(
            list.map((o: any) => ({
              id: o.id,
              label: `Order #${o.order_no || o.id}`,
              sublabel: o.status,
              href: `/order-details?id=${o.id}`,
            })),
          );
        }
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const goTo = (href: string) => {
    router.push(href);
    onClose();
  };

  const noResults =
    searched && !loading && products.length === 0 && customers.length === 0 && orders.length === 0;

  const renderGroup = (title: string, icon: React.ReactNode, items: ResultItem[]) =>
    items.length > 0 && (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          {icon} {title}
          <span className="ml-1 text-xs font-normal text-gray-400">({items.length})</span>
        </h4>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.href)}
              className="flex w-full items-center justify-between h-auto py-2 px-3 text-left bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm text-gray-700 font-medium">{item.label}</p>
                {item.sublabel && <p className="text-xs text-gray-400">{item.sublabel}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl transition-all duration-300 data-closed:scale-95 data-closed:opacity-0"
        >
          <div className="p-4 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-light-primary-text" />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-gray-400" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, customers, orders..."
                autoFocus
                className="w-full h-9 pl-9 pr-9 border border-gray-500/20 rounded-full text-sm focus:outline-none bg-white focus:border-primary"
              />
            </div>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            {!query.trim() ? (
              <div className="text-center py-8 text-sm text-gray-400">
                Start typing to search across products, customers, and orders.
              </div>
            ) : noResults ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <>
                {renderGroup("Products", <Package className="size-4" />, products)}
                {renderGroup("Customers", <Users className="size-4" />, customers)}
                {renderGroup("Orders", <ShoppingCart className="size-4" />, orders)}
              </>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
