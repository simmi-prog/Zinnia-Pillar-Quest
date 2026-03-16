"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startGame, endGame, resetGame, seedQuestions } from "@/lib/game";
import { getAllPlayers, getAllTeams } from "@/lib/queries";
import type { GameState, Player, Team } from "@/lib/types";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authenticated) return;

    const unsubscribe = onSnapshot(doc(db, "gameState", "current"), (snapshot) => {
      if (snapshot.exists()) {
        setGameState(snapshot.data() as GameState);
      }
    });

    loadData();

    return () => unsubscribe();
  }, [authenticated]);

  const loadData = async () => {
    const playersData = await getAllPlayers();
    const teamsData = await getAllTeams();
    setPlayers(playersData);
    setTeams(teamsData);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin123") {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleStartGame = async () => {
    if (confirm("Start the game?")) {
      setLoading(true);
      try {
        await startGame();
      } catch (err) {
        alert("Failed to start game");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEndGame = async () => {
    if (confirm("End the game?")) {
      setLoading(true);
      try {
        await endGame();
      } catch (err) {
        alert("Failed to end game");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetGame = async () => {
    if (confirm("Reset the entire game? This will delete all teams and players!")) {
      setLoading(true);
      try {
        await resetGame();
        await loadData();
      } catch (err) {
        alert("Failed to reset game");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSeedQuestions = async () => {
    setLoading(true);
    try {
      await seedQuestions();
      alert("Questions seeded successfully!");
    } catch (err) {
      alert("Failed to seed questions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleAdjustScore = async (playerId: string, currentScore: number) => {
    const newScore = prompt(`Adjust score for player (current: ${currentScore}):`);
    if (newScore === null) return;

    const score = parseInt(newScore, 10);
    if (isNaN(score)) {
      alert("Invalid score");
      return;
    }

    try {
      await updateDoc(doc(db, "players", playerId), { score });
      await loadData();
    } catch (err) {
      alert("Failed to update score");
    }
  };

  const handleMovePlayer = async (playerId: string, playerName: string) => {
    const newLevel = prompt(
      `Move ${playerName} to level (1, 2, 3, or "finished"):`
    );
    if (newLevel === null) return;

    if (!["1", "2", "3", "finished"].includes(newLevel)) {
      alert("Invalid level");
      return;
    }

    try {
      const level = newLevel === "finished" ? "finished" : parseInt(newLevel, 10);
      await updateDoc(doc(db, "players", playerId), {
        currentLevel: level,
        updatedAt: serverTimestamp(),
      });
      await loadData();
    } catch (err) {
      alert("Failed to move player");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter admin password"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Game Status</p>
              <p className="text-2xl font-bold text-primary uppercase">{gameState?.phase || "N/A"}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-secondary">{teams.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Players</p>
              <p className="text-2xl font-bold text-purple-600">{players.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Finished</p>
              <p className="text-2xl font-bold text-yellow-600">
                {players.filter((p) => p.currentLevel === "finished").length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartGame}
              disabled={loading || gameState?.phase !== "lobby"}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
            <button
              onClick={handleEndGame}
              disabled={loading || gameState?.phase !== "live"}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              End Game
            </button>
            <button
              onClick={handleResetGame}
              disabled={loading}
              className="px-6 py-3 bg-danger text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Game
            </button>
            <button
              onClick={handleSeedQuestions}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seed Questions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Teams</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {teams.map((team) => (
                <div key={team.teamId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{team.teamName}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {team.teamCode}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Level: {team.currentLevel} | Members: {team.memberIds.length}
                  </p>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-gray-500 text-center py-8">No teams yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Players</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {player.name}
                      {player.isCaptain && " ⭐"}
                    </p>
                    <p className="text-xs text-gray-500">Level: {player.currentLevel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-primary">{player.score}</p>
                    <button
                      onClick={() => handleAdjustScore(player.playerId, player.score)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      title="Adjust Score"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleMovePlayer(player.playerId, player.name)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                      title="Move Level"
                    >
                      Move
                    </button>
                  </div>
                </div>
              ))}
              {players.length === 0 && (
                <p className="text-gray-500 text-center py-8">No players yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
