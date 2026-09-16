import AbandonCartList from "@/components/abandon-cart/abandon-cart-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abandoned Cart",
  description: "View and manage abandoned shopping carts.",
};

export default function AbandonCartPage() {
  return <AbandonCartList />;
}
