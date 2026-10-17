import { Youtube, Camera, Lightbulb, Network, Plus } from 'lucide-react'

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
          <a
            href="https://www.youtube.com/@popcorn_party1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}
          >
            @popcorn_party1
          </a>
        </div>
      </div>

      <div className="status-row">
        <div className="status-module">
          <div className="status-label">Smart Home</div>
          <div className="status-value">Not connected <span className="demo-badge">Demo</span></div>
        </div>
        <div className="status-module">
          <div className="status-label">Network</div>
          <div className="status-value">Online</div>
        </div>
        <div className="status-module">
          <div className="status-label">Cameras</div>
          <div className="status-value">0 active <span className="demo-badge">Demo</span></div>
        </div>
        <div className="status-module">
          <div className="status-label">Creator</div>
          <div className="status-value">Planning</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Smart Home</h3>
          <span className="demo-badge">Not connected</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14 }}>
          Connect Home Assistant to control lights, devices and cameras.
        </p>
        <div className="quick-actions">
          <button className="btn" disabled>All Lights Off</button>
          <button className="btn" disabled>All Lights On</button>
          <button className="btn" onClick={() => setPage('devices')}>Configure</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="panel">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Cameras</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No cameras configured. Demo thumbnails only.</p>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setPage('cameras')}>
            <Camera size={14} /> Open Cameras
          </button>
        </div>
        <div className="panel">
          <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Creator</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            Content ideas and publishing checklist for @popcorn_party1.
          </p>
          <button className="btn btn-primary" onClick={() => setPage('youtube')}>
            <Youtube size={14} /> Open Workspace
          </button>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Quick Actions</h3>
        <div className="quick-actions">
          <button className="btn" onClick={() => setPage('lighting')}><Lightbulb size={14} /> Lighting</button>
          <button className="btn" onClick={() => setPage('youtube')}><Plus size={14} /> Add Video Idea</button>
          <button className="btn" onClick={() => window.open('https://www.youtube.com/@popcorn_party1', '_blank')}>
            <Youtube size={14} /> Channel
          </button>
          <button className="btn" onClick={() => setPage('network')}><Network size={14} /> Network</button>
        </div>
      </div>
    </>
  )
}
