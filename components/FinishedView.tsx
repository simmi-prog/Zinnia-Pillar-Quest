"use client";

import type { Player } from "@/lib/types";

interface FinishedViewProps {
  player: Player;
}

export default function FinishedView({ player }: FinishedViewProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">You are Done!</h1>
        <p className="text-gray-600 mb-6">Great job completing all levels!</p>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Your Current Score</p>
          <p className="text-5xl font-bold text-primary">{player.score}</p>
        </div>

        <p className="text-gray-500">Check the dashboard for live leaderboard!</p>
      </div>
    </div>
  );
}
