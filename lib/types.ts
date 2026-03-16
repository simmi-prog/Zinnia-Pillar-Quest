import { Timestamp } from "firebase/firestore";

export type GamePhase = "lobby" | "live" | "ended";
export type Level = 1 | 2 | 3 | "finished";
export type Mode = "safe" | "bold" | null;
export type OwnerType = "team" | "player";

export interface GameState {
  phase: GamePhase;
  gameStartTime: Timestamp | null;
  gameEndTime: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Team {
  teamId: string;
  teamName: string;
  teamCode: string;
  captainPlayerId: string;
  memberIds: string[];
  currentLevel: Level;
  level1SubmittedAt: Timestamp | null;
  level1Answer: string | null;
  level1Correct: boolean | null;
  createdAt: Timestamp;
}

export interface Player {
  playerId: string;
  name: string;
  teamId: string;
  teamCode: string;
  isCaptain: boolean;
  currentLevel: Level;
  score: number;
  level2SubmittedAt: Timestamp | null;
  level3SubmittedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Answer {
  answerId: string;
  ownerType: OwnerType;
  ownerId: string;
  teamId: string;
  playerId: string | null;
  level: 1 | 2 | 3;
  selectedOption: string;
  mode: Mode;
  submittedAt: Timestamp;
  isCorrect: boolean;
  awardedPoints: number;
}

export interface Activity {
  activityId: string;
  type: string;
  message: string;
  createdAt: Timestamp;
}

export interface Question {
  questionId: string;
  level: 1 | 2 | 3;
  prompt: string;
  options: string[];
  correctOption: string;
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  teamName: string;
  score: number;
  level: Level;
  level2SubmittedAt: Timestamp | null;
  level3SubmittedAt: Timestamp | null;
}
