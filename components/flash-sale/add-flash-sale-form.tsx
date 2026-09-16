"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import StatusSelect, { Option } from "@/components/ui/status-select";
import DatePicker from "@/components/ui/date-picker";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Percent, Banknote, Search, X, Tag, Loader2 } from "lucide-react";

interface ProductOption {
  id: number;
  name: string;
}

const statusOptions: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AddFlashSaleForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Product Search & Multi-Selection State
  const [productQuery, setProductQuery] = useState("");
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Products via API with Search Filter
  const fetchProducts = useCallback(async (searchQuery: string) => {
    try {
      setIsSearchingProducts(true);
      const response = await apiClient.get("/products", {
        params: {
          page: 1,
          search: searchQuery.trim(),
        },
      });

      if (response.data?.status || response.status === 200) {
        const items =
          response.data?.data?.data ||
          response.data?.products?.data ||
          response.data?.data ||
          [];
        setProductOptions(
          items.map((item: any) => ({
            id: item.id,
            name: item.name || item.title || `Product #${item.id}`,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsSearchingProducts(false);
    }
  }, []);

  // Debounced product search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(productQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [productQuery, fetchProducts]);

  // Click outside listener for dropdown cleanup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelectProduct = (product: ProductOption) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const removeProduct = (id: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDateToMySQL = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} 00:00:00`;
  };

  const formatEndDateToMySQL = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} 23:59:59`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Please enter a flash sale title.");
    if (!discount || isNaN(Number(discount))) return toast.error("Please enter a valid discount amount.");
    if (!startDate) return toast.error("Please select a start date.");
    if (!endDate) return toast.error("Please select an end date.");
    if (selectedProducts.length === 0) return toast.error("Please select at least one product for the flash sale.");

    const payload = {
      title: title.trim(),
      start_date: formatDateToMySQL(startDate),
      end_date: formatEndDateToMySQL(endDate),
      discount_type: discountType,
      discount: Number(discount),
      product_id: selectedProducts.map((p) => p.id),
      is_active: status?.value === "active" || status?.value === 1,
    };

    try {
      setSubmitting(true);
      const response = await apiClient.post("/flash-sales", payload);

      toast.success(response.data?.message || "Flash sale created successfully!");
      router.push("/flash-sales");
    } catch (err: any) {
      console.error("Error creating flash sale:", err);
      toast.error(err?.response?.data?.message || "Failed to create flash sale.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <PageHeader
            title="Create New Flash Sales"
            backHref="/flash-sales"
            className="gap-4"
          />
        </div>
        <div className="w-40">
          <StatusSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
        <h2 className="text-lg font-bold text-light-primary-text">
          Basic Information
        </h2>

        {/* Discount Type Radio Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Discount Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                discountType === "percentage"
                  ? "border-teal-600 bg-teal-50/40 text-teal-900 shadow-2xs"
                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="discount_type"
                value="percentage"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold">Percentage Discount (%)</span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                discountType === "flat"
                  ? "border-teal-600 bg-teal-50/40 text-teal-900 shadow-2xs"
                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="discount_type"
                value="flat"
                checked={discountType === "flat"}
                onChange={() => setDiscountType("flat")}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold">Fixed Amount (₦)</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Title & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput
              label="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <FloatingInput
              label={discountType === "percentage" ? "Discount Percentage (%)" : "Discount Amount (₦)"}
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder={discountType === "percentage" ? "35" : "2500"}
              required
            />
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              label="Start Date"
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              label="End Date"
            />
          </div>
        </div>
      </div>

      {/* Add Product for Discount */}
      <div className="rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
        <h2 className="text-lg font-bold text-light-primary-text">
          Add Product for Discount
        </h2>

        {/* Search Input & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product by name..."
              value={productQuery}
              onFocus={() => setShowProductDropdown(true)}
              onChange={(e) => {
                setProductQuery(e.target.value);
                setShowProductDropdown(true);
              }}
              className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
            />
            {isSearchingProducts && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-teal-600" />
            )}
          </div>

          {/* Selected Product Chips */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {selectedProducts.map((prod) => (
                <span
                  key={prod.id}
                  className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 text-xs font-medium px-3 py-1.5 rounded-lg border border-teal-200/60"
                >
                  <Tag className="w-3.5 h-3.5 text-teal-600" />
                  {prod.name}
                  <button
                    type="button"
                    onClick={() => removeProduct(prod.id)}
                    className="hover:text-red-500 transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Dropdown Options List */}
          {showProductDropdown && (
            <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100">
              {productOptions.length === 0 ? (
                <div className="p-4 text-xs text-center text-gray-400">
                  {isSearchingProducts ? "Searching products..." : "No products found"}
                </div>
              ) : (
                productOptions.map((prod) => {
                  const isSelected = selectedProducts.some((p) => p.id === prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleSelectProduct(prod)}
                      className={`flex items-center justify-between p-3 text-sm cursor-pointer transition-colors ${
                        isSelected ? "bg-teal-50/50 text-teal-900 font-medium" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{prod.name}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-8"
          onClick={() => router.push("/flash-sales")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-full px-8 bg-teal-700 hover:bg-teal-800 text-white min-w-[120px]"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </form>
  );
}