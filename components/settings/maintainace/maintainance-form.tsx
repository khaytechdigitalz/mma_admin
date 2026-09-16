"use client";

import { useState, useEffect, useCallback } from "react";
import Switch from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import FileUploader from "@/components/ui/file-uploader";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function MaintenanceForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMode2, setMaintenanceMode2] = useState(false); // Extra switch as present in layout
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [reopenTime, setReopenTime] = useState<Date | undefined>();

  // Fetch settings to initialize state
  const fetchMaintenanceSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/settings");
      if (response.data?.status && response.data?.data?.maintenance) {
        const maintenance = response.data.data.maintenance;
        setMaintenanceMode(Boolean(maintenance.maintenance_mode));
        setMaintenanceMessage(maintenance.maintenance_message || "");
      }
    } catch (err: any) {
      console.error("Failed to load maintenance settings:", err);
      toast.error(err?.response?.data?.message || "Failed to load maintenance settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceSettings();
  }, [fetchMaintenanceSettings]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage,
      };

      const response = await apiClient.post("/settings/maintenance", payload);
      if (response.data?.status || response.status === 200) {
        toast.success(response.data?.message || "Maintenance settings saved successfully!");
      }
    } catch (err: any) {
      console.error("Failed to save maintenance settings:", err);
      toast.error(err?.response?.data?.message || "Failed to save maintenance settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-500/20 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading maintenance settings...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
      <h3 className="text-lg font-bold text-light-primary-text">
        Maintenance Mode
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6">
        <div className="border border-gray-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-light-primary-text text-base mb-1">
              Maintenance Mode
            </h4>
            <p className="text-sm text-light-secondary-text">
              Enable or disable site maintenance mode
            </p>
          </div>
          <Switch checked={maintenanceMode} onChange={setMaintenanceMode} />
        </div>

        
      </div>

      

      <div>
        <FloatingTextarea
          id="maintenance_message"
          label="Maintenance Message"
          value={maintenanceMessage}
          onChange={(e) => setMaintenanceMessage(e.target.value)}
          className="h-24 resize-none"
          required
        />
      </div>
 

      <div className="flex justify-end gap-4 pt-4 sm:pt-6 border-t border-gray-100"> 
        <Button
          type="submit"
          disabled={submitting}
          className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-6"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save Change"
          )}
        </Button>
      </div>
    </form>
  );
}