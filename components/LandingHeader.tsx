"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { Menu, X } from "lucide-react"
import { motion, AnimatePresence, Variants, useScroll, useMotionValueEvent } from "framer-motion"
import { CONTACT } from "@/lib/constants/contact"

const NAV_LINKS = [
 { label: "меню", href: "/#menu" },
 { label: "доставка", href: "/#delivery" },
 { label: "новости", href: "/#news" },
 { label: "контакты", href: "/#contacts" },
 { label: "faq", href: "/#faq" },
] as const

const SCROLL_THRESHOLD = 20

const menuVariants: Variants = {
 hidden: { opacity: 0 },
 show: {
  opacity: 1,
  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
 },
}

const itemVariants: Variants = {
 hidden: { opacity: 0, y: 30 },
 show: {
  opacity: 1,
  y: 0,
  transition: { type: "spring" as const, stiffness: 300, damping: 24 },
 },
}

const LandingHeader: React.FC = () => {
 const [isScrolled, setIsScrolled] = useState(false)
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
 const { scrollY } = useScroll()

 useMotionValueEvent(scrollY, "change", (latest) => {
  setIsScrolled(latest > SCROLL_THRESHOLD)
 })

 useEffect(() => {
  if (isMobileMenuOpen) {
   const scrollY = window.scrollY
   document.body.style.position = "fixed"
   document.body.style.top = `-${scrollY}px`
   document.body.style.width = "100%"
   document.body.style.overflow = "hidden"
   document.body.dataset.menuScrollY = String(scrollY)
  } else {
   const savedY = parseInt(document.body.dataset.menuScrollY || "0", 10)
   document.body.style.position = ""
   document.body.style.top = ""
   document.body.style.width = ""
   document.body.style.overflow = ""
   delete document.body.dataset.menuScrollY
   window.scrollTo(0, savedY)
  }
 }, [isMobileMenuOpen])

 const openMenu = () => setIsMobileMenuOpen(true)
 const closeMenu = () => setIsMobileMenuOpen(false)

 return (
  <>
   <motion.header
    initial="top"
    animate={isScrolled ? "scrolled" : "top"}
    variants={{
     top: {
      backgroundColor: "rgba(253, 248, 237, 0)",
      backdropFilter: "blur(0px)",
      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
      paddingTop: "24px",
      paddingBottom: "24px",
     },
     scrolled: {
      backgroundColor: "rgba(244, 238, 233, 1)",
      backdropFilter: "blur(0px)",
      boxShadow: "0 10px 30px -10px rgba(100,70,50,0.2)",
      paddingTop: "16px",
      paddingBottom: "16px",
     }
    }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="fixed top-0 left-0 w-full z-[100] px-4 md:px-8 xl:px-12 flex items-center justify-between"
   >
    <div className="lg:hidden flex-1 flex items-center justify-start">
     <button
      onClick={openMenu}
      className="p-2 -ml-2 text-[#936746] hover:text-[#B54442] transition-colors active:scale-95 group"
      aria-label="Открыть меню"
     >
      <Menu className="w-8 h-8 group-hover:drop-shadow-sm transition-all" strokeWidth={1.5} />
     </button>
    </div>

    <nav className="hidden lg:flex flex-1 items-center justify-start gap-4 xl:gap-14 text-[15px] font-[800] tracking-wide text-[#936746]">
     {NAV_LINKS.map((link) => (
      <Link
       key={link.label}
       href={link.href}
       className="relative group lowercase transition-colors hover:text-[#B54442] text-[#936746] py-2"
      >
       <span className="relative z-10">{link.label}</span>
       <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#B54442] group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
      </Link>
     ))}
    </nav>

    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
     <Link href="/" className="flex items-center group">
      <motion.div
       variants={{
        top: { scale: 1 },
        scrolled: { scale: 0.9 }
       }}
       transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
       className="relative origin-center hover:scale-105 transition-transform duration-500 ease-out py-1"
      >
       <Image
        src="/images/Logoo.png"
        alt={CONTACT.siteName}
        width={90}
        height={90}
        className="w-[60px] md:w-[75px] lg:w-[90px] h-auto object-contain drop-shadow-sm group-hover:drop-shadow-md"
       />
      </motion.div>
     </Link>
    </div>

    <div className="hidden lg:flex flex-1 items-center justify-end gap-6 xl:gap-12 text-[16px] font-[800] text-[#936746]">
     <a href={CONTACT.phone.tel} className="relative group transition-colors hover:text-[#B54442] whitespace-nowrap py-2">
      {CONTACT.phone.display}
      <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#B54442] group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
     </a>
     <a href={CONTACT.email.mailto} className="relative group transition-colors hover:text-[#B54442] py-2">
      {CONTACT.email.display}
      <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#B54442] group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
     </a>
    </div>

    <div className="lg:hidden flex-1" />
   </motion.header>

   <AnimatePresence>
    {isMobileMenuOpen && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] bg-[#FAF8F5]/98 flex flex-col font-manrope overflow-hidden"
     >
      <motion.div
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ duration: 1.5, ease: "easeOut" }}
       className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-[#CF8F73]/15 rounded-full blur-[80px] pointer-events-none"
      />
      <motion.div
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
       className="absolute bottom-[-10%] left-[-10%] w-[60vh] h-[60vh] bg-[#B54442]/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="flex items-center justify-between px-6 py-6 w-full relative z-10">
       <div className="flex-1 flex items-center justify-start">
        <button
         onClick={closeMenu}
         className="p-2 -ml-2 text-[#936746] hover:text-[#B54442] transition-all rounded-full hover:bg-white/40 active:scale-90"
         aria-label="Закрыть меню"
        >
         <X className="w-8 h-8" strokeWidth={1} />
        </button>
       </div>
       <div className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center justify-center">
        <Image
         src="/images/Logoo.png"
         alt={CONTACT.siteName}
         width={50}
         height={50}
         className="w-[45px] h-auto object-contain drop-shadow-sm opacity-80"
        />
       </div>
       <div className="flex-1" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 relative z-10 mt-[-40px]">
       <motion.div
        variants={menuVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-10 md:gap-12 w-full"
       >
        {NAV_LINKS.map((link) => (
         <motion.div key={link.label} variants={itemVariants}>
          <Link
           href={link.href}
           onClick={closeMenu}
           className="text-[40px] md:text-[50px] font-script tracking-[0.05em] text-[#CF6A6A] lowercase hover:opacity-70 transition-all hover:scale-[1.05] inline-block"
          >
           {link.label}
          </Link>
         </motion.div>
        ))}
       </motion.div>

       {/* Divider */}
       <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-[60px] h-[1px] bg-[#936746]/20 mt-16 mb-10"
       />

       {/* Contacts */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3 text-center"
       >
        <a href={CONTACT.phone.tel} className="text-[18px] font-[700] tracking-wide text-[#936746] hover:text-[#B54442] transition-colors">
         {CONTACT.phone.display}
        </a>
        <a href={CONTACT.email.mailto} className="text-[16px] font-[600] text-[#936746]/60 hover:text-[#B54442] transition-colors">
         {CONTACT.email.display}
        </a>
       </motion.div>
      </div>
     </motion.div>
    )}
   </AnimatePresence>
  </>
 )
}

export default LandingHeader
