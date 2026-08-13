"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "horizontal" | "vertical" | "grid";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "horizontal",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all select-none shrink-0",
              isActive
                ? "bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77] shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] rounded-full font-bold",
                  isActive
                    ? "bg-[#0F6B5C] text-white dark:bg-[#148A77]"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
