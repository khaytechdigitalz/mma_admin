"use client";

import GeneralSettingsForm from "@/components/settings/general-settings-form";
import Notifications from "@/components/settings/general/notifications";
import { toast } from "sonner";

export default function GeneralSettingsClientPage() {
  const handleSave = () => {
    toast.success("Settings have been saved successfully");
  };

  return (
    <div className="space-y-4">
      <GeneralSettingsForm />
      <Notifications />
    </div>
  );
}
