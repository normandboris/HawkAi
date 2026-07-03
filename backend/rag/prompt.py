import anthropic
import os

_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

FALLBACK = (
    "I don't have that information on the official Hunter website. "
    "Please contact the financial aid office at Room 241 North Building."
)

SYSTEM_PROMPT = """You are HawkAI, the official financial aid assistant for Hunter College students.
Answer student questions EXCLUSIVELY using the provided context below.
Always cite the source URL at the end of your answer in this format: (Source: <url>)
If the context does not contain the answer, respond EXACTLY with:
"I don't have that information on the official Hunter website. Please contact the financial aid office at Room 241 North Building."
Do not use any outside knowledge. Do not mention that you are reading from context."""


def build_context_block(chunks: list) -> str:
    blocks = []
    for i, chunk in enumerate(chunks):
        url = chunk.get("source_url", "")
        text = chunk.get("answer", "")
        question = chunk.get("question", "")
        blocks.append(f"[Source {i+1}: {url}]\n{question}\n{text}")
    return "\n\n".join(blocks)


def generate_answer(question: str, chunks: list) -> str:
    if not chunks:
        return FALLBACK

    context = build_context_block(chunks)

    message = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        temperature=0.0,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nStudent question: {question}"
            }
        ]
    )
    return message.content[0].text.strip()
