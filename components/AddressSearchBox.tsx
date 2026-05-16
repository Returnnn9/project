"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Clock, MapPin, Building2, Navigation, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OSMSuggestion } from "@/lib/types/address";

// ─── Distance ─────────────────────────────────────────────────────────────────

function haversineKm(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371;
  const r = (n: number) => (n * Math.PI) / 180;
  const a =
    Math.sin(r(la2 - la1) / 2) ** 2 +
    Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(r(lo2 - lo1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number): string {
  if (km < 0.05) return "";
  if (km < 1) return `${Math.round(km * 1000)} м`;
  if (km < 10) return `${km.toFixed(1)} км`;
  return `${Math.round(km)} км`;
}

// ─── Text highlighting ─────────────────────────────────────────────────────────

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const words = query
    .toLowerCase()
    .replace(/ё/g, "е")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!words.length) return <>{text}</>;

  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts: { t: string; hi: boolean }[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ t: text.slice(last, match.index), hi: false });
    parts.push({ t: match[0], hi: true });
    last = regex.lastIndex;
    if (match[0].length === 0) regex.lastIndex++;
  }
  if (last < text.length) parts.push({ t: text.slice(last), hi: false });

  return (
    <>
      {parts.map((p, i) =>
        p.hi ? (
          <span key={i} className="text-[#CF8F73] font-semibold">
            {p.t}
          </span>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  );
}

// ─── Item icon ─────────────────────────────────────────────────────────────────

function getIconStyle(item: OSMSuggestion, isHistory: boolean) {
  if (isHistory) return { Icon: Clock, bg: "bg-gray-100", ic: "text-gray-400" };
  if (item.address?.house_number) return { Icon: Building2, bg: "bg-blue-50", ic: "text-blue-400" };
  return { Icon: MapPin, bg: "bg-[#CF8F73]/10", ic: "text-[#CF8F73]" };
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="py-1">
      {[72, 88, 62].map((w, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
            <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: `${w - 22}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty ─────────────────────────────────────────────────────────────────────

function Empty({ query }: { query: string }) {
  return (
    <div className="py-10 px-6 text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <MapPin className="w-6 h-6 text-gray-200" />
      </div>
      <p className="text-[13px] font-semibold text-gray-400">Ничего не найдено</p>
      {query.length > 2 && (
        <p className="text-[12px] text-gray-300 mt-1 leading-relaxed">
          Проверьте написание или уточните улицу
        </p>
      )}
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface AddressSearchBoxProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (item: OSMSuggestion) => void;
  onClear: () => void;
  onGeolocate?: () => void;
  suggestions: OSMSuggestion[];
  history: OSMSuggestion[];
  onClearHistory?: () => void;
  isLoading: boolean;
  isLocating?: boolean;
  placeholder?: string;
  userCoords?: [number, number] | null;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AddressSearchBox({
  query,
  onQueryChange,
  onSelect,
  onClear,
  onGeolocate,
  suggestions,
  history,
  onClearHistory,
  isLoading,
  isLocating = false,
  placeholder = "Поиск адреса...",
  userCoords,
  className,
}: AddressSearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isShort = query.trim().length < 2;
  const showHistory = isFocused && isShort && history.length > 0;
  const showResults = isFocused && !isShort;
  const isOpen = showHistory || showResults;
  const items: OSMSuggestion[] = showHistory ? history : suggestions;

  useEffect(() => { setActiveIdx(-1); }, [items.length, isFocused]);

  // Scroll active item into view on keyboard nav
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx]);

  // Click outside → close
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleSelect = useCallback(
    (item: OSMSuggestion) => {
      setIsFocused(false);
      setActiveIdx(-1);
      onSelect(item);
    },
    [onSelect]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIdx >= 0 && items[activeIdx]) handleSelect(items[activeIdx]);
        break;
      case "Escape":
        e.preventDefault();
        setIsFocused(false);
        setActiveIdx(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* ── Input pill ── */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-5 h-[52px]",
          "bg-[#F8F8F8] rounded-[1.2rem]",
          "border transition-all duration-200",
          isFocused
            ? "border-[#CF8F73]/50 bg-white shadow-[0_4px_20px_rgba(207,143,115,0.08)]"
            : "border-transparent focus-within:border-gray-300 hover:border-gray-200"
        )}
      >
        {/* Icon: spinner while loading, else search */}
        <div className="shrink-0">
          {isLoading ? (
            <Loader2 className="w-[18px] h-[18px] text-[#CF8F73] animate-spin" />
          ) : (
            <Search
              className={cn(
                "transition-colors duration-200",
                isFocused ? "text-[#CF8F73]" : "text-gray-400"
              )}
              style={{ width: 18, height: 18 }}
            />
          )}
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent text-[16px] font-extrabold text-[#3A332E] placeholder:text-gray-300 placeholder:font-bold outline-none"
        />

        {/* Right-side controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Clear */}
          {query.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onClear();
                inputRef.current?.focus();
              }}
              aria-label="Очистить"
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-90"
            >
              <X style={{ width: 13, height: 13 }} />
            </button>
          )}
          {/* Geolocate */}
          {onGeolocate && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onGeolocate();
              }}
              disabled={isLocating}
              aria-label="Моё местоположение"
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full transition-all active:scale-90",
                isLocating
                  ? "text-[#CF8F73] bg-[#CF8F73]/10"
                  : "text-gray-400 hover:text-[#CF8F73] hover:bg-[#CF8F73]/10"
              )}
            >
              {isLocating ? (
                <Loader2 className="w-[14px] h-[14px] animate-spin" />
              ) : (
                <Navigation style={{ width: 14, height: 14 }} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="addr-dd"
            initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
            style={{ originY: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100/80 shadow-[0_20px_60px_rgba(0,0,0,0.11)] overflow-hidden z-[1001]"
          >
            {/* History header */}
            {showHistory && (
              <div className="flex items-center justify-between px-4 pt-3.5 pb-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
                  Недавние
                </span>
                {onClearHistory && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onClearHistory();
                    }}
                    className="text-[11px] font-medium text-gray-400 hover:text-[#CF8F73] transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>
            )}

            {/* Loading skeleton — only when fetching with no prior results */}
            {showResults && isLoading && suggestions.length === 0 && <Skeleton />}

            {/* Result / history list */}
            {items.length > 0 && (
              <div
                ref={listRef}
                className="py-1.5 max-h-[320px] overflow-y-auto"
              >
                {items.map((item, i) => {
                  const title = item.address?.title || item.display_name || "";
                  const subtitle = item.address?.subtitle || item.address?.city || "";
                  const isActive = i === activeIdx;
                  const { Icon, bg, ic } = getIconStyle(item, showHistory);

                  let dist = "";
                  if (userCoords && item.lat && item.lon) {
                    const km = haversineKm(
                      userCoords[0], userCoords[1],
                      parseFloat(item.lat), parseFloat(item.lon)
                    );
                    dist = fmtDist(km);
                  }

                  return (
                    <button
                      key={`${title}-${i}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(item);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer",
                        "border-b border-gray-50 last:border-0",
                        "transition-colors duration-100",
                        isActive ? "bg-[#CF8F73]/6" : "hover:bg-gray-50/80",
                        "group"
                      )}
                    >
                      {/* Type icon */}
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-100 group-hover:scale-105",
                          bg
                        )}
                      >
                        <Icon className={ic} style={{ width: 16, height: 16 }} />
                      </div>

                      {/* Title + subtitle */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-[500] text-[#3A332E] truncate leading-[1.3]">
                          {showResults ? (
                            <HighlightText text={title} query={query} />
                          ) : (
                            title
                          )}
                        </div>
                        {subtitle && (
                          <div className="text-[12px] text-gray-400 truncate mt-[2px] leading-[1.3]">
                            {subtitle}
                          </div>
                        )}
                      </div>

                      {/* Distance badge */}
                      {dist && (
                        <span className="text-[11px] font-[500] text-gray-300 shrink-0 tabular-nums">
                          {dist}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {showResults && !isLoading && suggestions.length === 0 && (
              <Empty query={query} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
