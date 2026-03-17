"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, collection, getDocs, updateDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startGame, endGame, resetGame, seedQuestions } from "@/lib/game";
import { getAllPlayers, getAllTeams } from "@/lib/queries";
import type { GameState, Player, Team } from "@/lib/types";
import Link from "next/link";

type DbStatus = "checking" | "connected" | "error";

interface QuestionHealth {
  level: number;
  count: number;
  needed: number;
  ok: boolean;
}

interface SystemHealth {
  db: DbStatus;
  questionsByLevel: QuestionHealth[];
  checkedAt: Date | null;
}

const PAGE_LINKS = [
  { name: "Landing (Players)", path: "/", desc: "Create / Join team" },
  { name: "Play", path: "/play", desc: "Game screen" },
  { name: "Admin", path: "/admin", desc: "This panel" },
  { name: "Dashboard", path: "/dashboard", desc: "Projector view" },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<SystemHealth>({
    db: "checking",
    questionsByLevel: [],
    checkedAt: null,
  });

  const runHealthCheck = useCallback(async () => {
    setHealth((prev) => ({ ...prev, db: "checking" }));
    try {
      // Check DB connectivity by reading gameState
      const gsSnap = await getDocs(collection(db, "gameState"));
      if (gsSnap === undefined) throw new Error("No response");

      // Check questions per level
      const levels = [1, 2, 3] as const;
      const qHealth: QuestionHealth[] = await Promise.all(
        levels.map(async (lvl) => {
          const snap = await getDocs(query(collection(db, "questions"), where("level", "==", lvl)));
          return { level: lvl, count: snap.size, needed: 3, ok: snap.size >= 3 };
        })
      );

      setHealth({ db: "connected", questionsByLevel: qHealth, checkedAt: new Date() });
    } catch {
      setHealth({ db: "error", questionsByLevel: [], checkedAt: new Date() });
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const unsubscribe = onSnapshot(doc(db, "gameState", "current"), (snapshot) => {
      if (snapshot.exists()) setGameState(snapshot.data() as GameState);
    });

    loadData();
    runHealthCheck();
    return () => unsubscribe();
  }, [authenticated, runHealthCheck]);

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
    if (!confirm("Start the game?")) return;
    setLoading(true);
    try { await startGame(); }
    catch { alert("Failed to start game"); }
    finally { setLoading(false); }
  };

  const handleEndGame = async () => {
    if (!confirm("End the game?")) return;
    setLoading(true);
    try { await endGame(); }
    catch { alert("Failed to end game"); }
    finally { setLoading(false); }
  };

  const handleResetGame = async () => {
    if (!confirm("Reset the entire game? This will delete all teams and players!")) return;
    setLoading(true);
    try { await resetGame(); await loadData(); }
    catch { alert("Failed to reset game"); }
    finally { setLoading(false); }
  };

  const handleSeedQuestions = async () => {
    setLoading(true);
    try {
      await seedQuestions();
      alert("Questions seeded successfully!");
      await runHealthCheck();
    } catch { alert("Failed to seed questions"); }
    finally { setLoading(false); }
  };

  const handleAdjustScore = async (playerId: string, currentScore: number) => {
    const newScore = prompt(`Adjust score for player (current: ${currentScore}):`);
    if (newScore === null) return;
    const score = parseInt(newScore, 10);
    if (isNaN(score)) { alert("Invalid score"); return; }
    try {
      await updateDoc(doc(db, "players", playerId), { score });
      await loadData();
    } catch { alert("Failed to update score"); }
  };

  const handleMovePlayer = async (playerId: string, playerName: string) => {
    const newLevel = prompt(`Move ${playerName} to level (1, 2, 3, or "finished"):`);
    if (newLevel === null) return;
    if (!["1", "2", "3", "finished"].includes(newLevel)) { alert("Invalid level"); return; }
    try {
      const level = newLevel === "finished" ? "finished" : parseInt(newLevel, 10);
      await updateDoc(doc(db, "players", playerId), {
        currentLevel: level,
        currentQuestionIndex: 0,
        updatedAt: serverTimestamp(),
      });
      await loadData();
    } catch { alert("Failed to move player"); }
  };

  // ── Auth Screen ──────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
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
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Panel ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── System Health Panel ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">System Health</h2>
            <button
              onClick={runHealthCheck}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
            >
              Re-check
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* DB Connection */}
            <div className={`p-4 rounded-lg border-2 ${
              health.db === "connected" ? "border-green-300 bg-green-50"
              : health.db === "error" ? "border-red-300 bg-red-50"
              : "border-yellow-300 bg-yellow-50"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full ${
                  health.db === "connected" ? "bg-green-500"
                  : health.db === "error" ? "bg-red-500"
                  : "bg-yellow-400 animate-pulse"
                }`} />
                <span className="font-semibold text-gray-800">Firebase DB</span>
              </div>
              <p className={`text-sm font-medium ${
                health.db === "connected" ? "text-green-700"
                : health.db === "error" ? "text-red-700"
                : "text-yellow-700"
              }`}>
                {health.db === "connected" ? "Connected ✓"
                  : health.db === "error" ? "Connection Error ✗"
                  : "Checking..."}
              </p>
              {health.checkedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Last checked: {health.checkedAt.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Questions per level */}
            <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${
                  health.questionsByLevel.length === 0 ? "bg-gray-400"
                  : health.questionsByLevel.every((q) => q.ok) ? "bg-green-500"
                  : "bg-red-500"
                }`} />
                <span className="font-semibold text-gray-800">Questions</span>
              </div>
              {health.questionsByLevel.length === 0 ? (
                <p className="text-sm text-gray-500">Not checked yet</p>
              ) : (
                <div className="space-y-1">
                  {health.questionsByLevel.map((q) => (
                    <div key={q.level} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Level {q.level}</span>
                      <span className={`font-medium ${q.ok ? "text-green-600" : "text-red-600"}`}>
                        {q.count}/{q.needed} {q.ok ? "✓" : "✗ — seed needed"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pages quick links */}
            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-semibold text-gray-800">Pages</span>
              </div>
              <div className="space-y-1">
                {PAGE_LINKS.map((pg) => (
                  <Link
                    key={pg.path}
                    href={pg.path}
                    className="flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    <span>{pg.name}</span>
                    <span className="text-gray-400 text-xs">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Game Control Panel ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => { loadData(); runHealthCheck(); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Refresh All
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Game Status</p>
              <p className="text-2xl font-bold text-blue-600 uppercase">{gameState?.phase || "N/A"}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Teams</p>
              <p className="text-2xl font-bold text-green-600">{teams.length}</p>
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

          {/* Action buttons */}
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
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* ── Teams & Players ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Teams ({teams.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {teams.map((team) => (
                <div key={team.teamId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{team.teamName}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {team.teamCode}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Level: {team.currentLevel} | Members: {team.memberIds.length}
                    {team.currentLevel === 1 && (
                      <span className="ml-2 text-purple-600">
                        (L1 Q{(team.level1QuestionIndex ?? 0) + 1}/3)
                      </span>
                    )}
                  </p>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-gray-500 text-center py-8">No teams yet</p>
              )}
            </div>
          </div>

          {/* Players */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Players ({players.length})</h2>
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
                    <p className="text-xs text-gray-500">
                      Level {player.currentLevel}
                      {typeof player.currentLevel === "number" && (
                        <span className="ml-1 text-blue-500">
                          (Q{(player.currentQuestionIndex ?? 0) + 1}/3)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blue-600">{player.score}</p>
                    <button
                      onClick={() => handleAdjustScore(player.playerId, player.score)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleMovePlayer(player.playerId, player.name)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
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
