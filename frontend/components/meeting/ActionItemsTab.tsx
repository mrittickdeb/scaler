"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, ExternalLink, Check } from "lucide-react";
import { ActionItem, Participant, TranscriptSegment } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { updateActionItem, createActionItem, deleteActionItem } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface ActionItemsTabProps {
  meetingId: string;
  actionItems: ActionItem[];
  participants: Participant[];
  segments: TranscriptSegment[];
  onSeekTo: (time: number) => void;
  onRefresh: () => void;
}

export const ActionItemsTab: React.FC<ActionItemsTabProps> = ({
  meetingId,
  actionItems,
  participants,
  segments,
  onSeekTo,
  onRefresh,
}) => {
  const [items, setItems] = useState<ActionItem[]>(actionItems);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setItems(actionItems);
  }, [actionItems]);

  const handleToggleComplete = async (item: ActionItem) => {
    const newStatus = !item.isCompleted;

    // Optimistic UI update (0ms latency!)
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isCompleted: newStatus } : i))
    );

    toast({
      title: newStatus ? "Task Completed" : "Task Re-opened",
      description: item.text,
      variant: "success",
    });

    try {
      await updateActionItem(item.id, { isCompleted: newStatus });
      onRefresh();
    } catch (err) {
      // Rollback on error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isCompleted: !newStatus } : i))
      );
      toast({ title: "Failed to update action item", variant: "error" });
    }
  };

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const assignee = participants.find((p) => p.id === selectedAssignee);
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: ActionItem = {
      id: tempId,
      meetingId,
      text: newItemText.trim(),
      assigneeId: selectedAssignee || undefined,
      assignee,
      isCompleted: false,
    };

    // Optimistic UI update (Instant add!)
    setItems((prev) => [optimisticItem, ...prev]);
    setIsAddModalOpen(false);
    const savedText = newItemText;
    setNewItemText("");
    setSelectedAssignee("");

    toast({ title: "Action Item Added", variant: "success" });

    try {
      const created = await createActionItem(meetingId, savedText, selectedAssignee || undefined);
      setItems((prev) => prev.map((i) => (i.id === tempId ? created : i)));
      onRefresh();
    } catch (err) {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      toast({ title: "Error adding task", variant: "error" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    const backup = [...items];
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeletingId(null);
    toast({ title: "Action item deleted", variant: "success" });

    try {
      await deleteActionItem(id);
      onRefresh();
    } catch (err) {
      setItems(backup);
      toast({ title: "Delete failed", variant: "error" });
    }
  };

  const handleJumpToMoment = (sourceSegmentId?: string) => {
    if (!sourceSegmentId) return;
    const seg = segments.find((s) => s.id === sourceSegmentId);
    if (seg) {
      onSeekTo(seg.startTime);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#0F6B5C] dark:text-[#148A77]" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Action Items & Tasks
          </h2>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {/* Task List */}
      {items.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No action items recorded for this meeting yet.</p>
          <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(true)}>
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all",
                item.isCompleted
                  ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600"
              )}
            >
              {/* Checkbox & Task Text */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleComplete(item)}
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5",
                    item.isCompleted
                      ? "bg-[#0F6B5C] dark:bg-[#148A77] border-[#0F6B5C] dark:border-[#148A77] text-white"
                      : "border-slate-300 dark:border-slate-600 hover:border-[#0F6B5C] dark:hover:border-[#148A77]"
                  )}
                >
                  {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="space-y-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-normal",
                      item.isCompleted
                        ? "line-through text-slate-400 dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {item.text}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {item.assignee && (
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Avatar name={item.assignee.name} src={item.assignee.avatarUrl} size="sm" />
                        {item.assignee.name}
                      </span>
                    )}

                    {item.sourceSegmentId && (
                      <button
                        onClick={() => handleJumpToMoment(item.sourceSegmentId)}
                        className="text-[#0F6B5C] dark:text-[#148A77] hover:underline flex items-center gap-1 font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Jump to moment
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setDeletingId(item.id)}
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Action Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Action Item"
        description="Create a new task assigned to a meeting participant."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddActionItem} isLoading={isSubmitting}>
              Save Task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Task Description"
            placeholder="e.g. Follow up on API performance benchmark"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            required
          />

          <Select
            label="Assignee"
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            options={[
              { value: "", label: "Unassigned" },
              ...participants.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Task"
        description="Are you sure you want to remove this action item?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDeleteItem(deletingId)}
            >
              Delete Task
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">This action cannot be undone.</p>
      </Modal>
    </div>
  );
};
