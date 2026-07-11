# Duolingo Web App Clone (Hindi to English)

This repository contains a functional clone of the Duolingo web application, built to replicate the original’s playful aesthetic, user experience, linear learning paths, and gamified progress engines (streaks, hearts regeneration, gems, and achievements). It is specifically configured to teach English to native Hindi speakers.

---

## 1. Technical Stack

*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand (state stores), Lucide React (icons), and Canvas-Confetti (animations).
*   **Backend**: Python 3.13 (FastAPI), SQLAlchemy ORM (SQLite).
*   **Database**: SQLite (`duolingo.db`).

---

## 2. Database Schema (SQLite Relational Model)

The database schema is highly normalized, optimizing reads for nested paths while maintaining granular tracking of user progress:

```
┌───────────┐      ┌─────────┐      ┌─────────┐      ┌──────────┐      ┌─────────────┐
│  Course   │───1:N─▶│  Unit   │───1:N─▶│  Skill  │───1:N─▶│  Lesson  │───1:N─▶│  Exercise   │
└───────────┘      └─────────┘      └─────────┘      └──────────┘      └─────────────┘
                                                                              ▲
                                                                              │ 1:N
                                                                       ┌─────────────┐
                                                                       │UserProgress │
                                                                       └─────────────┘
                                                                              ▲
                                                                              │ N:1
                                                                       ┌─────────────┐
                                                                       │    User     │
                                                                       └─────────────┘
```

*   **`users`**: tracks global user progress (`id`, `name`, `email`, `xp`, `streak`, `hearts`, `max_hearts`, `gems`, `last_active_date`, `last_heart_lost_at`).
*   **`courses`**: course metadata (`id`, `title`, `slug`).
*   **`units`**: unit dividers (`id`, `course_id`, `title`, `description`, `order`, `color` for visual styling banners).
*   **`skills`**: circular winding nodes on the map (`id`, `unit_id`, `title`, `order`, `icon`).
*   **`lessons`**: individual lesson stages (`id`, `skill_id`, `order`, `xp_reward`).
*   **`exercises`**: question parameters (`id`, `lesson_id`, `order`, `type`, `prompt`, `data` (JSON string containing option arrays), `correct_answer` (JSON string containing correct answers)).
*   **`user_progress`**: logs completed lessons (`id`, `user_id`, `lesson_id`, `completed_at`, `is_perfect`).

---

## 3. High-Level Architecture Overview

The system follows a decoupled client-server state machine:
*   **State Separation**:
    *   **Zustand User Store (`useUserStore`)**: Stores persistent metrics (streak, hearts, gems) synced from the backend and shared globally.
    *   **Zustand Lesson Store (`useLessonStore`)**: Isolated ephemeral state (active questions, errors, selected values) mounted on a single lesson run and completely cleared on exit.
*   **Logical Operations**:
    *   **Lazy Heart Regeneration**: Instead of running background worker daemons, hearts are calculated on API read calls. The server measures `last_heart_lost_at` relative to `now()`, adds 1 heart per 30 minutes, and writes the corrected value before returning payloads.
    *   **Streak Integrity**: Automatically increments the streak if the last lesson date was yesterday, maintains it if today, and resets to 1 if the user missed a day.

---

## 4. How to Run Locally

### Step 1: Initialize the Backend FastAPI Server
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the database seeder to create tables and load mock Hindi-to-English lessons/users:
    ```bash
    PYTHONPATH=. python3 seed.py
    ```
4.  Start the FastAPI application on local port 8000:
    ```bash
    PYTHONPATH=. python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
    ```

### Step 2: Start the Next.js Frontend App
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Run the Next.js development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 5. Engineering Assumptions

*   **Authentication**: Simplified for testing. All requests default to `User ID = 1` (Keshav Goyal).
*   **Regeneration scale**: Configured at 30 minutes per heart for rapid testing (Duolingo default is 4 hours, which can be changed by editing `REGEN_INTERVAL_MINUTES` in `main.py`).
*   **Mascot & Vector Assets**: Rendered completely offline using inline SVG components inside the React code, guaranteeing instant load speeds and zero broken static image links.
