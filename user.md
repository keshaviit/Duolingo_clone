# Duolingo Clone - Hindi to English (User Flow & Documentation)

Welcome to the Duolingo Clone! This project is an interactive web-based language learning platform designed to teach English to native Hindi speakers. It replicates the structure, gamified workflow, and aesthetics of the official Duolingo app.

---

## 1. Project Architecture & Setup

The codebase is split into a **Python FastAPI backend** and a **Next.js frontend**:

*   **Backend (`/backend`)**: FastAPI, SQLAlchemy (SQLite ORM), Pydantic. Serves as the state machine for user data, streak calculations, hearts regeneration, and lesson progress verification.
*   **Frontend (`/frontend`)**: Next.js (App Router, TypeScript), Tailwind CSS, Zustand. Manages UI layouts, circular maps, visual locking/unlocking states, and the interactive fullscreen lesson player.

### How to Run Locally

#### Prerequisites
*   Node.js (v20+)
*   Python (3.10+)

#### Step 1: Start the Backend API
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   # (Includes fastapi, uvicorn, sqlalchemy)
   ```
3. Run the database seed script to initialize the SQLite database (`duolingo.db`) with Hindi-to-English lessons and users:
   ```bash
   PYTHONPATH=. python3 seed.py
   ```
4. Start the server on port 8000:
   ```bash
   PYTHONPATH=. python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

#### Step 2: Start the Next.js Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Interactive Flow & Navigation

When a learner opens the app, they navigate through a gamified sequence of screens:

```
[Sidebar Layout / Navigation]
      │
      ├──► 🗺️ Learn (Home Path Map)
      │      ├── Click Active Node ──► Tooltip Card ──► [Launch Lesson] ──► 🎮 Lesson Player
      │
      ├──► 🏆 Leaderboard (Seeded Rankings list)
      │
      └──► 👤 Profile & Achievements (Stats & Heart Refills)
```

1.  **Sidebar Dashboard**: The left panel contains route navigation (Learn, Leaderboard, Profile). The top bar displays streak flame count, total XP, current hearts, and gems.
2.  **Circular Winding Map (`/learn`)**:
    *   **Unit 1: Introduce Yourself** banner stands at the top in green.
    *   A sequence of circular skill nodes alternates left and right, mimicking a path.
    *   Locked nodes are gray with padlocks. Clicking them does nothing.
    *   Completed nodes turn Gold with a crown.
    *   The Active node pulses. Clicking it reveals a card showing lessons count, reward (+10 XP), and a prominent **"Start Lesson"** button.
3.  **The Lesson Player (`/lesson/[id]`)**:
    *   Fills the screen. Shows a top progress bar tracking completed questions and remaining hearts.
    *   A cartoon Duo the Owl mascot prompts the learner in Hindi.
    *   Interactive exercise modules load depending on type (multiple-choice cards, draggable word bank cards, fill-in-the-blank, match pairs grid, or typed textbox input).
    *   **Feedback Footer**: Learner taps **"Check"**. A banner slides up from the bottom:
        *   *Correct (Green)*: owl cheers, "+10 XP" pop-up.
        *   *Incorrect (Red)*: screen shakes, deducts 1 heart, reveals correct English answer.
    *   **Out of Hearts**: If hearts reach 0, player ends with a failure popup offering to return home or buy refills in the Shop.
    *   **Perfect Lesson**: Completing with full hearts grants a +5 XP perfect bonus, triggers full-page confetti, and updates stats.

---

## 3. Core Algorithms

*   **Lazy Heart Regeneration**: Calculated at read time. If hearts are below 5, the server checks the last time a heart was lost and dynamically adds 1 heart per 30 minutes, writing the corrected value silently before returning user payloads.
*   **Streaks Calculations**: Evaluated on lesson completion. If the user's last active date is yesterday, streak increases. If it's today, it remains safe. If they missed a day, streak resets.

---

## 4. UI Assets & Avatars

*   **Mascot & Avatars**: Styled using custom, responsive inline SVGs representing Duo the Owl in different states (cheering, crying, speaking) and user profile icons. This avoids dead image link problems and guarantees fast, high-quality vector rendering offline.
*   **Exercises**: Clean interactive forms mapped to active Zustand stores (`useLessonStore`) which isolate state transitions locally and reset when exiting.
