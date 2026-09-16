"use client";

import { useState } from "react";
import Switch from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface PaymentApiFormCardProps {
  id: number;
  slug: string;
  title: string;
  description: string;
  isActive: boolean;
  logo: string;
  publicKey: string;
  secretKey: string;
  webhookEndpoint: string;
  onToggle: (id: number, nextState: boolean) => void;
  onUpdate: (slug: string, data: { public_key: string; secret_key: string; webhook_endpoint: string }) => Promise<void>;
}

export default function PaymentApiFormCard({
  id,
  slug,
  title,
  description,
  isActive,
  logo,
  publicKey,
  secretKey,
  webhookEndpoint,
  onToggle,
  onUpdate,
}: PaymentApiFormCardProps) {
  const [pubKey, setPubKey] = useState(publicKey || "");
  const [secKey, setSecKey] = useState(secretKey || "");
  const [webhook, setWebhook] = useState(webhookEndpoint || "");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onUpdate(slug, {
      public_key: pubKey,
      secret_key: secKey,
      webhook_endpoint: webhook,
    });
    setSubmitting(false);
  };

  const handleSwitchChange = async (nextState: boolean) => {
    setToggling(true);
    await onToggle(id, nextState);
    setToggling(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-500/20 rounded-2xl p-4 sm:p-5 bg-white flex flex-col justify-between gap-5 shadow-sm">
      <div className="flex justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="size-12 rounded-full overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Image
              src={logo}
              alt={title}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-light-primary-text text-base mb-0.5">
              {title}
            </h4>
            <p className="text-xs text-light-secondary-text">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toggling && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          <Switch checked={isActive} onChange={(val) => handleSwitchChange(val)} disabled={toggling} />
        </div>
      </div>

      <div className="space-y-4">
        <FloatingInput
          label="Public Key"
          value={pubKey}
          onChange={(e) => setPubKey(e.target.value)}
          className="h-10"
        />

        {/* Secret Key Input with Lucide Eye/EyeOff Toggle */}
        <div className="relative">
          <FloatingInput
            label="Secret Key"
            type={showSecretKey ? "text" : "password"}
            value={secKey}
            onChange={(e) => setSecKey(e.target.value)}
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowSecretKey((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showSecretKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <FloatingInput
          label="Webhook Endpoint"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          className="h-10"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
       
        <Button
          type="submit"
          size="xs"
          disabled={submitting}
          className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-4"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}