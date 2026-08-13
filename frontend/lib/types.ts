export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  meetingId: string;
  name: string;
  avatarUrl?: string;
  isSpeaker: boolean;
}

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  speakerId?: string;
  startTime: number;
  endTime: number;
  text: string;
  sequenceOrder: number;
  speaker?: Participant;
}

export interface Summary {
  id: string;
  meetingId: string;
  overviewText: string;
  generatedAt: string;
  source: "mock" | "llm";
}

export interface OutlineItem {
  id: string;
  meetingId: string;
  title: string;
  startTime: number;
  sequenceOrder: number;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  text: string;
  assigneeId?: string;
  dueDate?: string;
  isCompleted: boolean;
  sourceSegmentId?: string;
  assignee?: Participant;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  durationSeconds: number;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  participants: Participant[];
}

export interface MeetingDetail extends Meeting {
  owner: User;
  summary?: Summary;
  outlineItems: OutlineItem[];
  actionItems: ActionItem[];
  transcriptSegments: TranscriptSegment[];
}
