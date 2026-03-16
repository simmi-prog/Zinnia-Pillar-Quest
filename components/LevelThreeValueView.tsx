"use client";

import { useState, useEffect } from "react";
import { submitLevel3 } from "@/lib/game";
import { getQuestionByLevel } from "@/lib/queries";
import type { Question, Player } from "@/lib/types";

interface LevelThreeValueViewProps {
  player: Player;
}

export default function LevelThreeValueView({ player }: LevelThreeValueViewProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuestionByLevel(3).then(setQuestion);
  }, []);

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setSubmitting(true);
    try {
      await submitLevel3(player.playerId, selectedOption);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Level 3: Deliver Value</h2>
          <p className="text-gray-600">Speed matters! First correct answers get more points.</p>
          <div className="mt-3 text-sm text-gray-500 space-y-1">
            <p>1st correct: +35 | 2nd: +30 | 3rd: +25 | Others: +20</p>
          </div>
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
      </div>
    </div>
  );
}
