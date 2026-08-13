"use client";

import React, { useState } from "react";
import { Settings, User, Building, Key, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@echonotes.ai");
  const [workspaceName, setWorkspaceName] = useState("EchoNotes Engineering");
  const [llmEnabled, setLlmEnabled] = useState("mock");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your workspace and profile preferences have been updated.",
        variant: "success",
      });
    }, 400);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Account & Workspace Settings
          </h1>
          <Badge variant="teal">Preferences</Badge>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, workspace details, and AI intelligence provider configs.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[#0F6B5C]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              User Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Workspace Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-5 h-5 text-[#0F6B5C]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Workspace Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              required
            />
            <Select
              label="Summary Generator Provider"
              value={llmEnabled}
              onChange={(e) => setLlmEnabled(e.target.value)}
              options={[
                { value: "mock", label: "Mock Local Generator (No API Key)" },
                { value: "openai", label: "OpenAI GPT-3.5 Turbo (Requires Key)" },
              ]}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
