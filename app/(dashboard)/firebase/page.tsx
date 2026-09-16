"use client";

import React from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FloatingSelect } from "@/components/ui/floating-select";

export default function FirebasePage() {
  return (
    <div className="sm:space-y-6 space-y-4 bg-white p-4 sm:p-6 rounded-2xl">
      <h1 className="text-xl font-bold text-light-primary-text">Firebase</h1>
      <DashboardCard title="Firebase Configuration">
        <div className=" grid grid-cols-1 gap-6 md:grid-cols-2">
          <FloatingInput
            label="Service account content"
            defaultValue={
              process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT || ""
            }
          />
          <FloatingInput
            label="Api Key"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""}
          />

          <FloatingSelect
            label="Auth Domain"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ""}
          >
            <option value="drivevalley-fdb7f">
              drivevalley-fdb7f.firebaseapp.com
            </option>
            <option value="market-my-art-dashboard">
              market-my-art-dashboard.firebaseapp.com
            </option>
            <option value="example-app">example-app.firebaseapp.com</option>
          </FloatingSelect>
          <FloatingInput
            label="Project ID"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}
          />

          <FloatingInput
            label="Storage Bucket"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""}
          />
          <FloatingInput
            label="Messaging Sender ID"
            defaultValue={
              process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ""
            }
          />

          <FloatingInput
            label="App ID"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""}
          />
          <FloatingInput
            label="Measurement ID"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""}
          />
        </div>
      </DashboardCard>

      <DashboardCard title="Firebase Authentication">
        <div className="mt-4">
          <FloatingInput
            label="Web Api Key"
            defaultValue={process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY || ""}
          />
        </div>
      </DashboardCard>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={() => toast.success("Changes saved successfully!")}>
          Save Change
        </Button>
      </div>
    </div>
  );
}
