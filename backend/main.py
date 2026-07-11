import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List

from backend.database import SessionLocal, get_db, engine, Base
from backend.models import User, Course, Unit, Skill, Lesson, Exercise, UserProgress
from backend.schemas import (
    UserResponse, CoursePathResponse, UnitProgressResponse, SkillProgressResponse,
    LessonProgressDetail, ExerciseResponse, LessonCompleteRequest, LessonCompleteResponse,
    LeaderboardUser, CheckAnswerRequest, CheckAnswerResponse
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Auto-seed if database is empty (important for Render/production deployment)
db_init = SessionLocal()
run_seeding = False
try:
    from backend.models import Course
    if db_init.query(Course).count() == 0:
        run_seeding = True
except Exception as e:
    print(f"Auto-seed check failed/skipped: {e}")
finally:
    db_init.close()

if run_seeding:
    print("Database is empty. Running auto-seeding...")
    from backend.seed import seed_db
    seed_db()

app = FastAPI(title="Duolingo Clone API", description="FastAPI Backend for Duolingo Web App Clone")

# Configure CORS so frontend React app can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to allow specific client domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- HELPER FUNCTIONS (ALGORITHMS) -----------------

REGEN_INTERVAL_MINUTES = 30  # 1 heart regenerates every 30 minutes

def lazy_regenerate_hearts(user: User, db: Session):
    """
    Lazy Heart Regeneration Algorithm:
    Calculates and updates missing hearts dynamically when user info is queried.
    Ensures state updates run on database read rather than requiring CRON workers.
    """
    if user.hearts >= user.max_hearts:
        # Hearts are already full
        if user.last_heart_lost_at is not None:
            user.last_heart_lost_at = None
            db.commit()
        return

    if user.last_heart_lost_at is None:
        # Safety fallback
        user.last_heart_lost_at = datetime.utcnow()
        db.commit()
        return

    now = datetime.utcnow()
    time_diff = now - user.last_heart_lost_at
    hearts_to_add = int(time_diff.total_seconds() // (REGEN_INTERVAL_MINUTES * 60))

    if hearts_to_add > 0:
        new_hearts = min(user.max_hearts, user.hearts + hearts_to_add)
        user.hearts = new_hearts
        
        if new_hearts == user.max_hearts:
            user.last_heart_lost_at = None
        else:
            # Carry over leftover partial time progress toward the next heart
            user.last_heart_lost_at = user.last_heart_lost_at + timedelta(minutes=hearts_to_add * REGEN_INTERVAL_MINUTES)
        
        db.commit()
        db.refresh(user)

def calculate_streak(user: User, db: Session) -> tuple[int, bool]:
    """
    Streak Calculation Algorithm:
    Dynamically computes and updates streak counter on lesson completion.
    """
    # Get today and yesterday dates in local/standard YYYY-MM-DD
    now_utc = datetime.utcnow()
    today_str = now_utc.strftime("%Y-%m-%d")
    yesterday_str = (now_utc - timedelta(days=1)).strftime("%Y-%m-%d")

    is_extended = False
    
    if user.last_active_date == today_str:
        # Lesson already completed today, streak is safe and active, but not double-incremented
        pass
    elif user.last_active_date == yesterday_str:
        # Streak maintained, incrementing by 1 day
        user.streak += 1
        user.last_active_date = today_str
        is_extended = True
    else:
        # Missed a day or first time, streak starts/resets to 1
        user.streak = 1
        user.last_active_date = today_str
        is_extended = True

    db.commit()
    db.refresh(user)
    return user.streak, is_extended

# ----------------- API ENDPOINTS -----------------

@app.get("/api/users/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    """
    Fetch current logged-in user profile details (hardcoded to user 1 for simplicity).
    Triggers Lazy Heart Regeneration algorithm dynamically.
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    lazy_regenerate_hearts(user, db)
    return user

@app.get("/api/courses/{course_id}/path", response_model=CoursePathResponse)
def get_course_path(course_id: int, db: Session = Depends(get_db)):
    """
    Computes lock/unlock state progression of the linear course path.
    Maps Units -> Skills -> Lessons.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch completed lesson IDs for user 1
    completed_lessons = {
        prog.lesson_id for prog in db.query(UserProgress).filter(UserProgress.user_id == 1).all()
    }

    # Fetch and sort skills to determine active and lock state transitions
    skills_in_order = []
    units_response = []
    
    # Sort units by order
    sorted_units = sorted(course.units, key=lambda u: u.order)
    
    for unit in sorted_units:
        skills_response = []
        # Sort skills within unit
        sorted_skills = sorted(unit.skills, key=lambda s: s.order)
        
        for skill in sorted_skills:
            # Sort lessons in skill
            sorted_lessons = sorted(skill.lessons, key=lambda l: l.order)
            
            lessons_detail = []
            all_completed = True
            for lesson in sorted_lessons:
                is_comp = lesson.id in completed_lessons
                if not is_comp:
                    all_completed = False
                lessons_detail.append(
                    LessonProgressDetail(
                        id=lesson.id,
                        order=lesson.order,
                        xp_reward=lesson.xp_reward,
                        completed=is_comp
                    )
                )
            
            skill_status = "locked"  # Placeholder, determined below
            skills_in_order.append({
                "id": skill.id,
                "unit_id": unit.id,
                "title": skill.title,
                "order": skill.order,
                "icon": skill.icon,
                "lessons": lessons_detail,
                "all_completed": all_completed
            })

    # Set skill lock status:
    # 1. Any skill where all_completed = True is "completed".
    # 2. The first skill where all_completed = False is "active".
    # 3. All skills after the active skill are "locked".
    active_found = False
    for skill_dict in skills_in_order:
        if skill_dict["all_completed"]:
            skill_dict["status"] = "completed"
        elif not active_found:
            skill_dict["status"] = "active"
            active_found = True
        else:
            skill_dict["status"] = "locked"
    
    # If all skills are completed, make the last skill "completed" (handled)

    # Reconstruct nested response matching UnitProgressResponse
    unit_map = {u.id: [] for u in sorted_units}
    for sk in skills_in_order:
        unit_map[sk["unit_id"]].append(
            SkillProgressResponse(
                id=sk["id"],
                unit_id=sk["unit_id"],
                title=sk["title"],
                order=sk["order"],
                icon=sk["icon"],
                status=sk["status"],
                lessons=sk["lessons"]
            )
        )

    for unit in sorted_units:
        units_response.append(
            UnitProgressResponse(
                id=unit.id,
                course_id=unit.course_id,
                title=unit.title,
                order=unit.order,
                color=unit.color,
                skills=unit_map[unit.id]
            )
        )

    return CoursePathResponse(
        id=course.id,
        title=course.title,
        slug=course.slug,
        units=units_response
    )

@app.get("/api/lessons/{lesson_id}", response_model=List[ExerciseResponse])
def get_lesson_exercises(lesson_id: int, db: Session = Depends(get_db)):
    """
    Returns the list of exercises inside a lesson.
    Converts database JSON strings into serialized objects dynamically.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises_response = []
    # Sort exercises by order
    sorted_exercises = sorted(lesson.exercises, key=lambda e: e.order)
    
    for ex in sorted_exercises:
        try:
            parsed_data = json.loads(ex.data)
        except Exception:
            parsed_data = ex.data

        # For MATCH_PAIRS: embed correctMap inside data so the frontend can
        # validate pair taps locally in real-time (no API call per tap needed)
        if ex.type == "MATCH_PAIRS":
            try:
                correct_map = json.loads(ex.correct_answer)
                if isinstance(parsed_data, dict):
                    parsed_data["correctMap"] = correct_map
            except Exception:
                pass

        exercises_response.append(
            ExerciseResponse(
                id=ex.id,
                lesson_id=ex.lesson_id,
                order=ex.order,
                type=ex.type,
                prompt=ex.prompt,
                data=parsed_data
            )
        )
    return exercises_response

@app.post("/api/exercises/{exercise_id}/check", response_model=CheckAnswerResponse)
def check_exercise_answer(exercise_id: int, req: CheckAnswerRequest, db: Session = Depends(get_db)):
    """
    Checks exercise answer securely on the backend.
    """
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    try:
        correct = json.loads(exercise.correct_answer)
    except Exception:
        correct = exercise.correct_answer
    
    is_correct = False
    
    # Evaluate correctness
    if exercise.type in ["MULTIPLE_CHOICE", "FILL_BLANK", "TYPE_ANSWER"]:
        clean_selected = str(req.answer).strip().lower()
        clean_correct = str(correct).strip().lower()
        is_correct = clean_selected == clean_correct
    elif exercise.type == "WORD_BANK":
        sel_arr = req.answer if isinstance(req.answer, list) else []
        corr_arr = correct if isinstance(correct, list) else []
        is_correct = (
            len(sel_arr) == len(corr_arr) and 
            all(str(v).strip().lower() == str(corr_arr[idx]).strip().lower() for idx, v in enumerate(sel_arr))
        )
    elif exercise.type == "MATCH_PAIRS":
        is_correct = req.answer is True
        
    return CheckAnswerResponse(correct=is_correct, correct_answer=correct)

@app.post("/api/lessons/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson(lesson_id: int, payload: LessonCompleteRequest, db: Session = Depends(get_db)):
    """
    Saves lesson progress, calculates and adds XP rewards (with perfect lesson bonus),
    and updates streak counters.
    """
    user = db.query(User).filter(User.id == 1).first()
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not user or not lesson:
        raise HTTPException(status_code=404, detail="User or Lesson not found")

    # Double check hearts
    lazy_regenerate_hearts(user, db)
    if user.hearts <= 0:
        raise HTTPException(status_code=400, detail="Cannot complete lesson: 0 hearts remaining. Refill first.")

    # Calculate XP: reward from lesson, +5 XP perfect bonus if correct_count == total_count
    xp_gained = lesson.xp_reward
    is_perfect = payload.correct_count == payload.total_count
    if is_perfect:
        xp_gained += 5

    user.xp += xp_gained
    user.gems += 5  # Base lesson completion reward

    # Record UserProgress entry
    progress = UserProgress(
        user_id=user.id,
        lesson_id=lesson_id,
        is_perfect=is_perfect,
        completed_at=datetime.utcnow()
    )
    db.add(progress)

    # Calculate streak additions
    streak_val, is_extended = calculate_streak(user, db)

    db.commit()
    db.refresh(user)

    return LessonCompleteResponse(
        xp_gained=xp_gained,
        streak_updated=streak_val,
        is_streak_extended=is_extended,
        hearts=user.hearts,
        gems_balance=user.gems
    )

@app.post("/api/users/gems/add", response_model=UserResponse)
def add_user_gems(payload: dict, db: Session = Depends(get_db)):
    """
    Awards gems (e.g. from chests) to the user's persistent balance.
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    amount = payload.get("amount", 50)
    user.gems += amount
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/users/hearts/deduct")
def deduct_heart(db: Session = Depends(get_db)):
    """
    Deducts one heart for answering incorrectly.
    If hearts were previously full, sets last_heart_lost_at timestamp for regeneration.
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    lazy_regenerate_hearts(user, db)

    if user.hearts <= 0:
        return {"hearts": 0}

    # Record start of heart regeneration if we lost a heart from max capacity
    if user.hearts == user.max_hearts:
        user.last_heart_lost_at = datetime.utcnow()

    user.hearts -= 1
    db.commit()
    db.refresh(user)
    return {"hearts": user.hearts}

@app.post("/api/users/hearts/refill")
def refill_hearts(db: Session = Depends(get_db)):
    """
    Deducts 350 gems and restores user's hearts to maximum (5).
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    lazy_regenerate_hearts(user, db)

    if user.hearts == user.max_hearts:
        raise HTTPException(status_code=400, detail="Hearts are already full")

    if user.gems < 350:
        raise HTTPException(status_code=400, detail="Insufficient gems. Restoring hearts requires 350 gems.")

    user.gems -= 350
    user.hearts = user.max_hearts
    user.last_heart_lost_at = None
    
    db.commit()
    db.refresh(user)
    return {"hearts": user.hearts, "gems": user.gems}

@app.get("/api/leaderboard", response_model=List[LeaderboardUser])
def get_leaderboard(db: Session = Depends(get_db)):
    """
    Returns top 10 users ranked by total XP.
    Flags current logged-in user dynamically.
    """
    users = db.query(User).order_by(User.xp.desc()).limit(10).all()
    leaderboard = []
    
    for u in users:
        leaderboard.append(
            LeaderboardUser(
                name=u.name,
                xp=u.xp,
                streak=u.streak,
                is_current_user=(u.id == 1)
            )
        )
    return leaderboard

@app.post("/api/users/progress/reset", response_model=UserResponse)
def reset_user_progress(db: Session = Depends(get_db)):
    """
    Resets the user's progress log, XP, streak, gems and hearts to starting values.
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Delete all progress entries for user 1
    db.query(UserProgress).filter(UserProgress.user_id == 1).delete()
    
    # Reset stats
    user.xp = 0
    user.streak = 0
    user.hearts = 5
    user.gems = 500
    user.last_active_date = (datetime.utcnow() - timedelta(days=10)).strftime("%Y-%m-%d")
    user.last_heart_lost_at = None
    
    db.commit()
    db.refresh(user)
    return user

