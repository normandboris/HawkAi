import { Routes, Route } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/chat'
const FEEDBACK_URL = 'http://localhost:5000/feedback'

function Chatbot() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)

  async function sendQuestion() {
    if (!question.trim()) return

    const askedQuestion = question
    const userMessage = { role: 'user', text: askedQuestion }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setQuestion('')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: askedQuestion, session_id: sessionId }),
      })
      const data = await res.json()

      setSessionId(data.session_id)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          confidence: data.confidence,
          question: askedQuestion,
          rated: null,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error: could not reach the server.' },
      ])
    }

    setLoading(false)
  }

  async function sendFeedback(index, rating) {
    const msg = messages[index]

    setMessages((prev) =>
      prev.map((m, i) => (i === index ? { ...m, rated: rating } : m))
    )

    try {
      await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question: msg.question,
          answer: msg.text,
          rating,
        }),
      })
    } catch (err) {
      // silently ignore feedback errors, non-critical
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') sendQuestion()
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>HawkAI</h1>
        <p>Hunter College Financial Aid Assistant</p>
      </div>

      <div className="chat-window">
        {messages.length === 0 && (
          <p className="empty-state">Ask a financial aid question to get started.</p>
        )}

        {messages.map((m, i) => (
          <p key={i} className={`message ${m.role}`}>
            <b>{m.role === 'user' ? 'You' : 'HawkAI'}:</b> {m.text}
            {m.confidence !== undefined && (
              <span className="confidence"> (Confidence: {m.confidence}%)</span>
            )}
            {m.role === 'assistant' && m.question && (
              <span className="feedback-buttons">
                <button
                  className={`feedback-btn ${m.rated === true ? 'active' : ''}`}
                  onClick={() => sendFeedback(i, true)}
                  disabled={m.rated !== null}
                >
                  👍
                </button>
                <button
                  className={`feedback-btn ${m.rated === false ? 'active' : ''}`}
                  onClick={() => sendFeedback(i, false)}
                  disabled={m.rated !== null}
                >
                  👎
                </button>
              </span>
            )}
          </p>
        ))}

        {loading && <p className="message assistant typing">HawkAI is thinking...</p>}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
        />
        <button onClick={sendQuestion}>Send</button>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chatbot />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
}

export default App;