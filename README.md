# HawkAI

**One place. Every campus question. Instant answer.**

HawkAI is an AI-powered assistant that lets Hunter College students ask financial aid questions in plain English and get accurate, sourced answers instead of digging through disconnected campus websites. It's built as a retrieval-augmented generation (RAG) system: every answer is retrieved from real, scraped Hunter College content before it's written, so responses are grounded in actual data rather than a language model's general knowledge.

Built for CSCI 49900 (Capstone Course) at Hunter College by Mohammad, Mahdi, Boris, and Raymond.

## The Problem

Students spend 10–20 minutes navigating multiple disconnected university websites just to find one piece of information — a deadline, an office hour, a required document. Financial aid info is scattered across the registrar, financial aid, and advising sites, none of them connected, and even when you find something, there's no guarantee it's current.

## How It Works

1. A student asks a question in the chat interface.
2. The question is converted into a vector embedding (Voyage AI).
3. The backend searches a Supabase/pgvector database of scraped Hunter College content for the most relevant matches.
4. Claude (Anthropic) generates an answer using only that retrieved content, citing its source and explicitly saying "I don't have that information" rather than guessing if nothing relevant is found.
5. The answer, with a confidence score, is shown to the student, who can rate it with a thumbs up or down.

A Python scraper (BeautifulSoup) separately keeps the knowledge base populated with content pulled from Hunter's financial aid pages.

## Features

- **Student chat interface** — ask any financial aid question, get a grounded, sourced answer with a live confidence score
- **Markdown-rendered responses** — bold text, headings, lists, and tables render properly instead of raw text
- **Feedback loop** — thumbs up/down on every answer, logged for review
- **Admin dashboard** — JWT-protected, view-only dashboard showing live conversations, feedback, and the knowledge base
- **Mobile responsive** — works on phone, tablet, and desktop
- **Hunter College branding** — themed around Hunter's official purple (`#5f259f`) and gold (`#ffc72a`)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), react-router-dom, react-markdown |
| Backend | Flask (Python) |
| Database | Supabase (Postgres) with the pgvector extension |
| Embeddings | Voyage AI (`voyage-3-lite`, 512-dimension vectors) |
| Answer generation | Claude API (Anthropic) |
| Scraping | Python + BeautifulSoup |
| Deployment | Render (backend), Vercel (frontend) |

## Project Structure

```
backend/
  app.py                 # Flask entry point
  supabase_client.py      # shared Supabase connection
  routes/
    chat.py               # /chat endpoint — the main RAG pipeline
    feedback.py            # /feedback endpoint
    admin.py               # /admin/login and protected admin routes
  rag/
    embeddings.py          # Voyage AI embedding calls
    search.py              # vector search against Supabase
    prompt.py               # builds the Claude prompt and generates answers
  scraper.py               # scrapes Hunter College financial aid pages
  scraper/
    save_to_supabase.py    # embeds and inserts scraped content
  database/
    schema.sql              # full database schema (tables + search function)
  evaluation/
    evaluate (1).py          # automated accuracy evaluation suite
    test_questions.csv       # 75 hand-written test questions
    evaluation_results.csv   # evaluation output

frontend/
  src/
    App.jsx                 # chat interface + routing
    AdminLogin.jsx            # admin sign-in
    AdminDashboard.jsx        # admin dashboard (conversations/feedback/knowledge)
    App.css                   # all styling
  index.html
  vite.config.js
```

## Running It Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_key
ANTHROPIC_API_KEY=your_anthropic_api_key
VOYAGE_API_KEY=your_voyage_api_key
```

Then run:

```bash
python app.py
```

The API will be live at `http://127.0.0.1:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be live at `http://localhost:5173`.

### Database

Run `backend/database/schema.sql` in the Supabase SQL editor to create the required tables (`knowledge_base`, `conversations`, `feedback`) and the `match_knowledge_base` search function. It requires the `vector` (pgvector) extension.

### Populating the Knowledge Base

```bash
cd backend/scraper
python scraper.py            # full scrape
python save_to_supabase.py   # embeds and inserts scraped content
```

## Evaluation

We built a 75-question evaluation suite (`backend/evaluation/`) to measure accuracy rather than assume it. Each question is sent to the live chatbot and scored three ways: semantic similarity to a known-correct reference answer, an LLM-judge grade for correctness and relevance, and a check for whether the response cites a real source.



We diagnosed the main cause of the correctness ceiling: knowledge base entries are embedded from raw scraped webpage text, while student questions are short and naturally phrased, which lowers similarity scores even when the retrieved content is correct. We also found and fixed a bug in the evaluation script itself, where the LLM judge silently defaulted to "Fail" on any unparsable response — fixing it raised correctness from 44% to 48%.

## Known Limitations

- The scraper runs on demand rather than on an automated schedule.
- Knowledge base coverage is incomplete for some topics (e.g., Work-Study acceptance deadlines).
- The admin dashboard is currently view-only; staff cannot yet edit or correct answers directly.
- Retrieval quality would benefit from embedding question-style text per knowledge chunk instead of raw scraped paragraphs.

## Team

| Name | Role |
|---|---|
| Mohammad | Backend — Flask API, RAG logic |
| Mahdi | Database / DevOps — Supabase schema, deployment |
| Boris | AI / Data — API integration, scraper, evaluation |
| Raymond | Frontend — React chat UI, routing |
