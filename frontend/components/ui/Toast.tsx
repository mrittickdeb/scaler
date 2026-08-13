"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info" }: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, title, description, variant };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-5 fade-in duration-200 transition-all",
              t.variant === "success" && "border-emerald-200 text-emerald-950 dark:border-emerald-800 dark:text-emerald-100",
              t.variant === "error" && "border-rose-200 text-rose-950 dark:border-rose-800 dark:text-rose-100",
              t.variant === "info" && "border-slate-200 text-slate-900 dark:border-slate-800 dark:text-slate-100"
            )}
          >
            {t.variant === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {t.variant === "error" && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {t.variant === "info" && <Info className="w-5 h-5 text-[#0F6B5C] dark:text-[#148A77] shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{t.title}</h4>
              {t.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
