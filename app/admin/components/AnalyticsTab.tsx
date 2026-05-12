"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Order } from '@/store/types';
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 BarElement,
 Title,
 Tooltip,
 Legend,
 Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartOptions, TooltipItem } from 'chart.js';
import { TrendingUp, ShoppingBag, CreditCard, RotateCw, Wallet, X, Phone, User as UserIcon, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 BarElement,
 Title,
 Tooltip,
 Legend,
 Filler
);

export default function AnalyticsTab() {
 const [orders, setOrders] = useState<Order[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

 const fetchOrders = async () => {
  setIsLoading(true);
  try {
   const res = await fetch('/api/orders');
   if (res.ok) {
    const data = await res.json();
    setOrders(data);
   }
  } catch (error) {
   console.error("Failed to fetch global orders:", error);
  } finally {
   setIsLoading(false);
  }
 };


 useEffect(() => {
  fetchOrders();
 }, []);

 const formatOrderDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: '2-digit', minute: '2-digit' }) : '';

 const todayStr = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
 const todaysOrders = orders.filter(o => {
  const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : '';
  return d === todayStr;
 });
 const totalRevenueToday = todaysOrders.reduce((sum, o) => sum + o.total, 0);

 const analyticsData = useMemo(() => {
  const datesMap: Record<string, number> = {};
  [...orders].reverse().forEach(o => {
   const dateKey = o.createdAt ? new Date(o.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : '—';
   if (!datesMap[dateKey]) datesMap[dateKey] = 0;
   datesMap[dateKey] += o.total;
  });

  const labels = Object.keys(datesMap).slice(-7);
  const data = labels.map(l => datesMap[l]);

  return {
   labels,
   datasets: [
    {
     label: 'Выручка (₽)',
     data,
     borderColor: '#CD8B70',
     backgroundColor: 'rgba(205, 139, 112, 0.1)',
     fill: true,
     tension: 0.4,
     borderWidth: 3,
     pointBackgroundColor: '#fff',
     pointBorderColor: '#CD8B70',
     pointBorderWidth: 2,
     pointRadius: 4,
     pointHoverRadius: 6,
    }
   ]
  };
 }, [orders]);

 const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
   legend: { display: false },
   tooltip: {
    backgroundColor: '#fff',
    titleColor: '#6B5D54',
    bodyColor: '#CD8B70',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 12,
    displayColors: false,
    titleFont: { family: 'Manrope', size: 14, weight: 'bold' as const },
    bodyFont: { family: 'Manrope', size: 16, weight: 'bold' as const },
    callbacks: {
     label: function (context: TooltipItem<'line'>) {
      return context.parsed.y + ' ₽';
     }
    }
   }
  },
  scales: {
   y: {
    beginAtZero: true,
    grid: { color: '#f3f4f6' },
    ticks: { font: { family: 'Manrope' } }
   },
   x: {
    grid: { display: false },
    ticks: { font: { family: 'Manrope' } }
   }
  },
  interaction: { mode: 'index' as const, intersect: false },
 };

 return (
  <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
   {/* Stat grid omitted for brevity, but remains the same in practice... wait replace whole block instead */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex items-center justify-between group">
     <div>
      <p className="text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Выручка за сегодня</p>
      <div className="flex items-baseline gap-2">
       <span className="text-[32px] font-black text-[#6B5D54] leading-none">{totalRevenueToday}</span>
       <span className="text-[18px] font-bold text-[#CD8B70]">₽</span>
      </div>
     </div>
     <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
      <TrendingUp className="w-6 h-6 text-green-500" />
     </div>
    </div>

    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex items-center justify-between group">
     <div>
      <p className="text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Заказов сегодня</p>
      <div className="flex items-baseline gap-2">
       <span className="text-[32px] font-black text-[#6B5D54] leading-none">{todaysOrders.length}</span>
       <span className="text-[18px] font-bold text-[#CD8B70]">шт</span>
      </div>
     </div>
     <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
      <ShoppingBag className="w-6 h-6 text-blue-500" />
     </div>
    </div>

    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex items-center justify-between group">
     <div>
      <p className="text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Всего заказов</p>
      <div className="flex items-baseline gap-2">
       <span className="text-[32px] font-black text-[#6B5D54] leading-none">{orders.length}</span>
      </div>
     </div>
     <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
      <CreditCard className="w-6 h-6 text-orange-500" />
     </div>
    </div>

   </div>

   <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-50">
    <div className="flex items-center justify-between mb-8">
     <h3 className="text-[20px] font-black text-[#6B5D54]">Динамика выручки (последние 7 дней)</h3>
     <button
      onClick={() => { fetchOrders(); }}
      className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-[#9C9188] transition-colors active:scale-95"
     >
      <RotateCw className={cn("w-5 h-5", isLoading && "animate-spin text-[#CD8B70]")} />
     </button>
    </div>

    <div className="h-[300px] w-full">
     {analyticsData.labels.length > 0 ? (
      <Line data={analyticsData} options={chartOptions} />
     ) : (
      <div className="h-full flex items-center justify-center text-[#9C9188] font-medium">
       {isLoading ? "Загрузка данных..." : "Пока нет данных для графика"}
      </div>
     )}
    </div>
   </div>

   <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-50">
    <div className="p-6 sm:p-8 border-b border-gray-50">
     <h3 className="text-[20px] font-black text-[#6B5D54]">История всех заказов</h3>
     <p className="text-[#9C9188] text-[13px] font-medium mt-1">Нажмите на заказ для просмотра деталей и контактов</p>
    </div>

    <div>
     {isLoading && orders.length === 0 ? (
      <div className="p-8 text-center text-[#9C9188]">Загрузка истории...</div>
     ) : orders.length === 0 ? (
      <div className="p-8 text-center text-[#9C9188]">Заказов пока нет.</div>
     ) : (
      <>
       {/* Mobile View Cards */}
       <div className="md:hidden divide-y divide-gray-50">
        {orders.map((o) => (
         <div 
          key={o.id} 
          onClick={() => setSelectedOrder(o)}
          className="p-5 active:bg-gray-50 transition-colors cursor-pointer"
         >
          <div className="flex justify-between items-start mb-2">
           <div>
            <span className="text-[13px] font-bold text-[#CD8B70]">#{o.id.toString().slice(-4)}</span>
            <h4 className="font-bold text-[#6B5D54] text-[15px]">{formatOrderDate(o.createdAt)}</h4>
           </div>
           <span className="font-black text-[16px] text-[#6B5D54]">{o.total} ₽</span>
          </div>
          
          <div className="text-[13px] text-[#9C9188] truncate max-w-full mb-1">
           {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-[12px] text-[#9C9188]">
           <UserIcon className="w-3 h-3 opacity-70" />
           <span className="font-bold">{o.userName || 'Гость'}</span>
          </div>
         </div>
        ))}
       </div>

       {/* Desktop View Table */}
       <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
         <thead>
          <tr className="border-b border-gray-100 text-[#9C9188] text-[13px] uppercase tracking-widest font-bold">
           <th className="p-6 pb-4">ID</th>
           <th className="p-6 pb-4">Дата и время</th>
           <th className="p-6 pb-4">Покупатель</th>
           <th className="p-6 pb-4">Товары</th>
           <th className="p-6 pb-4">Сумма</th>
           <th className="p-6 pb-4 text-right">Адрес</th>
          </tr>
         </thead>
         <tbody className="divide-y divide-gray-50">
          {orders.map((o) => (
           <tr 
            key={o.id} 
            onClick={() => setSelectedOrder(o)}
            className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
           >
            <td className="p-4 pl-6 font-bold text-[#CD8B70]">
             #{o.id.toString().slice(-4)}
            </td>
            <td className="p-4 text-[#6B5D54] font-medium text-[14px]">
             {formatOrderDate(o.createdAt) || '—'}
            </td>
            <td className="p-4">
             <div className="flex flex-col">
              <span className="font-bold text-[#6B5D54] text-[14px]">{o.userName || 'Гость'}</span>
              <span className="text-[12px] text-[#9C9188]">{o.userPhone || '—'}</span>
             </div>
            </td>
            <td className="p-4">
             <div className="flex flex-col gap-1 max-w-[220px]">
              {o.items.slice(0, 2).map((item, idx) => (
               <span key={idx} className="text-[13px] text-[#6B5D54] truncate">
                {item.quantity}x {item.name}
               </span>
              ))}
              {o.items.length > 2 && (
               <span className="text-[11px] text-[#CD8B70] font-bold">
                +{o.items.length - 2} ещё...
               </span>
              )}
             </div>
            </td>
            <td className="p-4 font-black text-[#6B5D54]">
             {o.total} ₽
            </td>
            <td className="p-4 pr-6 text-right">
             <span className="text-[13px] text-[#9C9188] max-w-[150px] truncate inline-block text-right border-b border-dashed border-gray-300 pb-0.5" title={o.address}>
              {o.address || 'Самовывоз'}
             </span>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </>
     )}
    </div>
   </div>

   {/* Global Order Details Modal */}
   <AnimatePresence>
    {selectedOrder && (
     <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       onClick={() => setSelectedOrder(null)}
       className="absolute inset-0 bg-[#2A1F1A]/60 backdrop-blur-sm"
      />
      <motion.div 
       initial={{ opacity: 0, scale: 0.95, y: 20 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.95 }}
       className="relative w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
       {/* Modal Header */}
       <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div>
         <div className="text-[12px] font-black text-[#CD8B70] uppercase tracking-widest mb-1">
          Заказ #{selectedOrder.id.toString().slice(-4)}
         </div>
         <h3 className="text-[20px] font-black text-[#6B5D54] leading-tight">
          {formatOrderDate(selectedOrder.createdAt)}
         </h3>
        </div>
        <button 
         onClick={() => setSelectedOrder(null)}
         className="p-2.5 bg-white text-[#9C9188] hover:text-[#6B5D54] rounded-full shadow-sm transition-colors active:scale-95"
        >
         <X className="w-5 h-5" />
        </button>
       </div>

       {/* Modal Content */}
       <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
        
        {/* Customer Info Block */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
         <h4 className="text-[12px] font-black text-[#9C9188] uppercase tracking-[0.15em]">Покупатель</h4>
         
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CD8B70]/10 flex items-center justify-center text-[#CD8B70]">
           <UserIcon className="w-5 h-5" />
          </div>
          <div>
           <p className="text-[12px] text-[#9C9188] font-medium">ФИО</p>
           <p className="font-bold text-[#6B5D54] text-[16px]">{selectedOrder.userName || 'Не указано'}</p>
          </div>
         </div>

         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CD8B70]/10 flex items-center justify-center text-[#CD8B70]">
           <Phone className="w-5 h-5" />
          </div>
          <div>
           <p className="text-[12px] text-[#9C9188] font-medium">Телефон</p>
           <a href={`tel:${selectedOrder.userPhone}`} className="font-bold text-[#6B5D54] text-[16px] hover:text-[#CD8B70] underline decoration-dashed underline-offset-4">
            {selectedOrder.userPhone || 'Не указан'}
           </a>
          </div>
         </div>

         <div className="flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-[#CD8B70]/10 flex items-center justify-center text-[#CD8B70] shrink-0">
           <MapPin className="w-5 h-5" />
          </div>
          <div>
           <p className="text-[12px] text-[#9C9188] font-medium">Адрес доставки</p>
           <p className="font-bold text-[#6B5D54] text-[15px] leading-snug">
            {selectedOrder.address || 'Самовывоз'}
           </p>
          </div>
         </div>
        </div>

        {/* Products Block */}
        <div>
         <h4 className="text-[12px] font-black text-[#9C9188] uppercase tracking-[0.15em] mb-4 ml-1">Состав заказа</h4>
         <div className="space-y-3">
          {selectedOrder.items.map((item, idx) => (
           <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1 pr-4">
             <p className="font-bold text-[#6B5D54] leading-tight">{item.name}</p>
             <p className="text-[13px] text-[#9C9188] mt-0.5">{item.quantity} шт × {item.price} ₽</p>
            </div>
            <div className="font-bold text-[#6B5D54]">
             {item.quantity * item.price} ₽
            </div>
           </div>
          ))}
         </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t-2 border-dashed border-gray-100 mt-6 flex items-center justify-between">
         <span className="text-[18px] font-bold text-[#6B5D54]">Итого</span>
         <span className="text-[28px] font-black text-[#CD8B70]">{selectedOrder.total} ₽</span>
        </div>

       </div>
      </motion.div>
     </div>
    )}
   </AnimatePresence>
  </div>
 );
}
