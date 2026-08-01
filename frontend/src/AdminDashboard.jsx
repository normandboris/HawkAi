import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://hawkai-zqi2.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("conversations");
  const [conversations, setConversations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    async function loadData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [convRes, fbRes, kbRes] = await Promise.all([
          fetch(`${API_BASE}/admin/conversations`, { headers }),
          fetch(`${API_BASE}/admin/feedback`, { headers }),
          fetch(`${API_BASE}/admin/knowledge`, { headers }),
        ]);

        if (convRes.status === 401 || fbRes.status === 401 || kbRes.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/admin/login");
          return;
        }

        setConversations(await convRes.json());
        setFeedback(await fbRes.json());
        setKnowledge(await kbRes.json());
      } catch (err) {
        setError("Unable to load dashboard data.");
      }
      setLoading(false);
    }

    loadData();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/admin/login");
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>HawkAI Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Log out</button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={tab === "conversations" ? "tab active" : "tab"}
          onClick={() => setTab("conversations")}
        >
          Conversations ({conversations.length})
        </button>
        <button
          className={tab === "feedback" ? "tab active" : "tab"}
          onClick={() => setTab("feedback")}
        >
          Feedback ({feedback.length})
        </button>
        <button
          className={tab === "knowledge" ? "tab active" : "tab"}
          onClick={() => setTab("knowledge")}
        >
          Knowledge Base ({knowledge.length})
        </button>
      </div>

      {loading && <p className="dashboard-status">Loading...</p>}
      {error && <p className="dashboard-status">{error}</p>}

      {!loading && !error && (
        <div className="dashboard-content">
          {tab === "conversations" && (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Role</th>
                  <th>Message</th>
                  <th>Confidence</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id}>
                    <td>{c.session_id?.slice(0, 8)}</td>
                    <td>{c.role}</td>
                    <td>{c.message}</td>
                    <td>{c.confidence ?? "-"}</td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "feedback" && (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Rating</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr key={f.id}>
                    <td>{f.question}</td>
                    <td>{f.answer}</td>
                    <td>{f.rating ? "👍" : "👎"}</td>
                    <td>{new Date(f.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "knowledge" && (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Category</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {knowledge.map((k) => (
                  <tr key={k.id}>
                    <td>{k.question}</td>
                    <td>{k.answer}</td>
                    <td>{k.category}</td>
                    <td>
                      <a href={k.source_url} target="_blank" rel="noreferrer">
                        Link
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
