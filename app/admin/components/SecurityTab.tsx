"use client";

import React, { useState } from "react";
import { Shield, ShieldCheck, Key, Smartphone, Info, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function SecurityTab() {
 const { data: session, update } = useSession();
 const [isSettingUp, setIsSettingUp] = useState(false);
 const [qrCodeUrl, setQrCodeUrl] = useState("");
 const [secret, setSecret] = useState("");
 const [code, setCode] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState(false);

 const isEnabled = session?.user?.twoFactorEnabled;

 const handleStartSetup = async () => {
  setIsLoading(true);
  setError("");
  try {
   const res = await fetch("/api/admin/setup-2fa");
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Ошибка загрузки QR-кода");

   setQrCodeUrl(data.qrCodeUrl);
   setSecret(data.secret);
   setIsSettingUp(true);
  } catch (err: unknown) {
   setError(err instanceof Error ? err.message : 'Ошибка загрузки QR-кода');
  } finally {
   setIsLoading(false);
  }
 };

 const handleVerifySetup = async () => {
  setIsLoading(true);
  setError("");
  try {
   const res = await fetch("/api/admin/setup-2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Неверный код подтверждения");

   setSuccess(true);
   await update({ twoFactorEnabled: true });
   setTimeout(() => {
    setIsSettingUp(false);
    setSuccess(false);
   }, 2000);
  } catch (err: unknown) {
   setError(err instanceof Error ? err.message : 'Неверный код подтверждения');
  } finally {
   setIsLoading(false);
  }
 };

 return (
  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-gray-100 max-w-[800px]">
   <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
    <div className="flex items-center gap-4">
     <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${isEnabled ? 'bg-green-50 text-green-600' : 'bg-[#CD8B70]/10 text-[#CD8B70]'}`}>
      <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
     </div>
     <div>
      <h2 className="text-[18px] sm:text-[24px] font-black text-[#6B5D54] leading-tight">Двухфакторная аутентификация</h2>
      <p className="text-[13px] sm:text-[16px] text-[#9C9188] font-medium mt-1">Защитите ваш аккаунт входом через Google</p>
     </div>
    </div>
    <div className="sm:ml-auto mt-2 sm:mt-0">
     <span className={`px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-black uppercase tracking-wider ${isEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
      {isEnabled ? 'Активно' : 'Отключено'}
     </span>
    </div>
   </div>

   {!isSettingUp ? (
    <div className="grid gap-6">
     <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-gray-50">
      <h3 className="flex items-center gap-2 font-bold text-[#6B5D54] mb-2">
       <Key className="w-4 h-4" />
       Как это работает?
      </h3>
      <p className="text-[14px] text-[#9C9188] leading-relaxed">
       При входе в панель администратора, после ввода пароля, система попросит ввести 6-значный код из специального приложения (например, Google Authenticator) на вашем телефоне.
      </p>
     </div>

     <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl">
      <div className="flex items-center gap-4">
       <Smartphone className="w-10 h-10 text-[#6B5D54]/20" />
       <div>
        <p className="font-bold text-[#6B5D54]">Приложение Authenticator</p>
        <p className="text-[13px] text-[#9C9188]">Используйте для генерации кодов</p>
       </div>
      </div>
      {!isEnabled && (
       <button
        onClick={handleStartSetup}
        disabled={isLoading}
        className="px-6 py-3 bg-[#6B5D54] text-white rounded-2xl font-black text-[15px] hover:bg-[#5A4D45] transition-all disabled:opacity-50"
       >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Подключить"}
       </button>
      )}
     </div>
    </div>
   ) : (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div className="flex flex-col sm:flex-row items-center gap-10">
      <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-gray-50">
       {qrCodeUrl ? (
        <Image src={qrCodeUrl} alt="2FA QR Code" width={192} height={192} className="w-48 h-48" unoptimized />
       ) : (
        <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl">
         <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
       )}
      </div>

      <div className="flex-1 space-y-4">
       <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-4">
        <Info className="w-6 h-6 text-blue-500 shrink-0" />
        <p className="text-[14px] text-blue-700 font-medium">
         Откройте приложение Authenticator и отсканируйте код. Если не получается, введите секрет вручную:
         <code className="block mt-2 bg-white/50 p-2 rounded text-[16px] font-mono text-blue-900 select-all">{secret}</code>
        </p>
       </div>

       <div className="space-y-3">
        <label className="block text-[13px] font-bold text-[#9C9188] uppercase tracking-widest ml-1">Код подтверждения</label>
        <input
         type="text"
         maxLength={6}
         value={code}
         onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
         placeholder="000 000"
         className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl py-4 text-center text-[24px] font-black tracking-widest text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/20 transition-all"
        />
       </div>

       {error && <p className="text-red-500 text-[14px] font-bold text-center bg-red-50 py-3 rounded-xl">{error}</p>}

       <div className="flex gap-3 pt-4">
        <button
         onClick={() => setIsSettingUp(false)}
         className="flex-1 px-6 py-4 bg-gray-50 text-[#9C9188] rounded-2xl font-bold hover:bg-gray-100 transition-all"
        >
         Отмена
        </button>
        <button
         onClick={handleVerifySetup}
         disabled={isLoading || code.length < 6 || success}
         className={`flex-[2] px-6 py-4 rounded-2xl font-black text-[16px] transition-all flex items-center justify-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-[#CD8B70] text-white hover:bg-[#C27E63]'}`}
        >
         {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          success ? (
           <>
            <ShieldCheck className="w-5 h-5" />
            Готово!
           </>
          ) : "Активировать"
         )}
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
