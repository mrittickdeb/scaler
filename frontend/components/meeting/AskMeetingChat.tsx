"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: "mock" | "llm";
}

export interface AskMeetingChatProps {
  meetingId: string;
  meetingTitle: string;
}

export const AskMeetingChat: React.FC<AskMeetingChatProps> = ({
  meetingId,
  meetingTitle,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: `Hello! I'm your EchoNotes AI Assistant for "${meetingTitle}". Ask me any question about key decisions, action items, or transcript moments!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "What were the main blockers discussed?",
    "Who is responsible for action items?",
    "Summarize key technical decisions",
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || isLoading) return;

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessage = { id: userMsgId, sender: "user", text: q };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setQuestion("");
    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) throw new Error("Failed to get answer");

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "assistant",
        text: data.answer,
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "assistant",
          text: "Sorry, I ran into an error retrieving the answer for this meeting.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        leftIcon={<MessageSquare className="w-4 h-4" />}
        className="fixed bottom-6 right-6 shadow-xl z-40 rounded-full"
      >
        Ask This Meeting
      </Button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md flex flex-col h-[520px] overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0F6B5C] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Ask This Meeting
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Conversational Q&A (Gemini AI)</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2.5 items-start",
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                msg.sender === "user"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-[#0F6B5C] text-white"
              )}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={cn(
                "p-3 rounded-2xl text-xs leading-relaxed max-w-[80%]",
                msg.sender === "user"
                  ? "bg-[#0F6B5C] text-white rounded-tr-none font-medium"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-2xs font-normal"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.source && (
                <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-medium">
                  Source: {msg.source === "llm" ? "Google Gemini AI" : "Transcript Context"}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold italic pl-9 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#0F6B5C]" />
            Analyzing transcript with Gemini AI...
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((sq) => (
            <button
              key={sq}
              onClick={() => handleSend(sq)}
              className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0F6B5C] text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded-full transition-colors text-left shadow-2xs"
            >
              {sq}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <Input
          placeholder="Ask a question about this call..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-9 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          disabled={!question.trim() || isLoading}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
