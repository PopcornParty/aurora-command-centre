import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'aurora-video-ideas'

export default function YouTube() {
  const [ideas, setIdeas] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '["Night drive cinematic", "Rainy city Ferrari shot"]')
    } catch {
      return ["Night drive cinematic", "Rainy city Ferrari shot"]
    }
  })
  const [input, setInput] = useState('')

  const save = (next: string[]) => {
    setIdeas(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const add = () => {
    if (!input.trim()) return
    save([...ideas, input.trim()])
    setInput('')
  }

  return (
    <div>
      <h1 className="page-title">YouTube Workspace</h1>
      <p className="subtitle" style={{ marginBottom: 8 }}>
        <a href="https://www.youtube.com/@popcorn_party1" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
          @popcorn_party1
        </a>
      </p>
      <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => window.open('https://www.youtube.com/@popcorn_party1', '_blank')}>
        Open Channel
      </button>

      <div className="panel">
        <h3 style={{ marginBottom: 12 }}>Upcoming Ideas</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Add a video idea…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }}
          />
          <button className="btn" onClick={add}><Plus size={14} /> Add</button>
        </div>
        {ideas.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No ideas yet.</p>}
        {ideas.map((idea, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span>{idea}</span>
            <button className="icon-btn" onClick={() => save(ideas.filter((_, idx) => idx !== i))} aria-label="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Publishing Checklist</h3>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><input type="checkbox" /> Thumbnail ready</label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><input type="checkbox" /> Title & description</label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" /> Tags & end screen</label>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Analytics</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>YouTube Data API + OAuth required for private analytics. Public channel link works without authentication.</p>
      </div>
    </div>
  )
}
