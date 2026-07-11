"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useUserStore } from "@/lib/store";
import { Gem, Star, Award, Sparkles, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, fetchUser, refillHeartsAction, resetProgressAction } = useUserStore();
  const [refilling, setRefilling] = useState(false);
  const [refillMessage, setRefillMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const handleRefill = async () => {
    if (!user) return;
    if (user.hearts === user.max_hearts) {
      setRefillMessage({ type: "error", text: "You already have full hearts!" });
      return;
    }
    if (user.gems < 350) {
      setRefillMessage({ type: "error", text: "Insufficient gems to refill (need 350)." });
      return;
    }

    setRefilling(true);
    setRefillMessage(null);
    const success = await refillHeartsAction();
    setRefilling(false);

    if (success) {
      setRefillMessage({ type: "success", text: "Hearts refilled successfully!" });
    } else {
      setRefillMessage({ type: "error", text: "Refill failed." });
    }
  };

  // Dynamic calculations for achievements progress
  const getAchievements = () => {
    if (!user) return [];

    return [
      {
        id: 1,
        title: "First Steps",
        description: "Earn 10 XP to complete your first steps.",
        target: 10,
        current: user.xp,
        isCompleted: user.xp >= 10,
      },
      {
        id: 2,
        title: "Wildfire",
        description: "Maintain a 3-day active streak.",
        target: 3,
        current: user.streak,
        isCompleted: user.streak >= 3,
      },
      {
        id: 3,
        title: "Gem Collector",
        description: "Reach 400 gems in your balance.",
        target: 400,
        current: user.gems,
        isCompleted: user.gems >= 400,
      },
      {
        id: 4,
        title: "Super Learner",
        description: "Earn 100 total XP.",
        target: 100,
        current: user.xp,
        isCompleted: user.xp >= 100,
      },
    ];
  };

  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-800 dark:text-white transition-colors duration-150">
      {/* Sidebar navigation */}
      <Sidebar />

      <div className="md:ml-64 min-h-screen flex flex-col pb-24 md:pb-12 bg-white dark:bg-[#111827] text-slate-800 dark:text-white transition-colors duration-150">
        {/* Topbar stats dashboard */}
        <TopBar />

        {/* Profile layout */}
        <main className="flex-1 w-full max-w-[700px] mx-auto px-4 py-8 select-none bg-white dark:bg-[#111827] transition-colors duration-150">
          {/* User Profile Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-b-6 border-hare-light dark:border-slate-800 rounded-3xl mb-8 bg-white dark:bg-[#111827]/40">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-macaw text-white flex items-center justify-center font-extrabold text-4xl shadow-md border-2 border-macaw-dark">
              {user?.name.charAt(0).toUpperCase() ?? "K"}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-200">{user?.name ?? "Keshav Goyal"}</h2>
              <p className="text-slate-400 font-semibold text-sm mt-0.5">{user?.email ?? "keshav@nsut.ac.in"}</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-hare-ultralight dark:bg-slate-800 border-2 border-hare-light dark:border-slate-800 rounded-full font-bold text-xs text-slate-500 dark:text-slate-400">
                  Joined: July 2026
                </span>
                <span className="px-3 py-1 bg-feather/10 border-2 border-feather/20 rounded-full font-bold text-xs text-feather">
                  Student ID: 1
                </span>
              </div>
            </div>
          </div>

          {/* Shop & Hearts Refill Section */}
          <div className="p-6 border-2 border-b-6 border-feather/20 dark:border-feather/10 bg-feather/5 rounded-3xl mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-feather rounded-2xl text-white shadow-md">
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Gems Shop</h3>
                <p className="text-slate-500 font-semibold text-sm mt-0.5">
                  Refill your hearts to capacity to continue learning without stops.
                </p>

                {/* Status messages */}
                {refillMessage && (
                  <div
                    className={`mt-4 p-3 rounded-xl font-bold text-xs flex items-center gap-2 ${
                      refillMessage.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <AlertCircle size={16} />
                    <span>{refillMessage.text}</span>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-4">
                  <button
                    onClick={handleRefill}
                    disabled={refilling}
                    className="px-6 py-3 btn-3d-macaw text-[15px] flex items-center gap-2"
                  >
                    {refilling ? "Processing..." : "Refill Hearts"}
                  </button>
                  <span className="font-extrabold text-sm text-slate-400 flex items-center gap-1.5">
                    <Gem size={18} className="fill-feather text-feather" />
                    Cost: 350 Gems
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Container */}
          <div>
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Award className="text-macaw" />
              Achievements
            </h3>

            <div className="flex flex-col gap-4">
              {achievements.map((item) => {
                const percent = Math.min(Math.round((item.current / item.target) * 100), 100);
                
                return (
                  <div
                    key={item.id}
                    className="p-5 border-2 border-b-6 border-hare-light dark:border-slate-800 rounded-2xl bg-white dark:bg-[#131f24]/30 flex items-start gap-4"
                  >
                    <div
                      className={`p-3 rounded-xl text-white shadow-md ${
                        item.isCompleted ? "bg-bee border-b-2 border-bee-dark" : "bg-hare"
                      }`}
                    >
                      <Star size={22} className={item.isCompleted ? "fill-white text-white" : ""} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="text-[15px] text-slate-800 dark:text-slate-200">{item.title}</span>
                        <span
                          className={`text-xs ${
                            item.isCompleted ? "text-bee-dark" : "text-slate-400"
                          }`}
                        >
                          {item.isCompleted ? "COMPLETE" : `${item.current}/${item.target}`}
                        </span>
                      </div>
                      <p className="text-slate-400 font-semibold text-xs mt-0.5">{item.description}</p>

                      {/* Progress Bar */}
                      {!item.isCompleted && (
                        <div className="w-full bg-hare-light dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                          <div
                            className="bg-bee h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger Zone: Reset Progress */}
          <div className="mt-12 p-6 border-2 border-b-6 border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/10 rounded-3xl">
            <h3 className="font-extrabold text-lg text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm mt-0.5">
              Resetting progress will permanently clear all completed lessons, XP, active streaks, and gems.
            </p>
            <button
              onClick={async () => {
                if (confirm("⚠️ Are you sure you want to reset all your progress? This action cannot be undone.")) {
                  await resetProgressAction();
                  alert("🔄 Progress reset successfully!");
                  window.location.reload();
                }
              }}
              className="mt-4 px-6 py-3 btn-3d-cardinal text-sm font-bold uppercase tracking-wider"
            >
              Reset All Progress
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
