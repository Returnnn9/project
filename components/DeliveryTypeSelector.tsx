"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface DeliveryTypeSelectorProps {
 onSelect: (type: "delivery" | "pickup") => void
 selectedType?: "delivery" | "pickup" | null
}

export default function DeliveryTypeSelector({ onSelect, selectedType }: DeliveryTypeSelectorProps) {
 return (
  <div className="space-y-5">
   <button
    onClick={() => onSelect("delivery")}
    className={cn(
     "w-full h-[88px] px-7 rounded-[1.5rem] border transition-all duration-200 flex items-center justify-between group shadow-sm active:scale-[0.98]",
     selectedType === "delivery"
       ? "border-[#CF8F73] bg-[#CF8F73]/5 ring-1 ring-[#CF8F73]/20"
       : "border-gray-200 hover:border-[#CF8F73] bg-[#F8F8F8] hover:bg-white hover:shadow-md"
    )}
   >
    <span className={cn("text-[20px] font-extrabold transition-colors tracking-tight", selectedType === "delivery" ? "text-[#CF8F73]" : "text-[#3A332E]")}>Доставка на дом</span>
    <div className={cn(
     "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
     selectedType === "delivery" ? "border-[#CF8F73]" : "border-gray-300 group-hover:border-[#CF8F73]"
    )}>
     <div className={cn(
      "w-3.5 h-3.5 rounded-full bg-[#CF8F73] transition-all duration-300",
      selectedType === "delivery" ? "scale-100" : "scale-0 group-hover:scale-100 opacity-50 group-hover:opacity-100"
     )} />
    </div>
   </button>

   <button
    onClick={() => onSelect("pickup")}
    className={cn(
     "w-full h-[88px] px-7 rounded-[1.5rem] border transition-all duration-200 flex items-center justify-between group shadow-sm active:scale-[0.98]",
     selectedType === "pickup"
       ? "border-[#CF8F73] bg-[#CF8F73]/5 ring-1 ring-[#CF8F73]/20"
       : "border-gray-200 hover:border-[#CF8F73] bg-[#F8F8F8] hover:bg-white hover:shadow-md"
    )}
   >
    <span className={cn("text-[20px] font-extrabold transition-colors tracking-tight", selectedType === "pickup" ? "text-[#CF8F73]" : "text-[#3A332E]")}>Самовывоз</span>
    <div className={cn(
     "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
     selectedType === "pickup" ? "border-[#CF8F73]" : "border-gray-300 group-hover:border-[#CF8F73]"
    )}>
     <div className={cn(
      "w-3.5 h-3.5 rounded-full bg-[#CF8F73] transition-all duration-300",
      selectedType === "pickup" ? "scale-100" : "scale-0 group-hover:scale-100 opacity-50 group-hover:opacity-100"
     )} />
    </div>
   </button>
  </div>
 )
}
