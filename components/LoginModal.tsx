"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, ArrowRight, Loader2, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useUIStore, useUserStore, useStoreData } from "@/store/hooks";

/* ─── Phone input formatting ─────────────────────────────── */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  let r = "+7";
  if (digits.length > 1) r += " (" + digits.slice(1, 4);
  if (digits.length > 4) r += ") " + digits.slice(4, 7);
  if (digits.length > 7) r += "-" + digits.slice(7, 9);
  if (digits.length > 9) r += "-" + digits.slice(9, 11);
  return r;
}

function rawDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

/* ─── OTP input: 4 boxes ─────────────────────────────────── */
function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onInput = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("").slice(0, 4);
    arr[i] = digit;
    const next = arr.join("").padEnd(4, " ").slice(0, 4);
    // trim trailing spaces
    const trimmed = next.trimEnd();
    onChange(trimmed);
    if (digit && i < 3) {
      inputs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 3)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={onPaste}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => onInput(i, e)}
          onKeyDown={(e) => onKey(i, e)}
          autoFocus={i === 0}
          className={[
            "w-[64px] h-[76px] text-center text-[32px] font-[900] rounded-[1.2rem] outline-none transition-all duration-300",
            "text-[#3A332E]",
            value[i]
              ? "border-2 border-[#CF8F73] bg-white shadow-[0_12px_24px_-8px_rgba(207,143,115,0.4)] scale-105"
              : "border-2 border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.04] focus:border-[#CF8F73]/50 focus:bg-white focus:scale-105",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* ─── Countdown tick ─────────────────────────────────────── */
function useCountdown(initial: number) {
  const [remaining, setRemaining] = useState(0);
  const start = () => setRemaining(initial);
  useEffect(() => {
    if (!remaining) return;
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remaining]);
  return { remaining, start };
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
type Step = "phone" | "code" | "done";

const LoginModal: React.FC = () => {
  const uiStore = useUIStore();
  const userStore = useUserStore();

  const isAuthModalOpen = useStoreData(uiStore, (s) => s.getIsAuthModalOpen());
  const setAuthModalOpen = (open: boolean) => uiStore.setAuthModalOpen(open);

  const [step, setStep] = useState<Step>("phone");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");       // raw formatted: +7 (9XX) ...
  const [otp, setOtp]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptNews, setAcceptNews] = useState(true);

  const { remaining, start: startCountdown } = useCountdown(60);

  /* reset on close */
  const handleClose = () => {
    setAuthModalOpen(false);
    setTimeout(() => {
      setStep("phone");
      setPhone("");
      setOtp("");
      setError("");
    }, 400);
  };

  const phoneDigits = rawDigits(phone);
  const ADMIN_PHONE = '79222222222';
  const isAdmin = phoneDigits === ADMIN_PHONE;
  const isPhoneValid = phoneDigits.length === 11;
  const isOtpComplete = isAdmin ? otp.length >= 4 : otp.length === 4;

  /* ── Step 1: send OTP ── */
  const handleSend = async () => {
    if (!isPhoneValid || isLoading) return;
    if (isRegister && !name.trim()) {
      setError("Пожалуйста, введите ваше имя");
      return;
    }
    setError("");
    
    if (isAdmin) {
      setOtp("");
      setStep("code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка отправки");
        return;
      }
      setOtp("");
      setStep("code");
      startCountdown();
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Step 2: verify OTP ── */
  const handleVerify = async () => {
    if (!isOtpComplete || isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const { signIn } = await import("next-auth/react");
      const res = await signIn("phone-otp", {
        redirect: false,
        phone,
        code: otp,
        name: isRegister ? name : undefined,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Неверный код" : res.error);
        setOtp("");
        return;
      }

      // Save phone (and name if registering) to userStore
      userStore.setUserPhone(phone);
      if (isRegister && name) {
        userStore.setUserName(name);
      }

      setStep("done");
      setTimeout(() => {
        handleClose();
        window.location.href = "/profile";
      }, 1800);
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setIsLoading(false);
    }
  };

  /* Auto-verify when all 4 digits entered (Skip for admin password) */
  useEffect(() => {
    if (!isAdmin && isOtpComplete && step === "code") {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, isAdmin]);

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-[#3A332E]/40 backdrop-blur-md"
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          className="relative w-full sm:max-w-[420px] bg-white/95 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] sm:shadow-2xl sm:border border-white/40 mt-auto sm:my-auto pb-6 sm:pb-0 overflow-hidden"
        >
          {/* Decorative glowing orb */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CF8F73]/15 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
          >
            <X className="w-5 h-5 text-[#4A403A]/50" />
          </button>

          {/* Drag Handle for Mobile */}
          <div className="w-12 h-1.5 bg-gray-200/70 rounded-full mx-auto mt-4 sm:hidden shrink-0" />

          <AnimatePresence mode="wait">

            {/* ── STEP: PHONE ── */}
            {step === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", damping: 30, stiffness: 240 }}
                className="p-8 sm:p-10 pt-12"
              >

                {/* Tabs */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="flex bg-[#F8F8F8] p-1.5 rounded-[1.4rem] mb-8"
                >
                  <button 
                    onClick={() => { setIsRegister(false); setError(""); }}
                    className={`flex-1 py-3.5 text-[15px] font-[800] rounded-[1.2rem] transition-all ${!isRegister ? "bg-white text-[#3A332E] shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : "text-[#3A332E]/40 hover:text-[#3A332E]/70"}`}
                  >
                    Вход
                  </button>
                  <button 
                    onClick={() => { setIsRegister(true); setError(""); }}
                    className={`flex-1 py-3.5 text-[15px] font-[800] rounded-[1.2rem] transition-all ${isRegister ? "bg-white text-[#3A332E] shadow-[0_4px_12px_rgba(0,0,0,0.05)]" : "text-[#3A332E]/40 hover:text-[#3A332E]/70"}`}
                  >
                    Регистрация
                  </button>
                </motion.div>

                <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[28px] sm:text-[32px] font-[900] text-[#3A332E] text-center mb-2 tracking-tight">
                  {isRegister ? "Создать аккаунт" : "С возвращением!"}
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-[#3A332E]/50 text-[15px] text-center mb-8 font-medium">
                  {isRegister ? "Введите имя и номер — пришлём код" : "Введите номер — пришлём код в SMS"}
                </motion.p>

                {isRegister && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-[#CF8F73]/40 focus-within:bg-white transition-all mb-4">
                    <svg className="w-5 h-5 text-[#CF8F73] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={name}
                      placeholder="Ваше имя"
                      autoFocus={isRegister}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-none outline-none text-[17px] font-bold text-[#3A332E] placeholder:text-[#3A332E]/25 w-full"
                    />
                  </motion.div>
                )}

                {/* Phone input */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-[#CF8F73]/40 focus-within:bg-white transition-all mb-4">
                  <Phone className="w-5 h-5 text-[#CF8F73] shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    placeholder="+7 (9XX) XXX-XX-XX"
                    autoFocus={!isRegister}
                    onChange={(e) => {
                      const digits = rawDigits(e.target.value);
                      setPhone(formatPhone(digits.startsWith("7") ? digits : "7" + digits));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isPhoneValid) handleSend();
                    }}
                    className="bg-transparent border-none outline-none text-[17px] font-bold text-[#3A332E] placeholder:text-[#3A332E]/25 w-full"
                  />
                </motion.div>

                {/* News consent only on registration */}
                {isRegister && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setAcceptNews(!acceptNews)}
                      className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                        acceptNews
                          ? "bg-[#CF8F73] border-[#CF8F73] shadow-sm shadow-[#CF8F73]/20"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {acceptNews && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <p className="text-[13px] font-medium text-[#3A332E]/50 leading-snug">
                      Соглашаюсь получать новости и специальные предложения
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 mb-4 rounded-[1.4rem] bg-red-500/5 backdrop-blur-md border border-red-500/20 shadow-[0_8px_24px_-8px_rgba(239,68,68,0.25)]"
                  >
                    <div className="relative shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 mb-auto mt-0.5">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                      <AlertCircle className="relative w-4 h-4 text-red-500" strokeWidth={3} />
                    </div>
                    <p className="text-red-600 text-[14px] font-bold leading-snug">
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  onClick={handleSend}
                  disabled={!isPhoneValid || isLoading}
                  className="w-full h-[64px] bg-gradient-to-r from-[#CF8F73] to-[#B87A60] disabled:opacity-50 text-white rounded-[1.4rem] font-[800] text-[17px] flex items-center justify-center gap-2 hover:brightness-105 transition-all active:scale-95 shadow-[0_16px_40px_-12px_rgba(207,143,115,0.6)]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Получить код</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-5 text-[11px] font-medium text-[#3A332E]/25 leading-relaxed text-center px-2">
                  Нажимая «Получить код», принимаю{" "}
                  <a href="/offer" className="text-[#CF8F73] underline underline-offset-2">оферту</a>
                  {" "}и{" "}
                  <a href="/terms" className="text-[#CF8F73] underline underline-offset-2">пользовательское соглашение</a>
                </motion.p>

                {/* Social divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3A332E]/8" />
                  </div>
                  <span className="relative flex justify-center">
                    <span className="px-4 bg-white text-[#3A332E]/30 text-[11px] font-bold uppercase tracking-widest">
                      или через
                    </span>
                  </span>
                </div>

                {/* Social buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => import("next-auth/react").then((m) => m.signIn("google"))}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#EBEBEB] rounded-2xl font-bold text-[13px] text-[#4A403A] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: CODE ── */}
            {step === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", damping: 30, stiffness: 240 }}
                className="p-8 sm:p-10 pt-12"
              >
                <button
                  onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                  className="absolute top-6 left-6 p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#4A403A]/50" />
                </button>

                <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[28px] sm:text-[32px] font-[900] text-[#3A332E] text-center mb-2 tracking-tight">
                  {isAdmin ? "Вход для админа" : "Введите код"}
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[#3A332E]/50 text-[15px] text-center mb-8 font-medium leading-snug">
                  {isAdmin ? (
                    <>Введите секретный пароль для <span className="text-[#3A332E] font-bold">{phone}</span></>
                  ) : (
                    <>Отправили SMS на <span className="text-[#3A332E] font-bold">{phone}</span></>
                  )}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  {isAdmin ? (
                    <div className="bg-[#F8F8F8] rounded-[1.2rem] px-5 py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-[#CF8F73]/40 focus-within:bg-white transition-all shadow-sm">
                      <input
                        type="password"
                        value={otp}
                        placeholder="Пароль администратора"
                        autoFocus
                        onChange={(e) => setOtp(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && isOtpComplete) handleVerify();
                        }}
                        className="bg-transparent border-none outline-none text-[17px] font-bold text-[#3A332E] placeholder:text-[#3A332E]/25 w-full text-center tracking-[0.3em]"
                      />
                    </div>
                  ) : (
                    <OtpBoxes value={otp} onChange={setOtp} />
                  )}
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 mt-5 rounded-[1.4rem] bg-red-500/5 backdrop-blur-md border border-red-500/20 shadow-[0_8px_24px_-8px_rgba(239,68,68,0.25)]"
                  >
                    <div className="relative shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 mb-auto mt-0.5">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                      <AlertCircle className="relative w-4 h-4 text-red-500" strokeWidth={3} />
                    </div>
                    <p className="text-red-600 text-[14px] font-bold leading-snug">
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  onClick={handleVerify}
                  disabled={!isOtpComplete || isLoading}
                  className="w-full h-[64px] bg-gradient-to-r from-[#CF8F73] to-[#B87A60] disabled:opacity-50 text-white rounded-[1.4rem] font-[800] text-[17px] flex items-center justify-center gap-2 hover:brightness-105 transition-all active:scale-95 shadow-[0_16px_40px_-12px_rgba(207,143,115,0.6)] mt-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Подтвердить</span>
                  )}
                </motion.button>

                {/* Resend (Only for non-admin) */}
                {!isAdmin && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-5 text-center text-[13px] font-medium">
                    {remaining > 0 ? (
                      <span className="text-[#3A332E]/30">
                        Повторить через {remaining} сек.
                      </span>
                    ) : (
                      <button
                        onClick={() => { setOtp(""); handleSend(); }}
                        className="text-[#CF8F73] hover:underline font-bold"
                      >
                        Отправить код повторно
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── STEP: DONE ── */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 flex flex-col items-center justify-center min-h-[320px]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 180, delay: 0.1 }}
                  className="relative w-24 h-24 mb-8 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-[#34A853]/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#34A853] to-[#2b8c45] flex items-center justify-center shadow-[0_12px_32px_rgba(52,168,83,0.4)]">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-[28px] sm:text-[32px] font-[900] text-[#3A332E] mb-2 tracking-tight">Вы вошли!</h2>
                <p className="text-[#3A332E]/40 text-[14px] font-medium">Переходим в профиль…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
