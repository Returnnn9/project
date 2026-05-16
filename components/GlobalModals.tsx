"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useUIStore, useUserStore } from "@/store/hooks";

const LoginModal = dynamic(() => import("@/components/LoginModal"), { ssr: false });
const AddressModal = dynamic(() => import("@/components/AddressModal"), { ssr: false });
const CheckoutModal = dynamic(() => import("@/components/CheckoutModal"), { ssr: false });
const ProductDetailsModal = dynamic(() => import("@/components/ProductDetailsModal"), { ssr: false });

export default function GlobalModals() {
  const isAuthOpen = useUIStore((s) => s.isAuthModalOpen);
  const isAddressOpen = useUIStore((s) => s.isAddressModalOpen);
  const setAddressModalOpen = useUIStore((s) => s.setAddressModalOpen);
  const isCheckoutOpen = useUIStore((s) => s.isCheckoutOpen);
  const isProductOpen = useUIStore((s) => s.selectedProduct !== null);
  const isCartOpen = useUIStore((s) => s.isCartOpen);
  const hasSetAddress = useUserStore((s) => s.hasSetAddress);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasSetAddress) {
        setAddressModalOpen(true);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [hasSetAddress, setAddressModalOpen]);

  useEffect(() => {
    const isAnyModalOpen = isAuthOpen || isAddressOpen || isCheckoutOpen || isProductOpen || isCartOpen;

    if (isAnyModalOpen) {
      // Only lock if not already locked — avoids clobbering saved scroll position
      if (document.body.style.position !== "fixed") {
        scrollYRef.current = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollYRef.current}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      }
    } else {
      if (document.body.style.position === "fixed") {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollYRef.current);
      }
    }
  }, [isAuthOpen, isAddressOpen, isCheckoutOpen, isProductOpen, isCartOpen]);

  return (
    <>
      <LoginModal />
      <AddressModal />
      <CheckoutModal />
      <ProductDetailsModal />
    </>
  );
}
