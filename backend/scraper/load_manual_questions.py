"""
Loads 10 manually curated Q&A pairs into Supabase for the MVP demo.
Edit the MANUAL_QUESTIONS list below before running.
Usage: python scraper/load_manual_questions.py
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase_client import supabase
from rag.embeddings import embed_batch

SOURCE_URL = "https://www.hunter.cuny.edu/students/financial-aid/"

MANUAL_QUESTIONS = [
    {
        "question": "When is the FAFSA priority deadline?",
        "answer": "Hunter College's priority deadline for filing the FAFSA is April 1. Students are encouraged to file as soon as possible, since filing sooner means finding out about eligibility sooner and getting a clearer picture of financial resources.",
        "category": "deadlines",
    },
    {
        "question": "What is the final FAFSA deadline?",
        "answer": "The final deadline to submit the FAFSA for the current academic year is May 8. This is the last date to submit and still be considered for aid for that year.",
        "category": "deadlines",
    },
    {
        "question": "What is TAP?",
        "answer": "TAP (Tuition Assistance Program) is a New York State grant that helps eligible New York residents pay for tuition at approved schools, including Hunter College. It does not need to be repaid.",
        "category": "eligibility",
    },
    {
        "question": "Do I need to be a New York resident to qualify for TAP?",
        "answer": "Yes, TAP is a New York State-specific grant and requires the student to be a New York State resident who meets state residency requirements.",
        "category": "eligibility",
    },
    {
        "question": "What is Satisfactory Academic Progress (SAP)?",
        "answer": "Satisfactory Academic Progress (SAP) is a set of academic standards students must maintain, including a minimum GPA and credit completion rate, to remain eligible for financial aid.",
        "category": "eligibility",
    },
    {
        "question": "What documents do I need to apply for financial aid?",
        "answer": "Students typically need their Social Security number, federal tax returns, records of untaxed income, and bank statements to complete the FAFSA application.",
        "category": "process",
    },
    {
        "question": "How do I apply for federal work-study?",
        "answer": "Students indicate interest in federal work-study when completing the FAFSA. Eligibility is based on financial need, and awards are included in the student's financial aid package.",
        "category": "process",
    },
    {
        "question": "Where is the Hunter College Financial Aid Office located?",
        "answer": "The Financial Aid Office is located in Room 241, North Building, at Hunter College.",
        "category": "faq",
    },
    {
        "question": "What types of financial aid does Hunter College offer?",
        "answer": "Hunter College offers several types of financial aid including TAP, FAFSA-based federal aid, loans, and federal work-study opportunities.",
        "category": "faq",
    },
    {
        "question": "Can I still apply for financial aid if I miss the priority deadline?",
        "answer": "Yes, students can still submit the FAFSA after the priority deadline, up until the final deadline of May 8. However, filing after the priority deadline may reduce the amount and types of aid available.",
        "category": "faq",
    },
]


def load_manual_questions():
    texts = [q["answer"] for q in MANUAL_QUESTIONS]

    print(f"Embedding {len(texts)} manual Q&A pairs...")
    embeddings = embed_batch(texts)

    rows = []
    for q, embedding in zip(MANUAL_QUESTIONS, embeddings):
        rows.append({
            "question": q["question"],
            "answer": q["answer"],
            "source_url": SOURCE_URL,
            "category": q["category"],
            "embedding": embedding,
        })

    supabase.table("knowledge_base").insert(rows).execute()
    print(f"Inserted {len(rows)} rows into knowledge_base.")


if __name__ == "__main__":
    load_manual_questions()
    print("Done! knowledge_base loaded with 10 manual questions.")
