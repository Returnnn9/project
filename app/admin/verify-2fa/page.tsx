"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Verify2FAPage() {
 const router = useRouter();
 const { data: session, status } = useSession();
 const [code, setCode] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
  if (status === "unauthenticated") {
   router.push("/admin/login");
  }
 }, [status, router]);

 const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
   const res = await fetch("/api/admin/verify-2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
   });

   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Неверный код");

   // Set cookie client-side too if needed, but API should handle it
   router.push("/admin");
  } catch (err: any) {
   setError(err.message);
  } finally {
   setIsLoading(false);
  }
 };

 if (status === "loading") return null;

 return (
  <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 font-montserrat">
   <div className="w-full max-w-[440px]">
    <div className="flex flex-col items-center mb-8">
     <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 border border-gray-100">
      <Lock className="w-10 h-10 text-[#CD8B70]" />
     </div>
     <h1 className="text-[32px] font-black text-[#6B5D54] tracking-tight text-center">Безопасность</h1>
     <p className="text-[#9C9188] font-medium mt-2 text-center">Подтвердите вход через 2FA</p>
    </div>

    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative p-8 sm:p-10">
     <form onSubmit={handleVerify} className="space-y-6">
      <div className="text-center">
       <div className="w-16 h-16 bg-[#CD8B70]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-8 h-8 text-[#CD8B70]" />
       </div>
       <h2 className="text-[20px] font-black text-[#6B5D54]">Код подтверждения</h2>
       <p className="text-[14px] text-[#9C9188] font-medium mt-1">Введите 6 цифр из вашего приложения</p>
      </div>

      <div className="relative">
       <input
        required
        autoFocus
        type="text"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
        className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl py-5 text-center text-[32px] font-black tracking-[0.5em] text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/20 transition-all placeholder:text-gray-200"
        placeholder="000000"
       />
      </div>

      {error && <p className="text-red-500 text-[14px] font-bold text-center bg-red-50 py-3 rounded-xl">{error}</p>}

      <button
       disabled={isLoading || code.length < 6}
       type="submit"
       className="w-full bg-[#CD8B70] text-white py-5 rounded-2xl font-black text-[18px] hover:bg-[#C27E63] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
      >
       {isLoading ? "Проверка..." : "Подтвердить"}
      </button>

      <motion.button
       whileHover={{ scale: 1.02, color: "#6B5D54" }}
       whileTap={{ scale: 0.98 }}
       type="button"
       onClick={() => {
        const { signOut } = require("next-auth/react");
        signOut();
       }}
       className="w-full text-[#9C9188] font-bold text-[14px] transition-colors flex items-center justify-center gap-2 pt-2 group"
      >
       <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
       Выйти из аккаунта
      </motion.button>
     </form>
    </div>
   </div>
  </div>
 );
}
