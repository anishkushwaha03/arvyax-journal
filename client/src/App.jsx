import { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = 'https://arvyax-backend-u6f5.onrender.com/api/journal';
const USER_ID = '123';

function App() {
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [text, setText] = useState('');
  const [ambience, setAmbience] = useState('forest');
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/${USER_ID}`);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/insights/${USER_ID}`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchEntries();
      await fetchInsights();
    };
    loadData();
  }, [fetchEntries, fetchInsights]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return alert("Please write an entry first.");

    setLoading(true);

    try {
      const analyzeRes = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const analysisData = await analyzeRes.json();

      const newEntry = {
        userId: USER_ID,
        ambience,
        text,
        analysis: analysisData
      };

      const saveRes = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });

      if (!saveRes.ok) throw new Error("Saving failed");

      setText('');
      fetchEntries();
      fetchInsights();
    } catch (err) {
      console.error(err);
      alert("Failed to process and save the entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Arvyax Journal</h1>

      {/* Top Section: Two Columns */}
      <div className="top-section">

        {/* Left Column: New Entry */}
        <section className="column">
          <h2 className="section-title">New Entry</h2>
          <textarea
            className="entry-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your session... How did the environment make you feel?"
          />

          <div className="controls-row">
            <select
              className="ambience-select"
              value={ambience}
              onChange={(e) => setAmbience(e.target.value)}
            >
              <option value="forest">Forest ↓</option>
              <option value="ocean">Ocean ↓</option>
              <option value="mountain">Mountain ↓</option>
            </select>

            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </section>

        {/* Right Column: Insights */}
        <section className="column">
          <h2 className="section-title">Insights</h2>
          <div className="insights-box">
            {insights ? (
              <ul className="insights-list">
                <li><strong>Total Entries:</strong> {insights.totalEntries}</li>
                <li><strong>Top Emotion:</strong> {insights.topEmotion}</li>
                <li><strong>Most Used Ambience:</strong> {insights.mostUsedAmbience}</li>
                <li><strong>Recent Keywords:</strong> {insights.recentKeywords?.join(', ')}</li>
              </ul>
            ) : <p className="loading-text">Loading insights...</p>}
          </div>
        </section>

      </div>

      {/* Bottom Section: Previous Entries */}
      <section className="bottom-section">
        <h2 className="section-title">Previous Entries</h2>
        <div className="entries-container">
          {entries.map((entry) => (
            <div key={entry._id} className="entry-card">
              <div className="entry-header">
                <strong className="entry-ambience">{entry.ambience.toUpperCase()}</strong>
                <span className="entry-date">{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="entry-text">"{entry.text}"</p>

              {entry.analysis && (
                <div className="entry-analysis">
                  <em><strong>Emotion:</strong> {entry.analysis.emotion} | <strong>Keywords:</strong> {entry.analysis.keywords?.join(', ')}</em>
                </div>
              )}
            </div>
          ))}
          {entries.length === 0 && <p className="no-entries">No entries yet.</p>}
        </div>
      </section>

    </div>
  );
}

export default App;