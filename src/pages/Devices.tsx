export default function Devices() {
  return (
    <div>
      <h1 className="page-title">Devices</h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>Home Assistant integration required for live devices.</p>
      <div className="panel">
        <p style={{ color: 'var(--text-muted)' }}>No devices connected. Add your Home Assistant URL and token in Settings to discover entities.</p>
        <button className="btn" style={{ marginTop: 14 }} onClick={() => alert('Open Settings → Integrations')}>Setup Home Assistant</button>
      </div>
    </div>
  )
}
