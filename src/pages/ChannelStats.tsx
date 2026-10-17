import { useState, useMemo, useEffect } from 'react'
import { RefreshCw, Upload } from 'lucide-react'
import { loadJSON, saveJSON } from '../lib/storage'

type Server = { name: string; members: number; partnered: boolean; premium: boolean; tags: string[]; growth: number }
type StatsData = { servers: Server[]; lastUpdated: string }

const DEFAULT_DEMO: StatsData = {
  lastUpdated: new Date().toISOString(),
  servers: [
    { name: 'Night Drive HQ', members: 1840, partnered: true, premium: true, tags: ['cars', 'night'], growth: 4.2 },
    { name: 'Rain City', members: 920, partnered: true, premium: false, tags: ['rain', 'city'], growth: 1.8 },
    { name: 'Ferrari Fans', members: 640, partnered: false, premium: true, tags: ['ferrari'], growth: 6.1 },
    { name: 'Creator Lounge', members: 310, partnered: false, premium: false, tags: ['content'], growth: -0.5 },
    { name: 'Speed Club', members: 1250, partnered: true, premium: true, tags: ['racing'], growth: 3.4 }
  ]
}

const KEY = 'aurora-channel-stats'

export default function ChannelStats() {
  const [data, setData] = useState<StatsData>(() => loadJSON(KEY, DEFAULT_DEMO))
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'members' | 'name' | 'growth'>('members')
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  useEffect(() => { saveJSON(KEY, data) }, [data])

  const kpis = useMemo(() => {
    const total = data.servers.length
    const partnered = data.servers.filter(s => s.partnered).length
    const premium = data.servers.filter(s => s.premium).length
    const tags = new Set(data.servers.flatMap(s => s.tags)).size
    const partners24h = Math.min(2, partnered)
    const avgGrowth = data.servers.reduce((a, s) => a + s.growth, 0) / total || 0
    return { total, partnered, premium, tags, partners24h, avgGrowth: avgGrowth.toFixed(1) }
  }, [data])

  const rows = useMemo(() => {
    let r = data.servers.filter(s =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.tags.some(t => t.includes(q.toLowerCase()))
    )
    r = [...r].sort((a, b) => {
      if (sort === 'members') return b.members - a.members
      if (sort === 'growth') return b.growth - a.growth
      return a.name.localeCompare(b.name)
    })
    return r
  }, [data, q, sort])

  const refresh = () => {
    setData(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString(),
      servers: prev.servers.map(s => ({ ...s, members: s.members + Math.floor(Math.random() * 5 - 2) }))
    }))
  }

  const importData = () => {
    try {
      const parsed = JSON.parse(importText)
      if (Array.isArray(parsed.servers)) {
        setData({ servers: parsed.servers, lastUpdated: new Date().toISOString() })
        setShowImport(false)
        setImportText('')
        alert('Imported custom stats (still treated as your data, not live).')
      } else {
        alert('JSON must contain a "servers" array.')
      }
    } catch {
      alert('Invalid JSON')
    }
  }

  const resetDemo = () => {
    if (confirm('Reset to sample DEMO DATA?')) setData(DEFAULT_DEMO)
  }

  return (
    <div>
      <h1 className="page-title">Channel Stats</h1>
      <p className="subtitle">
        All numbers are sample data until you import your own. <span className="demo-badge">DEMO DATA</span>
      </p>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn" onClick={refresh}><RefreshCw size={14} /> Refresh</button>
        <button className="btn" onClick={() => setShowImport(!showImport)}><Upload size={14} /> Import / Settings</button>
        <select value={range} onChange={e => setRange(e.target.value as any)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px' }}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated: {new Date(data.lastUpdated).toLocaleString()}</span>
      </div>

      {showImport && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3>Import custom stats</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0' }}>
            Paste JSON with a "servers" array (name, members, partnered, premium, tags, growth). This stays local.
          </p>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={6} placeholder='{"servers":[{"name":"My Server","members":100,"partnered":false,"premium":false,"tags":["demo"],"growth":0}]}' style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontFamily: 'monospace', fontSize: 12 }} />
          <div className="quick-actions" style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={importData}>Import</button>
            <button className="btn" onClick={resetDemo}>Reset to DEMO</button>
          </div>
        </div>
      )}

      <div className="status-row" style={{ marginTop: 8 }}>
        <div className="status-module"><div className="status-label">Total Servers</div><div className="status-value">{kpis.total}</div></div>
        <div className="status-module"><div className="status-label">Partnered</div><div className="status-value">{kpis.partnered}</div></div>
        <div className="status-module"><div className="status-label">Partners 24h</div><div className="status-value">{kpis.partners24h} <span style={{ color: 'var(--success)', fontSize: 12 }}>+{kpis.avgGrowth}%</span></div></div>
        <div className="status-module"><div className="status-label">Premium</div><div className="status-value">{kpis.premium}</div></div>
        <div className="status-module"><div className="status-label">Unique Tags</div><div className="status-value">{kpis.tags}</div></div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Member Growth ({range} demo)</h3>
        <svg viewBox="0 0 300 80" style={{ width: '100%', height: 80 }}>
          <polyline fill="none" stroke="#D9273E" strokeWidth="2" points="0,60 50,48 100,52 150,32 200,38 250,22 300,18" />
          <polyline fill="none" stroke="#3D8B6E" strokeWidth="1.5" strokeDasharray="4" points="0,55 50,50 100,45 150,40 200,35 250,30 300,25" />
        </svg>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Sample chart — not live data. Range filter is visual only in this demo.</p>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search servers or tags…" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
          <select value={sort} onChange={e => setSort(e.target.value as any)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
            <option value="members">Sort by members</option>
            <option value="growth">Sort by growth</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
              <th>Server</th><th>Members</th><th>Growth</th><th>Partner</th><th>Premium</th><th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.name} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0' }}>{s.name}</td>
                <td>{s.members.toLocaleString()}</td>
                <td style={{ color: s.growth >= 0 ? 'var(--success)' : 'var(--accent)' }}>{s.growth > 0 ? '+' : ''}{s.growth}%</td>
                <td>{s.partnered ? 'Yes' : '—'}</td>
                <td>{s.premium ? 'Yes' : '—'}</td>
                <td>{s.tags.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No matches.</p>}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Rankings (demo)</h3>
        <ol style={{ marginTop: 8, paddingLeft: 20, color: 'var(--text-secondary)' }}>
          {data.servers.slice().sort((a, b) => b.members - a.members).slice(0, 3).map(s => (
            <li key={s.name}>{s.name} — {s.members.toLocaleString()} members</li>
          ))}
        </ol>
        <h3 style={{ marginTop: 16 }}>Recent Activity (sample)</h3>
        <ul style={{ marginTop: 8, paddingLeft: 18, color: 'var(--text-secondary)' }}>
          <li>Partner request approved — Night Drive HQ</li>
          <li>New tag added: ferrari</li>
          <li>Premium server renewed</li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Use the Import button above to load your own data later. Nothing here is live.</p>
      </div>
    </div>
  )
}
