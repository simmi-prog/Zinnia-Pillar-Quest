"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, orderBy, limit, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getLeaderboard } from "@/lib/queries";
import Leaderboard from "@/components/Leaderboard";
import ActivityFeed from "@/components/ActivityFeed";
import LevelPanel from "@/components/LevelPanel";
import { formatTime } from "@/lib/utils";
import type { GameState, Player, Team, LeaderboardEntry } from "@/lib/types";

export default function DashboardPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(300);

  useEffect(() => {
    const unsubscribeGame = onSnapshot(doc(db, "gameState", "current"), (snapshot) => {
      if (snapshot.exists()) {
        setGameState(snapshot.data() as GameState);
      }
    });

    const unsubscribePlayers = onSnapshot(collection(db, "players"), (snapshot) => {
      setPlayers(snapshot.docs.map((doc) => doc.data() as Player));
    });

    const unsubscribeTeams = onSnapshot(collection(db, "teams"), (snapshot) => {
      setTeams(snapshot.docs.map((doc) => doc.data() as Team));
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
      unsubscribeTeams();
    };
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameState?.phase !== "live" || !gameState.gameEndTime) {
      return;
    }

    const interval = setInterval(async () => {
      const now = Date.now();
      const end = gameState.gameEndTime!.toMillis();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        try {
          await updateDoc(doc(db, "gameState", "current"), {
            phase: "ended",
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Failed to auto-end game:", err);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const level1Teams = teams.filter((t) => t.currentLevel === 1);
  const level2Players = players.filter((p) => p.currentLevel === 2);
  const level3Players = players.filter((p) => p.currentLevel === 3);
  const finishedPlayers = players.filter((p) => p.currentLevel === "finished");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Live Dashboard</h1>

          {gameState?.phase === "live" && (
            <div className="inline-block bg-white rounded-2xl px-12 py-6 shadow-2xl">
              <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
              <p
                className={`text-7xl font-bold ${
                  timeRemaining < 60 ? "text-danger" : "text-primary"
                }`}
              >
                {formatTime(timeRemaining)}
              </p>
            </div>
          )}

          {gameState?.phase === "lobby" && (
            <div className="inline-block bg-yellow-100 text-yellow-800 px-8 py-4 rounded-xl text-xl font-semibold">
              Game Not Started
            </div>
          )}

          {gameState?.phase === "ended" && (
            <div className="inline-block bg-red-100 text-red-800 px-8 py-4 rounded-xl text-xl font-semibold">
              Game Ended
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <LevelPanel level={1} teams={level1Teams} />
          <LevelPanel level={2} players={level2Players} />
          <LevelPanel level={3} players={level3Players} />
          <LevelPanel level="finished" players={finishedPlayers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Leaderboard entries={leaderboard} maxEntries={10} />
          </div>

          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
