import { Meeting, MeetingDetail, ActionItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchMeetings(params?: { search?: string; sort?: string; participant?: string }): Promise<Meeting[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.sort) query.append("sort", params.sort);
  if (params?.participant) query.append("participant", params.participant);

  const res = await fetch(`${API_BASE_URL}/api/meetings?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch meetings: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMeetingDetail(id: string): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch meeting detail: ${res.statusText}`);
  }
  return res.json();
}

export async function createMeeting(data: { title: string; date: string; participants?: { name: string; avatarUrl?: string }[]; transcriptText?: string }): Promise<MeetingDetail> {
  const res = await fetch(`${API_BASE_URL}/api/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.title,
      date: new Date(data.date).toISOString(),
      durationSeconds: 120,
      participants: data.participants || [],
      transcriptText: data.transcriptText,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create meeting: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteMeeting(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete meeting: ${res.statusText}`);
  }
}

export async function updateActionItem(id: string, updates: Partial<ActionItem>): Promise<ActionItem> {
  const res = await fetch(`${API_BASE_URL}/api/action-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update action item: ${res.statusText}`);
  }
  return res.json();
}

export async function createActionItem(meetingId: string, text: string, assigneeId?: string): Promise<ActionItem> {
  const res = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/action-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, assigneeId, isCompleted: false }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create action item: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteActionItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/action-items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete action item: ${res.statusText}`);
  }
}
