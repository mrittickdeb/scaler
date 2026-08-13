"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Sparkles, CheckSquare, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { AudioPlayer } from "@/components/meeting/AudioPlayer";
import { TranscriptPanel } from "@/components/meeting/TranscriptPanel";
import { SummaryTab } from "@/components/meeting/SummaryTab";
import { OutlineTab } from "@/components/meeting/OutlineTab";
import { ActionItemsTab } from "@/components/meeting/ActionItemsTab";
import { AskMeetingChat } from "@/components/meeting/AskMeetingChat";
import { MeetingDetail } from "@/lib/types";
import { fetchMeetingDetail } from "@/lib/api";
import { formatDuration, formatRelativeDate } from "@/lib/utils";

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("transcript");
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchMeetingDetail(meetingId);
      setMeeting(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meeting");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [meetingId]);

  const handleSeekTo = (time: number) => {
    setSeekTarget(time);
    setTimeout(() => setSeekTarget(null), 100);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 w-full">
        <Skeleton variant="line" className="w-48 h-6" />
        <Skeleton variant="card" className="h-16" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton variant="card" className="lg:col-span-4 h-64" />
          <Skeleton variant="card" className="lg:col-span-8 h-96" />
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="p-12 text-center space-y-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Meeting Not Found
        </h2>
        <p className="text-sm text-slate-500">{error || "Unable to retrieve meeting detail."}</p>
        <Link href="/">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6B5C] dark:text-[#148A77] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Meetings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {meeting.title}
            </h1>
            <Badge variant="teal">{formatDuration(meeting.durationSeconds)}</Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatRelativeDate(meeting.date)}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Participants:</span>
              <div className="flex items-center -space-x-1.5">
                {meeting.participants.map((p) => (
                  <Avatar key={p.id} name={p.name} src={p.avatarUrl} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Pane Fireflies Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Column: Audio Player & View Tabs */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8">
          <AudioPlayer
            src={meeting.audioUrl}
            onTimeUpdate={setCurrentTime}
            seekTarget={seekTarget}
          />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <Tabs
              tabs={[
                { id: "transcript", label: "Transcript", icon: <FileText className="w-4 h-4" />, count: meeting.transcriptSegments.length },
                { id: "summary", label: "Summary", icon: <Sparkles className="w-4 h-4" /> },
                { id: "action-items", label: "Action Items", icon: <CheckSquare className="w-4 h-4" />, count: meeting.actionItems.length },
                { id: "outline", label: "Outline", icon: <List className="w-4 h-4" />, count: meeting.outlineItems.length },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* Right Main Pane: Active Tab Content */}
        <div className="lg:col-span-8 min-h-[500px]">
          {activeTab === "transcript" && (
            <TranscriptPanel
              segments={meeting.transcriptSegments}
              currentTime={currentTime}
              onSeekTo={handleSeekTo}
            />
          )}

          {activeTab === "summary" && (
            <SummaryTab summary={meeting.summary} />
          )}

          {activeTab === "outline" && (
            <OutlineTab outlineItems={meeting.outlineItems} onSeekTo={handleSeekTo} />
          )}

          {activeTab === "action-items" && (
            <ActionItemsTab
              meetingId={meeting.id}
              actionItems={meeting.actionItems}
              participants={meeting.participants}
              segments={meeting.transcriptSegments}
              onSeekTo={handleSeekTo}
              onRefresh={loadData}
            />
          )}

          {/* Bonus Feature: Ask This Meeting Chat Panel */}
          <div className="mt-6">
            <AskMeetingChat meetingId={meeting.id} meetingTitle={meeting.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
