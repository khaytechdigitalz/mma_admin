"use client";

import React from "react";
import SettingTabs from "@/components/settings/setting-tabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" bg-white rounded-2xl ">
      <div className="mb-1 px-4 sm:px-6 pt-4 sm:pt-6">
        <h2 className="text-xl font-bold text-light-primary-text">Settings</h2>
      </div>
      <SettingTabs />
      <div className="mt-6 px-4 sm:px-6 pb-4 sm:pb-6">{children}</div>
    </div>
  );
}
