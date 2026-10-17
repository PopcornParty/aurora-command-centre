export default function SettingsPage() {
  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>Visual preferences and integrations.</p>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Background</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
          Place a looping video at <code>public/media/ferrari-rain.mp4</code> or a high-quality still at <code>public/media/ferrari-fallback.jpg</code>.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" defaultChecked /> Rain effect
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <input type="checkbox" /> Prefer reduced motion
        </label>
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 12 }}>Home Assistant</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
          Base URL and long-lived access token should be stored server-side. Frontend never embeds secrets.
        </p>
        <input placeholder="https://your-ha.local:8123" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', marginBottom: 8 }} />
        <button className="btn">Test Connection</button>
      </div>
    </div>
  )
}
