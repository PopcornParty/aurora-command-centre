import { ChangeEvent, useState, useEffect } from 'react'
import { loadJSON, saveJSON, resetKey } from '../lib/storage'

export default function SettingsPage() {
  const [reduceMotion, setReduceMotion] = useState(() => loadJSON('aurora-reduce-motion', false))
  const [accent, setAccent] = useState(() => loadJSON('aurora-accent', '#D9273E'))

  useEffect(() => {
    saveJSON('aurora-reduce-motion', reduceMotion)
    document.documentElement.style.setProperty('--accent', accent)
    if (reduceMotion) document.documentElement.classList.add('reduce-motion')
    else document.documentElement.classList.remove('reduce-motion')
  }, [reduceMotion, accent])

  const exportData = () => {
    const data = {
      notes: loadJSON('aurora-notes', []),
      tasks: loadJSON('aurora-tasks', []),
      bookmarks: loadJSON('aurora-bookmarks', []),
      stats: loadJSON('aurora-channel-stats', null)
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = 'aurora-backup.json'
    a.click()
  }

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.notes) saveJSON('aurora-notes', data.notes)
        if (data.tasks) saveJSON('aurora-tasks', data.tasks)
        if (data.bookmarks) saveJSON('aurora-bookmarks', data.bookmarks)
        if (data.stats) saveJSON('aurora-channel-stats', data.stats)
        alert('Imported. Refresh to see all changes.')
      } catch { alert('Invalid file') }
    }
    reader.readAsText(f)
  }

  const reset = () => {
    if (!confirm('Reset all local notes, tasks, bookmarks and stats?')) return
    resetKey('aurora-notes'); resetKey('aurora-tasks'); resetKey('aurora-bookmarks'); resetKey('aurora-channel-stats')
    alert('Reset. Refresh the page.')
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="subtitle">Local preferences and data management. No accounts or external services required.</p>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Appearance</h3>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)} />
            Reduce motion (overrides system preference for this site)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Accent colour:
            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{accent}</span>
          </label>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ferrari background and glass theme stay. Changes are local.</p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Data</h3>
        <div className="quick-actions" style={{ marginTop: 10 }}>
          <button className="btn" onClick={exportData}>Export backup</button>
          <label className="btn">Import <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} /></label>
          <button className="btn" onClick={reset}>Reset local data</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Includes notes, tasks, bookmarks and channel stats.</p>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Channel Stats</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
          Currently showing DEMO DATA by default. Import your own JSON on the Channel Stats page or via backup. No live connection is active.
        </p>
      </div>
    </div>
  )
}
