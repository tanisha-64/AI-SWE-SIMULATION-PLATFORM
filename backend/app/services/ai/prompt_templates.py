def code_review_prompt(problem_title: str, problem_description: str, code: str, language: str) -> str:
    return f"""You are a senior software engineer conducting a code review at a top tech company.

PROBLEM: {problem_title}
DESCRIPTION: {problem_description}

CANDIDATE'S CODE ({language}):
{code}

Provide a structured code review with these exact sections:

1. CODE_QUALITY: Rate 1-10 and briefly explain (readability, naming, structure)
2. TIME_COMPLEXITY: State Big-O and explain
3. SPACE_COMPLEXITY: State Big-O and explain
4. BUGS_OR_EDGE_CASES: List any bugs or unhandled edge cases (or "None found")
5. OPTIMIZATION_SUGGESTIONS: Specific ways to improve, if any
6. OVERALL_VERDICT: One sentence summary

Respond ONLY in valid JSON format with these exact keys: code_quality_score, code_quality_note, time_complexity, space_complexity, bugs_found, optimization_suggestions, overall_verdict. No markdown, no extra text, just JSON."""


def debugging_hint_prompt(problem_description: str, broken_code: str, user_attempt: str, hint_level: int) -> str:
    hint_instructions = {
        1: "Give a very general, high-level hint about WHERE the bug might be (which function/section). Do not reveal the actual bug.",
        2: "Give a more specific hint about WHAT TYPE of bug it is (e.g., off-by-one, wrong condition, type mismatch). Do not give the fix.",
        3: "Point to the exact line number and explain what's wrong conceptually, but do not write the corrected code."
    }

    return f"""You are a debugging mentor helping a student learn, not just fixing their code for them.

PROBLEM: {problem_description}
ORIGINAL BROKEN CODE:
{broken_code}

STUDENT'S CURRENT ATTEMPT:
{user_attempt}

HINT LEVEL {hint_level}: {hint_instructions.get(hint_level, hint_instructions[1])}

Respond ONLY in valid JSON with keys: hint_text, hint_level. Keep hint_text under 60 words."""

def problem_generation_prompt(category: str, difficulty: str, problem_type: str) -> str:
    common_header = f"""You are an expert technical assessment creator, similar to those who design questions for top tech company hiring rounds (fintech, e-commerce, SaaS companies like Razorpay, Stripe, Swiggy, Amazon).

Generate ONE original {problem_type}-type question with these specs:
- Category: {category}
- Difficulty: {difficulty}
- The content must be ORIGINAL — do not copy any real company's actual question, only mimic the STYLE and PATTERN typically seen in that type of company's interviews.
- Include a "company_style_tag" field describing which industry/company archetype this resembles (e.g., "Fintech/Payments style (Razorpay, Stripe pattern)" or "E-commerce scale style (Amazon, Flipkart pattern)"). Never claim it IS an actual company's real question.
"""

    if problem_type == "coding":
        return common_header + f"""
Respond ONLY in valid JSON:
{{
  "title": "string",
  "description": "string (include constraints and examples)",
  "difficulty": "{difficulty}",
  "category": "{category}",
  "company_style_tag": "string",
  "test_cases": [
    {{"input": "string", "output": "string", "is_sample": true}},
    {{"input": "string", "output": "string", "is_sample": true}},
    {{"input": "string", "output": "string", "is_sample": false}},
    {{"input": "string", "output": "string", "is_sample": false}}
  ]
}}
No markdown, just JSON."""

    elif problem_type == "mcq":
        return common_header + f"""
Create a conceptual multiple-choice question (CS fundamentals, system design basics, or language-specific concept relevant to {category}).

CRITICAL REQUIREMENTS:
- Provide EXACTLY 4 options in "mcq_options"
- "mcq_correct_index" must be a valid index (0, 1, 2, or 3) pointing to the genuinely correct answer
- Double-check your answer is factually correct before responding
- The 3 incorrect options must be plausible but clearly wrong upon careful analysis
- Never leave mcq_options empty

Respond ONLY in valid JSON:
{{
  "title": "string",
  "description": "string (the question itself)",
  "difficulty": "{difficulty}",
  "category": "{category}",
  "company_style_tag": "string",
  "mcq_options": ["option A", "option B", "option C", "option D"],
  "mcq_correct_index": 0,
  "mcq_explanation": "string (why this answer is correct, and briefly why others are wrong)"
}}
No markdown, just JSON."""

    else:  # project
        return common_header + f"""
Create a mini project-level challenge (something that would take a candidate a few hours, like building a small module/API/feature).

Respond ONLY in valid JSON:
{{
  "title": "string",
  "description": "string (project overview and context)",
  "difficulty": "{difficulty}",
  "category": "{category}",
  "company_style_tag": "string",
  "project_requirements": ["requirement 1", "requirement 2", "requirement 3", "requirement 4"],
  "project_evaluation_criteria": "string (how this would be evaluated: code quality, edge cases, architecture, etc.)"
}}
No markdown, just JSON."""
    
def rag_chat_prompt(question: str, contexts: list) -> str:
    context_text = "\n\n".join([f"[{c['topic']}]: {c['text']}" for c in contexts])

    return f"""You are a helpful coding mentor for students preparing for technical interviews.

Use ONLY the following reference material to answer the student's question. If the reference material doesn't fully cover the question, answer what you can from it and clearly state what additional research the student should do.

REFERENCE MATERIAL:
{context_text}

STUDENT'S QUESTION: {question}

Give a clear, encouraging, and educational answer. Keep it concise (under 150 words) and beginner-friendly. Do not make up information not present in the reference material."""

def knowledge_generation_prompt(topic: str) -> str:
    return f"""You are a computer science educator writing reference material for a coding interview prep platform.

Write a clear, accurate, educational explanation of the following topic: "{topic}"

Requirements:
- 100-180 words
- Cover: what it is, how it works, time/space complexity if applicable, and when to use it
- Beginner-friendly but technically accurate
- Write in plain paragraph form, no markdown formatting, no headers

Respond with ONLY the explanation text, nothing else."""

def career_advisor_agent_prompt(analytics: dict, recommendations: list, concept_explanation: str) -> str:
    return f"""You are an expert career advisor and coding mentor for a student preparing for tech interviews and placements.

STUDENT'S CURRENT PERFORMANCE DATA:
- Problems solved: {analytics['total_problems_solved']}
- Accuracy: {analytics['accuracy_percentage']}%
- Industry Readiness Score: {analytics['industry_readiness_score']}/100
- Strengths: {', '.join(analytics['strengths']) if analytics['strengths'] else 'Not yet identified'}
- Weaknesses: {', '.join(analytics['weaknesses']) if analytics['weaknesses'] else 'Not yet identified'}
- Consistency: {analytics['consistency_score']}%

RECOMMENDED NEXT PROBLEMS (based on weaknesses):
{chr(10).join([f"- {p['title']} ({p['difficulty']}, {p['category']})" for p in recommendations]) if recommendations else "No specific recommendations yet — student needs to attempt more problems first."}

RELEVANT CONCEPT EXPLANATION:
{concept_explanation}

Based on ALL of the above, write a personalized, encouraging action plan for this student. Structure your response with:
1. A brief assessment of where they currently stand
2. Specific next steps (referencing the recommended problems above)
3. One key concept they should focus on understanding deeply
4. A motivating closing note

Keep it under 200 words, warm and actionable tone."""


def socratic_tutor_prompt(question: str, contexts: list, conversation_history: list, turn_count: int) -> str:
    context_text = "\n\n".join([f"[{c['topic']}]: {c['text']}" for c in contexts])

    history_text = "\n".join([
        f"Student: {h['question']}\nTutor: {h['answer']}" for h in conversation_history
    ]) if conversation_history else "This is the first message in the conversation."

    stage_instruction = (
        "This is early in the conversation. Do NOT give the full answer yet. "
        "Ask ONE guiding question that helps the student think through the problem themselves, "
        "based on the reference material below."
        if turn_count < 2 else
        "The student has engaged with your guiding questions. Now provide a clear, complete explanation, "
        "building on what they've already figured out in the conversation."
    )

    return f"""You are a Socratic coding tutor. You help students discover answers through guided questioning rather than just telling them, similar to how a great teacher or interviewer coaches someone.

REFERENCE MATERIAL:
{context_text}

CONVERSATION SO FAR:
{history_text}

STUDENT'S LATEST MESSAGE: {question}

INSTRUCTION: {stage_instruction}

Keep your response under 80 words. Be warm and encouraging, never condescending."""


def tier_curation_prompt(tier_name: str, min_lpa: int, max_lpa) -> str:
    lpa_range = f"{min_lpa}-{max_lpa} LPA" if max_lpa else f"{min_lpa}+ LPA"

    return f"""You are a senior technical recruiter and interview coach with 15 years of experience
placing engineers at Indian and global tech companies across all compensation bands.

Generate an ACCURATE, well-established curriculum for engineers targeting the {lpa_range} compensation band.

Base this on WIDELY-RECOGNIZED, standard industry patterns for this band — the kind of consensus
guidance found in real interview prep communities (not fabricated specifics about any single company).
Be precise about difficulty calibration: lower bands emphasize fundamentals and correctness,
higher bands emphasize optimization, system design, and leadership signals.

Respond ONLY in valid JSON with this exact structure:
{{
  "description": "string (1-2 sentences describing what this band typically expects)",
  "dsa_topics": ["topic1", "topic2", ... 6-9 topics, ordered by priority],
  "required_subjects": ["subject1", "subject2", ... 4-6 subjects],
  "behavioral_focus": ["area1", "area2", ... 3-5 areas],
  "checklist_items": [
    {{"item_text": "string (specific, actionable)", "category": "dsa"}},
    {{"item_text": "string", "category": "subject"}},
    {{"item_text": "string", "category": "behavioral"}}
  ]
}}
Include exactly 8-10 checklist_items total, mixing all three categories. No markdown, just JSON."""


def bug_injection_prompt(topic: str, difficulty: str) -> str:
    return f"""You are creating a debugging exercise for programming students.

Write a short, correct Python function solving a simple problem related to: {topic} (difficulty: {difficulty}).
Then intentionally introduce ONE realistic bug (off-by-one error, wrong operator, wrong variable, etc.)
into it — the kind of mistake a real developer might make.

Respond ONLY in valid JSON:
{{
  "title": "string",
  "description": "string (what the function should do)",
  "broken_code": "string (the buggy Python code, with \\n for newlines)",
  "bug_explanation": "string (internal note: what the bug is, for hint generation — not shown to student)",
  "test_cases": [
    {{"input": "string", "output": "string", "is_sample": true}},
    {{"input": "string", "output": "string", "is_sample": false}}
  ]
}}
No markdown, just JSON."""

def direct_dsa_answer_prompt(question: str) -> str:
    return f"""You are an expert coding interview mentor. A student asked the following question
about data structures, algorithms, or computer science fundamentals:

QUESTION: {question}

Give a clear, accurate, educational answer using your own expert knowledge. Structure it well:
explain the core concept, how it works, time/space complexity if relevant, and a brief example
if it helps clarity. Keep it beginner-friendly but technically precise, under 180 words."""


def direct_socratic_prompt(question: str, conversation_history: list, turn_count: int) -> str:
    history_text = "\n".join([
        f"Student: {h['question']}\nTutor: {h['answer']}" for h in conversation_history
    ]) if conversation_history else "This is the first message in the conversation."

    stage_instruction = (
        "This is early in the conversation. Do NOT give the full answer yet. "
        "Ask ONE guiding question that helps the student think through the concept themselves, "
        "using your own knowledge of the topic to craft a smart, relevant question."
        if turn_count < 2 else
        "The student has engaged with your guiding questions. Now provide a clear, complete explanation "
        "using your own expert knowledge, building on what they've already figured out in the conversation."
    )

    return f"""You are a Socratic coding tutor with deep expertise in data structures, algorithms,
and computer science. You help students discover answers through guided questioning rather than
just telling them, similar to how a great teacher or interviewer coaches someone.

CONVERSATION SO FAR:
{history_text}

STUDENT'S LATEST MESSAGE: {question}

INSTRUCTION: {stage_instruction}

Keep your response under 80 words. Be warm and encouraging, never condescending."""


def extract_mistake_prompt(code: str, ai_review: dict, problem_title: str) -> str:
    bugs = ai_review.get("bugs_found", "")
    return f"""Analyze this code review feedback and extract the CORE conceptual mistake in one short tag and summary.

PROBLEM: {problem_title}
BUGS/ISSUES FOUND: {bugs}

Respond ONLY in valid JSON:
{{
  "concept_tag": "string (2-4 words, e.g. 'off-by-one error', 'missing base case', 'wrong loop bound')",
  "summary": "string (one sentence describing what went wrong)"
}}
If there are no real conceptual mistakes (clean code), respond with {{"concept_tag": "none", "summary": "none"}}.
No markdown, just JSON."""


def personal_memory_rag_prompt(question: str, general_contexts: list, personal_mistakes: list) -> str:
    general_text = "\n\n".join([f"[{c['topic']}]: {c['text']}" for c in general_contexts]) or "No general reference found."

    personal_text = "\n".join([
        f"- In '{m['problem_title']}', you had a '{m['concept_tag']}' issue: {m['summary']}"
        for m in personal_mistakes
    ]) if personal_mistakes else "No relevant personal history found for this topic."

    return f"""You are a personalized coding mentor who remembers this specific student's past mistakes.

GENERAL KNOWLEDGE BASE:
{general_text}

THIS STUDENT'S RELEVANT PAST MISTAKES:
{personal_text}

STUDENT'S QUESTION: {question}

Answer the question using the general knowledge. If any of the student's past mistakes are
genuinely relevant to this question, naturally reference them (e.g. "This connects to something
you struggled with before...") to reinforce learning — but only if truly relevant, don't force it.
Keep it under 160 words, encouraging tone."""


def resume_content_prompt(analytics: dict, badges: list, education: list) -> str:
    return f"""You are a professional resume writer specializing in tech/CS resumes for campus placements.

STUDENT'S PLATFORM PERFORMANCE DATA:
- Problems solved: {analytics.get('total_problems_solved', 0)}
- Accuracy: {analytics.get('accuracy_percentage', 0)}%
- Industry Readiness Score: {analytics.get('industry_readiness_score', 0)}/100
- Strengths: {', '.join(analytics.get('strengths', [])) or 'Building foundational skills'}
- Debugging challenges solved: {analytics.get('debugging_challenges_solved', 0)}
- Average AI code quality score: {analytics.get('avg_code_quality_score', 0)}/10
- Badges earned: {', '.join([b['name'] for b in badges]) if badges else 'None yet'}

EDUCATION: {education}

Generate professional, resume-ready content. Respond ONLY in valid JSON:
{{
  "summary": "string (2-3 sentence professional summary, first person implied, no 'I')",
  "skills": ["skill1", "skill2", ... 6-10 technical skills inferred from the data],
  "achievements": ["achievement1 (quantified, action-verb-led bullet point)", "achievement2", ... 3-5 bullets]
}}
Use strong action verbs (Engineered, Solved, Achieved, Optimized). Be honest and grounded in the actual data — do not invent numbers not present above. No markdown, just JSON."""