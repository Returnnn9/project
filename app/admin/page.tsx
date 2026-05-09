"use client";
import React, { useEffect, useState } from 'react';
import { useProductStore } from '@/store/hooks';
import Image from 'next/image';
import { Edit2, Trash2, Plus, ArrowLeft, Package, ShieldCheck as ShieldIcon, Minus, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import ProductFormModal from './components/ProductFormModal';
import SecurityTab from './components/SecurityTab';
import AnalyticsTab from './components/AnalyticsTab';
import { Product } from '@/store/types';
import { categories } from '@/data/products';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


export default function AdminPage() {
 const { data: session, status } = useSession();
 const [activeTab, setActiveTab] = useState<'products' | 'security' | 'analytics'>('analytics');
 const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

 const products = useProductStore(s => s.products) || [];
 const isLoading = useProductStore(s => s.isLoading);
 const fetchProducts = useProductStore(s => s.fetchProducts);
 const deleteProduct = useProductStore(s => s.deleteProduct);
 const updateProduct = useProductStore(s => s.updateProduct);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

 useEffect(() => {
  fetchProducts();
 }, [fetchProducts]);

 const handleEdit = (product: Product) => {
  setEditingProduct(product);
  setIsModalOpen(true);
 };

 const handleDelete = async (product: Product) => {
  setDeleteTarget(product);
 };


 const handleAddNew = () => {
  setEditingProduct(undefined);
  setIsModalOpen(true);
 };

 const getCategoryLabel = (catId: string) => {
  return categories.find(c => c.id === catId)?.label || catId;
 };

 const handleQuantityChange = async (product: Product, delta: number) => {
  const newQuantity = Math.max(0, (product.quantity || 0) + delta);
  if (newQuantity === product.quantity) return;

  try {
   const formData = new FormData();
   formData.append("name", product.name);
   formData.append("price", product.price.toString());
   formData.append("weight", product.weight);
   formData.append("category", product.category);
   formData.append("quantity", newQuantity.toString());

   await updateProduct(product.id, formData);
  } catch (error) {
   console.error("Failed to update quantity", error);
  }
 };

 if (status === 'loading') return null;
 if (!session?.user || session.user.role !== 'ADMIN') return null;

 return (
  <div className="min-h-screen bg-[#FAF8F5] font-manrope p-4 sm:p-8 lg:p-12">
   <div className="max-w-[1200px] mx-auto">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
     <div>
      <Link href="/" className="inline-flex items-center gap-2 text-[#4A403A]/50 hover:text-[#B54442] transition-colors mb-4 text-[14px] font-bold uppercase tracking-widest">
       <ArrowLeft className="w-4 h-4" />
       Вернуться на сайт
      </Link>
      <h1 className="text-[32px] sm:text-[40px] font-black text-[#6B5D54] leading-none">
       Панель Управления
      </h1>
     </div>

     <div className="flex items-center gap-3">
      <button
       onClick={() => signOut({ callbackUrl: '/admin/login' })}
       className="flex items-center gap-2 px-6 py-3 bg-white text-[#6B5D54] border border-gray-100 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
      >
       Выйти
      </button>
     </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl w-fit border border-gray-100">
     <button
      onClick={() => setActiveTab('analytics')}
      className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-[#6B5D54] text-white shadow-md' : 'text-[#9C9188] hover:bg-white'}`}
     >
      <TrendingUp className="w-4 h-4" />
      <span className="hidden sm:inline">Аналитика</span>
     </button>
     <button
      onClick={() => setActiveTab('products')}
      className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-[#6B5D54] text-white shadow-md' : 'text-[#9C9188] hover:bg-white'}`}
     >
      <Package className="w-4 h-4" />
      <span className="hidden sm:inline">Товары</span>
     </button>
     <button
      onClick={() => setActiveTab('security')}
      className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-[#6B5D54] text-white shadow-md' : 'text-[#9C9188] hover:bg-white'}`}
     >
      <ShieldIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Безопасность</span>
     </button>
    </div>

    {activeTab === 'analytics' ? (
     <AnalyticsTab />
    ) : activeTab === 'products' ? (
     <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-8 flex justify-between items-center border-b border-gray-50">
       <h2 className="text-[20px] font-black text-[#6B5D54]">Список товаров</h2>
       <button
        onClick={handleAddNew}
        className="flex items-center gap-2 px-6 py-3 bg-[#CD8B70] text-white rounded-full font-bold hover:bg-[#C27E63] transition-colors shadow-sm active:scale-95"
       >
        <Plus className="w-5 h-5" />
        Добавить товар
       </button>
      </div>

      <div className="md:hidden flex flex-col divide-y divide-gray-50">
       {isLoading ? (
        <div className="p-8 text-center text-[#9C9188]">Загрузка товаров...</div>
       ) : products.length === 0 ? (
        <div className="p-8 text-center text-[#9C9188]">Товаров пока нет. Создайте первый!</div>
       ) : (
        products.map((product) => (
         <div key={product.id} className="p-5 flex flex-col gap-4">
          <div className="flex gap-4">
           <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-[#FAF8F5]">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
           </div>
           <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#6B5D54] text-[16px] leading-tight mb-1 truncate">{product.name}</h3>
            <p className="text-[12px] text-[#9C9188] font-medium mb-1">{getCategoryLabel(product.category)}</p>
            <div className="flex items-center gap-2 mt-1">
             <span className="font-bold text-[#B54442] text-[15px]">{product.price} ₽</span>
             <span className="text-[13px] text-[#9C9188]">/ {product.weight}</span>
            </div>
           </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
           <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border border-gray-100">
            <button
             onClick={() => handleQuantityChange(product, -1)}
             className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#6B5D54] shadow-sm hover:bg-gray-100 transition-colors active:scale-95"
            >
             <Minus className="w-4 h-4" />
            </button>
            <span className={cn(
             "text-[14px] font-bold w-6 text-center",
             (product.quantity || 0) > 10 ? "text-green-600" :
              (product.quantity || 0) > 0 ? "text-orange-600" :
               "text-red-500"
            )}>
             {product.quantity || 0}
            </span>
            <button
             onClick={() => handleQuantityChange(product, 1)}
             className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#6B5D54] shadow-sm hover:bg-gray-100 transition-colors active:scale-95"
            >
             <Plus className="w-4 h-4" />
            </button>
           </div>

           <div className="flex items-center gap-2">
            <button
             onClick={() => handleEdit(product)}
             className="p-2 sm:p-2.5 text-[#CD8B70] bg-[#CD8B70]/10 hover:bg-[#CD8B70]/20 rounded-xl transition-colors active:scale-95"
            >
             <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
             onClick={() => handleDelete(product)}
             className="p-2 sm:p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors active:scale-95"
            >
             <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
           </div>
          </div>
         </div>
        ))
       )}
      </div>

      <div className="hidden md:block overflow-x-auto">
       <table className="w-full text-left border-collapse">
        <thead>
         <tr className="border-b border-gray-100 text-[#9C9188] text-[13px] uppercase tracking-widest font-bold">
          <th className="p-6 pb-4">Фото</th>
          <th className="p-6 pb-4">Название</th>
          <th className="p-6 pb-4">Категория</th>
          <th className="p-6 pb-4">Цена / Вес</th>
          <th className="p-6 pb-4 text-center">Кол-во на складе</th>
          <th className="p-6 pb-4 text-right">Действия</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
         {isLoading ? (
          <tr>
           <td colSpan={6} className="p-8 text-center text-[#9C9188]">Загрузка товаров...</td>
          </tr>
         ) : products.length === 0 ? (
          <tr>
           <td colSpan={6} className="p-8 text-center text-[#9C9188]">Товаров пока нет. Создайте первый!</td>
          </tr>
         ) : (
          products.map((product) => (
           <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
            <td className="p-4 pl-6">
             <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF8F5]">
              <Image
               src={product.image}
               alt={product.name}
               fill
               className="object-cover"
              />
             </div>
            </td>
            <td className="p-4 font-bold text-[#6B5D54] text-[16px] xl:text-[18px]">
             {product.name}
            </td>
            <td className="p-4 text-[#9C9188] font-medium">
             {getCategoryLabel(product.category)}
            </td>
            <td className="p-4">
             <div className="font-bold text-[#B54442] text-[16px]">{product.price} ₽</div>
             <div className="text-[14px] text-[#9C9188]">{product.weight}</div>
            </td>
            <td className="p-4 text-center">
             <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-100/50 group-hover:bg-white group-hover:shadow-sm transition-all">
              <button
               onClick={() => handleQuantityChange(product, -1)}
               className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-[#6B5D54] hover:bg-gray-100 transition-colors active:scale-95 shadow-sm"
              >
               <Minus className="w-3 h-3" />
              </button>
              <span className={cn(
               "text-[13px] font-bold w-6 text-center",
               (product.quantity || 0) > 10 ? "text-green-600" :
                (product.quantity || 0) > 0 ? "text-orange-600" :
                 "text-red-500"
              )}>
               {product.quantity || 0}
              </span>
              <button
               onClick={() => handleQuantityChange(product, 1)}
               className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-[#6B5D54] hover:bg-gray-100 transition-colors active:scale-95 shadow-sm"
              >
               <Plus className="w-3 h-3" />
              </button>
             </div>
            </td>
            <td className="p-4 pr-6 text-right">
             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
               onClick={() => handleEdit(product)}
               className="p-2 text-[#CD8B70] bg-[#CD8B70]/10 hover:bg-[#CD8B70]/20 rounded-lg transition-colors"
              >
               <Edit2 className="w-4 h-4" />
              </button>
              <button
               onClick={() => handleDelete(product)}
               className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
               <Trash2 className="w-4 h-4" />
              </button>
             </div>
            </td>
           </tr>
          ))
         )}
        </tbody>
       </table>
      </div>
     </div>
    ) : (
     <SecurityTab />
    )}
   </div>

   <ProductFormModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    product={editingProduct}
   />

   <AnimatePresence>
    {deleteTarget && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => setDeleteTarget(null)}
     >
      <motion.div
       initial={{ scale: 0.9, opacity: 0, y: 20 }}
       animate={{ scale: 1, opacity: 1, y: 0 }}
       exit={{ scale: 0.9, opacity: 0 }}
       onClick={(e) => e.stopPropagation()}
       className="bg-white rounded-[2rem] p-8 max-w-[380px] w-full shadow-2xl"
      >
       <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5 mx-auto">
        <AlertTriangle className="w-7 h-7 text-red-400" />
       </div>
       <h3 className="text-[20px] font-black text-[#3A332E] text-center mb-2">Удалить товар?</h3>
       <p className="text-[14px] text-[#9C9188] text-center mb-7 leading-relaxed">
        «{deleteTarget.name}» будет удалён безвозвратно.
       </p>
       <div className="flex gap-3">
        <button
         onClick={() => setDeleteTarget(null)}
         className="flex-1 h-12 rounded-xl font-bold text-[#6B5D54] bg-gray-50 hover:bg-gray-100 transition-colors"
        >
         Отмена
        </button>
        <button
         onClick={async () => { await deleteProduct(deleteTarget.id); setDeleteTarget(null); }}
         className="flex-1 h-12 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
        >
         Удалить
        </button>
       </div>
      </motion.div>
     </motion.div>
    )}
   </AnimatePresence>
  </div>
 );
}

