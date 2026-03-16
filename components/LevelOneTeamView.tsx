"use client";

import { useState, useEffect } from "react";
import { submitLevel1 } from "@/lib/game";
import { getQuestionByLevel, getTeamMembers } from "@/lib/queries";
import type { Question, Player, Team } from "@/lib/types";

interface LevelOneTeamViewProps {
  team: Team;
  player: Player;
}

export default function LevelOneTeamView({ team, player }: LevelOneTeamViewProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Player[]>([]);

  useEffect(() => {
    getQuestionByLevel(1).then(setQuestion);
    getTeamMembers(team.teamId).then(setMembers);
  }, [team.teamId]);

  const handleSubmit = async () => {
    if (!selectedOption || !player.isCaptain) return;

    setSubmitting(true);
    try {
      await submitLevel1(team.teamId, player.playerId, selectedOption);
    } catch (err) {
      console.error("Failed to submit:", err);
      alert("Failed to submit answer");
      setSubmitting(false);
    }
  };

  if (!question) {
    return <div className="text-center p-8">Loading question...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Level 1: Team Up</h2>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              Team Round
            </span>
          </div>
          <p className="text-gray-600">
            {player.isCaptain
              ? "As captain, submit the answer for your team"
              : "Only your captain can submit for the team"}
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Team: {team.teamName}</h3>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <span
                key={member.playerId}
                className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200"
              >
                {member.name}
                {member.isCaptain && " ⭐"}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.prompt}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => player.isCaptain && setSelectedOption(option)}
                disabled={!player.isCaptain || submitting}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedOption === option
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${
                  !player.isCaptain
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-md"
                } disabled:opacity-50`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {!player.isCaptain && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 font-medium">
              Only your captain can submit the answer for your team
            </p>
          </div>
        )}

        {player.isCaptain && (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || submitting}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Team Answer"}
          </button>
        )}
      </div>
    </div>
  );
}
