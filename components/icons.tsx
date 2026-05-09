import React from "react";

interface IconProps {
 size?: number;
 className?: string;
}

export const SearchIcon = ({ size = 18, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
 </svg>
);

export const PlusIcon = ({ size = 16, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={className}>
  <path d="M12 5v14M5 12h14" />
 </svg>
);

export const MinusIcon = ({ size = 14, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={className}>
  <path d="M5 12h14" />
 </svg>
);

export const ChevronDown = ({ size = 14, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <path d="m6 9 6 6 6-6" />
 </svg>
);

export const ArrowRight = ({ size = 16, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <path d="M5 12h14M12 5l7 7-7 7" />
 </svg>
);

export const UserIcon = ({ size = 20, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
 </svg>
);

export const ClockIcon = ({ size = 18, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
 </svg>
);

export const ChefHatIcon = ({ size = 18, className = "" }: IconProps) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
  <path d="M6 13.81A6 6 0 1 1 18 13.8A6 6 0 0 1 6 13.81Z" />
  <path d="M9 13v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-7" />
  <path d="M9 16h6" />
 </svg>
);
