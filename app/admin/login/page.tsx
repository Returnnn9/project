"use client";

import React, { useState } from "react";
import { User, Key, ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
 const router = useRouter();

 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 const handleCredentialsSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
   const { signIn } = await import("next-auth/react");
   const res = await signIn("credentials", {
    redirect: false,
    email: username, // Mapping username to email field for NextAuth
    password: password,
   });

   if (res?.error) {
    throw new Error(res.error === "CredentialsSignin" ? "Неверный логин или пароль" : res.error);
   }

   // Successful login - middleware will now handle redirect to /admin or /admin/verify-2fa
   router.push("/admin");
  } catch (err: unknown) {
   setError(err instanceof Error ? err.message : 'Неверный логин или пароль');
  } finally {
   setIsLoading(false);
  }
 };

 // 2FA step removed as it's now handled by the separate /admin/verify-2fa page via middleware redirect


 return (
  <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 font-montserrat">
   <div className="w-full max-w-[440px]">
    {/* Logo Section */}
    <div className="flex flex-col items-center mb-8">
     <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 border border-gray-100">
      <Lock className="w-10 h-10 text-[#CD8B70]" />
     </div>
     <h1 className="text-[32px] font-black text-[#6B5D54] tracking-tight">Вход в Админку</h1>
     <p className="text-[#9C9188] font-medium mt-2 text-center">Гармония вкуса и эстетики управления</p>
    </div>

    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative p-8 sm:p-10">
     <form
      onSubmit={handleCredentialsSubmit}
      className="space-y-6"
     >
      <div>
       <label className="block text-[13px] font-bold text-[#9C9188] uppercase tracking-widest mb-3 ml-1">Логин</label>
       <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C9188]/50" />
        <input
         required
         type="text"
         value={username}
         onChange={(e) => setUsername(e.target.value)}
         className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl py-4 pl-12 pr-5 font-bold text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/20 transition-all placeholder:font-medium placeholder:text-gray-300"
         placeholder="admin"
        />
       </div>
      </div>

      <div>
       <label className="block text-[13px] font-bold text-[#9C9188] uppercase tracking-widest mb-3 ml-1">Пароль</label>
       <div className="relative">
        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C9188]/50" />
        <input
         required
         type="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         className="w-full bg-[#FAF8F5] border border-gray-100 rounded-2xl py-4 pl-12 pr-5 font-bold text-[#6B5D54] focus:outline-none focus:ring-2 focus:ring-[#CD8B70]/20 transition-all placeholder:font-medium placeholder:text-gray-300"
         placeholder="••••••••"
        />
       </div>
      </div>

      {error && <p className="text-red-500 text-[14px] font-bold text-center bg-red-50 py-3 rounded-xl">{error}</p>}

      <button
       disabled={isLoading}
       type="submit"
       className="w-full bg-[#6B5D54] text-white py-5 rounded-2xl font-black text-[18px] hover:bg-[#5A4D45] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
      >
       {isLoading ? "Проверка..." : (
        <>
         Продолжить
         <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
       )}
      </button>
     </form>
    </div>

    <p className="text-center mt-10 text-[13px] text-[#9C9188] font-bold uppercase tracking-widest opacity-40">
     Smusl © 2026 Admin Infrastructure
    </p>
   </div>
  </div>
 );
}
