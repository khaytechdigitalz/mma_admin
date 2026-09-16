"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SaveActions({ className }: { className?: string }) {
  return (
    <div className={`flex justify-end gap-4 ${className || ""}`}>
      <Button variant="outline">Cancel</Button>
      <Button onClick={() => toast.success("Changes saved successfully!")}>
        Save Changes
      </Button>
    </div>
  );
}
