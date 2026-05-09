"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Product } from "@/store/types";
import { categories } from "@/data/products";
import { useProductStore } from "@/store/hooks";
import Image from "next/image";

interface ProductFormModalProps {
 isOpen: boolean;
 onClose: () => void;
 product?: Product;
}

export default function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
 const productStore = useProductStore();

 const [name, setName] = useState("");
 const [price, setPrice] = useState("");
 const [oldPrice, setOldPrice] = useState("");
 const [weight, setWeight] = useState("");
 const [category, setCategory] = useState("desserts");
 const [description, setDescription] = useState("");
 const [composition, setComposition] = useState("");
 const [kcal, setKcal] = useState("");
 const [proteins, setProteins] = useState("");
 const [fats, setFats] = useState("");
 const [carbs, setCarbs] = useState("");

 const [imageFile, setImageFile] = useState<File | null>(null);
 const [previewUrl, setPreviewUrl] = useState<string>("");
 const [isDragging, setIsDragging] = useState(false);

 const [isSubmitting, setIsSubmitting] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
  if (product) {
   setName(product.name);
   setPrice(product.price.toString());
   setOldPrice(product.oldPrice ? product.oldPrice.toString() : "");
   setWeight(product.weight);
   setCategory(product.category);
   setDescription(product.description || "");
   setComposition(product.composition || "");
   setKcal(product.nutrition?.kcal || "");
   setProteins(product.nutrition?.proteins || "");
   setFats(product.nutrition?.fats || "");
   setCarbs(product.nutrition?.carbs || "");
   setPreviewUrl(product.image || "");
  } else {
   resetForm();
  }
 }, [product, isOpen]);

 const resetForm = () => {
  setName("");
  setPrice("");
  setOldPrice("");
  setWeight("");
  setCategory("desserts");
  setDescription("");
  setComposition("");
  setKcal("");
  setProteins("");
  setFats("");
  setCarbs("");
  setImageFile(null);
  setPreviewUrl("");
 };

 const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
 };

 const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
 };

 const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
   handleFileSelected(e.dataTransfer.files[0]);
  }
 };

 const handleFileSelected = (file: File) => {
  if (!file.type.startsWith("image/")) return;
  setImageFile(file);
  const url = URL.createObjectURL(file);
  setPreviewUrl(url);
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
   const formData = new FormData();
   formData.append("name", name);
   formData.append("price", price);
   formData.append("weight", weight);
   formData.append("category", category);

   if (oldPrice) formData.append("oldPrice", oldPrice);
   if (description) formData.append("description", description);
   if (composition) formData.append("composition", composition);
   if (kcal) formData.append("kcal", kcal);
   if (proteins) formData.append("proteins", proteins);
   if (fats) formData.append("fats", fats);
   if (carbs) formData.append("carbs", carbs);

   if (imageFile) {
    formData.append("image", imageFile);
   }

   if (product) {
    await productStore.updateProduct(product.id, formData);
   } else {
    await productStore.addProduct(formData);
   }

   onClose();
  } catch (error) {
   console.error(error);
   alert("Ошибка при сохранении товара");
  } finally {
   setIsSubmitting(false);
  }
 };

 return (
  <AnimatePresence>
   {isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-[#2A1F1A]/60 backdrop-blur-sm"
     />

     <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative w-full max-w-[800px] bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
     >
      {/* Header */}
      <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 shrink-0">
       <h2 className="text-[24px] sm:text-[28px] font-black text-[#6B5D54]">
        {product ? "Редактировать товар" : "Новый товар"}
       </h2>
       <button
        onClick={onClose}
        className="p-2 sm:p-3 bg-gray-50 text-[#9C9188] hover:text-[#6B5D54] hover:bg-gray-100 rounded-full transition-colors active:scale-95"
       >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
       </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
       <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">

        {/* Visuals Column */}
        <div className="space-y-4">
         <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">
          Фотография товара
         </label>
         <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${isDragging
           ? 'border-[#CD8B70] bg-[#CD8B70]/5'
           : previewUrl ? 'border-transparent bg-gray-50' : 'border-[#E8E8E8] bg-gray-50 hover:bg-gray-100'
           }`}
         >
          <input
           type="file"
           ref={fileInputRef}
           onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
           accept="image/*"
           className="hidden"
          />

          {previewUrl ? (
           <div className="absolute inset-0 group">
            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Upload className="w-8 h-8 text-white drop-shadow-md" />
            </div>
           </div>
          ) : (
           <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
             <ImageIcon className="w-6 h-6 text-[#CD8B70]" />
            </div>
            <p className="font-bold text-[#6B5D54] text-[15px] mb-1">Загрузить фото</p>
            <p className="text-[12px] text-[#9C9188]">Перетащите картинку сюда или нажмите для выбора</p>
           </div>
          )}
         </div>
        </div>

        {/* Details Column */}
        <div className="space-y-6">
         {/* Basic Info */}
         <div className="space-y-4">
          <div>
           <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Название</label>
           <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all placeholder:font-medium placeholder:text-gray-400"
            placeholder="Кекс фисташковый"
           />
          </div>

          <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Категория</label>
            <select
             value={category}
             onChange={(e) => setCategory(e.target.value)}
             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all"
            >
             {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
             ))}
            </select>
           </div>
           <div>
            <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Вес (с ед.изм.)</label>
            <input
             required
             type="text"
             value={weight}
             onChange={(e) => setWeight(e.target.value)}
             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all"
             placeholder="75 г"
            />
           </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Цена (₽)</label>
            <input
             required
             type="number"
             value={price}
             onChange={(e) => setPrice(e.target.value)}
             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all"
             placeholder="399"
            />
           </div>
           <div>
            <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Старая цена (опц.)</label>
            <input
             type="number"
             value={oldPrice}
             onChange={(e) => setOldPrice(e.target.value)}
             className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all"
             placeholder="—"
            />
           </div>
          </div>
         </div>

         {/* Extended Info */}
         <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="font-bold text-[#6B5D54] text-[18px]">Подробности</h3>

          <div>
           <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Краткое описание</label>
           <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all"
            placeholder="Нежное пирожное..."
           />
          </div>

          <div>
           <label className="block text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Состав</label>
           <textarea
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
            rows={2}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/30 transition-all"
            placeholder="Яйцо куриное, сахар..."
           />
          </div>

          <div className="grid grid-cols-4 gap-2">
           <div>
            <label className="block text-[#9C9188] text-[10px] xl:text-[11px] font-bold uppercase mb-1">Ккал</label>
            <input type="text" value={kcal} onChange={(e) => setKcal(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-[13px] font-semibold text-center text-[#6B5D54] focus:outline-none" placeholder="395" />
           </div>
           <div>
            <label className="block text-[#9C9188] text-[10px] xl:text-[11px] font-bold uppercase mb-1">Белки</label>
            <input type="text" value={proteins} onChange={(e) => setProteins(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-[13px] font-semibold text-center text-[#6B5D54] focus:outline-none" placeholder="7,2" />
           </div>
           <div>
            <label className="block text-[#9C9188] text-[10px] xl:text-[11px] font-bold uppercase mb-1">Жиры</label>
            <input type="text" value={fats} onChange={(e) => setFats(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-[13px] font-semibold text-center text-[#6B5D54] focus:outline-none" placeholder="27,8" />
           </div>
           <div>
            <label className="block text-[#9C9188] text-[10px] xl:text-[11px] font-bold uppercase mb-1">Углеводы</label>
            <input type="text" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 text-[13px] font-semibold text-center text-[#6B5D54] focus:outline-none" placeholder="28,5" />
           </div>
          </div>
         </div>

        </div>
       </div>

       {/* Footer Actions */}
       <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
         type="button"
         onClick={onClose}
         className="px-6 py-3 rounded-full text-[#9C9188] font-bold hover:bg-gray-50 transition-colors"
        >
         Отмена
        </button>
        <button
         type="submit"
         disabled={isSubmitting || (!imageFile && !previewUrl)}
         className="px-8 py-3 rounded-full bg-[#CD8B70] text-white font-bold hover:bg-[#C27E63] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
        >
         {isSubmitting ? (
          <>
           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
           Сохранение...
          </>
         ) : (
          "Сохранить товар"
         )}
        </button>
       </div>
      </form>
     </motion.div>
    </div>
   )}
  </AnimatePresence>
 );
}
