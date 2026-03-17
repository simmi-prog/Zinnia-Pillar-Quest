"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp, DocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getPlayer, getTeam } from "@/lib/game";
import LobbyView from "@/components/LobbyView";
import LevelOneTeamView from "@/components/LevelOneTeamView";
import LevelTwoBoldView from "@/components/LevelTwoBoldView";
import LevelThreeValueView from "@/components/LevelThreeValueView";
import FinishedView from "@/components/FinishedView";
import PlayerHeader from "@/components/PlayerHeader";
import type { Player, Team, GameState } from "@/lib/types";

export default function PlayPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId");
    const teamId = localStorage.getItem("teamId");

    if (!playerId || !teamId) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      const playerData = await getPlayer(playerId);
      const teamData = await getTeam(teamId);

      if (!playerData || !teamData) {
        localStorage.removeItem("playerId");
        localStorage.removeItem("teamId");
        router.push("/");
        return;
      }

      setPlayer(playerData);
      setTeam(teamData);
      setLoading(false);
    };

    loadData();

    // Listen to player doc for score/level updates
    const unsubscribePlayer = onSnapshot(doc(db, "players", playerId), (snapshot: DocumentSnapshot) => {
      if (snapshot.exists()) {
        setPlayer(snapshot.data() as Player);
      }
    });

    // Listen to team doc — critical for L1 question index progression
    const unsubscribeTeam = onSnapshot(doc(db, "teams", teamId), (snapshot: DocumentSnapshot) => {
      if (snapshot.exists()) {
        setTeam(snapshot.data() as Team);
      }
    });

    // Listen to game state for timer auto-end
    const unsubscribeGame = onSnapshot(doc(db, "gameState", "current"), (snapshot: DocumentSnapshot) => {
      if (snapshot.exists()) {
        const state = snapshot.data() as GameState;
        setGameState(state);

        if (state.phase === "live" && state.gameEndTime) {
          const now = Date.now();
          const end = state.gameEndTime.toMillis();
          if (now >= end) {
            updateDoc(doc(db, "gameState", "current"), {
              phase: "ended",
              updatedAt: serverTimestamp(),
            }).catch(console.error);
          }
        }
      }
    });

    return () => {
      unsubscribePlayer();
      unsubscribeTeam();
      unsubscribeGame();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!player || !team) return null;

  if (gameState?.phase === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Game Over</h1>
          <p className="text-gray-600 mb-4">
            The game has ended. Check the dashboard for final results!
          </p>
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Your Final Score</p>
            <p className="text-5xl font-bold text-primary">{player.score}</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState?.phase === "lobby") {
    return <LobbyView team={team} player={player} />;
  }

  const renderLevel = () => {
    if (player.currentLevel === "finished") return <FinishedView player={player} />;
    if (player.currentLevel === 1) return <LevelOneTeamView team={team} player={player} />;
    if (player.currentLevel === 2) return <LevelTwoBoldView player={player} />;
    if (player.currentLevel === 3) return <LevelThreeValueView player={player} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PlayerHeader player={player} team={team} />
      {renderLevel()}
    </div>
  );
}
