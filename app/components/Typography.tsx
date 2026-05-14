
import React from "react";
import type { JSX } from "react";

export type TypographyProps = {
  as?: keyof JSX.IntrinsicElements;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle" | "body";
  className?: string;
  children: React.ReactNode;
};

const variantClasses: Record<string, string> = {
  h1: "text-4xl md:text-6xl font-bold uppercase text-center text-white mb-4",
  h2: "text-3xl md:text-5xl font-normal uppercase text-center text-white mb-4",
  h3: "text-2xl md:text-4xl font-normal uppercase text-center text-white mb-3",
  h4: "text-xl md:text-2xl font-normal text-center text-white mb-2",
  h5: "text-lg md:text-xl font-normal text-center text-white mb-2",
  h6: "text-base md:text-lg font-normal text-center text-white mb-1",
  subtitle: "text-lg md:text-xl font-light text-center text-white mb-2",
  body: "text-base md:text-lg text-center text-white mb-1",
};

export const Typography: React.FC<TypographyProps> = ({
  as = "h2",
  variant = "h2",
  className = "",
  children,
}) => {
  const Tag = as;
  return (
    <Tag className={`${variantClasses[variant] || ""} ${className}`.trim()}>
      {children}
    </Tag>
  );
};
