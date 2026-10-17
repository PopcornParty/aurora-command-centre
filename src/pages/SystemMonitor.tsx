export default function SystemMonitor() {
  const info = {
    online: navigator.onLine,
    platform: navigator.platform,
    language: navigator.language,
    cores: navigator.hardwareConcurrency || 'unknown',
    memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'not exposed',
    screen: `${window.screen.width}×${window.screen.height}`,
    ua: navigator.userAgent.slice(0, 80) + '…'
  }

  return (
    <div>
      <h1 className="page-title">System Monitor</h1>
      <p className="subtitle">Browser and device info only. This does not monitor any server. <span className="demo-badge">Browser only</span></p>
      <div className="status-row" style={{ marginTop: 16 }}>
        <div className="status-module"><div className="status-label">Online</div><div className="status-value">{info.online ? 'Yes' : 'No'}</div></div>
        <div className="status-module"><div className="status-label">Platform</div><div className="status-value">{info.platform}</div></div>
        <div className="status-module"><div className="status-label">Language</div><div className="status-value">{info.language}</div></div>
        <div className="status-module"><div className="status-label">CPU cores</div><div className="status-value">{info.cores}</div></div>
        <div className="status-module"><div className="status-label">Device memory</div><div className="status-value">{info.memory}</div></div>
        <div className="status-module"><div className="status-label">Screen</div><div className="status-value">{info.screen}</div></div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="status-label">User agent</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, wordBreak: 'break-all' }}>{info.ua}</p>
      </div>
    </div>
  )
}
