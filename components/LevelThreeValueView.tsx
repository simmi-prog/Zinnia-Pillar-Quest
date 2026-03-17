"use client";

import { useState, useEffect } from "react";
import { submitLevel3 } from "@/lib/game";
import { getQuestion } from "@/lib/queries";
import type { Question, Player } from "@/lib/types";

interface LevelThreeValueViewProps {
  player: Player;
}

export default function LevelThreeValueView({ player }: LevelThreeValueViewProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const questionIndex = player.currentQuestionIndex ?? 0;

  // Reset state when question index changes
  useEffect(() => {
    setSelectedOption("");
    setSubmitting(false);
    getQuestion(3, questionIndex).then(setQuestion);
  }, [questionIndex]);

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setSubmitting(true);
    try {
      await submitLevel3(player.playerId, selectedOption, questionIndex);
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
            <h2 className="text-2xl font-bold text-gray-900">Level 3: Deliver Value 🎯</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Q{questionIndex + 1} of 3
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Speed matters — first correct answers earn the most points!
          </p>
          <div className="mt-2 inline-flex gap-3 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <span>1st ✓ = +35</span>
            <span>2nd ✓ = +30</span>
            <span>3rd ✓ = +25</span>
            <span>Others ✓ = +20</span>
          </div>
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
                  ? "bg-blue-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Question */}
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
                    ? "border-blue-500 bg-blue-50"
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? "Submitting..."
            : questionIndex < 2
            ? "Submit & Next Question →"
            : "Submit Final Answer ✓"}
        </button>
      </div>
    </div>
  );
}
