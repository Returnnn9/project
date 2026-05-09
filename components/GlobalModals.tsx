"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useUIStore } from "@/store/hooks";

const LoginModal = dynamic(() => import("@/components/LoginModal"), { ssr: false });
const AddressModal = dynamic(() => import("@/components/AddressModal"), { ssr: false });
const CheckoutModal = dynamic(() => import("@/components/CheckoutModal"), { ssr: false });
const ProductDetailsModal = dynamic(() => import("@/components/ProductDetailsModal"), { ssr: false });

export default function GlobalModals() {
  const isAuthOpen = useUIStore((s) => s.isAuthModalOpen);
  const isAddressOpen = useUIStore((s) => s.isAddressModalOpen);
  const isCheckoutOpen = useUIStore((s) => s.isCheckoutOpen);
  const isProductOpen = useUIStore((s) => s.selectedProduct !== null);

  useEffect(() => {
    const isAnyModalOpen = isAuthOpen || isAddressOpen || isCheckoutOpen || isProductOpen;
    
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "var(--removed-body-scroll-bar-size, 0px)";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isAuthOpen, isAddressOpen, isCheckoutOpen, isProductOpen]);

  return (
    <>
      {isAuthOpen && <LoginModal />}
      {isAddressOpen && <AddressModal />}
      {isCheckoutOpen && <CheckoutModal />}
      {isProductOpen && <ProductDetailsModal />}
    </>
  );
}
