"use client";

import type { Team, Player } from "@/lib/types";

interface LevelPanelProps {
  level: 1 | 2 | 3 | "finished";
  teams?: Team[];
  players?: Player[];
}

export default function LevelPanel({ level, teams, players }: LevelPanelProps) {
  const getLevelInfo = () => {
    switch (level) {
      case 1:
        return {
          title: "Level 1: Team Up",
          color: "purple",
          emoji: "🤝",
        };
      case 2:
        return {
          title: "Level 2: Be Bold",
          color: "blue",
          emoji: "⚡",
        };
      case 3:
        return {
          title: "Level 3: Deliver Value",
          color: "orange",
          emoji: "🎯",
        };
      case "finished":
        return {
          title: "Finished",
          color: "green",
          emoji: "✅",
        };
    }
  };

  const info = getLevelInfo();
  const items: Array<Team | Player> = teams ?? players ?? [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">
          <span className="mr-2">{info.emoji}</span>
          {info.title}
        </h3>
        <span
          className={`text-2xl font-bold ${
            info.color === "purple"
              ? "text-purple-600"
              : info.color === "blue"
              ? "text-blue-600"
              : info.color === "orange"
              ? "text-orange-600"
              : "text-green-600"
          }`}
        >
          {items.length}
        </span>
      </div>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {items.map((item) => {
          const isTeam = "teamId" in item;
          return (
            <div
              key={isTeam ? (item as Team).teamId : (item as Player).playerId}
              className="text-sm p-2 bg-gray-50 rounded text-gray-700"
            >
              {isTeam ? (item as Team).teamName : (item as Player).name}
              {isTeam && <span className="text-xs text-gray-500 ml-2">({(item as Team).memberIds.length} members)</span>}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">None yet</p>
        )}
      </div>
    </div>
  );
}
