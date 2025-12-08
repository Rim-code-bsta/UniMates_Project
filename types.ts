export enum ConnectionPurpose {
  STUDY = 'Study Partner',
  GYM = 'Gym Buddy',
  SOCIAL = 'Social Hangout',
  HOBBY = 'Hobby Sharing',
  EVENTS = 'Event Companion'
}

export interface User {
  id: string;
  name: string;
  email: string; // Must be @aui.ma
  major: string;
  year: string;
  purpose: ConnectionPurpose;
  interests: string[];
  bio: string;
  avatar: string;
  isVerified: boolean;
}

export interface Match {
  id: string;
  users: [string, string]; // User IDs
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  matchScore: number; // 0-100 compatibility score
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface ChatSession {
  matchId: string;
  partnerId: string;
  messages: Message[];
}

export type Screen = 'landing' | 'onboarding' | 'dashboard' | 'matches' | 'chat' | 'profile';
