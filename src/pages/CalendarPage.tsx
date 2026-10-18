import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

type Event = { id: string; title: string; date: string; time: string; desc: string; category: string }

const KEY = 'aurora-calendar'

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>(() => loadJSON(KEY, []))
  const [view, setView] = useState<'month'|'agenda'>('agenda')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [time, setTime] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('General')

  useEffect(() => { saveJSON(KEY, events) }, [events])

  const add = () => {
    if (!title.trim() || !date) return
    setEvents([{ id: crypto.randomUUID(), title: title.trim(), date, time, desc, category: cat }, ...events])
    setTitle(''); setDesc('')
  }
  const del = (id: string) => { if (confirm('Delete event?')) setEvents(events.filter(e => e.id !== id)) }

  const upcoming = [...events].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)).filter(e => e.date >= new Date().toISOString().slice(0,10))

  return (
    <div>
      <h1 className="page-title">Calendar</h1>
      <p className="subtitle">Local events only. Not synced with any external calendar.</p>
      <div className="quick-actions" style={{ margin: '12px 0' }}>
        <button className={`btn ${view==='agenda'?'btn-primary':''}`} onClick={() => setView('agenda')}>Agenda</button>
        <button className={`btn ${view==='month'?'btn-primary':''}`} onClick={() => setView('month')}>Month</button>
      </div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" style={{ width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Category" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
        </div>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" rows={2} style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={add}>Add event</button>
      </div>
      {view === 'agenda' ? (
        upcoming.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No upcoming events.</p> :
        upcoming.map(e => (
          <div key={e.id} className="panel" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{e.title}</strong>
              <button className="icon-btn" onClick={() => del(e.id)}>×</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.date} {e.time} · {e.category}</div>
            {e.desc && <p style={{ fontSize: 13, marginTop: 4 }}>{e.desc}</p>}
          </div>
        ))
      ) : (
        <div className="panel">
          <p style={{ color: 'var(--text-muted)' }}>Month view shows events by date. Switch to Agenda for the full list.</p>
          <div style={{ marginTop: 8 }}>
            {events.slice(0, 10).map(e => <div key={e.id}>{e.date}: {e.title}</div>)}
          </div>
        </div>
      )}
    </div>
  )
}
