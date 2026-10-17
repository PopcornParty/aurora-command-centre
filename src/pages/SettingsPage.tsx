import { loadJSON, saveJSON, resetKey } from '../lib/storage'

export default function SettingsPage() {
  const exportData = () => {
    const data = {
      notes: loadJSON('aurora-notes', []),
      tasks: loadJSON('aurora-tasks', []),
      bookmarks: loadJSON('aurora-bookmarks', [])
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = 'aurora-backup.json'
    a.click()
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.notes) saveJSON('aurora-notes', data.notes)
        if (data.tasks) saveJSON('aurora-tasks', data.tasks)
        if (data.bookmarks) saveJSON('aurora-bookmarks', data.bookmarks)
        alert('Imported. Refresh to see changes.')
      } catch { alert('Invalid file') }
    }
    reader.readAsText(f)
  }

  const reset = () => {
    if (!confirm('Reset all local notes, tasks and bookmarks?')) return
    resetKey('aurora-notes'); resetKey('aurora-tasks'); resetKey('aurora-bookmarks')
    alert('Reset. Refresh the page.')
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="subtitle">Local preferences and data management.</p>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Data</h3>
        <div className="quick-actions" style={{ marginTop: 10 }}>
          <button className="btn" onClick={exportData}>Export backup</button>
          <label className="btn">Import <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} /></label>
          <button className="btn" onClick={reset}>Reset local data</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Channel Stats</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
          Currently showing DEMO DATA. In the future you can paste or import your own server/channel metrics here. No live connection is active.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Appearance</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
          Reduced motion is respected via the system setting. Ferrari background and glass theme are fixed for this build.
        </p>
      </div>
    </div>
  )
}
