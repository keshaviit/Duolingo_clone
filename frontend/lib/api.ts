import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  last_active_date: string | null;
  last_heart_lost_at: string | null;
}

export interface LessonProgress {
  id: number;
  order: number;
  xp_reward: number;
  completed: boolean;
}

export interface SkillProgress {
  id: number;
  unit_id: number;
  title: string;
  order: number;
  icon: string;
  status: "completed" | "active" | "locked";
  lessons: LessonProgress[];
}

export interface UnitProgress {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order: number;
  color: string;
  skills: SkillProgress[];
}

export interface CoursePath {
  id: number;
  title: string;
  slug: string;
  units: UnitProgress[];
}

export interface Exercise {
  id: number;
  lesson_id: number;
  order: number;
  type: "MULTIPLE_CHOICE" | "WORD_BANK" | "FILL_BLANK" | "MATCH_PAIRS" | "TYPE_ANSWER";
  prompt: string;
  data: any; // Options list, matching pairs dictionary, etc.
}

export interface LessonCompleteResponse {
  xp_gained: number;
  streak_updated: number;
  is_streak_extended: boolean;
  hearts: number;
  gems_balance: number;
}

export interface LeaderboardUser {
  name: string;
  xp: number;
  streak: number;
  is_current_user: boolean;
}

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/me");
  return response.data;
};

export const fetchCoursePath = async (courseId: number = 1): Promise<CoursePath> => {
  const response = await api.get<CoursePath>(`/courses/${courseId}/path`);
  return response.data;
};

export const fetchLessonExercises = async (lessonId: number): Promise<Exercise[]> => {
  const response = await api.get<Exercise[]>(`/lessons/${lessonId}`);
  return response.data;
};

export const submitLessonComplete = async (
  lessonId: number,
  correctCount: number,
  totalCount: number
): Promise<LessonCompleteResponse> => {
  const response = await api.post<LessonCompleteResponse>(`/lessons/${lessonId}/complete`, {
    correct_count: correctCount,
    total_count: totalCount,
  });
  return response.data;
};

export const addUserGems = async (amount: number): Promise<UserProfile> => {
  const response = await api.post<UserProfile>("/users/gems/add", { amount });
  return response.data;
};

export const deductHeart = async (): Promise<{ hearts: number }> => {
  const response = await api.post<{ hearts: number }>("/users/hearts/deduct");
  return response.data;
};

export const refillHearts = async (): Promise<{ hearts: number; gems: number }> => {
  const response = await api.post<{ hearts: number; gems: number }>("/users/hearts/refill");
  return response.data;
};

export const resetProgress = async (): Promise<UserProfile> => {
  const response = await api.post<UserProfile>("/users/progress/reset");
  return response.data;
};

export const fetchLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const response = await api.get<LeaderboardUser[]>("/leaderboard");
  return response.data;
};

export const checkExerciseAnswer = async (
  exerciseId: number,
  answer: any
): Promise<{ correct: boolean; correct_answer: any }> => {
  const response = await api.post<{ correct: boolean; correct_answer: any }>(
    `/exercises/${exerciseId}/check`,
    { answer }
  );
  return response.data;
};
