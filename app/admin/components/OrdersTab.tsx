"use client";

import React, { useEffect, useState } from 'react';
import { Order } from '@/store/types';
import { 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Package, 
  Truck, 
  XCircle, 
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const STATUS_CONFIG = {
  new: { label: 'Новый', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Clock },
  processing: { label: 'В работе', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: Package },
  shipped: { label: 'Отправлен', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Truck },
  delivered: { label: 'Доставлен', color: 'bg-green-50 text-green-600 border-green-100', icon: CheckCircle2 },
  cancelled: { label: 'Отменен', color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle },
};

const formatOrderDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : '—';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (o.userPhone || '').includes(searchQuery) ||
      o.id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left List */}
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Поиск заказа..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#CD8B70]/20 focus:border-[#CD8B70] transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#9C9188] shrink-0" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-[#6B5D54] outline-none cursor-pointer hover:text-[#CD8B70] transition-colors"
            >
              <option value="all">Все статусы</option>
              <option value="new">Новые</option>
              <option value="processing">В работе</option>
              <option value="shipped">Отправлены</option>
              <option value="delivered">Доставлены</option>
              <option value="cancelled">Отменены</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="p-12 text-center text-[#9C9188]">Загрузка заказов...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-[#9C9188]">Заказов не найдено</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredOrders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status || 'new'].icon;
                const config = STATUS_CONFIG[order.status || 'new'];
                
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "w-full p-6 text-left hover:bg-gray-50 transition-all flex items-center justify-between group",
                      selectedOrder?.id === order.id && "bg-[#FAF8F5] border-l-4 border-[#CD8B70]"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border", config.color)}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-[#6B5D54]">#{order.id.toString().slice(-6)}</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border", config.color)}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[14px] font-bold text-[#6B5D54] truncate max-w-[200px]">
                          {order.userName || 'Гость'}
                        </p>
                        <p className="text-[12px] text-[#9C9188] font-medium">
                          {formatOrderDate(order.createdAt)} • {order.total} ₽
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 text-gray-300 group-hover:text-[#6B5D54] transition-all", selectedOrder?.id === order.id && "translate-x-1 text-[#CD8B70]")} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="lg:w-[450px] bg-white rounded-[2rem] shadow-sm border border-gray-50 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <motion.div 
              key={selectedOrder.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Detail Header */}
              <div className="p-8 pb-4 border-b border-gray-50 relative shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-black text-[#6B5D54]">Детали заказа</h2>
                  <div className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border", STATUS_CONFIG[selectedOrder.status || 'new'].color)}>
                    {STATUS_CONFIG[selectedOrder.status || 'new'].label}
                  </div>
                </div>
                
                {/* Status Switcher */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {(Object.keys(STATUS_CONFIG) as Array<Order['status']>).map(s => (
                    <button
                      key={s}
                      onClick={() => updateOrderStatus(selectedOrder.id, s)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                        selectedOrder.status === s 
                          ? "bg-[#6B5D54] text-white border-[#6B5D54]" 
                          : "bg-gray-50 text-[#9C9188] border-gray-100 hover:border-gray-200"
                      )}
                    >
                      {STATUS_CONFIG[s || 'new'].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-8 pt-6 no-scrollbar">
                {/* Customer Section */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#6B5D54]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Клиент</p>
                      <p className="text-[16px] font-black text-[#6B5D54]">{selectedOrder.userName || 'Имя не указано'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#6B5D54]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Телефон</p>
                      <p className="text-[16px] font-black text-[#6B5D54]">{selectedOrder.userPhone || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#6B5D54]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Адрес доставки</p>
                      <p className="text-[15px] font-bold text-[#6B5D54] leading-relaxed">
                        {selectedOrder.address || 'Самовывоз'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Состав заказа</p>
                    <p className="text-[11px] font-bold text-[#CD8B70]">{selectedOrder.items.length} поз.</p>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] overflow-hidden relative shrink-0 border border-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-black text-[#6B5D54] truncate">{item.name}</p>
                          <p className="text-[12px] text-[#9C9188] font-bold">{item.quantity} x {item.price} ₽</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-black text-[#6B5D54]">{item.quantity * item.price} ₽</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-8 border-t border-gray-50 bg-gray-50/50 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 font-bold text-[13px]">Итого к оплате</span>
                  <span className="text-[24px] font-black text-[#6B5D54]">{selectedOrder.total} ₽</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-green-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Оплачено онлайн (СПБ)</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-[18px] font-black text-[#6B5D54] mb-2">Заказ не выбран</h3>
              <p className="text-[14px] text-[#9C9188] font-medium leading-relaxed max-w-[200px]">
                Выберите заказ из списка слева, чтобы увидеть подробную информацию.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
