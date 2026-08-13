"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Video, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { MeetingCardRow } from "@/components/meeting/MeetingCardRow";
import { CreateMeetingModal } from "@/components/meeting/CreateMeetingModal";
import { Meeting } from "@/lib/types";
import { fetchMeetings } from "@/lib/api";

export default function MeetingsDashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMeetings({
        search: debouncedSearch || undefined,
        sort: sort || undefined,
        participant: selectedParticipant || undefined,
      });
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, sort, selectedParticipant]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Meetings Library
            </h1>
            {!isLoading && (
              <Badge variant="teal">{meetings.length} Meetings</Badge>
            )}
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Search, filter, and review meeting transcripts, AI summaries, and action items.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Meeting
        </Button>
      </div>

      {/* Control Bar: Search, Filters, Sort */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search meetings by title or participant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: "recent", label: "Sort: Most Recent" },
              { value: "oldest", label: "Sort: Oldest" },
              { value: "longest", label: "Sort: Longest Duration" },
              { value: "shortest", label: "Sort: Shortest Duration" },
            ]}
            className="w-48"
          />

          <Select
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
            options={[
              { value: "", label: "Filter: All Participants" },
              { value: "Alex Chen", label: "Alex Chen" },
              { value: "Jordan Taylor", label: "Jordan Taylor" },
              { value: "Sarah Jenkins", label: "Sarah Jenkins" },
              { value: "Maya Lin", label: "Maya Lin" },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="font-semibold text-rose-900 dark:text-rose-200">
            Error Loading Meetings
          </h3>
          <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            {error}. Make sure the FastAPI backend is running at http://127.0.0.1:8000.
          </p>
          <Button
            variant="outline"
            onClick={loadMeetings}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </div>
      ) : meetings.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77] flex items-center justify-center mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              No meetings found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {search || selectedParticipant
                ? "No meetings match your search filter criteria. Try resetting your search."
                : "Upload your first transcript or create a meeting entry to get started."}
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Upload Your First Meeting
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <MeetingCardRow key={m.id} meeting={m} onDeleted={loadMeetings} />
          ))}
        </div>
      )}

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadMeetings}
      />
    </div>
  );
}
