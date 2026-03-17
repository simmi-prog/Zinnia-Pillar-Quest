"use client";

import { useState, useEffect } from "react";
import { submitLevel2 } from "@/lib/game";
import { getQuestion } from "@/lib/queries";
import type { Question, Player } from "@/lib/types";

interface LevelTwoBoldViewProps {
  player: Player;
}

export default function LevelTwoBoldView({ player }: LevelTwoBoldViewProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [mode, setMode] = useState<"safe" | "bold" | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const questionIndex = player.currentQuestionIndex ?? 0;

  // Reset local state whenever question index changes (after each submission)
  useEffect(() => {
    setMode(null);
    setSelectedOption("");
    setSubmitting(false);
    getQuestion(2, questionIndex).then(setQuestion);
  }, [questionIndex]);

  const handleSubmit = async () => {
    if (!selectedOption || !mode) return;

    setSubmitting(true);
    try {
      await submitLevel2(player.playerId, selectedOption, mode, questionIndex);
    } catch (err) {
      console.error("Failed to submit:", err);
      alert("Failed to submit answer. Please try again.");
      setSubmitting(false);
    }
  };

  if (!question) {
    return <div className="text-center p-8 text-gray-600">Loading question...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Level 2: Be Bold ⚡</h2>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
              Q{questionIndex + 1} of 3
            </span>
          </div>
          <p className="text-gray-500 text-sm">Choose your risk level for each question</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < questionIndex
                  ? "bg-green-500"
                  : i === questionIndex
                  ? "bg-orange-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Mode selector — shown when mode not yet chosen */}
        {!mode && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Your Strategy for Q{questionIndex + 1}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("safe")}
                className="p-6 border-2 border-green-500 rounded-xl hover:bg-green-50 hover:shadow-md transition-all text-left"
              >
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="font-bold text-lg mb-1">Be Safe</h4>
                <p className="text-sm text-gray-600">Correct: +15 pts | Wrong: 0 pts</p>
                <p className="text-xs text-gray-400 mt-1">Low risk, steady progress</p>
              </button>

              <button
                onClick={() => setMode("bold")}
                className="p-6 border-2 border-orange-500 rounded-xl hover:bg-orange-50 hover:shadow-md transition-all text-left"
              >
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-bold text-lg mb-1">Be Bold</h4>
                <p className="text-sm text-gray-600">Correct: +30 pts | Wrong: −10 pts</p>
                <p className="text-xs text-gray-400 mt-1">High risk, high reward</p>
              </button>
            </div>
          </div>
        )}

        {/* Question + answer — shown after mode selected */}
        {mode && (
          <>
            {/* Mode badge with change option */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mode:{" "}
                <span
                  className={`font-bold ${
                    mode === "safe" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {mode === "safe" ? "Be Safe 🛡️" : "Be Bold ⚡"}{" "}
                  <span className="font-normal text-gray-500">
                    (Correct: {mode === "safe" ? "+15" : "+30"} | Wrong:{" "}
                    {mode === "safe" ? "0" : "−10"})
                  </span>
                </span>
              </span>
              <button
                onClick={() => setMode(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Change
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 whitespace-pre-line leading-relaxed">
                {question.prompt}
              </h3>
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    disabled={submitting}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedOption === option
                        ? "border-orange-500 bg-orange-50"
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
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? "Submitting..."
                : questionIndex < 2
                ? "Submit & Next Question →"
                : "Submit Final Answer ✓"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
