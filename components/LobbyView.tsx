"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTeamMembers } from "@/lib/queries";
import type { Team, Player } from "@/lib/types";

interface LobbyViewProps {
  team: Team;
  player: Player;
}

export default function LobbyView({ team, player }: LobbyViewProps) {
  const [members, setMembers] = useState<Player[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "teams", team.teamId), async (snapshot) => {
      if (snapshot.exists()) {
        const updatedTeam = snapshot.data() as Team;
        const teamMembers = await getTeamMembers(updatedTeam.teamId);
        setMembers(teamMembers);
      }
    });

    return () => unsubscribe();
  }, [team.teamId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.teamName}</h1>
          <div className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-2xl font-mono font-bold tracking-wider">
            {team.teamCode}
          </div>
          <p className="text-sm text-gray-600 mt-2">Share this code with your teammates</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.playerId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{member.name}</span>
                {member.isCaptain && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                    CAPTAIN
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700 font-medium">Waiting for game to start...</p>
        </div>
      </div>
    </div>
  );
}
