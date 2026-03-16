"use client";

import { useState, useEffect } from "react";
import { submitLevel2 } from "@/lib/game";
import { getQuestionByLevel } from "@/lib/queries";
import type { Question, Player } from "@/lib/types";

interface LevelTwoBoldViewProps {
  player: Player;
}

export default function LevelTwoBoldView({ player }: LevelTwoBoldViewProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [mode, setMode] = useState<"safe" | "bold" | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuestionByLevel(2).then(setQuestion);
  }, []);

  const handleSubmit = async () => {
    if (!selectedOption || !mode) return;

    setSubmitting(true);
    try {
      await submitLevel2(player.playerId, selectedOption, mode);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Level 2: Be Bold</h2>
          <p className="text-gray-600">Choose your risk level, then answer</p>
        </div>

        {!mode && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("safe")}
                className="p-6 border-2 border-secondary rounded-xl hover:bg-green-50 hover:shadow-md transition-all"
              >
                <div className="text-2xl mb-2">🛡️</div>
                <h4 className="font-bold text-lg mb-2">Be Safe</h4>
                <p className="text-sm text-gray-600 mb-2">Correct: +15 | Wrong: 0</p>
                <p className="text-xs text-gray-500">Play it safe</p>
              </button>

              <button
                onClick={() => setMode("bold")}
                className="p-6 border-2 border-orange-500 rounded-xl hover:bg-orange-50 hover:shadow-md transition-all"
              >
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-bold text-lg mb-2">Be Bold</h4>
                <p className="text-sm text-gray-600 mb-2">Correct: +30 | Wrong: -10</p>
                <p className="text-xs text-gray-500">High risk, high reward</p>
              </button>
            </div>
          </div>
        )}

        {mode && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected Mode:{" "}
                <span
                  className={`font-bold ${mode === "safe" ? "text-secondary" : "text-orange-600"}`}
                >
                  {mode === "safe" ? "Be Safe 🛡️" : "Be Bold ⚡"}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.prompt}</h3>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    disabled={submitting}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedOption === option
                        ? "border-primary bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    } cursor-pointer hover:shadow-md disabled:opacity-50`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Answer"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
