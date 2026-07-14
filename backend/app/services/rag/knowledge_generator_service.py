from openai import OpenAI
from app.core.config import settings
from app.services.ai.prompt_templates import knowledge_generation_prompt

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def generate_topic_content(topic: str) -> str:
    """
    Uses AI to generate an educational explanation for a given DSA/CS topic.
    This content gets stored in the vector database as knowledge.
    """
    prompt = knowledge_generation_prompt(topic)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a precise, accurate CS educator. Write only the requested explanation, no preamble."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=300
        )

        content = response.choices[0].message.content.strip()
        return content

    except Exception as e:
        raise ValueError(f"Knowledge generation failed for topic '{topic}': {str(e)}")