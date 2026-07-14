from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.problem import Problem
from app.schemas.problem import ProblemCreate
from app.services.ai.problem_generator_service import generate_problem


def create_problem(db: Session, problem_data: ProblemCreate) -> Problem:
    test_cases_dict = [tc.model_dump() for tc in problem_data.test_cases] if problem_data.test_cases else None

    new_problem = Problem(
        title=problem_data.title,
        description=problem_data.description,
        difficulty=problem_data.difficulty,
        category=problem_data.category,
        problem_type=problem_data.problem_type,
        company_style_tag=problem_data.company_style_tag,
        test_cases=test_cases_dict,
        time_limit_seconds=problem_data.time_limit_seconds,
        mcq_options=problem_data.mcq_options,
        mcq_correct_index=problem_data.mcq_correct_index,
        mcq_explanation=problem_data.mcq_explanation,
        project_requirements=problem_data.project_requirements,
        project_evaluation_criteria=problem_data.project_evaluation_criteria
    )
    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)
    return new_problem


def get_all_problems(db: Session, difficulty: str = None, category: str = None, problem_type: str = None):
    query = db.query(Problem)
    if difficulty:
        query = query.filter(Problem.difficulty == difficulty)
    if category:
        query = query.filter(Problem.category == category)
    if problem_type:
        query = query.filter(Problem.problem_type == problem_type)
    return query.all()


def get_problem_by_id(db: Session, problem_id: int) -> Problem:
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


def generate_and_save_problem(db: Session, category: str, difficulty: str, problem_type: str) -> Problem:
    ai_data = generate_problem(category, difficulty, problem_type)

    from app.schemas.problem import TestCase
    test_cases = None
    if ai_data.get("test_cases"):
        test_cases = [TestCase(**tc) for tc in ai_data["test_cases"]]

    problem_create = ProblemCreate(
        title=ai_data["title"],
        description=ai_data["description"],
        difficulty=ai_data["difficulty"],
        category=ai_data["category"],
        problem_type=ai_data["problem_type"],
        company_style_tag=ai_data.get("company_style_tag"),
        test_cases=test_cases,
        time_limit_seconds=5,
        mcq_options=ai_data.get("mcq_options"),
        mcq_correct_index=ai_data.get("mcq_correct_index"),
        mcq_explanation=ai_data.get("mcq_explanation"),
        project_requirements=ai_data.get("project_requirements"),
        project_evaluation_criteria=ai_data.get("project_evaluation_criteria")
    )

    return create_problem(db, problem_create)


def generate_and_save_bulk(db: Session, category: str, difficulty: str, problem_type: str, count: int) -> list:
    created = []
    for _ in range(count):
        try:
            problem = generate_and_save_problem(db, category, difficulty, problem_type)
            created.append(problem)
        except Exception as e:
            print(f"❌ GENERATION FAILED: {type(e).__name__}: {e}")
            continue
    return created


def submit_mcq_answer(db: Session, problem_id: int, selected_index: int) -> dict:
    problem = get_problem_by_id(db, problem_id)
    if problem.problem_type != "mcq":
        raise HTTPException(status_code=400, detail="This problem is not an MCQ type")

    is_correct = selected_index == problem.mcq_correct_index
    return {
        "is_correct": is_correct,
        "correct_index": problem.mcq_correct_index,
        "explanation": problem.mcq_explanation
    }


def search_problems(db: Session, search_query: str):
    search_pattern = f"%{search_query}%"
    return db.query(Problem).filter(
        (Problem.title.ilike(search_pattern)) |
        (Problem.description.ilike(search_pattern)) |
        (Problem.category.ilike(search_pattern)) |
        (Problem.company_style_tag.ilike(search_pattern))
    ).all()