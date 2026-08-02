export type ContestPhase = 'BEFORE' | 'CODING' | 'FINISHED' | 'PENDING_SYSTEM_TEST' | 'SYSTEM_TEST';

export type ContestType = 'CF' | 'IOI' | 'ICPC';

export interface CodeforcesContest {
  id: number;
  name: string;
  type: ContestType;
  phase: ContestPhase;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
  preparedBy?: string;
  websiteUrl?: string;
  description?: string;
  difficulty?: number;
  kind?: string;
  icpcRegion?: string;
  country?: string;
  city?: string;
  season?: string;
}

export interface ContestReminder {
  contestId: number;
  contestName: string;
  startTimeSeconds: number;
  durationSeconds: number;
  leadTimeMinutes: number; // e.g. 20 for 20 minutes before
  notified: boolean;
  createdAt: number;
}

export interface CodeforcesUser {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CodeforcesProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type?: string;
  points?: number;
  rating?: number;
  tags?: string[];
}

export interface CodeforcesSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds?: number;
  problem: CodeforcesProblem;
  programmingLanguage: string;
  verdict?: string; // 'OK', 'WRONG_ANSWER', etc.
  passedTestCount: number;
}

export interface SolvedProblemItem {
  id: string;
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
  solvedAtSeconds: number;
  url: string;
}

export interface DailySolvedStats {
  handle: string;
  uniqueSolvedTodayCount: number;
  totalOkTodayCount: number;
  problemsSolvedToday: SolvedProblemItem[];
  lastUpdated: number;
  dailyGoal: number;
}

export type DivisionFilter = 'ALL' | 'DIV1' | 'DIV2' | 'DIV3' | 'DIV4' | 'EDUCATIONAL' | 'GLOBAL' | 'OTHER';

export type StatusFilter = 'UPCOMING' | 'REMINDERS' | 'ACTIVE' | 'FINISHED';

export interface AppSettings {
  defaultLeadMinutes: number; // Default: 20
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  selectedTimezone: string; // e.g., 'local' or specific IANA string
  userHandle: string;
  autoRefreshInterval: number; // in seconds
  theme: 'dark' | 'codeforces' | 'light';
}
