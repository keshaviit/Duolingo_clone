# Subagent 4: Profile & Stats Manager [Status: COMPLETED ✅]

## Role
This agent is responsible for secondary views, including the comparative leaderboard scoreboard, the profile stats display, achievements cards, and the shop modal which lets users refill hearts with gems.

## Scope of Work & Deliverables
1. **Leaderboard View**:
   * Create `app/leaderboard/page.tsx` pulling rankings via `GET /api/leaderboard`.
   * Render top 10 rows styled with gold/silver/bronze icons for ranks 1-3. Highlight current user row (Keshav Goyal) in a distinct active color.
2. **Profile Stats Page**:
   * Create `app/profile/page.tsx` displaying cards for Streak (flame), XP (lightning), Hearts, and Gems.
   * Renders the list of achievements (e.g. "Wildfire" for streaks, "Sage" for total XP) showing checkmarks or progress bars depending on user progress.
3. **Shop & Heart Refills**:
   * Implement modal or block under `/profile` or `/learn` allowing the user to click "Refill Hearts" (costing 350 gems).
   * Calls `POST /api/users/hearts/refill` backend API, updates `useUserStore` state, and returns error toast if user has insufficient gems.
