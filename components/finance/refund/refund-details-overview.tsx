"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ActionModal } from "@/components/ui/action-modal";
import { apiClient } from "@/lib/axios";
import { RefundDetailsData } from "./refund-details-client";

interface Props {
  refund: RefundDetailsData;
  onRefresh: () => void;
}

export default function RefundDetailsOverview({ refund, onRefresh }: Props) {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPending = refund.status.toLowerCase() === "pending";

  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "declined":
      case "rejected":
        return "error";
      default:
        return "info";
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await apiClient.post(`/refunds/${refund.id}/approve`, {
        admin_notes: adminNotes,
      });
      setApproveModalOpen(false);
      setAdminNotes("");
      onRefresh();
    } catch (error) {
      console.error("Failed to approve refund:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      await apiClient.post(`/refunds/${refund.id}/decline`, {
        admin_notes: adminNotes,
      });
      setRejectModalOpen(false);
      setAdminNotes("");
      onRefresh();
    } catch (error) {
      console.error("Failed to decline refund:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const detailsCards = [
    {
      label: "Requested Amount",
      value: `₦${Number(refund.refund_amount).toLocaleString()}`,
      bgClass: "bg-[#c2dcfc]", // Soft blue
    },
    {
      label: "Payment Method",
      value: refund.order?.payment_method
        ? refund.order.payment_method.toUpperCase()
        : "N/A",
      bgClass: "bg-[#fef2a0]", // Soft yellow
    },
    {
      label: "Requested Date",
      value: formatDate(refund.created_at),
      bgClass: "bg-[#c3f0aa]", // Soft green
    },
    {
      label: "Processed Date",
      value: formatDate(refund.processed_at),
      bgClass: "bg-[#fde2f4]", // Soft pink
    },
  ];

  return (
    <div>
      {/* Page Header with Action Buttons */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <PageHeader title="Details" backHref="/refunds" />
        
        {/* Approve/Reject actions render ONLY when refund is pending */}
        {isPending && (
          <div className="flex gap-3">
            <Button
              size="xs"
              className="bg-teal-700 hover:bg-teal-800 text-white"
              onClick={() => setApproveModalOpen(true)}
            >
              Approve
            </Button>
            <Button
              variant="danger-outline"
              size="xs"
              onClick={() => setRejectModalOpen(true)}
            >
              Decline
            </Button>
          </div>
        )}
      </div>

      {/* Refund Summary Container */}
      <div className="border border-gray-500/20 rounded-2xl overflow-hidden mb-4 sm:mb-6">
        <div className="px-6 py-4 border-b border-gray-500/20 bg-white">
          <h3 className="text-lg font-bold text-light-primary-text">
            Refunds Information
          </h3>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h4 className="text-xl font-bold text-light-primary-text">
              {refund.refund_no}
            </h4>
            <Badge variant={getBadgeVariant(refund.status)}>
              {refund.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {detailsCards.map((item, index) => (
              <div
                key={index}
                className={`${item.bgClass} rounded-2xl p-4 sm:p-6 flex flex-col gap-1 justify-center`}
              >
                <p className="text-xs font-semibold text-gray-700">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="border border-gray-500/20 rounded-2xl p-4 sm:p-6">
              <h5 className="text-sm font-bold text-light-primary-text mb-1">
                Reason
              </h5>
              <p className="text-sm max-w-2xl text-light-secondary-text leading-relaxed">
                {refund.reason || "No explicit reason provided."}
              </p>
            </div>

            {refund.admin_notes && (
              <div className="border border-amber-500/30 bg-amber-50/50 rounded-2xl p-4 sm:p-6">
                <h5 className="text-sm font-bold text-amber-900 mb-1">
                  Admin Notes
                </h5>
                <p className="text-sm max-w-2xl text-amber-800 leading-relaxed">
                  {refund.admin_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <ActionModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Refund"
        description={`Are you sure you want to approve refund request ${refund.refund_no}?`}
        confirmText="Approve"
        confirmVariant="teal"
        loading={submitting}
        onConfirm={handleApprove}
      >
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Admin Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Enter reference or approval comments..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </ActionModal>

      {/* Decline Modal */}
      <ActionModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Refund"
        description={`Are you sure you want to decline refund request ${refund.refund_no}?`}
        confirmText="Decline"
        confirmVariant="danger"
        loading={submitting}
        onConfirm={handleReject}
      >
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Reason / Admin Notes
          </label>
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Explain why this request is being declined..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </ActionModal>
    </div>
  );
}