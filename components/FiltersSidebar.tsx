"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FiltersSidebarProps {
 categories: string[];
 activeCategory: string;
 onCategorySelect: (category: string) => void;
 onlyDelivery?: boolean;
 onDeliveryToggle?: () => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
 categories,
 activeCategory,
 onCategorySelect,
}) => {
 const [isCategoryOpen, setIsCategoryOpen] = useState(true);
 const [inStock, setInStock] = useState(false);

 return (
  <div className="flex flex-col bg-white rounded-[2rem] border border-black/[0.03] font-manrope p-6 shadow-subtle hover:shadow-wow transition-all duration-300 ease-premium selection:bg-black/5">
   <div className="mb-10">
    <div className="flex items-center gap-3">
     <div className="h-8 w-1.5 bg-[#3A332E] rounded-full" />
     <h2 className="text-[32px] font-[1000] tracking-[-0.05em] text-[#3A332E] lowercase leading-none">фильтры</h2>
    </div>
   </div>

   <div className="flex flex-col gap-10">
    {/* ── Category Section ── */}
    <section>
     <button
      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
      className="flex items-center justify-between w-full mb-6 group cursor-pointer"
     >
      <div className="flex items-center gap-2">
       <h3 className="text-[22px] font-[1000] text-[#3A332E] lowercase tracking-tight">категория</h3>
      </div>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#e8dfd5]/50 transition-all duration-300 ease-premium ${isCategoryOpen ? "" : "rotate-180 bg-[#3A332E] text-white"}`}>
       <ChevronDown className="w-4 h-4" strokeWidth={3} />
      </div>
     </button>

     <AnimatePresence initial={false}>
      {isCategoryOpen && (
       <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
       >
        <div className="flex flex-col gap-2.5 ml-1 pb-1">
         {categories.map((cat) => (
          <button
           key={cat}
           onClick={() => onCategorySelect(cat)}
           className={`relative flex items-center text-left text-[17px] font-[1000] transition-all duration-200 cursor-pointer group/item ${activeCategory === cat
            ? "text-[#3A332E] translate-x-2"
            : "text-[#3A332E]/20 hover:text-[#3A332E] hover:translate-x-2"
            }`}
          >
           <div className={`absolute -left-3 w-1 h-4 rounded-full bg-[#3A332E] transition-all duration-200 ${activeCategory === cat ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`} />
           <span className="transition-transform duration-200">{cat}</span>
          </button>
         ))}
        </div>
       </motion.div>
      )}
     </AnimatePresence>
     <div className="h-px w-full bg-black/[0.04] mt-8" />
    </section>

    {/* ── Filter Controls ── */}
    <section className="flex flex-col gap-8">
     <div className="flex items-center justify-between">
      <span className="text-[17px] font-[1000] text-[#3A332E] tracking-tight">в наличии</span>
      <button
       onClick={() => setInStock(!inStock)}
       className={`relative h-7 w-12 rounded-full transition-all duration-300 cursor-pointer shadow-inner border-none ${inStock ? "bg-[#3A332E] shadow-wow" : "bg-black/10"}`}
      >
       <div className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-premium transition-all duration-300 ease-premium ${inStock ? "translate-x-5" : ""}`} />
      </button>
     </div>

     <div className="space-y-4">
      <h4 className="text-[11px] font-[1000] text-[#3A332E]/30 uppercase tracking-[0.2em] ml-1">диапазон цен</h4>
      <div className="flex items-center gap-3">
       <div className="relative flex-1 group">
        <input type="text" placeholder="от" className="w-full rounded-2xl bg-[#F5F5F7] px-5 py-4 text-[16px] font-[1000] text-[#3A332E] outline-none border-2 border-transparent focus:border-[#3A332E] focus:bg-white transition-all duration-200 shadow-sm" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-[#3A332E]/20 group-focus-within:text-[#3A332E] transition-colors">₽</span>
       </div>
       <div className="h-0.5 w-3 bg-[#3A332E]/10 rounded-full" />
       <div className="relative flex-1 group">
        <input type="text" placeholder="до" className="w-full rounded-2xl bg-[#F5F5F7] px-5 py-4 text-[16px] font-[1000] text-[#3A332E] outline-none border-2 border-transparent focus:border-[#3A332E] focus:bg-white transition-all duration-200 shadow-sm" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-[#3A332E]/20 group-focus-within:text-[#3A332E] transition-colors">₽</span>
       </div>
      </div>
     </div>
    </section>

    {/* ── Preferences ── */}
    <section>
     <h3 className="text-[11px] font-[1000] text-[#3A332E]/30 uppercase tracking-[0.2em] mb-6 ml-1">предпочтения</h3>
     <div className="flex flex-wrap gap-2.5">
      {["без сахара", "веган", "пшеница", "ржаной"].map((tag) => (
       <button key={tag} className="px-5 py-2.5 rounded-full border border-black/[0.04] bg-white text-[14px] font-[1000] text-[#3A332E]/60 hover:text-[#3A332E] hover:border-[#3A332E] hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95">
        {tag}
       </button>
      ))}
     </div>
    </section>

    {/* ── Reset ── */}
    <button className="flex items-center gap-3 mt-6 text-[13px] font-[1000] text-[#3A332E]/40 hover:text-[#3A332E] uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer border-none bg-transparent group">
     <div className="h-8 w-8 rounded-full border border-black/[0.06] flex items-center justify-center transition-all group-hover:rotate-[-45deg] group-hover:bg-[#e8dfd5]">
      <RotateCcw className="w-4 h-4" />
     </div>
     сбросить всё
    </button>

   </div>
  </div>
 );
};

export default FiltersSidebar;
