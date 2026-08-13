"use client";

import React, { useState } from "react";
import { Puzzle, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  iconBg: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: "zoom", name: "Zoom Meetings", category: "Video Conferencing", description: "Auto-join live Zoom meetings and record transcripts.", connected: true, iconBg: "bg-blue-500 text-white" },
    { id: "gmeet", name: "Google Meet", category: "Video Conferencing", description: "Seamless Chrome extension integration for Google Meet calls.", connected: true, iconBg: "bg-emerald-500 text-white" },
    { id: "teams", name: "Microsoft Teams", category: "Video Conferencing", description: "Capture Teams channel calls and export notes to OneNote.", connected: false, iconBg: "bg-indigo-600 text-white" },
    { id: "slack", name: "Slack", category: "Collaboration", description: "Send automated AI meeting summaries to designated Slack channels.", connected: true, iconBg: "bg-purple-600 text-white" },
    { id: "hubspot", name: "HubSpot CRM", category: "CRM Integration", description: "Automatically attach meeting action items to HubSpot deal records.", connected: false, iconBg: "bg-orange-500 text-white" },
    { id: "salesforce", name: "Salesforce", category: "CRM Integration", description: "Sync client call transcripts with Salesforce opportunity timeline.", connected: false, iconBg: "bg-sky-500 text-white" },
  ]);

  const { toast } = useToast();

  const handleToggle = (id: string, name: string, isConnected: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, connected: !item.connected } : item))
    );

    toast({
      title: !isConnected ? `${name} Connected` : `${name} Disconnected`,
      description: !isConnected ? "Automated sync is now active." : "Integration disabled.",
      variant: !isConnected ? "success" : "info",
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Integrations & Apps
          </h1>
          <Badge variant="teal">6 Integrations</Badge>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Connect EchoNotes to your calendar, video conferencing tools, and CRM platforms.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#0F6B5C]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} font-bold text-sm flex items-center justify-center shadow-xs`}>
                  {item.name.substring(0, 2).toUpperCase()}
                </div>

                <Badge variant={item.connected ? "success" : "gray"}>
                  {item.connected ? "Connected" : "Available"}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {item.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <Button
              variant={item.connected ? "outline" : "primary"}
              size="sm"
              onClick={() => handleToggle(item.id, item.name, item.connected)}
              className="w-full justify-center"
            >
              {item.connected ? "Disconnect" : "Connect App"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
