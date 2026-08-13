"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Search, Plus, Sparkles, CheckCircle, Video } from "lucide-react";

function StyleGuideContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Badge variant="teal">EchoNotes Design System</Badge>
          <span className="text-xs text-slate-500">Phase 2 Token System</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          Component Style Guide & Tokens
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Visual showcase of reusable UI primitives built with deep teal accent (#0F6B5C) and warm slate neutrals.
        </p>
      </div>

      {/* Buttons */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          1. Button Variants & Sizes
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Meeting
          </Button>
          <Button variant="secondary" leftIcon={<Sparkles className="w-4 h-4" />}>
            AI Summary
          </Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Delete Meeting</Button>
          <Button variant="primary" isLoading>
            Processing
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button size="sm" variant="primary">Small (sm)</Button>
          <Button size="md" variant="primary">Medium (md)</Button>
          <Button size="lg" variant="primary">Large (lg)</Button>
        </div>
      </section>

      {/* Badges */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          2. Badges
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="teal">Deep Teal</Badge>
          <Badge variant="default">Default Gray</Badge>
          <Badge variant="success">Completed</Badge>
          <Badge variant="warning">In Progress</Badge>
          <Badge variant="error">High Priority</Badge>
        </div>
      </section>

      {/* Avatars */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          3. Avatars (With Fallbacks & Deterministic Colors)
        </h2>
        <div className="flex items-center gap-4">
          <Avatar name="Alex Chen" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" size="lg" />
          <Avatar name="Jordan Taylor" size="lg" />
          <Avatar name="Sarah Jenkins" size="lg" />
          <Avatar name="Maya Lin" size="lg" />
          <Avatar name="Priya Sharma" size="sm" />
          <Avatar name="David Kim" size="xl" />
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          4. Tabs Component
        </h2>
        <Tabs
          tabs={[
            { id: "transcript", label: "Transcript", count: 15 },
            { id: "summary", label: "AI Summary" },
            { id: "action-items", label: "Action Items", count: 4 },
            { id: "outline", label: "Outline", count: 3 },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Active Tab ID: <code className="font-bold text-[#0F6B5C]">{activeTab}</code>
        </p>
      </section>

      {/* Form Primitives */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          5. Form Controls (Input, Select, Textarea)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search Meetings"
            placeholder="Search by title or participant..."
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Select
            label="Sort By"
            options={[
              { value: "recent", label: "Most Recent" },
              { value: "oldest", label: "Oldest" },
              { value: "longest", label: "Longest Duration" },
            ]}
          />
        </div>
        <Textarea
          label="Paste Meeting Transcript"
          placeholder="[00:12] Alex: Welcome everyone to today's sync..."
        />
      </section>

      {/* Toast & Modal Trigger */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          6. Toasts & Modal Dialog
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            onClick={() => toast({ title: "Meeting Created", description: "Sprint Planning transcript successfully imported.", variant: "success" })}
          >
            Trigger Success Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast({ title: "Failed to delete meeting", description: "Network timeout occurred while calling backend.", variant: "error" })}
          >
            Trigger Error Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
          >
            Open Confirm Modal
          </Button>
        </div>
      </section>

      {/* Skeletons */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b pb-2">
          7. Skeleton Loaders
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="line" className="w-3/4" />
              <Skeleton variant="line" className="w-1/2" />
            </div>
          </div>
          <Skeleton variant="card" />
        </div>
      </section>

      {/* Modal Dialog Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Meeting"
        description="Upload a transcript or enter details manually to generate meeting notes."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { setIsModalOpen(false); toast({ title: "Action confirmed!", variant: "success" }); }}>
              Create Meeting
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Meeting Title" placeholder="e.g. Q3 Roadmap Review" />
          <Select
            label="Participant Preset"
            options={[
              { value: "eng", label: "Engineering Team" },
              { value: "product", label: "Product & Design" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <ToastProvider>
      <StyleGuideContent />
    </ToastProvider>
  );
}
