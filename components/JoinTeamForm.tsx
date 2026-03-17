"use client";

import { useState } from "react";
import { joinTeam } from "@/lib/game";
import { useRouter } from "next/navigation";

export default function JoinTeamForm() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!playerName.trim() || !teamCode.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { team, player } = await joinTeam(playerName.trim(), teamCode.trim());

      localStorage.setItem("playerId", player.playerId);
      localStorage.setItem("teamId", team.teamId);

      router.push("/play");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="joinPlayerName" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          id="joinPlayerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter your name"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="teamCode" className="block text-sm font-medium text-gray-700 mb-1">
          Team Code
        </label>
        <input
          id="teamCode"
          type="text"
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
          placeholder="Enter team code"
          disabled={loading}
          maxLength={6}
        />
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Joining..." : "Join Team"}
      </button>
    </form>
  );
}
