"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, MoreVertical, Trash2, Calendar } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Meeting } from "@/lib/types";
import { formatDuration, formatRelativeDate } from "@/lib/utils";
import { deleteMeeting } from "@/lib/api";

export interface MeetingCardRowProps {
  meeting: Meeting;
  onDeleted: () => void;
}

export const MeetingCardRow: React.FC<MeetingCardRowProps> = ({
  meeting,
  onDeleted,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const visibleParticipants = meeting.participants ? meeting.participants.slice(0, 4) : [];
  const overflowCount = meeting.participants && meeting.participants.length > 4 ? meeting.participants.length - 4 : 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMeeting(meeting.id);
      toast({ title: "Meeting deleted", description: `"${meeting.title}" was removed.`, variant: "success" });
      onDeleted();
    } catch (err) {
      toast({ title: "Delete failed", description: err instanceof Error ? err.message : "Error deleting", variant: "error" });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:border-[#0F6B5C]/50 dark:hover:border-[#148A77]/50 hover:shadow-md flex items-center justify-between gap-4">
        {/* Clickable Area */}
        <Link href={`/meetings/${meeting.id}`} className="flex-1 min-w-0 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#0F6B5C] dark:group-hover:text-[#148A77] transition-colors">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatRelativeDate(meeting.date)}
              </span>
              <span>•</span>
              <span>{formatDuration(meeting.durationSeconds)}</span>
            </div>
          </div>
        </Link>

        {/* Stacked Participant Avatars */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center -space-x-2 overflow-hidden">
            {visibleParticipants.map((p) => (
              <Avatar key={p.id} name={p.name} src={p.avatarUrl} size="sm" />
            ))}
            {overflowCount > 0 && (
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center border border-white dark:border-slate-900">
                +{overflowCount}
              </div>
            )}
          </div>

          {/* Kebab Options Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Meeting
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Meeting"
        description={`Are you sure you want to delete "${meeting.title}"? This action cannot be undone.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>
              Delete Meeting
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          All associated transcript segments, summaries, and action items will be permanently removed.
        </p>
      </Modal>
    </>
  );
};
