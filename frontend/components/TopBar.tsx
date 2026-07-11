"use client";

import { useEffect, useState, useRef } from "react";
import { useUserStore } from "@/lib/store";
import { Flame, Shield, Heart, Zap, Gem, ChevronDown } from "lucide-react";

export default function TopBar() {
  const { user, fetchUser, isDarkMode, toggleTheme } = useUserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Synchronize document.documentElement class for Tailwind class-based dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 bg-white dark:bg-[#111827] border-b-2 border-hare-light dark:border-slate-800 h-16 w-full px-6 flex items-center justify-between z-40 select-none text-slate-800 dark:text-white transition-colors duration-150">
      
      {/* Country Flag Dropdown Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 p-1 px-3.5 rounded-xl border-2 border-hare-light dark:border-slate-800 bg-hare-ultralight dark:bg-[#131f24]/30 hover:brightness-105 active:scale-95 transition font-extrabold text-[15px] cursor-pointer"
        >
          <span className="text-2xl">🇪🇸</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 rounded-2xl border-2 border-hare-light dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50">
            <div className="flex flex-col py-1 font-bold text-sm">
              <button className="flex items-center gap-3 px-4 py-3 bg-hare-ultralight dark:bg-slate-800 text-slate-800 dark:text-white w-full text-left">
                <span className="text-xl">🇪🇸</span>
                <span>Spanish (Active)</span>
              </button>
              <button disabled className="flex items-center gap-3 px-4 py-3 text-slate-400 w-full text-left cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <span className="text-xl opacity-50">🇬🇧</span>
                <span>English (Locked)</span>
              </button>
              <button disabled className="flex items-center gap-3 px-4 py-3 text-slate-400 w-full text-left cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <span className="text-xl opacity-50">🇫🇷</span>
                <span>French (Locked)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats and Theme Toggle Container */}
      <div className="flex items-center gap-4 sm:gap-6 font-bold text-[15px]">
        {/* Streak */}
        <div className="flex items-center gap-2 text-fox" title="Daily Streak">
          <Flame size={22} className="fill-fox" />
          <span>{user?.streak ?? 0}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 text-bee" title="Total XP">
          <Zap size={20} className="fill-bee" />
          <span>{user?.xp ?? 0}</span>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-2 text-feather" title="Gems balance">
          <Gem size={20} className="fill-feather" />
          <span>{user?.gems ?? 0}</span>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-2 text-cardinal mr-2" title="Hearts (Lives)">
          <Heart
            size={20}
            className={`${user && user.hearts > 0 ? "fill-cardinal" : "text-cardinal"}`}
          />
          <span>{user?.hearts === 0 ? "0" : user?.hearts ?? 5}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:brightness-105 active:scale-95 transition-all cursor-pointer font-bold text-xs flex items-center gap-1.5"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? "☀️ LIGHT" : "🌙 DARK"}
        </button>
      </div>
    </header>
  );
}
