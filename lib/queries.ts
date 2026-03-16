import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "./firebase";
import type { Player, Team, Question, LeaderboardEntry } from "./types";

export async function getQuestionByLevel(level: 1 | 2 | 3): Promise<Question | null> {
  const q = query(collection(db, "questions"), where("level", "==", level), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Question);
}

export async function getTeamMembers(teamId: string): Promise<Player[]> {
  const q = query(collection(db, "players"), where("teamId", "==", teamId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Player);
}

export async function getAllPlayers(): Promise<Player[]> {
  const snapshot = await getDocs(collection(db, "players"));
  return snapshot.docs.map((doc) => doc.data() as Player);
}

export async function getAllTeams(): Promise<Team[]> {
  const snapshot = await getDocs(collection(db, "teams"));
  return snapshot.docs.map((doc) => doc.data() as Team);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const playersSnapshot = await getDocs(collection(db, "players"));
  const teamsSnapshot = await getDocs(collection(db, "teams"));

  const teamsMap = new Map<string, Team>();
  teamsSnapshot.forEach((doc) => {
    const team = doc.data() as Team;
    teamsMap.set(team.teamId, team);
  });

  const entries: LeaderboardEntry[] = playersSnapshot.docs.map((doc) => {
    const player = doc.data() as Player;
    const team = teamsMap.get(player.teamId);

    return {
      playerId: player.playerId,
      name: player.name,
      teamName: team?.teamName || "Unknown",
      score: player.score,
      level: player.currentLevel,
      level2SubmittedAt: player.level2SubmittedAt,
      level3SubmittedAt: player.level3SubmittedAt,
    };
  });

  entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const aL3Time = a.level3SubmittedAt?.toMillis() || Infinity;
    const bL3Time = b.level3SubmittedAt?.toMillis() || Infinity;
    if (aL3Time !== bL3Time) {
      return aL3Time - bL3Time;
    }

    const aL2Time = a.level2SubmittedAt?.toMillis() || Infinity;
    const bL2Time = b.level2SubmittedAt?.toMillis() || Infinity;
    return aL2Time - bL2Time;
  });

  return entries;
}
