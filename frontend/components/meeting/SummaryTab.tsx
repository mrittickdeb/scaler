"use client";

import React from "react";
import { Sparkles, Calendar } from "lucide-react";
import { Summary } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate } from "@/lib/utils";

export interface SummaryTabProps {
  summary?: Summary;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-xs">
        <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          No summary generated yet
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0F6B5C] dark:text-[#148A77]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Executive Summary
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={summary.source === "llm" ? "teal" : "gray"}>
            {summary.source === "llm" ? "Google Gemini AI" : "Seeded Summary"}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatRelativeDate(summary.generatedAt)}
          </span>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-base leading-relaxed font-normal text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          {summary.overviewText}
        </p>
      </div>
    </div>
  );
};
