"use client";

import React, { useState, useEffect, useCallback } from "react";
import PaymentApiFormCard from "./payment-api-form-card";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Gateway {
  id: number;
  name: string;
  slug: string;
  public_key: string;
  secret_key: string;
  webhook_endpoint: string;
  is_active: boolean;
}

const paymentLogosMap: Record<string, string> = {
  paystack: "/images/payment-logo/paystack.jpg", 
  flutterwave: "/images/payment-logo/flutterwave.png",
  stripe: "/images/payment-logo/stripe.jpeg",
  paypal: "/images/payment-logo/paypal.jpg",
  razorpay: "/images/payment-logo/razor.jpg",
  skrill: "/images/payment-logo/skrill.jpg",
  apple_pay: "/images/payment-logo/apple.png",
  google_pay: "/images/payment-logo/google.jpeg",
};

export default function PaymentApiSettings() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch gateways from API
  const fetchGateways = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/payment-gateways");
      if (response.data?.status) {
        setGateways(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load payment gateways:", err);
      toast.error(err?.response?.data?.message || "Failed to load payment gateways.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  // Handle Switch Status Toggle -> PATCH payment-gateways/status/[id]
  const handleToggleStatus = async (id: number, nextState: boolean) => {
    try {
      const response = await apiClient.patch(`/payment-gateways/status/${id}`, {
        status: nextState ? 1 : 0,
      });
      if (response.data?.status) {
        toast.success(response.data.message || "Gateway status updated successfully!");
        setGateways((prev) =>
          prev.map((g) => (g.id === id ? { ...g, is_active: nextState } : g))
        );
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error(err?.response?.data?.message || "Failed to update gateway status.");
    }
  };

  // Handle Form Submission -> POST /payment-gateways/{slug}
  const handleUpdateGateway = async (slug: string, data: { public_key: string; secret_key: string; webhook_endpoint: string }) => {
    try {
      const response = await apiClient.post(`/payment-gateways/${slug}`, data);
      if (response.data?.status) {
        toast.success(response.data.message || "Payment settings saved successfully!");
      }
    } catch (err: any) {
      console.error("Failed to update gateway settings:", err);
      toast.error(err?.response?.data?.message || "Failed to update payment settings.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-500/20 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading payment configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
      <h3 className="text-lg font-bold text-light-primary-text">
        Payment API Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {gateways.map((item) => {
          const logoPath = paymentLogosMap[item.slug] || "/images/payment-logo/stripe.jpeg";
          return (
            <PaymentApiFormCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              title={item.name}
              description="Online payment processing"
              logo={logoPath}
              isActive={item.is_active}
              publicKey={item.public_key}
              secretKey={item.secret_key}
              webhookEndpoint={item.webhook_endpoint}
              onToggle={handleToggleStatus}
              onUpdate={handleUpdateGateway}
            />
          );
        })}
      </div>
    </div>
  );
}