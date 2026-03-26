"use client";

import dynamic from "next/dynamic";
import { useUIStore, useStoreData } from "@/store/hooks";

// Dynamically import modals with No SSR to prevent hydration errors
// and heavily reduce the initial server-rendered HTML payload.
const LoginModal = dynamic(() => import("@/components/LoginModal"), { ssr: false });
const AddressModal = dynamic(() => import("@/components/AddressModal"), { ssr: false });
const CheckoutModal = dynamic(() => import("@/components/CheckoutModal"), { ssr: false });
const ProductDetailsModal = dynamic(() => import("@/components/ProductDetailsModal"), { ssr: false });

export default function GlobalModals() {
  const uiStore = useUIStore();
  
  // We can conditionally mount them based on store state to save even more memory/DOM nodes
  // But for now, they have their own inner AnimatePresence rendering logic.
  // Rendering them here globally avoids duplication across pages.
  const isAuthOpen = useStoreData(uiStore, (s) => s.getIsAuthModalOpen());
  const isAddressOpen = useStoreData(uiStore, (s) => s.getIsAddressModalOpen());
  const isCheckoutOpen = useStoreData(uiStore, (s) => s.getIsCheckoutOpen());
  const isProductOpen = useStoreData(uiStore, (s) => s.getSelectedProduct() !== null);

  return (
    <>
      {isAuthOpen && <LoginModal />}
      {isAddressOpen && <AddressModal />}
      {isCheckoutOpen && <CheckoutModal />}
      {isProductOpen && <ProductDetailsModal />}
    </>
  );
}
