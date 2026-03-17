"use client";

import type { Player, Team } from "@/lib/types";

interface PlayerHeaderProps {
  player: Player;
  team: Team;
}

export default function PlayerHeader({ player, team }: PlayerHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {player.name} {player.isCaptain && "⭐"}
          </p>
          <p className="text-xs text-gray-500">Team: {team.teamName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Score</p>
          <p className="text-2xl font-bold text-primary">{player.score}</p>
        </div>
      </div>
    </div>
  );
}
