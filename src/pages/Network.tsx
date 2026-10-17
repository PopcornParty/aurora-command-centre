export default function NetworkPage() {
  return (
    <div>
      <h1 className="page-title">Network</h1>
      <p className="subtitle" style={{ marginBottom: 16 }}>Browser connectivity status. Not a full network scan.</p>
      <div className="panel">
        <div className="status-module" style={{ marginBottom: 10 }}>
          <div className="status-label">Browser Online</div>
          <div className="status-value">{navigator.onLine ? 'Yes' : 'No'}</div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Optional server metrics can be added via a secure backend.</p>
      </div>
    </div>
  )
}
