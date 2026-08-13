"use client";

import React, { useState, useEffect } from "react";
import { BarChart2, Video, Clock, CheckSquare, Users, TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchMeetings } from "@/lib/api";
import { Meeting } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export default function AnalyticsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMeetings();
        setMeetings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalMeetings = meetings.length;
  const totalDuration = meetings.reduce((acc, m) => acc + (m.durationSeconds || 0), 0);
  const avgDuration = totalMeetings > 0 ? Math.round(totalDuration / totalMeetings) : 0;
  const totalParticipants = new Set(meetings.flatMap((m) => m.participants?.map((p) => p.name) || [])).size;

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 w-full">
        <Skeleton variant="line" className="w-48 h-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Workspace Analytics & Insights
          </h1>
          <Badge variant="teal">Realtime Data</Badge>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Track meeting volume, duration trends, speaker activity, and action item retention.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Meetings</span>
            <div className="p-2 rounded-lg bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77]">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalMeetings}</p>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +140% MOM Growth
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Audio Time</span>
            <div className="p-2 rounded-lg bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatDuration(totalDuration)}</p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Avg {formatDuration(avgDuration)} / call
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Speakers</span>
            <div className="p-2 rounded-lg bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalParticipants}</p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Across 5 departments
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Task Completion</span>
            <div className="p-2 rounded-lg bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">82%</p>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            High team velocity
          </span>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Meeting Category Breakdown
            </h3>
            <Sparkles className="w-4 h-4 text-[#0F6B5C]" />
          </div>

          <div className="space-y-3">
            {[
              { label: "Engineering & Sprint Planning", pct: 40, color: "bg-[#0F6B5C]" },
              { label: "Client Kickoffs & Enterprise Sales", pct: 25, color: "bg-indigo-600" },
              { label: "1:1 Check-ins & Career Growth", pct: 20, color: "bg-amber-500" },
              { label: "Product & Design Reviews", pct: 15, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-slate-500">{item.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Top Active Participants
            </h3>
            <Users className="w-4 h-4 text-[#0F6B5C]" />
          </div>

          <div className="space-y-3">
            {[
              { name: "Alex Chen", role: "Product Lead", calls: 6 },
              { name: "Jordan Taylor", role: "Tech Lead", calls: 4 },
              { name: "Sarah Jenkins", role: "VP Ops (Acme)", calls: 2 },
              { name: "Maya Lin", role: "Frontend Lead", calls: 2 },
            ].map((person) => (
              <div key={person.name} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{person.name}</p>
                  <p className="text-[11px] text-slate-500">{person.role}</p>
                </div>
                <Badge variant="teal">{person.calls} Meetings</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
