import React from "react";
import PaymentApiSettings from "@/components/settings/payment/payment-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment API Settings",
  description: "Configure payment API integrations.",
};

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-6">
      <PaymentApiSettings />
    </div>
  );
}
