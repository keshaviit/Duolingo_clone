# Subagent 3: Lesson Architect [Status: COMPLETED ✅]

## Role
This agent is responsible for the full-screen interactive lesson player, checking correctness, presenting dynamic exercise forms, deducting hearts, and handling lesson completion celebrations.

## Scope of Work & Deliverables
1. **Zustand Ephemeral Store**:
   * Create `useLessonStore` in `lib/store.ts` to manage the currently active lesson state: list of exercises, index of active exercise, selected options, correctness status, local mistakes, and progress calculations.
2. **Fullscreen Lesson Player Frame**:
   * Create `app/lesson/[id]/page.tsx` displaying a fullscreen player:
     * Header containing: close button (warns user before exiting), progress bar (filling smoothly), and remaining hearts counter.
     * Mascot Area: Duo the Owl illustration speaking instructions.
     * Exercise View Container: Dynamically mounts the appropriate exercise form.
     * Footer Banner: Sticky footer showing a "Check" button when unanswered, turning green (success) or red (failure) when answered.
3. **Interactive Exercise Forms**:
   * `MultipleChoice`: Grid cards that are clicked/highlighted.
   * `WordBank`: Tapping buttons to move text words in/out of the answer slots.
   * `FillBlank`: Text blanks or inline dropdown selector.
   * `MatchPairs`: Grid matching board where cards highlight green (match) or red (mismatch).
   * `TypeAnswer`: Input textbox where users write the answer manually.
4. **Incorrect/Out of Hearts state**:
   * If a question is incorrect, calls `POST /api/users/hearts/deduct` to sync state and reduces hearts locally.
   * If hearts reach 0, pauses play and pops a modal: "No Hearts Left", offering a return to home or Shop refill.
5. **Completion Celebration**:
   * Completing the final exercise calls `POST /api/lessons/{id}/complete` to submit results, updates user global stats, triggers full-screen confetti (`canvas-confetti`), and reveals a summary screen detailing total XP earned, time spent, and streak extensions before returning to the map.
