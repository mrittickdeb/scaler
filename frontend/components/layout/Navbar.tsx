"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, BarChart2, Settings, Puzzle, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Meetings", href: "/", icon: Video, active: pathname === "/" || pathname?.startsWith("/meetings") },
    { label: "Analytics", href: "/analytics", icon: BarChart2, active: pathname === "/analytics" },
    { label: "Integrations", href: "/integrations", icon: Puzzle, active: pathname === "/integrations" },
    { label: "Settings", href: "/settings", icon: Settings, active: pathname === "/settings" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-xs">
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-[#0F6B5C] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-none">
              EchoNotes
            </h1>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              Meeting Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-2 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors select-none",
                  item.active
                    ? "bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Icon className={cn("w-4 h-4", item.active ? "text-[#0F6B5C] dark:text-[#148A77]" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle & User Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <ThemeToggle className="w-full justify-center" />

        <div className="flex items-center gap-3 pt-1">
          <Avatar name="Alex Chen" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              Alex Chen
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">alex@echonotes.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
