"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import FlashSaleInfo from "./flash-sale-info";
import FlashSaleBasicInfo from "./flash-sale-basic-info";

export default function FlashSaleDetails() {
  const params = useParams();
  const flashSaleId = params?.id as string;

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Details" backHref="/flash-sales" className="gap-4" />
        <Button variant="outline" href={`/flash-sales/edit/${flashSaleId}`}>
          Edit
        </Button>
      </div>

      {/* Flash Sales Information */}
      <FlashSaleInfo />

      {/* Basic Information */}
      <FlashSaleBasicInfo />
    </div>
  );
}
