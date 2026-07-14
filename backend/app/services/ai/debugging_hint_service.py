import json
from openai import OpenAI
from app.core.config import settings
from app.services.ai.prompt_templates import debugging_hint_prompt

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def get_debugging_hint(
    problem_description: str,
    bug_explanation: str,
    user_attempt: str,
    hint_level: int
) -> dict:
    """
    Generates a progressive hint without revealing the full fix.
    hint_level 1 = vague direction, 2 = bug type, 3 = exact location
    """
    prompt = debugging_hint_prompt(
        problem_description=problem_description,
        broken_code=bug_explanation,
        user_attempt=user_attempt,
        hint_level=hint_level
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a patient debugging mentor. You NEVER give the full fix, only guided hints. Always respond in valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=200
        )

        raw_text = response.choices[0].message.content.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        hint_data = json.loads(raw_text)
        return {
            "hint_text": hint_data.get("hint_text", "Try reviewing your loop conditions and variable usage."),
            "hint_level": hint_level
        }

    except Exception:
        fallback_hints = {
            1: "Look carefully at how the main logic flows — something isn't quite right in the core section.",
            2: "Check for common issues like off-by-one errors, wrong comparison operators, or type mismatches.",
            3: "Re-read each line slowly and trace through with a simple example input."
        }
        return {
            "hint_text": fallback_hints.get(hint_level, fallback_hints[1]),
            "hint_level": hint_level
        }