import { create } from "zustand";
import {
  UserProfile,
  Exercise,
  fetchCurrentUser,
  deductHeart as apiDeductHeart,
  refillHearts as apiRefillHearts,
  checkExerciseAnswer,
  addUserGems,
  resetProgress,
} from "./api";

// ----------------- GLOBAL USER STORE -----------------

interface UserStore {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDarkMode: boolean;
  fetchUser: () => Promise<void>;
  deductHeartAction: () => Promise<void>;
  refillHeartsAction: () => Promise<boolean>;
  updateUserStats: (xpGained: number, heartsRemaining: number, streak: number, gems?: number) => void;
  addGemsAction: (amount: number) => Promise<void>;
  resetProgressAction: () => Promise<void>;
  toggleTheme: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isDarkMode: true,

  toggleTheme: () => {
    const nextMode = !get().isDarkMode;
    set({ isDarkMode: nextMode });
  },

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await fetchCurrentUser();
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch user profile", loading: false });
    }
  },

  deductHeartAction: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const data = await apiDeductHeart();
      set({
        user: { ...user, hearts: data.hearts },
      });
    } catch (err) {
      // Fallback local change if offline/error
      set({
        user: { ...user, hearts: Math.max(0, user.hearts - 1) },
      });
    }
  },

  refillHeartsAction: async () => {
    const { user } = get();
    if (!user) return false;
    try {
      const data = await apiRefillHearts();
      set({
        user: { ...user, hearts: data.hearts, gems: data.gems },
      });
      return true;
    } catch (err) {
      return false;
    }
  },

  updateUserStats: (xpGained, heartsRemaining, streak, gems) => {
    const { user } = get();
    if (!user) return;
    set({
      user: {
        ...user,
        xp: user.xp + xpGained,
        hearts: heartsRemaining,
        streak,
        gems: gems !== undefined ? gems : user.gems,
      },
    });
  },

  addGemsAction: async (amount: number) => {
    const { user } = get();
    if (!user) return;
    try {
      const updatedUser = await addUserGems(amount);
      set({ user: updatedUser });
    } catch (err) {
      // Fallback
      set({
        user: { ...user, gems: user.gems + amount }
      });
    }
  },

  resetProgressAction: async () => {
    try {
      const updatedUser = await resetProgress();
      set({ user: updatedUser });
      // Clear opened chests from local storage
      localStorage.removeItem("openedChests");
    } catch (err) {
      alert("Failed to reset progress.");
    }
  },
}));

// ----------------- EPHEMERAL LESSON STORE -----------------

interface LessonStore {
  lessonId: number | null;
  exercises: Exercise[];
  currentIndex: number;
  selectedAnswer: any;
  isAnswerChecked: boolean;
  isAnswerCorrect: boolean | null;
  hearts: number;
  mistakesCount: number;
  completed: boolean;

  initLesson: (lessonId: number, exercises: Exercise[], initialHearts: number) => void;
  selectAnswer: (answer: any) => void;
  checkAnswer: () => Promise<void>;
  nextQuestion: () => void;
  resetLesson: () => void;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  lessonId: null,
  exercises: [],
  currentIndex: 0,
  selectedAnswer: null,
  isAnswerChecked: false,
  isAnswerCorrect: null,
  hearts: 5,
  mistakesCount: 0,
  completed: false,

  initLesson: (lessonId, exercises, initialHearts) => {
    set({
      lessonId,
      exercises,
      currentIndex: 0,
      selectedAnswer: null,
      isAnswerChecked: false,
      isAnswerCorrect: null,
      hearts: initialHearts,
      mistakesCount: 0,
      completed: false,
    });
  },

  selectAnswer: (answer) => {
    set({ selectedAnswer: answer });
  },

  checkAnswer: async () => {
    const { exercises, currentIndex, selectedAnswer, hearts } = get();
    const currentExercise = exercises[currentIndex];
    if (!currentExercise || selectedAnswer === null) return;

    try {
      const data = await checkExerciseAnswer(currentExercise.id, selectedAnswer);
      const isCorrect = data.correct;

      // Update the exercises array immutably to notify React of correct_answer change
      const updatedExercises = [...exercises];
      updatedExercises[currentIndex] = {
        ...currentExercise,
        correct_answer: data.correct_answer,
      } as any;

      // NOTE: do NOT deduct hearts here — handleCheck in page.tsx calls deductHeartAction()
      // which hits the API and syncs the real value. Deducting here would double-deduct.
      set({
        exercises: updatedExercises,
        isAnswerChecked: true,
        isAnswerCorrect: isCorrect,
        mistakesCount: isCorrect ? get().mistakesCount : get().mistakesCount + 1,
      });
    } catch (err) {
      console.error("checkAnswer failed:", err);
      // Fallback: mark as incorrect but let the API call in page.tsx handle heart deduction
      set({
        isAnswerChecked: true,
        isAnswerCorrect: false,
        mistakesCount: get().mistakesCount + 1,
      });
    }
  },

  nextQuestion: () => {
    const { currentIndex, exercises, isAnswerCorrect } = get();
    
    let updatedExercises = [...exercises];
    if (isAnswerCorrect === false) {
      const currentExercise = exercises[currentIndex];
      // Clone the exercise and strip the evaluated answer status
      const reQueuedExercise = {
        ...currentExercise,
        correct_answer: undefined,
      };
      updatedExercises.push(reQueuedExercise);
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= updatedExercises.length) {
      set({ 
        exercises: updatedExercises, 
        completed: true 
      });
    } else {
      set({
        exercises: updatedExercises,
        currentIndex: nextIdx,
        selectedAnswer: null,
        isAnswerChecked: false,
        isAnswerCorrect: null,
      });
    }
  },

  resetLesson: () => {
    set({
      lessonId: null,
      exercises: [],
      currentIndex: 0,
      selectedAnswer: null,
      isAnswerChecked: false,
      isAnswerCorrect: null,
      hearts: 5,
      mistakesCount: 0,
      completed: false,
    });
  },
}));
