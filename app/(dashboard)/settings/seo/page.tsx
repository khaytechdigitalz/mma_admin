
import HomePageSeo from "@/components/settings/seo/home-page-seo";
import GlobalPageSeo from "@/components/settings/seo/global-seo";
import type { Metadata } from "next";
import SaveActions from "@/components/settings/save-actions";

export const metadata: Metadata = {
  title: "SEO Settings",
  description: "Manage SEO settings for your shop.",
};

export default function SeoSettingsPage() {
  return (
    <div className="space-y-4">
      <GlobalPageSeo />
      <HomePageSeo /> 
    </div>
  );
}
