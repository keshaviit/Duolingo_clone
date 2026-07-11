"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { fetchLeaderboard, LeaderboardUser } from "@/lib/api";
import { Shield, ShieldAlert, Compass } from "lucide-react";

const LEAGUE_SHIELDS = [
  { name: "Bronze", color: "#D67D3E", active: false },
  { name: "Silver", color: "#B3C3D4", active: false },
  { name: "Gold", color: "#FFD700", active: true, hasFeather: true },
  { name: "Sapphire", color: "#3B82F6", active: false },
  { name: "Ruby", color: "#EF4444", active: false },
  { name: "Emerald", color: "#10B981", active: false },
];

const STATUS_EMOJIS = [
  "😎", "🎉", "💪", "👀", "🍿", "🇺🇸", 
  "🦉", "💯", "💩", "🏆", "🍔", "🐱"
];

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive "Set your status" states
  const [userStatusEmoji, setUserStatusEmoji] = useState("😊");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const list = await fetchLeaderboard();
        setRankings(list);
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-800 dark:text-white transition-colors duration-150">
      {/* Navigation Drawer */}
      <Sidebar />

      <div className="md:ml-64 min-h-screen flex flex-col pb-24 md:pb-12 bg-white dark:bg-[#111827] text-slate-800 dark:text-white transition-colors duration-150">
        {/* Topbar stats dashboard */}
        <TopBar />

        {/* Redesigned double-column layout */}
        <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-8 select-none grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-[#111827] transition-colors duration-150">
          
          {/* LEFT COLUMN: Leaderboard Listings (8 Cols on large screens) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            {/* League Shields header row */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-5 mb-6 border-b border-hare-light dark:border-slate-800 pb-6">
              {LEAGUE_SHIELDS.map((shield) => {
                const isActive = shield.active;
                return (
                  <div
                    key={shield.name}
                    className={`flex flex-col items-center transition-all ${
                      isActive ? "scale-110 opacity-100" : "scale-95 opacity-40 hover:opacity-60"
                    }`}
                  >
                    {/* Shield SVG Drawing */}
                    <div
                      className="w-12 h-14 relative flex items-center justify-center filter drop-shadow-md"
                      style={{ color: shield.color }}
                    >
                      <Shield size={48} fill={shield.color} stroke="none" />
                      {shield.hasFeather && (
                        <span className="absolute text-slate-800 text-[10px] font-extrabold translate-y-[-2px]">
                          ⚡
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-wider">
                      {shield.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Gold League active status card */}
            <div className="w-full text-center mb-8 flex flex-col items-center">
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-wide">Gold League</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1 max-w-sm leading-relaxed">
                Complete a lesson to join this week's leaderboard and compete against others!
              </p>
              <Link
                href="/lesson/1"
                className="mt-5 px-8 py-3.5 btn-3d-feather text-[15px] tracking-wider font-extrabold uppercase flex items-center gap-2"
              >
                <Compass size={18} />
                START A LESSON
              </Link>
            </div>

            {/* Rank Board List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 w-full">
                <div className="w-8 h-8 rounded-full border-4 border-t-macaw border-slate-200 dark:border-slate-800 animate-spin" />
                <span className="text-slate-500 font-bold text-sm">Loading rankings...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 border-2 border-dashed border-hare-light dark:border-slate-800 rounded-2xl w-full">
                <ShieldAlert size={28} />
                <span className="font-bold text-sm mt-2">{error}</span>
              </div>
            ) : (
              <div className="w-full flex flex-col border border-hare-light dark:border-slate-800 bg-[#f7f7f7] dark:bg-[#131f24]/30 rounded-3xl overflow-hidden shadow-lg">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-800/40 border-b border-hare-light dark:border-slate-800 font-extrabold text-xs text-slate-500 tracking-wider">
                  <span className="col-span-2">RANK</span>
                  <span className="col-span-6">USER</span>
                  <span className="col-span-4 text-right">TOTAL XP</span>
                </div>

                {/* Table Rows list */}
                <div className="flex flex-col divide-y divide-hare-light dark:divide-slate-800/60">
                  {rankings.map((row, idx) => {
                    const rank = idx + 1;
                    return (
                      <div
                        key={row.name}
                        className={`grid grid-cols-12 gap-3 px-6 py-4.5 items-center font-bold ${
                          row.is_current_user
                            ? "bg-feather/10 text-feather border-l-4 border-feather"
                            : "text-slate-700 dark:text-slate-300 bg-transparent"
                        }`}
                      >
                        {/* Rank */}
                        <div className="col-span-2 flex items-center justify-start text-[15px] font-extrabold text-slate-500">
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                        </div>

                        {/* User Details */}
                        <div className="col-span-6 flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm ${
                              row.is_current_user ? "bg-feather text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] text-slate-800 dark:text-slate-200">{row.name}</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                              🔥 {row.streak} Day Streak
                            </span>
                          </div>
                        </div>

                        {/* XP */}
                        <span className="col-span-4 text-right text-[15px] font-extrabold text-slate-500 dark:text-slate-400">
                          {row.xp} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Set Status & Footer Links (4 Cols on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Set Status Interactive Widget */}
            <div className="p-6 border border-hare-light dark:border-slate-800 bg-hare-ultralight dark:bg-[#131f24]/30 rounded-3xl flex flex-col items-center shadow-lg relative">
              <h3 className="font-extrabold text-lg text-slate-700 dark:text-slate-200 self-start mb-4">Set your status</h3>
              
              {/* User Avatar & Status preview */}
              <div className="relative flex items-center justify-center w-28 h-28 mb-5 select-none">
                {/* Large circular avatar placeholder */}
                <div className="w-24 h-24 rounded-full border-4 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-3xl font-extrabold">
                  K
                </div>
                {/* Status bubble */}
                <div className="absolute top-[-10px] right-[-15px] bg-slate-200 border-2 border-slate-300 dark:bg-slate-700 dark:border-slate-600 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md transform hover:scale-110 transition duration-150 cursor-default text-slate-800 dark:text-white">
                  {userStatusEmoji}
                  {/* speech pointer */}
                  <div className="absolute bottom-[-4px] left-2 w-2 h-2 bg-slate-200 border-r border-b border-slate-300 dark:bg-slate-700 dark:border-slate-600 rotate-45" />
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#111827]" />
              </div>

              {/* Status Emojis Selection Grid */}
              <div className="grid grid-cols-6 gap-2 w-full pt-4 border-t border-hare-light dark:border-slate-800/80">
                {STATUS_EMOJIS.map((emoji) => {
                  const isSelected = userStatusEmoji === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => setUserStatusEmoji(emoji)}
                      className={`text-xl p-2 rounded-xl border-2 transition active:scale-95 cursor-pointer ${
                        isSelected
                          ? "border-feather bg-feather/10"
                          : "border-transparent bg-slate-200/50 dark:bg-slate-800/40 hover:bg-slate-300/40 dark:hover:bg-slate-800"
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mock Duolingo footer links */}
            <footer className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-2 justify-center font-bold text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">ABOUT</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">BLOG</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">STORE</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">EFFICACY</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">CAREERS</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">INVESTORS</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">TERMS</span>
              <span>•</span>
              <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">PRIVACY</span>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
