"use client";

import { useState, useEffect, useCallback } from "react";
import Switch from "@/components/ui/switch";
import { BellIcon } from "@/icons";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  color: string;
  active: boolean;
}

const notificationConfigTemplate: Omit<NotificationItem, "active">[] = [
  {
    id: "sms_notification",
    title: "SMS Notifications",
    description: "Receive instant text messages regarding order status, delivery tracking, and security alerts.",
    color: "bg-accent-1/60",
  },
  {
    id: "email_notification",
    title: "Email Notifications",
    description: "Get detailed summaries, promotional offers, receipts, and account updates straight to your inbox.",
    color: "bg-accent-2/60",
  },
  {
    id: "push_notification",
    title: "Push Notifications",
    description: "Allow browser or app push alerts for real-time updates, flash sales, and live support messages.",
    color: "bg-accent-3/60",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch settings and map the notification object
  const fetchNotificationSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      if (response.data?.status && response.data?.data?.notification) {
        const remoteSettings = response.data.data.notification;

        const mapped = notificationConfigTemplate.map((item) => {
          const remoteVal = remoteSettings[item.id];
          // Checks if value is "1", 1, or true
          const isActive = remoteVal === "1" || remoteVal === 1 || remoteVal === true;
          return {
            ...item,
            active: isActive,
          };
        });

        setNotifications(mapped);
      }
    } catch (err: any) {
      console.error("Failed to fetch notification settings:", err);
      toast.error(err?.response?.data?.message || "Failed to load notification settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificationSettings();
  }, [fetchNotificationSettings]);

  // Handle switch toggle and PATCH update
  const toggle = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    const nextState = !target.active;

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: nextState } : n))
    );

    try {
      setUpdatingId(id);
      const response = await apiClient.patch(`/settings/notification/${id}`, {
        status: nextState ? 1 : 0,
        active: nextState,
      });
      toast.success(response.data?.message || "Notification preference updated successfully.");
    } catch (err: any) {
      console.error("Failed to update notification setting:", err);
      toast.error(err?.response?.data?.message || "Failed to update notification preference.");
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, active: !nextState } : n))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-500/20 flex items-center justify-center min-h-[350px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
      <h3 className="text-lg font-bold text-light-primary-text">
        System Preferences
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl relative p-5 ${item.color} shadow-sm flex flex-col justify-between transition-all`}
          >
            <div className="flex justify-between items-start gap-5 sm:gap-10 pr-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="size-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <BellIcon className="size-6 text-light-primary-text" />
                </div>
                <div>
                  <h4 className="font-bold text-base mb-1.5 text-light-primary-text">
                    {item.title}
                  </h4>
                  <p className="text-sm text-light-secondary-text leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-4 flex items-center gap-2">
              {updatingId === item.id && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              )}
              <Switch
                checked={item.active}
                onChange={() => toggle(item.id)}
                disabled={updatingId === item.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}