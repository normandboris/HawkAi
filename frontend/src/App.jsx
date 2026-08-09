import { Routes, Route } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

const API_URL = 'https://hawkai-zqi2.onrender.com/chat'
const FEEDBACK_URL = 'https://hawkai-zqi2.onrender.com/feedback'

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
          <div key={i} className={`message-row ${m.role}`}>
            <div className={`bubble ${m.role}`}>
              <div className="bubble-label">{m.role === 'user' ? 'You' : 'HawkAI'}</div>
              <div className="bubble-text">
                {m.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
              {m.confidence !== undefined && (
                <div className="confidence">Confidence: {m.confidence}%</div>
              )}
              {m.role === 'assistant' && m.question && (
                <div className="feedback-buttons">
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
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row assistant">
            <div className="bubble assistant typing">HawkAI is thinking...</div>
          </div>
        )}
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
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;