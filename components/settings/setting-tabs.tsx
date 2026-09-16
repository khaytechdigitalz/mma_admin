"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "General", href: "/settings/general" },
  { name: "SEO", href: "/settings/seo" },
  { name: "Payment API", href: "/settings/payment-api" },
  { name: "Maintains", href: "/settings/maintenance" },
];

export default function SettingTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-500/20 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
      <nav
        className="-mb-px flex space-x-6 sm:space-x-10 min-w-max"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "whitespace-nowrap py-3 border-b-3 font-semibold text-sm transition-colors",
                isActive
                  ? "border-primary text-light-primary-text"
                  : "border-transparent text-light-secondary-text hover:text-light-primary-text hover:border-gray-300",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
