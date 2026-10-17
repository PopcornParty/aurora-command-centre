export default function Cameras() {
  return (
    <div>
      <h1 className="page-title">Cameras</h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>Configure camera entities from Home Assistant or custom streams.</p>
      <div className="panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ background: '#1a1c22', borderRadius: 8, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Demo Camera 1
          </div>
          <div style={{ background: '#1a1c22', borderRadius: 8, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Demo Camera 2
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>Thumbnails are placeholders. No live feeds.</p>
      </div>
    </div>
  )
}
