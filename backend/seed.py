import json
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database import SessionLocal, engine, Base
from backend.models import User, Course, Unit, Skill, Lesson, Exercise, UserProgress

def seed_db():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Users
        me = User(
            id=1,
            name="Keshav Goyal",
            email="keshav.goyal.ug23@nsut.ac.in",
            xp=0,
            streak=0,
            hearts=5,
            max_hearts=5,
            last_active_date=(datetime.utcnow() - timedelta(days=10)).strftime("%Y-%m-%d"),
            last_heart_lost_at=None
        )
        db.add(me)

        # Leaderboard competitors
        competitors = [
            User(name="Alice", email="alice@test.com", xp=320, streak=12, hearts=5),
            User(name="Bob", email="bob@test.com", xp=280, streak=7, hearts=5),
            User(name="Charlie", email="charlie@test.com", xp=190, streak=3, hearts=3),
            User(name="Duo Owl", email="duo@duolingo.com", xp=500, streak=100, hearts=5),
            User(name="Emily", email="emily@test.com", xp=90, streak=2, hearts=5)
        ]
        db.add_all(competitors)

        # 2. Seed Courses
        spanish = Course(id=1, title="Spanish", slug="spanish")
        db.add(spanish)

        # 3. Seed Units
        unit1 = Unit(
            id=1,
            course_id=1,
            title="Unit 1: Introduce Yourself",
            description="Greet people, say your name, and talk about basics.",
            order=1,
            color="#58cc02"  # Duolingo Green
        )
        unit2 = Unit(
            id=2,
            course_id=1,
            title="Unit 2: Daily Life",
            description="Discuss food, drinks, and regular activities.",
            order=2,
            color="#ff9600"  # Duolingo Orange
        )
        db.add_all([unit1, unit2])

        # 4. Seed Skills (Unit 1)
        skill1 = Skill(
            id=1,
            unit_id=1,
            title="Greetings",
            order=1,
            icon="star"
        )
        skill2 = Skill(
            id=2,
            unit_id=1,
            title="Introductions",
            order=2,
            icon="dialogue"
        )
        # Skills (Unit 2)
        skill3 = Skill(
            id=3,
            unit_id=2,
            title="Food & Drink",
            order=1,
            icon="cup"
        )
        db.add_all([skill1, skill2, skill3])

        # 5. Seed Lessons
        lesson1 = Lesson(id=1, skill_id=1, order=1, xp_reward=10)
        lesson2 = Lesson(id=2, skill_id=1, order=2, xp_reward=10)
        lesson3 = Lesson(id=3, skill_id=2, order=1, xp_reward=15)
        lesson4 = Lesson(id=4, skill_id=3, order=1, xp_reward=15)  # Food & Drink
        db.add_all([lesson1, lesson2, lesson3, lesson4])

        # 6. Seed Exercises (Lesson 1: Greetings)
        e1 = Exercise(
            id=1,
            lesson_id=1,
            order=1,
            type="MULTIPLE_CHOICE",
            prompt="Translate this sentence: 'The cat eats fish.'",
            data=json.dumps(["El gato come pescado", "El perro come manzanas", "La leche es buena"]),
            correct_answer="El gato come pescado"
        )
        e2 = Exercise(
            id=2,
            lesson_id=1,
            order=2,
            type="WORD_BANK",
            prompt="Translate: 'The cat drinks milk.'",
            data=json.dumps(["El", "gato", "bebe", "leche", "perro", "manzana", "agua"]),
            correct_answer=json.dumps(["El", "gato", "bebe", "leche"])
        )
        e3 = Exercise(
            id=3,
            lesson_id=1,
            order=3,
            type="FILL_BLANK",
            prompt="Complete the sentence: 'El gato ___ leche.'",
            data=json.dumps(["bebe", "come", "habla"]),
            correct_answer="bebe"
        )
        e4 = Exercise(
            id=4,
            lesson_id=1,
            order=4,
            type="MATCH_PAIRS",
            prompt="Match the pairs",
            data=json.dumps({
                "left": ["gato", "perro", "leche", "agua", "manzana"],
                "right": ["milk", "dog", "cat", "apple", "water"]
            }),
            correct_answer=json.dumps({
                "gato": "cat",
                "perro": "dog",
                "leche": "milk",
                "agua": "water",
                "manzana": "apple"
            })
        )
        e5 = Exercise(
            id=5,
            lesson_id=1,
            order=5,
            type="TYPE_ANSWER",
            prompt="Translate to Spanish: 'The milk'",
            data=json.dumps([]),
            correct_answer="la leche"
        )
        db.add_all([e1, e2, e3, e4, e5])

        # Seed Exercises (Lesson 2: Greetings - continuation)
        e6 = Exercise(
            id=6,
            lesson_id=2,
            order=1,
            type="MULTIPLE_CHOICE",
            prompt="How do you say 'Hello' in Spanish?",
            data=json.dumps(["Hola", "Adiós", "Gracias"]),
            correct_answer="Hola"
        )
        e7 = Exercise(
            id=7,
            lesson_id=2,
            order=2,
            type="WORD_BANK",
            prompt="Translate: 'Hello, good morning.'",
            data=json.dumps(["Hola", "buenos", "días", "perro", "manzana", "gato"]),
            correct_answer=json.dumps(["Hola", "buenos", "días"])
        )
        e8 = Exercise(
            id=8,
            lesson_id=2,
            order=3,
            type="FILL_BLANK",
            prompt="Complete the sentence: 'Hola, ___ noches.'",
            data=json.dumps(["buenas", "buenos", "gracias"]),
            correct_answer="buenas"
        )
        e9 = Exercise(
            id=9,
            lesson_id=2,
            order=4,
            type="TYPE_ANSWER",
            prompt="Translate to Spanish: 'Thank you'",
            data=json.dumps([]),
            correct_answer="gracias"
        )
        db.add_all([e6, e7, e8, e9])

        # Seed Exercises (Lesson 3: Introductions)
        e10 = Exercise(
            id=10,
            lesson_id=3,
            order=1,
            type="MULTIPLE_CHOICE",
            prompt="How do you say 'Goodbye' in Spanish?",
            data=json.dumps(["Adiós", "Hola", "Por favor"]),
            correct_answer="Adiós"
        )
        e11 = Exercise(
            id=11,
            lesson_id=3,
            order=2,
            type="WORD_BANK",
            prompt="Translate: 'My name is Duo.'",
            data=json.dumps(["Me", "llamo", "Duo", "leche", "agua", "gato"]),
            correct_answer=json.dumps(["Me", "llamo", "Duo"])
        )
        e12 = Exercise(
            id=12,
            lesson_id=3,
            order=3,
            type="FILL_BLANK",
            prompt="Complete the sentence: 'Mucho ___.'",
            data=json.dumps(["gusto", "gracias", "hola"]),
            correct_answer="gusto"
        )
        e13 = Exercise(
            id=13,
            lesson_id=3,
            order=4,
            type="MATCH_PAIRS",
            prompt="Match the pairs",
            data=json.dumps({
                "left": ["gracias", "por favor", "hola", "adiós", "de nada"],
                "right": ["welcome", "hello", "thank you", "goodbye", "please"]
            }),
            correct_answer=json.dumps({
                "gracias": "thank you",
                "por favor": "please",
                "hola": "hello",
                "adiós": "goodbye",
                "de nada": "welcome"
            })
        )
        e14 = Exercise(
            id=14,
            lesson_id=3,
            order=5,
            type="TYPE_ANSWER",
            prompt="Translate to Spanish: 'Please'",
            data=json.dumps([]),
            correct_answer="por favor"
        )
        db.add_all([e10, e11, e12, e13, e14])

        # Seed Exercises (Lesson 4: Food & Drink)
        e15 = Exercise(
            id=15,
            lesson_id=4,
            order=1,
            type="MULTIPLE_CHOICE",
            prompt="How do you say 'water' in Spanish?",
            data=json.dumps(["agua", "leche", "pan"]),
            correct_answer="agua"
        )
        e16 = Exercise(
            id=16,
            lesson_id=4,
            order=2,
            type="WORD_BANK",
            prompt="Translate: 'I eat bread and cheese.'",
            data=json.dumps(["Como", "pan", "y", "queso", "leche", "agua"]),
            correct_answer=json.dumps(["Como", "pan", "y", "queso"])
        )
        e17 = Exercise(
            id=17,
            lesson_id=4,
            order=3,
            type="FILL_BLANK",
            prompt="Complete: 'Quiero ___ café, por favor.'",
            data=json.dumps(["un", "una", "unos"]),
            correct_answer="un"
        )
        e18 = Exercise(
            id=18,
            lesson_id=4,
            order=4,
            type="MATCH_PAIRS",
            prompt="Match the food words",
            data=json.dumps({
                "left": ["pan", "leche", "agua", "queso", "café"],
                "right": ["cheese", "milk", "coffee", "bread", "water"]
            }),
            correct_answer=json.dumps({
                "pan": "bread",
                "leche": "milk",
                "agua": "water",
                "queso": "cheese",
                "café": "coffee"
            })
        )
        db.add_all([e15, e16, e17, e18])

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
