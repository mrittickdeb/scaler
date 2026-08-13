"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createMeeting } from "@/lib/api";
import { Upload, FileText } from "lucide-react";

export interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [title, setTitle] = useState("");
  const [participantsText, setParticipantsText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please provide a meeting title", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const participantsList = participantsText
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      await createMeeting({
        title,
        date: new Date().toISOString(),
        participants: participantsList.length > 0 ? participantsList : [{ name: "Alex Chen" }],
        transcriptText: activeTab === "upload" ? transcriptText : undefined,
      });

      toast({ title: "Meeting Created", description: `"${title}" was created successfully.`, variant: "success" });
      setTitle("");
      setParticipantsText("");
      setTranscriptText("");
      onSuccess();
      onClose();
    } catch (err) {
      toast({ title: "Creation Failed", description: err instanceof Error ? err.message : "Error creating meeting", variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Meeting"
      description="Upload a transcript or create a meeting entry."
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Create Meeting
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Tabs
          tabs={[
            { id: "upload", label: "Paste / Upload Transcript", icon: <Upload className="w-4 h-4" /> },
            { id: "manual", label: "Manual Form", icon: <FileText className="w-4 h-4" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <Input
          label="Meeting Title"
          placeholder="e.g. Q3 Sprint Planning or Client Kickoff"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Participants (comma separated)"
          placeholder="e.g. Alex Chen, Sarah Jenkins, Marcus Vance"
          value={participantsText}
          onChange={(e) => setParticipantsText(e.target.value)}
        />

        {activeTab === "upload" && (
          <Textarea
            label="Transcript Content (.txt, .vtt, or raw text)"
            placeholder="[00:00] Alex: Welcome team! Let's get started...
[00:15] Jordan: Sounds good Alex..."
            rows={5}
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
          />
        )}
      </div>
    </Modal>
  );
};
