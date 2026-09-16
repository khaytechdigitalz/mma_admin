import type { Metadata } from "next";
import GeneralSettingsClientPage from "@/components/settings/general";

export const metadata: Metadata = {
  title: "General Settings",
  description: "Manage your general account and application settings.",
};

export default function GeneralSettingsPage() {
  return <GeneralSettingsClientPage />;
}
