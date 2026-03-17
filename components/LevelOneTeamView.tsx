"use client";

import { useState, useEffect } from "react";
import { submitLevel1 } from "@/lib/game";
import { getQuestion } from "@/lib/queries";
import { getTeamMembers } from "@/lib/queries";
import type { Question, Player, Team } from "@/lib/types";

interface LevelOneTeamViewProps {
  team: Team;
  player: Player;
}

export default function LevelOneTeamView({ team, player }: LevelOneTeamViewProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<Player[]>([]);

  const questionIndex = team.level1QuestionIndex ?? 0;

  // Reset answer state whenever question changes
  useEffect(() => {
    setSelectedOption("");
    setTextAnswer("");
    setSubmitting(false);
    getQuestion(1, questionIndex).then(setQuestion);
    getTeamMembers(team.teamId).then(setMembers);
  }, [team.teamId, questionIndex]);

  const handleSubmit = async () => {
    if (!player.isCaptain) return;
    const answer = question?.inputType === "text" ? textAnswer.trim() : selectedOption;
    if (!answer) return;

    setSubmitting(true);
    try {
      await submitLevel1(team.teamId, player.playerId, answer, questionIndex);
    } catch (err) {
      console.error("Failed to submit:", err);
      alert("Failed to submit answer. Please try again.");
      setSubmitting(false);
    }
  };

  const canSubmit =
    question?.inputType === "text" ? textAnswer.trim().length > 0 : selectedOption !== "";

  if (!question) {
    return (
      <div className="text-center p-8 text-gray-600 font-medium">Loading question...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">Level 1: Team Up 🤝</h2>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              Q{questionIndex + 1} of 3
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {player.isCaptain
              ? "You are captain — submit the answer for your team"
              : "Your captain is answering — wait for the question to advance"}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < questionIndex
                  ? "bg-green-500"
                  : i === questionIndex
                  ? "bg-purple-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Team info */}
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

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 whitespace-pre-line leading-relaxed">
            {question.prompt}
          </h3>

          {question.inputType === "text" ? (
            <div>
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && !submitting && handleSubmit()}
                disabled={!player.isCaptain || submitting}
                placeholder={
                  player.isCaptain ? "Type your answer here..." : "Waiting for captain to answer..."
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-60 disabled:bg-gray-50 disabled:cursor-not-allowed text-lg"
              />
              <p className="text-xs text-gray-400 mt-1">Answer is case-insensitive</p>
            </div>
          ) : (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => player.isCaptain && setSelectedOption(option)}
                  disabled={!player.isCaptain || submitting}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedOption === option
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${
                    !player.isCaptain ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
                  } disabled:opacity-50`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Non-captain message */}
        {!player.isCaptain && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 font-medium">
              Waiting for your captain to submit the answer...
            </p>
          </div>
        )}

        {/* Captain submit button */}
        {player.isCaptain && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? "Submitting..."
              : questionIndex < 2
              ? "Submit & Next Question →"
              : "Submit Final Answer ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
