# Subagent 1: Connector [Status: COMPLETED ✅]

## Role
This agent is responsible for the baseline environment configuration of the Next.js React application and establishing the API connector layer to bridge the backend FastAPI routes with the frontend layout.

## Scope of Work & Deliverables
1. **Environment Setup**:
   * Create `package.json` with React, Next.js, Tailwind, Lucide Icons, Canvas-Confetti, and Zustand.
   * Create `tsconfig.json` for TypeScript configuration.
   * Create `postcss.config.js` and `tailwind.config.js` with customized themes (Duolingo color system).
2. **API Client Layer**:
   * Create `lib/api.ts` exposing Axios/fetch hooks targeting `http://127.0.0.1:8000`.
   * Define functions:
     * `fetchCurrentUser()` -> `GET /api/users/me`
     * `fetchCoursePath(courseId)` -> `GET /api/courses/{courseId}/path`
     * `fetchLessonExercises(lessonId)` -> `GET /api/lessons/{lessonId}`
     * `submitLessonCompletion(lessonId, payload)` -> `POST /api/lessons/{lessonId}/complete`
     * `deductHeart()` -> `POST /api/users/hearts/deduct`
     * `refillHearts()` -> `POST /api/users/hearts/refill`
     * `fetchLeaderboard()` -> `GET /api/leaderboard`
3. **State Management**:
   * Create `lib/store.ts` implementing `useUserStore` (Zustand) which coordinates global user profile data (XP, gems, hearts, streak) across page navigations.
