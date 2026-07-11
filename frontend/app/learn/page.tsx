"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import DuoMascot from "@/components/DuoMascot";
import { fetchCoursePath, CoursePath } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { Lock, Check, BookOpen, Star, Gift, X, Gem, Crown, Flame, Zap } from "lucide-react";

/* ─── Chest Modal ──────────────────────────────────────────────────────────── */
function ChestModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1e2d3d] border-2 border-b-8 border-amber-400 dark:border-amber-600 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
        <div className="text-8xl mb-3" style={{ animation: "bounce 0.6s ease-in-out 3" }}>🎁</div>
        <h2 className="font-extrabold text-2xl text-amber-600 dark:text-amber-400 tracking-tight">Treasure Chest!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-2 leading-relaxed">
          You completed a skill! Here is your reward.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 py-5 px-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800">
          <Gem size={36} className="text-blue-500 fill-blue-400" />
          <div className="text-left">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Reward</p>
            <span className="font-extrabold text-3xl text-blue-600 dark:text-blue-400">+50 Gems</span>
          </div>
        </div>

        <button onClick={onClose} className="mt-6 w-full py-4 btn-3d-macaw font-extrabold text-lg rounded-2xl">
          Collect! 🎉
        </button>
      </div>
    </div>
  );
}

/* ─── Skill Node ───────────────────────────────────────────────────────────── */
function getNodeIcon(status: "completed" | "active" | "locked", idx: number) {
  if (status === "completed") return <Crown className="text-white fill-white/80" size={26} />;
  if (status === "active") return <BookOpen className="text-white" size={26} />;
  const icons = [Lock, Star, Zap, Flame];
  const Icon = icons[idx % icons.length];
  return <Icon className="text-slate-400 dark:text-slate-500" size={26} />;
}

/* ─── Inner component (needs Suspense for useSearchParams) ─────────────────── */
function LearnPageInner() {
  const [path, setPath] = useState<CoursePath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltipSkillId, setActiveTooltipSkillId] = useState<number | null>(null);
  const [showChest, setShowChest] = useState(false);
  // Track which chest keys have been opened (persist in localStorage)
  const [openedChests, setOpenedChests] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const parsed = JSON.parse(localStorage.getItem("openedChests") || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const refreshKey = searchParams.get("refresh");

  const loadPath = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCoursePath(1);
      setPath(data);
      const firstActive = data.units.flatMap(u => u.skills).find(s => s.status === "active");
      if (firstActive) setActiveTooltipSkillId(firstActive.id);
    } catch (err: any) {
      setError(err.message || "Failed to load course path.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPath(); }, [loadPath, refreshKey]);

  // Close tooltip on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActiveTooltipSkillId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { addGemsAction } = useUserStore();

  const openChest = (key: string) => {
    if (!openedChests.includes(key)) {
      const next = [...openedChests, key];
      setOpenedChests(next);
      localStorage.setItem("openedChests", JSON.stringify(next));
      addGemsAction(50);
      setShowChest(true);
    }
  };

  /* ── Zigzag offset ── */
  const getOffset = (i: number) => {
    const cycle = i % 8;
    const map: Record<number, string> = {
      0: "translate-x-0", 1: "translate-x-10", 2: "translate-x-16",
      3: "translate-x-10", 4: "translate-x-0",  5: "-translate-x-10",
      6: "-translate-x-16", 7: "-translate-x-10",
    };
    return map[cycle] ?? "translate-x-0";
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-800 dark:text-white">
      <Sidebar />
      <div className="md:ml-64 flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[80vh]">
          <div className="w-14 h-14 rounded-full border-4 border-t-macaw border-slate-200 dark:border-slate-800 animate-spin" />
          <p className="font-bold text-slate-400">Loading your learning path…</p>
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !path) return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-800 dark:text-white">
      <Sidebar />
      <div className="md:ml-64 flex flex-col">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[80vh]">
          <span className="text-5xl">😿</span>
          <h3 className="font-extrabold text-xl">Could not load path</h3>
          <p className="text-slate-400 max-w-xs">{error || "Server unreachable."}</p>
          <button onClick={loadPath} className="px-8 py-3 btn-3d-macaw">Retry</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-800 dark:text-white">
      {showChest && <ChestModal onClose={() => setShowChest(false)} />}
      <Sidebar />

      <div className="md:ml-64 flex flex-col pb-24 md:pb-12">
        <TopBar />

        <main className="w-full max-w-[540px] mx-auto px-4 pt-32 pb-16">
          {path.units.map((unit) => {
            // flat global skill index for offsets & chest keys
            let gIdx = 0;
            return (
              <section key={unit.id} className="mb-10">

                {/* ── Unit Banner ── */}
                <div
                  className="rounded-2xl mb-10 overflow-hidden shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${unit.color}33 0%, ${unit.color}11 100%)`, border: `2px solid ${unit.color}55` }}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: unit.color }}>
                      <Star size={20} className="text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-xs tracking-widest uppercase" style={{ color: unit.color }}>
                        UNIT {unit.order}
                      </p>
                      <h2 className="font-extrabold text-base text-slate-800 dark:text-white truncate">{unit.title}</h2>
                      {unit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{unit.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Dashed connector ── */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute inset-y-0 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-700 z-0" />

                  <div className="flex flex-col items-center gap-8 relative z-10 w-full">
                    {unit.skills.map((skill, sIdx) => {
                      const currentGIdx = gIdx++;
                      const isCompleted = skill.status === "completed";
                      const isActive = skill.status === "active";
                      const isLocked = skill.status === "locked";

                      const completedLessons = skill.lessons.filter(l => l.completed).length;
                      const totalLessons = skill.lessons.length;
                      const firstIncomplete = skill.lessons.find(l => !l.completed) ?? skill.lessons[0];
                      const offsetClass = getOffset(currentGIdx);

                      // chest: shown after every completed skill. Locked if skill not yet completed
                      const chestKey = `skill-${skill.id}-chest`;
                      const chestUnlocked = isCompleted;
                      const chestOpened = openedChests.includes(chestKey);

                      return (
                        <div key={skill.id} className="flex flex-col items-center w-full">
                          {/* Node + mascot wrapper */}
                          <div className={`relative flex flex-col items-center transition-transform duration-300 ${offsetClass}`}>

                            {/* Active tooltip */}
                            {(isActive || isCompleted) && activeTooltipSkillId === skill.id && (
                              <div
                                ref={tooltipRef}
                                className="absolute -top-48 z-30 w-68"
                                style={{ width: 260 }}
                              >
                                <div className="bg-[#1cb0f6] rounded-2xl p-4 shadow-2xl text-white text-center relative">
                                  <button
                                    onClick={() => setActiveTooltipSkillId(null)}
                                    className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                                  >
                                    <X size={14} />
                                  </button>
                                  <span className="text-xs font-extrabold opacity-80 tracking-wider uppercase block">
                                    LESSON {completedLessons}/{totalLessons}
                                  </span>
                                  <h3 className="font-extrabold text-lg mt-0.5 leading-tight">{skill.title}</h3>

                                  {/* Lesson dots */}
                                  <div className="flex gap-1.5 justify-center mt-2">
                                    {skill.lessons.map((l, li) => (
                                      <div key={li} className={`w-2 h-2 rounded-full ${l.completed ? "bg-white" : "bg-white/30"}`} />
                                    ))}
                                  </div>

                                  {isCompleted ? (
                                    <div className="mt-3 py-2 rounded-xl bg-white/20 text-sm font-bold">
                                      ✓ Skill Complete!
                                    </div>
                                  ) : (
                                    <Link
                                      href={`/lesson/${firstIncomplete?.id}?refresh=${Date.now()}`}
                                      className="block mt-3 w-full py-2.5 rounded-xl bg-white text-[#1cb0f6] font-extrabold text-sm hover:bg-blue-50 transition active:scale-95"
                                    >
                                      START (+10 XP)
                                    </Link>
                                  )}
                                  {/* Triangle */}
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                                    <div className="w-3 h-3 bg-[#1cb0f6] rotate-45 mx-auto -translate-y-1.5" />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Lesson progress dots (above node for active) */}
                            {isActive && (
                              <div className="flex gap-1 mb-2">
                                {skill.lessons.map((l, li) => (
                                  <div key={li} className={`h-2 rounded-full transition-all ${l.completed ? "w-4 bg-[#58CC02]" : "w-2 bg-slate-200 dark:bg-slate-700"}`} />
                                ))}
                              </div>
                            )}

                            {/* Circular node */}
                            <button
                              disabled={isLocked}
                              onClick={() => !isLocked && setActiveTooltipSkillId(
                                activeTooltipSkillId === skill.id ? null : skill.id
                              )}
                              className={`relative w-20 h-20 rounded-full flex items-center justify-center select-none transition-all duration-200
                                ${isCompleted ? "bg-[#58CC02] shadow-lg shadow-green-400/30 hover:brightness-110 active:scale-95"
                                  : isActive ? "bg-[#1cb0f6] shadow-xl shadow-blue-400/40 hover:brightness-110 active:scale-95 ring-4 ring-[#1cb0f6]/30"
                                  : "bg-slate-200 dark:bg-slate-800 cursor-not-allowed"}
                              `}
                            >
                              {/* Inner circle shadow */}
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center
                                ${isCompleted ? "bg-black/10" : isActive ? "bg-black/10" : "bg-black/5"}`}>
                                {getNodeIcon(skill.status, sIdx)}
                              </div>
                              {/* Bottom shadow bar (Duolingo 3D effect) */}
                              <div className={`absolute -bottom-1.5 left-2 right-2 h-2 rounded-full -z-10
                                ${isCompleted ? "bg-[#46A302]" : isActive ? "bg-[#1592CC]" : "bg-slate-300 dark:bg-slate-700"}`} />
                            </button>

                            {/* Skill label */}
                            <div className="mt-3 text-center">
                              <span className={`font-extrabold text-sm ${isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-200"}`}>
                                {skill.title}
                              </span>
                              {isCompleted && (
                                <div className="flex items-center gap-1 justify-center mt-0.5">
                                  <Check size={12} className="text-[#58CC02]" />
                                  <span className="text-[11px] font-bold text-[#58CC02]">Complete</span>
                                </div>
                              )}
                              {isActive && !isCompleted && (
                                <span className="block text-[11px] font-bold text-[#1cb0f6] mt-0.5">
                                  {completedLessons}/{totalLessons} lessons
                                </span>
                              )}
                            </div>

                            {/* Duo mascot floating beside active node */}
                            {isActive && (
                              <div className="absolute -right-20 top-1 pointer-events-none select-none">
                                <DuoMascot mood="neutral" className="w-16 h-16" />
                              </div>
                            )}
                          </div>

                          {/* ── Chest (after each skill) ── */}
                          <div className={`flex flex-col items-center mt-6 transition-all duration-500 ${
                            // chest shifts opposite to skill offset for variety
                            currentGIdx % 2 === 0 ? "translate-x-8" : "-translate-x-8"
                          }`}>
                            {chestUnlocked ? (
                              /* UNLOCKED chest */
                              <button
                                onClick={() => !chestOpened && openChest(chestKey)}
                                disabled={chestOpened}
                                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all select-none
                                  ${chestOpened
                                    ? "bg-slate-200 dark:bg-slate-800 cursor-default opacity-50"
                                    : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-400/40 hover:brightness-110 active:scale-95 cursor-pointer"
                                  }`}
                              >
                                {chestOpened
                                  ? <Gift size={22} className="text-slate-400" />
                                  : <Gift size={22} className="text-white animate-bounce" />
                                }
                                {!chestOpened && (
                                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                                    1
                                  </div>
                                )}
                                {/* 3D shadow */}
                                <div className={`absolute -bottom-1.5 left-2 right-2 h-2 rounded-full -z-10 ${chestOpened ? "bg-slate-300 dark:bg-slate-700" : "bg-orange-600"}`} />
                              </button>
                            ) : (
                              /* LOCKED chest */
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-200 dark:bg-slate-800 opacity-40 select-none">
                                <Lock size={20} className="text-slate-400" />
                                <div className="absolute -bottom-1.5 left-2 right-2 h-2 rounded-full -z-10 bg-slate-300 dark:bg-slate-700" />
                              </div>
                            )}
                            <span className={`text-[10px] font-extrabold mt-2 uppercase tracking-widest ${
                              chestOpened ? "text-slate-400" : chestUnlocked ? "text-amber-500" : "text-slate-400 opacity-40"
                            }`}>
                              {chestOpened ? "Opened" : chestUnlocked ? "Chest!" : "Locked"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

/* ─── Exported page — wraps inner in Suspense for useSearchParams ─────────── */
export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#111827] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-[#58CC02] border-slate-200 animate-spin" />
      </div>
    }>
      <LearnPageInner />
    </Suspense>
  );
}
