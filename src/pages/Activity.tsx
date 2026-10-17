export default function ActivityPage() {
  const events = [
    { time: 'Just now', text: 'Dashboard opened', demo: true },
    { time: 'Earlier', text: 'Video idea list loaded', demo: true },
    { time: 'Earlier', text: 'Sample camera status checked', demo: true },
  ]
  return (
    <div>
      <h1 className="page-title">Activity</h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>Recent events. Demo data shown.</p>
      <div className="panel">
        {events.map((e, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
            <span>{e.text} {e.demo && <span className="demo-badge">Sample</span>}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
