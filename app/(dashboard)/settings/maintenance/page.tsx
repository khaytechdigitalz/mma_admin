import React from "react";
import MaintenanceForm from "@/components/settings/maintainace/maintainance-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Mode",
  description: "Manage shop maintenance mode settings.",
};

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <MaintenanceForm />
    </div>
  );
}
