export default function Lighting() {
  return (
    <div>
      <h1 className="page-title">Lighting</h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>Room-based controls appear when Home Assistant lights are connected.</p>
      <div className="panel">
        <p style={{ color: 'var(--text-muted)' }}>No lighting entities available. Connect Home Assistant to enable on/off, brightness and colour controls where supported.</p>
      </div>
    </div>
  )
}
