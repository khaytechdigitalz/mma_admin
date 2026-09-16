"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";

interface UpdatePaymentStatusModalProps {
  orderId: number;
  currentStatus: string;
  currentRef?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_STATUSES = ["unpaid", "paid", "partially_paid", "refunded"];

export function UpdatePaymentStatusModal({
  orderId,
  currentStatus,
  currentRef,
  isOpen,
  onClose,
  onSuccess,
}: UpdatePaymentStatusModalProps) {
  const [paymentStatus, setPaymentStatus] = useState(currentStatus || "unpaid");
  const [transactionRef, setTransactionRef] = useState(currentRef || "");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post(`orders/${orderId}/update-payment-status`, {
        payment_status: paymentStatus,
        transaction_ref: transactionRef,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update payment status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-light-primary-text">Update Payment Status</h3>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-light-secondary-text">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 capitalize"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-light-secondary-text">
              Transaction Reference
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. TXN-123456"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-light-secondary-text">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comment..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Updating..." : "Update Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}