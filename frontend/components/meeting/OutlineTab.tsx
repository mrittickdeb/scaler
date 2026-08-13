"use client";

import React from "react";
import { List, Play } from "lucide-react";
import { OutlineItem } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export interface OutlineTabProps {
  outlineItems: OutlineItem[];
  onSeekTo: (time: number) => void;
}

export const OutlineTab: React.FC<OutlineTabProps> = ({ outlineItems, onSeekTo }) => {
  if (!outlineItems || outlineItems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-xs">
        <List className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          No outline chapters available
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <List className="w-5 h-5 text-[#0F6B5C] dark:text-[#148A77]" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Meeting Chapters & Outline
        </h2>
      </div>

      <div className="space-y-2">
        {outlineItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onSeekTo(item.startTime)}
            className="group flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-[#E8F5F2] dark:hover:bg-[#0B332C] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0F6B5C]/50 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center group-hover:bg-[#0F6B5C] dark:group-hover:bg-[#148A77] group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0F6B5C] dark:group-hover:text-[#148A77]">
                {item.title}
              </span>
            </div>

            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#0F6B5C] dark:group-hover:text-[#148A77] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Play className="w-3 h-3 fill-current" />
              <span>{formatDuration(item.startTime)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
