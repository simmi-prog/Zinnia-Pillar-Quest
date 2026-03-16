"use client";

import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  maxEntries?: number;
}

export default function Leaderboard({ entries, maxEntries }: LeaderboardProps) {
  const displayEntries = maxEntries ? entries.slice(0, maxEntries) : entries;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Player
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Level
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayEntries.map((entry, index) => (
              <tr
                key={entry.playerId}
                className={index < 3 ? "bg-yellow-50" : "hover:bg-gray-50"}
              >
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      index === 0
                        ? "text-yellow-600 text-xl"
                        : index === 1
                        ? "text-gray-500 text-lg"
                        : index === 2
                        ? "text-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{entry.teamName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.level === "finished"
                        ? "bg-green-100 text-green-800"
                        : entry.level === 3
                        ? "bg-blue-100 text-blue-800"
                        : entry.level === 2
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {entry.level === "finished" ? "Done" : `L${entry.level}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">
                  {entry.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {displayEntries.length === 0 && (
          <div className="text-center py-8 text-gray-500">No players yet</div>
        )}
      </div>
    </div>
  );
}
