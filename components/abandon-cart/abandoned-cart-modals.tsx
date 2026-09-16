"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 1. Send Individual Notification Modal
export function SendNotificationModal({
  cartId,
  userEmail,
  isOpen,
  onClose,
  onSuccess,
}: ActionModalProps & { cartId: number | null; userEmail?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cartId) return null;

  const handleSend = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post(`abandoned-carts/${cartId}/send-notification`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send notification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-light-primary-text">Send Reminder</h3>
        <p className="text-sm text-light-secondary-text">
          Are you sure you want to send an abandoned cart reminder notification to{" "}
          <span className="font-semibold text-light-primary-text">{userEmail || "this user"}</span>?
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSend} disabled={submitting}>
            {submitting ? "Sending..." : "Send Reminder"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 2. Send Bulk Notifications Modal
export function SendBulkNotificationModal({
  isOpen,
  onClose,
  onSuccess,
}: ActionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendBulk = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post("abandoned-carts/send-bulk-notifications");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send bulk notifications.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-light-primary-text">Send Bulk Reminders</h3>
        <p className="text-sm text-light-secondary-text">
          Are you sure you want to trigger abandoned cart reminder notifications to all unnotified users?
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSendBulk} disabled={submitting}>
            {submitting ? "Sending..." : "Send Bulk Notifications"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 3. Delete Cart Modal
export function DeleteCartModal({
  cartId,
  isOpen,
  onClose,
  onSuccess,
}: ActionModalProps & { cartId: number | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cartId) return null;

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await apiClient.delete(`abandoned-carts/${cartId}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete abandoned cart.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-light-primary-text">Clear Abandoned Cart</h3>
        <p className="text-sm text-light-secondary-text">
          Are you sure you want to remove Cart <span className="font-semibold text-light-primary-text">#{cartId}</span>? This action cannot be undone.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={submitting}>
            {submitting ? "Deleting..." : "Clear Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 4. View Cart Details Modal
export function CartDetailsModal({
  cart,
  isOpen,
  onClose,
}: {
  cart: any | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !cart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-light-primary-text">
            Cart Details - #{cart.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-light-secondary-text">User Name</p>
            <p className="font-semibold text-light-primary-text">{cart.user?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-light-secondary-text">Email</p>
            <p className="font-semibold text-light-primary-text">{cart.user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-light-secondary-text">Status</p>
            <p className="font-semibold text-light-primary-text capitalize">{cart.status}</p>
          </div>
          <div>
            <p className="text-light-secondary-text">Grand Total</p>
            <p className="font-semibold text-light-primary-text">${cart.grand_total}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 text-light-primary-text">Cart Items</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Qty</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs font-medium text-light-primary-text">
                      {item.product?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-light-secondary-text">
                      {item.product?.sku || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-light-secondary-text">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-xs text-light-secondary-text">
                      ${item.unit_price}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-light-primary-text">
                      ${item.total_price}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}