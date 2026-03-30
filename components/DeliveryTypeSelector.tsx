"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface DeliveryTypeSelectorProps {
 onSelect: (type: "delivery" | "pickup") => void
 selectedType?: "delivery" | "pickup" | null
}

export default function DeliveryTypeSelector({ onSelect, selectedType }: DeliveryTypeSelectorProps) {
 return (
  <div className="space-y-4">
   <button
    onClick={() => onSelect("delivery")}
    className={cn(
     "w-full h-[72px] px-6 rounded-[1.2rem] border transition-all flex items-center justify-between group",
     selectedType === "delivery" 
       ? "border-[#CF8F73] bg-[#CF8F73]/5 ring-1 ring-[#CF8F73]/20" 
       : "border-gray-200 hover:border-[#CF8F73] bg-[#F8F8F8] hover:bg-white"
    )}
   >
    <span className={cn("text-[17px] font-extrabold transition-colors", selectedType === "delivery" ? "text-[#CF8F73]" : "text-[#3A332E]")}>Доставка на дом</span>
    <div className={cn(
     "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
     selectedType === "delivery" ? "border-[#CF8F73]" : "border-gray-300 group-hover:border-[#CF8F73]"
    )}>
     <div className={cn(
      "w-3 h-3 rounded-full bg-[#CF8F73] transition-all duration-300",
      selectedType === "delivery" ? "scale-100" : "scale-0 group-hover:scale-100 opacity-50 group-hover:opacity-100 text-transparent"
     )} />
    </div>
   </button>

   <button
    onClick={() => onSelect("pickup")}
    className={cn(
     "w-full h-[72px] px-6 rounded-[1.2rem] border transition-all flex items-center justify-between group",
     selectedType === "pickup" 
       ? "border-[#CF8F73] bg-[#CF8F73]/5 ring-1 ring-[#CF8F73]/20" 
       : "border-gray-200 hover:border-[#CF8F73] bg-[#F8F8F8] hover:bg-white"
    )}
   >
    <span className={cn("text-[17px] font-extrabold transition-colors", selectedType === "pickup" ? "text-[#CF8F73]" : "text-[#3A332E]")}>Самовывоз</span>
    <div className={cn(
     "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
     selectedType === "pickup" ? "border-[#CF8F73]" : "border-gray-300 group-hover:border-[#CF8F73]"
    )}>
     <div className={cn(
      "w-3 h-3 rounded-full bg-[#CF8F73] transition-all duration-300",
      selectedType === "pickup" ? "scale-100" : "scale-0 group-hover:scale-100 opacity-50 group-hover:opacity-100 text-transparent"
     )} />
    </div>
   </button>
  </div>
 )
}
