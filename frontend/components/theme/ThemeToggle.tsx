"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-lg border transition-colors flex items-center gap-2 text-xs font-semibold select-none",
        theme === "dark"
          ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
          : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200",
        className
      )}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};
