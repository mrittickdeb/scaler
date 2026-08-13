"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronUp, ChevronDown, Play } from "lucide-react";
import { TranscriptSegment } from "@/lib/types";
import { formatDuration, getSpeakerColor, cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

export interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeekTo: (time: number) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  segments,
  currentTime,
  onSeekTo,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const segmentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const activeSegment = segments.find(
    (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
  ) || (currentTime > 0 ? segments.find((s) => currentTime >= s.startTime) : undefined);

  const activeSegmentId = activeSegment?.id;

  const matchingSegments = searchQuery.trim()
    ? segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (activeSegmentId) {
      const el = segmentRefs.current.get(activeSegmentId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeSegmentId]);

  const handleNextMatch = () => {
    if (matchingSegments.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matchingSegments.length;
    setActiveMatchIndex(nextIdx);
    const targetSeg = matchingSegments[nextIdx];
    onSeekTo(targetSeg.startTime);
    const el = segmentRefs.current.get(targetSeg.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handlePrevMatch = () => {
    if (matchingSegments.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matchingSegments.length) % matchingSegments.length;
    setActiveMatchIndex(prevIdx);
    const targetSeg = matchingSegments[prevIdx];
    onSeekTo(targetSeg.startTime);
    const el = segmentRefs.current.get(targetSeg.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-800 dark:text-amber-100 font-bold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col h-full">
      {/* Header & In-Transcript Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Interactive Transcript
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search in transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="h-8 text-xs"
            />
          </div>

          {searchQuery.trim() && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {matchingSegments.length > 0
                  ? `${activeMatchIndex + 1} of ${matchingSegments.length}`
                  : "0 matches"}
              </span>
              <button
                onClick={handlePrevMatch}
                disabled={matchingSegments.length === 0}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={matchingSegments.length === 0}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
        {segments.map((seg) => {
          const isActive = seg.id === activeSegmentId;
          const speakerName = seg.speaker?.name || "Unknown Speaker";
          const speakerColor = getSpeakerColor(speakerName);

          return (
            <div
              key={seg.id}
              ref={(el) => {
                if (el) segmentRefs.current.set(seg.id, el);
                else segmentRefs.current.delete(seg.id);
              }}
              onClick={() => onSeekTo(seg.startTime)}
              className={cn(
                "group p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start select-none",
                isActive
                  ? "bg-[#E8F5F2] dark:bg-[#0B332C] border-[#0F6B5C] dark:border-[#148A77] shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <Avatar name={speakerName} src={seg.speaker?.avatarUrl} size="md" className="mt-0.5" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md border", speakerColor.bg, speakerColor.text, speakerColor.border)}>
                    {speakerName}
                  </span>

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 group-hover:text-[#0F6B5C] dark:group-hover:text-[#148A77] transition-colors">
                    <Play className="w-3 h-3 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                    {formatDuration(seg.startTime)}
                  </span>
                </div>

                <p className="text-sm font-normal text-slate-900 dark:text-slate-100 leading-relaxed">
                  {highlightText(seg.text, searchQuery)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
