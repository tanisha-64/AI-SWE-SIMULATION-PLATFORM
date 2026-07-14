import json
from openai import OpenAI
from app.core.config import settings
from app.services.ai.prompt_templates import code_review_prompt

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def get_ai_code_review(problem_title: str, problem_description: str, code: str, language: str) -> dict:
    prompt = code_review_prompt(problem_title, problem_description, code, language)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a precise, structured code reviewer. Always respond in valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=600
        )

        raw_text = response.choices[0].message.content.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        review_data = json.loads(raw_text)
        return review_data

    except json.JSONDecodeError:
        return {
            "code_quality_score": None,
            "code_quality_note": "AI response could not be parsed.",
            "time_complexity": "N/A",
            "space_complexity": "N/A",
            "bugs_found": "N/A",
            "optimization_suggestions": "N/A",
            "overall_verdict": "AI review temporarily unavailable."
        }
    except Exception as e:
        return {
            "code_quality_score": None,
            "code_quality_note": f"AI review failed: {str(e)}",
            "time_complexity": "N/A",
            "space_complexity": "N/A",
            "bugs_found": "N/A",
            "optimization_suggestions": "N/A",
            "overall_verdict": "AI review temporarily unavailable."
        }