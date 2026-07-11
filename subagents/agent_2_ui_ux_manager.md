# Subagent 2: UI/UX Manager [Status: COMPLETED ✅]

## Role
This agent is responsible for the overall design language, global layout, navigation sidebar, stats dashboards, and the signature circular winding learning path map.

## Scope of Work & Deliverables
1. **Typography & Styling**:
   * Configure standard rounded font (e.g. Google Font "Nunito") in `app/layout.tsx`.
   * Set up global buttons styles in CSS or custom tailwind utilities mapping the Duolingo 3D click effect.
2. **Navigation Sidebar**:
   * Create `components/Sidebar.tsx` with navigation options ("Learn", "Leaderboard", "Profile", "Shop/Practice") and full mobile support (responsive bottom bar on mobile, left sidebar on desktop).
3. **Dashboard TopBar**:
   * Create `components/TopBar.tsx` tracking user stats (Streak flame, XP star, Hearts count, Gems icon) synced with `useUserStore`.
4. **Learning Path Map**:
   * Create `app/learn/page.tsx` rendering Unit Headers (Unit title, description, and custom background color matching database seeds).
   * Render Skills in a circular winding map grid (skills offset left/right in a sinusoidal wave).
   * Render state-appropriate elements for circular nodes (gold for completed, colored pulsing border for active, gray with padlock for locked).
   * Include popup tooltips on active skill nodes showcasing lessons count, reward, and a "Start Lesson" launch button.
