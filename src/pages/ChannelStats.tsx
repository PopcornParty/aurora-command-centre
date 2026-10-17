import { useState, useMemo } from 'react'

const DEMO = {
  servers: 42,
  partnered: 8,
  partners24h: 2,
  premium: 5,
  tags: 18,
  growth: 12.4
}

const SERVERS = [
  { name: 'Night Drive HQ', members: 1840, partnered: true, premium: true, tags: ['cars','night'] },
  { name: 'Rain City', members: 920, partnered: true, premium: false, tags: ['rain','city'] },
  { name: 'Ferrari Fans', members: 640, partnered: false, premium: true, tags: ['ferrari'] },
  { name: 'Creator Lounge', members: 310, partnered: false, premium: false, tags: ['content'] }
]

export default function ChannelStats() {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'members' | 'name'>('members')

  const rows = useMemo(() => {
    let r = SERVERS.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.tags.some(t => t.includes(q.toLowerCase())))
    r = [...r].sort((a,b) => sort === 'members' ? b.members - a.members : a.name.localeCompare(b.name))
    return r
  }, [q, sort])

  return (
    <div>
      <h1 className="page-title">Channel Stats</h1>
      <p className="subtitle">All numbers below are sample data. <span className="demo-badge">DEMO DATA</span></p>
      <div className="status-row" style={{ marginTop: 16 }}>
        <div className="status-module"><div className="status-label">Total Servers</div><div className="status-value">{DEMO.servers}</div></div>
        <div className="status-module"><div className="status-label">Partnered</div><div className="status-value">{DEMO.partnered}</div></div>
        <div className="status-module"><div className="status-label">Partners 24h</div><div className="status-value">{DEMO.partners24h} <span style={{color:'var(--success)',fontSize:12}}>+{DEMO.growth}%</span></div></div>
        <div className="status-module"><div className="status-label">Premium</div><div className="status-value">{DEMO.premium}</div></div>
        <div className="status-module"><div className="status-label">Tags</div><div className="status-value">{DEMO.tags}</div></div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Member Growth (demo)</h3>
        <svg viewBox="0 0 300 80" style={{ width: '100%', height: 80 }}>
          <polyline fill="none" stroke="#D9273E" strokeWidth="2" points="0,60 40,50 80,55 120,35 160,40 200,25 240,30 280,15" />
        </svg>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Sample chart — not live data.</p>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search servers or tags…" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }} />
          <select value={sort} onChange={e => setSort(e.target.value as any)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
            <option value="members">Sort by members</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}><th>Server</th><th>Members</th><th>Partner</th><th>Premium</th><th>Tags</th></tr></thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.name} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0' }}>{s.name}</td>
                <td>{s.members.toLocaleString()}</td>
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
        <h3>Recent Activity (sample)</h3>
        <ul style={{ marginTop: 8, paddingLeft: 18, color: 'var(--text-secondary)' }}>
          <li>Partner request approved — Night Drive HQ</li>
          <li>New tag added: ferrari</li>
          <li>Premium server renewed</li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Connect a real data source later in Settings to replace DEMO DATA.</p>
      </div>
    </div>
  )
}
