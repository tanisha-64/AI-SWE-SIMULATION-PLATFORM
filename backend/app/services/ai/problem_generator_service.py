import time
import json
from openai import OpenAI
from app.core.config import settings
from app.services.ai.prompt_templates import problem_generation_prompt

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def _extract_json(raw_text: str) -> dict:
    raw_text = raw_text.strip()
    raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    start_idx = raw_text.find("{")
    end_idx = raw_text.rfind("}")

    if start_idx == -1 or end_idx == -1:
        raise ValueError("No JSON object found in AI response.")

    json_str = raw_text[start_idx:end_idx + 1]
    return json.loads(json_str)


def generate_problem(category: str, difficulty: str, problem_type: str = "coding") -> dict:
    prompt = problem_generation_prompt(category, difficulty, problem_type)

    max_retries = 2
    last_error = None
    temp = 0.3 if problem_type == "mcq" else 0.7

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a precise problem setter. Always respond in valid JSON only, following the exact schema given. Do not add any explanation before or after the JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temp,
                max_tokens=900
            )

            raw_text = response.choices[0].message.content
            problem_data = _extract_json(raw_text)
            problem_data["problem_type"] = problem_type

            if problem_type == "mcq":
                options = problem_data.get("mcq_options")
                correct_idx = problem_data.get("mcq_correct_index")
                if not options or len(options) < 2 or correct_idx is None or correct_idx >= len(options):
                    raise ValueError("Invalid MCQ structure: missing options or bad correct_index")

            return problem_data

        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            continue
        except Exception as e:
            raise ValueError(f"Problem generation failed: {str(e)}")

    raise ValueError(f"AI returned invalid JSON format after {max_retries} attempts. Last error: {last_error}")