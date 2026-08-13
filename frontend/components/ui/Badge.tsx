import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "default" | "teal" | "gray" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "teal",
  children,
  className,
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700",
    teal: "bg-[#E8F5F2] text-[#0F6B5C] dark:bg-teal-900/50 dark:text-teal-200 border-teal-200 dark:border-teal-700",
    gray: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
    warning: "bg-amber-50 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-700",
    error: "bg-rose-50 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200 border-rose-200 dark:border-rose-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
