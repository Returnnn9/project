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
import { TrendingUp, ShoppingBag, CreditCard, RotateCw, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 const [smsBalance, setSmsBalance] = useState<number | null>(null);

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

 const fetchSmsBalance = async () => {
  try {
   const res = await fetch('/api/admin/sms/balance');
   if (res.ok) {
    const data = await res.json();
    setSmsBalance(data.balance);
   }
  } catch (error) {
   console.error("Failed to fetch SMS balance:", error);
  }
 };

 useEffect(() => {
  fetchOrders();
  fetchSmsBalance();
 }, []);

 // Derived data
 const todayStr = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
 const todaysOrders = orders.filter(o => o.date === todayStr);
 const totalRevenueToday = todaysOrders.reduce((sum, o) => sum + o.total, 0);

 // Analytics Chart Data (Revenue by Date)
 const analyticsData = useMemo(() => {
  const datesMap: Record<string, number> = {};
  // Reverse to show older dates first for graph if sorted descending by default
  [...orders].reverse().forEach(o => {
   if (!datesMap[o.date]) datesMap[o.date] = 0;
   datesMap[o.date] += o.total;
  });

  const labels = Object.keys(datesMap).slice(-7); // Last 7 days with data
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
   {/* Quick Stats Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
    {/* Card 1: Today's Revenue */}
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

    {/* Card 2: Today's Orders */}
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

    {/* Card 3: Total All-time Orders */}
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

    {/* Card 4: SMS Balance */}
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex items-center justify-between group">
     <div>
      <p className="text-[#9C9188] text-[13px] font-bold uppercase tracking-widest mb-2">Баланс AlfaSMS</p>
      <div className="flex items-baseline gap-2">
       <span className="text-[32px] font-black text-[#6B5D54] leading-none">
        {smsBalance !== null ? smsBalance.toFixed(2) : '--'}
       </span>
       <span className="text-[18px] font-bold text-[#CD8B70]">₽</span>
      </div>
     </div>
     <div className="w-14 h-14 rounded-full bg-[#CD8B70]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
      <Wallet className="w-6 h-6 text-[#CD8B70]" />
     </div>
    </div>
   </div>

   {/* Graph Component */}
   <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-50">
    <div className="flex items-center justify-between mb-8">
     <h3 className="text-[20px] font-black text-[#6B5D54]">Динамика выручки (последние 7 дней)</h3>
     <button
      onClick={() => { fetchOrders(); fetchSmsBalance(); }}
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

   {/* Order History Table */}
   <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-50">
    <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between">
     <h3 className="text-[20px] font-black text-[#6B5D54]">История всех заказов</h3>
    </div>

    <div className="overflow-x-auto">
     {isLoading && orders.length === 0 ? (
      <div className="p-8 text-center text-[#9C9188]">Загрузка истории...</div>
     ) : orders.length === 0 ? (
      <div className="p-8 text-center text-[#9C9188]">Заказов пока нет.</div>
     ) : (
      <table className="w-full text-left border-collapse">
       <thead>
        <tr className="border-b border-gray-100 text-[#9C9188] text-[13px] uppercase tracking-widest font-bold">
         <th className="p-6 pb-4">ID</th>
         <th className="p-6 pb-4">Дата</th>
         <th className="p-6 pb-4 hidden sm:table-cell">Товары</th>
         <th className="p-6 pb-4 hidden md:table-cell">Сумма</th>
         <th className="p-6 pb-4 text-right">Назначение</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-gray-50">
        {orders.map((o) => (
         <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
          <td className="p-4 pl-6 font-bold text-[#6B5D54]">
           #{o.id.toString().slice(-4)}
          </td>
          <td className="p-4 text-[#9C9188] text-[14px]">
           {o.date}
          </td>
          <td className="p-4 hidden sm:table-cell">
           <div className="flex flex-col gap-1 max-w-[200px]">
            {o.items.slice(0, 2).map((item, idx) => (
             <span key={idx} className="text-[14px] text-[#6B5D54] truncate">
              {item.quantity}x {item.name}
             </span>
            ))}
            {o.items.length > 2 && (
             <span className="text-[12px] text-[#9C9188] font-medium">
              +{o.items.length - 2} ещё...
             </span>
            )}
           </div>
          </td>
          <td className="p-4 font-bold text-[#CD8B70] hidden md:table-cell">
           {o.total} ₽
          </td>
          <td className="p-4 pr-6 text-right">
           <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold text-[#6B5D54] md:hidden mb-1">{o.total} ₽</span>
            <span className="text-[13px] text-[#9C9188] max-w-[150px] truncate text-right border-b border-dashed border-gray-300 pb-0.5" title={o.address}>
             {o.address || 'Самовывоз'}
            </span>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     )}
    </div>
   </div>
  </div>
 );
}
