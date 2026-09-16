"use client";

import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthProvider } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  defaultUserRole?: "master" | "seller";
}

export default function DashboardLayout({
  children,
  defaultUserRole = "master",
}: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileSidebarOpen(false);
  }

  return (
    // AuthProvider was defined in context/AuthContext.tsx but never actually
    // mounted anywhere - useAuth()/hasPermission() would throw if called.
    // Mounted here so it covers the whole dashboard shell (sidebar, header,
    // every page) in one place.
    <AuthProvider>
      <div className="xl:flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isDesktopCollapsed}
          toggleCollapse={() => setIsDesktopCollapsed((prev) => !prev)}
        />

        {/* Main Content Wrapper */}
        <div
          className={`flex-1 min-w-0 flex flex-col bg-[rgba(0,171,85,0.08)] transition-[margin] duration-300 ml-0 ${
            isDesktopCollapsed ? "xl:ml-[80px]" : "xl:ml-[280px]"
          }`}
        >
          {/* Header */}
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {/* Main Content Area */}
          <main style={{ backgroundColor: "#ede9fe" }} className="flex-1 py-4 px-4 lg:p-6 xl:px-10  overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
