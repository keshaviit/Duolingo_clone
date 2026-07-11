"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserStore, useLessonStore } from "@/lib/store";
import { fetchLessonExercises, submitLessonComplete } from "@/lib/api";
import { X, Heart, CheckCircle2, XCircle, ShieldAlert, Sparkles, Flag } from "lucide-react";
import confetti from "canvas-confetti";
import DuoMascot from "@/components/DuoMascot";

// Shared AudioContext to unlock browser autoplay/gesture security policies
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

// Helper functions to synthesize retro chimes and buzzer alerts dynamically
const playCorrectSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gainNode.gain.setValueAtTime(0.2, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    const now = ctx.currentTime;
    playTone(523.25, now, 0.15);
    playTone(659.25, now + 0.08, 0.15);
    playTone(784.00, now + 0.16, 0.2);
    playTone(1046.50, now + 0.24, 0.35);
  } catch (e) {
    console.warn("Audio chime failed:", e);
  }
};

const playIncorrectSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gainNode.gain.setValueAtTime(0.25, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    const now = ctx.currentTime;
    playTone(160, now, 0.18);
    playTone(130, now + 0.2, 0.3);
  } catch (e) {
    console.warn("Audio buzz failed:", e);
  }
};

// ----------------- SUB-COMPONENTS FOR EXERCISES -----------------

// 1. Multiple Choice Component
interface MultipleChoiceProps {
  options: string[];
  selected: string | null;
  onSelect: (ans: string) => void;
  disabled: boolean;
  isAnswerChecked: boolean;
  correctAnswer?: any;
}
function MultipleChoice({ options, selected, onSelect, disabled, isAnswerChecked, correctAnswer }: MultipleChoiceProps) {
  return (
    <div className="grid grid-cols-1 gap-3 w-full max-w-md">
      {options.map((option, idx) => {
        const isSelected = selected === option;
        
        // Correct answer check mapping
        const isCorrectOption = isAnswerChecked && option === correctAnswer;
        const isWrongSelected = isAnswerChecked && isSelected && option !== correctAnswer;

        let btnStyle = "border-hare-light dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-hare-ultralight dark:hover:bg-slate-800/40";
        if (isAnswerChecked) {
          if (isCorrectOption) {
            btnStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400";
          } else if (isWrongSelected) {
            btnStyle = "border-cardinal bg-cardinal/10 text-cardinal";
          } else {
            btnStyle = "border-hare-light dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 opacity-60";
          }
        } else if (isSelected) {
          btnStyle = "border-feather bg-feather/5 text-feather";
        }

        return (
          <button
            key={option}
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={`w-full p-4 text-left border-2 rounded-2xl font-bold transition-all flex items-center gap-4 ${btnStyle}`}
          >
            <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs ${
              isAnswerChecked
                ? isCorrectOption
                  ? "border-green-500 text-green-600"
                  : isWrongSelected
                  ? "border-cardinal text-cardinal"
                  : "border-hare-light text-slate-400 opacity-40"
                : isSelected
                ? "border-feather text-feather"
                : "border-hare-light text-slate-400"
            }`}>
              {isAnswerChecked ? (isCorrectOption ? "✓" : isWrongSelected ? "✗" : idx + 1) : idx + 1}
            </span>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

// 2. Word Bank Component (Drag/Tap words)
interface WordBankProps {
  words: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled: boolean;
}
function WordBank({ words, selected, onChange, disabled }: WordBankProps) {
  const handleSelectWord = (word: string) => {
    if (disabled) return;
    onChange([...selected, word]);
  };

  const handleRemoveWord = (idxToRemove: number) => {
    if (disabled) return;
    onChange(selected.filter((_, idx) => idx !== idxToRemove));
  };

  const getAvailableWords = () => {
    const selectedCounts: Record<string, number> = {};
    selected.forEach((w) => {
      selectedCounts[w] = (selectedCounts[w] || 0) + 1;
    });

    const available: { word: string; isUsed: boolean }[] = [];
    const tracker: Record<string, number> = {};

    words.forEach((w) => {
      tracker[w] = (tracker[w] || 0) + 1;
      const timesUsed = selectedCounts[w] || 0;
      available.push({
        word: w,
        isUsed: tracker[w] <= timesUsed,
      });
    });

    return available;
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-8">
      {/* Selected Words Answer Slots */}
      <div className="min-h-16 w-full border-b-2 border-hare-light dark:border-slate-855 flex flex-wrap gap-2 py-2 items-center justify-center">
        {selected.length === 0 && (
          <span className="text-slate-400 text-sm font-bold">Tap words below to translate</span>
        )}
        {selected.map((word, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => handleRemoveWord(idx)}
            className="px-4 py-2 border-2 border-b-4 border-hare-light dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl font-semibold text-slate-700 dark:text-slate-200 active:border-b-2 transition-all cursor-pointer"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Available Words Options grid */}
      <div className="flex flex-wrap gap-3 justify-center">
        {getAvailableWords().map(({ word, isUsed }, idx) => (
          <button
            key={idx}
            disabled={disabled || isUsed}
            onClick={() => handleSelectWord(word)}
            className={`px-4 py-2.5 border-2 border-b-4 rounded-xl font-semibold text-[15px] transition-all ${
              isUsed
                ? "border-transparent bg-slate-100 dark:bg-slate-800 text-transparent cursor-default border-b-2"
                : "border-hare-light dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-hare-ultralight dark:hover:bg-slate-855"
            }`}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

// 3. Fill in the Blank Component
interface FillBlankProps {
  options: string[];
  selected: string | null;
  onSelect: (ans: string) => void;
  disabled: boolean;
  isAnswerChecked: boolean;
  correctAnswer?: any;
}
function FillBlank({ options, selected, onSelect, disabled, isAnswerChecked, correctAnswer }: FillBlankProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="flex flex-wrap gap-3 justify-center">
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrectOption = isAnswerChecked && option === correctAnswer;
          const isWrongSelected = isAnswerChecked && isSelected && option !== correctAnswer;

          let btnStyle = "border-hare-light dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-hare-ultralight dark:hover:bg-slate-855 border-b-4";
          if (isAnswerChecked) {
            if (isCorrectOption) {
              btnStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 border-b-4";
            } else if (isWrongSelected) {
              btnStyle = "border-cardinal bg-cardinal/10 text-cardinal border-b-4";
            } else {
              btnStyle = "border-hare-light dark:border-slate-750 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 opacity-60 border-b-2";
            }
          } else if (isSelected) {
            btnStyle = "border-feather bg-feather/5 text-feather border-b-4";
          }

          return (
            <button
              key={option}
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={`px-6 py-3 border-2 rounded-xl font-bold text-lg transition-all ${btnStyle}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 4. Word Matching Grid Component
interface MatchPairsProps {
  data: { left: string[]; right: string[] };
  correctMap: Record<string, string>;
  selectedLeft: string | null;
  selectedRight: string | null;
  onMatchComplete: (isCorrect: boolean) => void;
  disabled: boolean;
}
function MatchPairs({ data, correctMap, selectedLeft, selectedRight, onMatchComplete, disabled }: MatchPairsProps) {
  const [leftWords, setLeftWords] = useState<string[]>([]);
  const [rightWords, setRightWords] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [activeRight, setActiveRight] = useState<string | null>(null);
  const [errorPair, setErrorPair] = useState<{ left: string; right: string } | null>(null);

  useEffect(() => {
    setLeftWords([...data.left].sort(() => Math.random() - 0.5));
    setRightWords([...data.right].sort(() => Math.random() - 0.5));
  }, [data]);

  const handleSelectLeft = (word: string) => {
    if (disabled || matched.has(word)) return;
    setErrorPair(null);
    setActiveLeft(word);

    if (activeRight) {
      checkMatch(word, activeRight);
    }
  };

  const handleSelectRight = (word: string) => {
    if (disabled || matched.has(word)) return;
    setErrorPair(null);
    setActiveRight(word);

    if (activeLeft) {
      checkMatch(activeLeft, word);
    }
  };

  const checkMatch = (lWord: string, rWord: string) => {
    const isCorrect = correctMap[lWord] === rWord;
    if (isCorrect) {
      const newMatched = new Set(matched);
      newMatched.add(lWord);
      newMatched.add(rWord);
      setMatched(newMatched);
      setActiveLeft(null);
      setActiveRight(null);

      if (newMatched.size >= (leftWords.length + rightWords.length)) {
        onMatchComplete(true);
      }
    } else {
      setErrorPair({ left: lWord, right: rWord });
      setActiveLeft(null);
      setActiveRight(null);
      onMatchComplete(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 w-full max-w-lg select-none">
      {/* Left Column (Spanish Words) */}
      <div className="flex flex-col gap-3">
        {leftWords.map((word) => {
          const isMatched = matched.has(word);
          const isActive = activeLeft === word;
          const isError = errorPair?.left === word;

          return (
            <button
              key={word}
              disabled={disabled || isMatched}
              onClick={() => handleSelectLeft(word)}
              className={`w-full p-4 border-2 rounded-2xl font-bold transition-all text-center ${
                isMatched
                  ? "border-hare-light dark:border-slate-800 bg-hare-light/10 dark:bg-slate-800/10 text-hare-dark cursor-not-allowed opacity-40 border-b-2"
                  : isError
                  ? "border-cardinal bg-cardinal/10 text-cardinal border-b-4 animate-shake"
                  : isActive
                  ? "border-feather bg-feather/5 text-feather border-b-4"
                  : "border-hare-light dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-hare-ultralight dark:hover:bg-slate-855 border-b-4 active:border-b-2"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Right Column (English translation Words) */}
      <div className="flex flex-col gap-3">
        {rightWords.map((word) => {
          const isMatched = matched.has(word);
          const isActive = activeRight === word;
          const isError = errorPair?.right === word;

          return (
            <button
              key={word}
              disabled={disabled || isMatched}
              onClick={() => handleSelectRight(word)}
              className={`w-full p-4 border-2 rounded-2xl font-bold transition-all text-center ${
                isMatched
                  ? "border-hare-light dark:border-slate-800 bg-hare-light/10 dark:bg-slate-800/10 text-hare-dark cursor-not-allowed opacity-40 border-b-2"
                  : isError
                  ? "border-cardinal bg-cardinal/10 text-cardinal border-b-4 animate-shake"
                  : isActive
                  ? "border-feather bg-feather/5 text-feather border-b-4"
                  : "border-hare-light dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-hare-ultralight dark:hover:bg-slate-855 border-b-4 active:border-b-2"
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 5. Open Type Answer Input Component
interface TypeAnswerProps {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}
function TypeAnswer({ value, onChange, disabled }: TypeAnswerProps) {
  return (
    <div className="w-full max-w-md">
      <textarea
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type translation in Spanish..."
        rows={4}
        className="w-full p-4 border-2 border-hare-light dark:border-slate-700 rounded-2xl font-semibold bg-hare-ultralight dark:bg-slate-900 text-slate-700 dark:text-slate-250 focus:outline-none focus:border-feather focus:bg-white dark:focus:bg-slate-800 transition-all text-lg resize-none"
      />
    </div>
  );
}

// ----------------- MAIN PLAYER VIEW -----------------

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Number(params.id);

  const { user, deductHeartAction, updateUserStats, refillHeartsAction, isDarkMode } = useUserStore();
  const {
    exercises,
    currentIndex,
    selectedAnswer,
    isAnswerChecked,
    isAnswerCorrect,
    hearts,
    mistakesCount,
    completed,
    initLesson,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    resetLesson,
  } = useLessonStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  
  // Confetti/Summary states
  const [earnedXP, setEarnedXP] = useState<number | null>(null);
  const [streakVal, setStreakVal] = useState<number | null>(null);
  const [isStreakExtended, setIsStreakExtended] = useState<boolean>(false);

  const { fetchUser } = useUserStore();
  // Guard so lesson only initializes ONCE per mount — never re-runs when user.hearts changes
  const hasInitialized = useRef(false);

  // Auto-fetch user if not loaded (direct navigation to /lesson/1)
  // Only runs once on mount
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Skip if we already loaded exercises this session
    if (hasInitialized.current) return;
    // Wait until user is available
    if (!user) return;

    hasInitialized.current = true;

    const loadExercises = async () => {
      try {
        const list = await fetchLessonExercises(lessonId);
        // Capture hearts ONCE at lesson start — never re-read from user after that
        const startHearts = user.hearts ?? 5;
        initLesson(lessonId, list, startHearts);
        
        if (startHearts === 0) {
          setShowRefillModal(true);
        }
      } catch (err) {
        alert("Failed to load lesson exercises.");
        router.push("/learn");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
    // Intentionally only depend on user identity (null → loaded), not user's mutable fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Synchronize root theme class during player sessions
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // If local store hearts drop to 0, show the failure modal
  useEffect(() => {
    if (!loading && hearts === 0 && !isAnswerCorrect && isAnswerChecked) {
      setShowRefillModal(true);
    }
  }, [hearts, loading, isAnswerCorrect, isAnswerChecked]);

  const handleCheck = async () => {
    // Unlock browser audio context synchronously
    getAudioContext();

    if (isAnswerChecked) {
      nextQuestion();
    } else {
      await checkAnswer();

      const isCorrect = useLessonStore.getState().isAnswerCorrect;
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
        // Deduct via API then sync the lesson store's hearts counter
        await deductHeartAction();
        const updatedHearts = useUserStore.getState().user?.hearts ?? 0;
        useLessonStore.setState({ hearts: updatedHearts });
      }
    }
  };

  const handleSkip = async () => {
    // Unlock browser audio context synchronously
    getAudioContext();
    
    selectAnswer("__skipped__");
    await checkAnswer();
    playIncorrectSound();
    await deductHeartAction();
    const updatedHearts = useUserStore.getState().user?.hearts ?? 0;
    useLessonStore.setState({ hearts: updatedHearts });
  };

  // DEBUG: Skip the entire lesson instantly (marks as complete)
  const handleSkipLesson = async () => {
    try {
      const data = await submitLessonComplete(lessonId, exercises.length, exercises.length);
      updateUserStats(data.xp_gained, data.hearts, data.streak_updated, data.gems_balance);
      setEarnedXP(data.xp_gained);
      setStreakVal(data.streak_updated);
      setIsStreakExtended(data.is_streak_extended);
      useLessonStore.setState({ completed: true });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      alert("Failed to skip lesson.");
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const correctCount = exercises.length - mistakesCount;
      const data = await submitLessonComplete(lessonId, correctCount, exercises.length);
      
      updateUserStats(data.xp_gained, data.hearts, data.streak_updated, data.gems_balance);
      setEarnedXP(data.xp_gained);
      setStreakVal(data.streak_updated);
      setIsStreakExtended(data.is_streak_extended);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err) {
      alert("Failed to submit lesson completion.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefill = async () => {
    const success = await refillHeartsAction();
    if (success) {
      setShowRefillModal(false);
      useLessonStore.setState({ hearts: 5 });
    } else {
      alert("Unable to refill hearts. Do you have 350 gems?");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111827] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-t-macaw border-slate-200 dark:border-slate-800 animate-spin" />
        <span className="font-bold text-slate-400">Starting lesson...</span>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-855 dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-150">
        {earnedXP === null ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-t-macaw border-slate-200 dark:border-slate-800 animate-spin" />
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="px-8 py-3.5 btn-3d-macaw text-lg animate-pulse"
            >
              {submitting ? "Saving results..." : "Claim Rewards"}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
            <div className="w-32 h-32 mb-6">
              <DuoMascot mood="happy" className="w-32 h-32" />
            </div>

            <h1 className="text-macaw font-extrabold text-3xl sm:text-4xl tracking-wide">
              Great Job!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mt-2">
              You have completed this lesson.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mt-8 mb-12">
              <div className="p-5 border-2 border-b-6 border-hare-light dark:border-slate-800 rounded-2xl flex flex-col items-center bg-hare-ultralight dark:bg-[#131f24]/30">
                <span className="text-xs font-extrabold text-slate-400 tracking-wider">Total XP</span>
                <span className="text-bee font-extrabold text-2xl mt-1">+{earnedXP} XP</span>
              </div>
              <div className="p-5 border-2 border-b-6 border-hare-light dark:border-slate-800 rounded-2xl flex flex-col items-center bg-hare-ultralight dark:bg-[#131f24]/30">
                <span className="text-xs font-extrabold text-slate-400 tracking-wider">Daily Streak</span>
                <span className="text-fox font-extrabold text-2xl mt-1 flex items-center gap-1">
                  🔥 {streakVal}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                resetLesson();
                router.push(`/learn?refresh=${Date.now()}`);
              }}
              className="w-full py-4 btn-3d-macaw text-lg"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progressPercent = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-855 dark:text-white flex flex-col justify-between select-none transition-colors duration-150">
      
      {/* 1. Progress Header */}
      <header className="h-16 w-full max-w-[900px] mx-auto px-6 flex items-center gap-6 justify-between border-b-2 border-hare-light dark:border-slate-800 bg-white dark:bg-[#111827] transition-colors duration-150">
        {/* Close Button */}
        <button
          onClick={() => setShowExitModal(true)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <X size={24} />
        </button>

        {/* Progress Bar Container */}
        <div className="flex-1 bg-hare-light dark:bg-slate-800 h-4 rounded-full overflow-hidden">
          <div
            className="bg-macaw h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts + Skip Lesson */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cardinal font-extrabold text-lg">
            <Heart size={22} className="fill-cardinal text-cardinal" />
            <span>{hearts}</span>
          </div>
          {/* Skip Lesson button — for testing progression flow */}
          <button
            onClick={handleSkipLesson}
            title="Skip this lesson (test)"
            className="text-[11px] font-extrabold px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition active:scale-95"
          >
            SKIP LESSON ⚡
          </button>
        </div>
      </header>

      {/* 2. Main Question Section */}
      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 py-8 flex flex-col items-center justify-center gap-8">
        {currentExercise && (
          <>
            {/* Mascot dialog box */}
            <div className="flex items-start gap-4 w-full justify-center">
              {/* Owl SVG Character */}
              <div className="w-20 h-20 flex items-center justify-center">
                <DuoMascot
                  mood={isAnswerChecked ? (isAnswerCorrect ? "happy" : "sad") : "neutral"}
                  className="w-20 h-20"
                />
              </div>
              {/* Talk bubble */}
              <div className="relative bg-white dark:bg-slate-900 border-2 border-hare-light dark:border-slate-800 rounded-2xl p-4 max-w-md font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors duration-150">
                <span className="text-sm block text-slate-400 font-extrabold uppercase mb-1">
                  Translate this sentence
                </span>
                <span className="text-lg">{currentExercise.prompt}</span>
                {/* bubble triangle */}
                <div className="absolute left-[-10px] top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-hare-light dark:border-r-slate-800" />
                <div className="absolute left-[-8px] top-[25px] w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-white dark:border-r-slate-900" />
              </div>
            </div>

            {/* Render appropriate exercise sub-module */}
            {currentExercise.type === "MULTIPLE_CHOICE" && (
              <MultipleChoice
                options={currentExercise.data}
                selected={selectedAnswer}
                onSelect={(ans) => selectAnswer(ans)}
                disabled={isAnswerChecked}
                isAnswerChecked={isAnswerChecked}
                correctAnswer={currentExercise.correct_answer}
              />
            )}

            {currentExercise.type === "WORD_BANK" && (
              <WordBank
                words={currentExercise.data}
                selected={Array.isArray(selectedAnswer) ? selectedAnswer : []}
                onChange={(ans) => selectAnswer(ans)}
                disabled={isAnswerChecked}
              />
            )}

            {currentExercise.type === "FILL_BLANK" && (
              <FillBlank
                options={currentExercise.data}
                selected={selectedAnswer}
                onSelect={(ans) => selectAnswer(ans)}
                disabled={isAnswerChecked}
                isAnswerChecked={isAnswerChecked}
                correctAnswer={currentExercise.correct_answer}
              />
            )}

            {currentExercise.type === "MATCH_PAIRS" && (
              <MatchPairs
                data={currentExercise.data}
                correctMap={currentExercise.data?.correctMap || {}}
                selectedLeft={null}
                selectedRight={null}
                onMatchComplete={(correct) => {
                  // Unlock browser audio context synchronously
                  getAudioContext();
                  
                  selectAnswer(correct);
                  checkAnswer();
                  if (correct) {
                    playCorrectSound();
                  } else {
                    playIncorrectSound();
                    deductHeartAction();
                  }
                }}
                disabled={isAnswerChecked}
              />
            )}

            {currentExercise.type === "TYPE_ANSWER" && (
              <TypeAnswer
                value={typeof selectedAnswer === "string" ? selectedAnswer : ""}
                onChange={(ans) => selectAnswer(ans)}
                disabled={isAnswerChecked}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Sticky Footer Banner */}
      <footer
        className={`w-full py-6 px-6 border-t-2 z-10 transition-all duration-150 ${
          isAnswerChecked
            ? isAnswerCorrect
              ? "bg-green-100 dark:bg-green-950/20 border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400"
            : "bg-white dark:bg-[#111827] border-hare-light dark:border-slate-800"
        }`}
      >
        <div className="max-w-[800px] mx-auto flex items-center justify-between gap-6">
          {/* Banner message logic */}
          <div className="flex-1 flex items-center gap-4">
            {isAnswerChecked && (
              <>
                {isAnswerCorrect ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <CheckCircle2 size={30} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xl">Excellent!</h4>
                      <div className="text-sm font-semibold mt-1">
                        {currentExercise?.type === "MATCH_PAIRS" && currentExercise?.correct_answer && typeof currentExercise.correct_answer === "object" && !Array.isArray(currentExercise.correct_answer) ? (
                          <div className="flex flex-col gap-0.5">
                            {Object.entries(currentExercise.correct_answer as Record<string, string>).map(([k, v]) => (
                              <span key={k} className="font-bold">{k} → {v}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold">
                            {(() => {
                              const ansStr = typeof currentExercise?.correct_answer === "string"
                                ? currentExercise.correct_answer
                                : Array.isArray(currentExercise?.correct_answer)
                                ? currentExercise.correct_answer.join(" ")
                                : String(currentExercise?.correct_answer ?? "");
                              if (currentExercise?.prompt?.includes("___") && ansStr) {
                                return currentExercise.prompt
                                  .replace("___", ansStr)
                                  .replace("Complete the sentence: ", "")
                                  .replace(/'/g, "").replace(/"/g, "");
                              }
                              return ansStr;
                            })()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-green-600/70 dark:text-green-400/50 mt-1 cursor-pointer hover:underline text-xs font-bold uppercase">
                        <Flag size={12} />
                        <span>Report</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white">
                      <XCircle size={30} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xl text-red-600 dark:text-red-500">Correct solution:</h4>
                      {/* Correct answer — formatted by exercise type */}
                      <div className="text-sm font-semibold mt-1 text-red-700 dark:text-red-400">
                        {currentExercise?.type === "MATCH_PAIRS" && currentExercise?.correct_answer && typeof currentExercise.correct_answer === "object" && !Array.isArray(currentExercise.correct_answer) ? (
                          <div className="flex flex-col gap-0.5">
                            {Object.entries(currentExercise.correct_answer as Record<string, string>).map(([k, v]) => (
                              <span key={k} className="font-bold">{k} → {v}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold">
                            {(() => {
                              const ansStr = typeof currentExercise?.correct_answer === "string"
                                ? currentExercise.correct_answer
                                : Array.isArray(currentExercise?.correct_answer)
                                ? currentExercise.correct_answer.join(" ")
                                : String(currentExercise?.correct_answer ?? "");
                              if (currentExercise?.prompt?.includes("___") && ansStr) {
                                return currentExercise.prompt
                                  .replace("___", ansStr)
                                  .replace("Complete the sentence: ", "")
                                  .replace(/'/g, "").replace(/"/g, "");
                              }
                              return ansStr;
                            })()}
                          </span>
                        )}
                      </div>
                      {/* User's wrong answer — only show for non-match-pairs */}
                      {selectedAnswer && selectedAnswer !== "__skipped__" && currentExercise?.type !== "MATCH_PAIRS" && (
                        <p className="text-xs font-bold text-red-500/80 dark:text-red-400/60 mt-1">
                          Your answer: <span className="line-through font-bold">
                            {(() => {
                              const ansStr = Array.isArray(selectedAnswer) ? selectedAnswer.join(" ") : String(selectedAnswer);
                              if (currentExercise?.prompt?.includes("___") && ansStr) {
                                return currentExercise.prompt
                                  .replace("___", ansStr)
                                  .replace("Complete the sentence: ", "")
                                  .replace(/'/g, "").replace(/"/g, "");
                              }
                              return ansStr;
                            })()}
                          </span>
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-red-600/70 dark:text-red-450/50 mt-1 cursor-pointer hover:underline text-xs font-bold uppercase">
                        <Flag size={12} />
                        <span>Report</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            {!isAnswerChecked && (
              <button
                onClick={handleSkip}
                className="px-6 py-3.5 btn-3d-white text-slate-500 font-bold"
              >
                SKIP
              </button>
            )}

            <button
              onClick={handleCheck}
              disabled={selectedAnswer === null}
              className={`px-8 py-3.5 text-lg min-w-44 ${
                selectedAnswer === null
                  ? "bg-hare-light dark:bg-slate-800 border-hare-dark dark:border-slate-900 text-slate-400 border-b-4 cursor-not-allowed"
                  : isAnswerChecked
                  ? isAnswerCorrect
                    ? "btn-3d-macaw bg-green-500 border-green-600 hover:bg-green-400"
                    : "btn-3d-cardinal"
                  : "btn-3d-macaw"
              }`}
            >
              {isAnswerChecked ? "CONTINUE" : "CHECK"}
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Exit Dialog Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center border-b-8 border-hare-light dark:border-slate-950">
            <span className="text-5xl">🥺</span>
            <h3 className="font-extrabold text-xl text-slate-700 dark:text-slate-200 mt-4">Are you sure you want to quit?</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mt-2 leading-relaxed">
              You will lose all progress in this active lesson.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => {
                  resetLesson();
                  router.push(`/learn?refresh=${Date.now()}`);
                }}
                className="py-3.5 btn-3d-cardinal"
              >
                EXIT
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="py-3.5 btn-3d-white"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Heart Refill Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center border-b-8 border-hare-light dark:border-slate-950 animate-shake">
            <div className="text-cardinal mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center mb-4">
              <ShieldAlert size={36} />
            </div>
            <h3 className="font-extrabold text-xl text-slate-700 dark:text-slate-200">No Hearts Left!</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mt-2 leading-relaxed">
              Refill your hearts using gems to continue practicing, or return home.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={handleRefill}
                className="py-3.5 btn-3d-macaw flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Refill Hearts (350 Gems)
              </button>
              <button
                onClick={() => {
                  resetLesson();
                  router.push(`/learn?refresh=${Date.now()}`);
                }}
                className="py-3.5 btn-3d-white"
              >
                QUIT LESSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
