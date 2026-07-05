import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/chat'

function App() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)

  async function sendQuestion() {
    if (!question.trim()) return

    const userMessage = { role: 'user', text: question }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setQuestion('')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId }),
      })
      const data = await res.json()

      setSessionId(data.session_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, confidence: data.confidence },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error: could not reach the server.' },
      ])
    }

    setLoading(false)
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

export default App
