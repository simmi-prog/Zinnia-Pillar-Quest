"use client";

import { useState, useEffect } from "react";
import CreateTeamForm from "@/components/CreateTeamForm";
import JoinTeamForm from "@/components/JoinTeamForm";
import { initializeGameState } from "@/lib/game";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  useEffect(() => {
    initializeGameState();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Zinnia Pillar Quest</h1>
          <p className="text-blue-100">Strong Pillars. Stronger Guessing Skills 🤪</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === "create"
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Create Team
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === "join"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Join Team
            </button>
          </div>

          <div className="p-6">
            {activeTab === "create" ? <CreateTeamForm /> : <JoinTeamForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
