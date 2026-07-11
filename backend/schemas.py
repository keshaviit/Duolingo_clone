from pydantic import BaseModel, Field
from typing import List, Optional, Any, Union
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserResponse(UserBase):
    id: int
    xp: int
    streak: int
    hearts: int
    max_hearts: int
    gems: int
    last_active_date: Optional[str] = None
    last_heart_lost_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExerciseResponse(BaseModel):
    id: int
    lesson_id: int
    order: int
    type: str
    prompt: str
    data: Any  # Parsed JSON (list, dict, etc.)

    class Config:
        from_attributes = True

class CheckAnswerRequest(BaseModel):
    answer: Any

class CheckAnswerResponse(BaseModel):
    correct: bool
    correct_answer: Any

class LessonBaseResponse(BaseModel):
    id: int
    skill_id: int
    order: int
    xp_reward: int

    class Config:
        from_attributes = True

class LessonProgressDetail(BaseModel):
    id: int
    order: int
    xp_reward: int
    completed: bool

class SkillProgressResponse(BaseModel):
    id: int
    unit_id: int
    title: str
    order: int
    icon: str
    status: str  # "completed", "active", "locked"
    lessons: List[LessonProgressDetail]

    class Config:
        from_attributes = True

class UnitProgressResponse(BaseModel):
    id: int
    course_id: int
    title: str
    order: int
    color: str
    skills: List[SkillProgressResponse]

    class Config:
        from_attributes = True

class CoursePathResponse(BaseModel):
    id: int
    title: str
    slug: str
    units: List[UnitProgressResponse]

    class Config:
        from_attributes = True

class LessonCompleteRequest(BaseModel):
    correct_count: int
    total_count: int

class LessonCompleteResponse(BaseModel):
    xp_gained: int
    streak_updated: int
    is_streak_extended: bool
    hearts: int
    gems_balance: int

class LeaderboardUser(BaseModel):
    name: str
    xp: int
    streak: int
    is_current_user: bool = False

    class Config:
        from_attributes = True
