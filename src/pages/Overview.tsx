import { Youtube, Camera, Lightbulb, Network, StickyNote, CheckSquare, BarChart3, Calculator, Timer } from 'lucide-react'

interface Props {
  greeting: string
  setPage: (p: any) => void
}

export default function Overview({ greeting, setPage }: Props) {
  return (
    <>
      <div>
        <div className="greeting">{greeting},</div>
        <h1 className="page-title">PERSONAL COMMAND CENTRE</h1>
        <p className="subtitle">Everything important, at a glance.</p>
        <div style={{ marginTop: 8 }}>
          <a href="https://www.youtube.com/@popcorn_party1" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}>@popcorn_party1</a>
        </div>
      </div>

      <div className="status-row">
        <div className="status-module"><div className="status-label">Smart Home</div><div className="status-value">Not connected <span className="demo-badge">Demo</span></div></div>
        <div className="status-module"><div className="status-label">Network</div><div className="status-value">Online</div></div>
        <div className="status-module"><div className="status-label">Cameras</div><div className="status-value">0 active <span className="demo-badge">Demo</span></div></div>
        <div className="status-module"><div className="status-label">Creator</div><div className="status-value">Planning</div></div>
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Quick Tools</h3>
        <div className="quick-actions">
          <button className="btn" onClick={() => setPage('notes')}><StickyNote size={14} /> Notes</button>
          <button className="btn" onClick={() => setPage('tasks')}><CheckSquare size={14} /> Tasks</button>
          <button className="btn" onClick={() => setPage('calculator')}><Calculator size={14} /> Calculator</button>
          <button className="btn" onClick={() => setPage('timer')}><Timer size={14} /> Timer</button>
          <button className="btn" onClick={() => setPage('stats')}><BarChart3 size={14} /> Channel Stats</button>
          <button className="btn" onClick={() => setPage('youtube')}><Youtube size={14} /> Video Ideas</button>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Smart Home</h3>
          <span className="demo-badge">Not connected</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>Connect Home Assistant later to control lights, devices and cameras.</p>
        <div className="quick-actions">
          <button className="btn" onClick={() => setPage('devices')}>Devices</button>
          <button className="btn" onClick={() => setPage('cameras')}><Camera size={14} /> Cameras</button>
          <button className="btn" onClick={() => setPage('lighting')}><Lightbulb size={14} /> Lighting</button>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>More</h3>
        <div className="quick-actions">
          <button className="btn" onClick={() => setPage('network')}><Network size={14} /> System Monitor</button>
          <button className="btn" onClick={() => setPage('settings')}>Settings</button>
          <button className="btn" onClick={() => window.open('https://www.youtube.com/@popcorn_party1', '_blank')}><Youtube size={14} /> Open Channel</button>
        </div>
      </div>
    </>
  )
}
