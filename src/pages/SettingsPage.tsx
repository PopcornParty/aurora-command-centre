import { ChangeEvent, useState, useEffect } from 'react'
import { loadJSON, saveJSON, resetKey } from '../lib/storage'

type Settings = { accent: string; overlay: number; reduceMotion: boolean; clock12: boolean }

const KEY = 'aurora-settings'
const DEFAULT: Settings = { accent: '#D9273E', overlay: 0.55, reduceMotion: false, clock12: true }

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(() => loadJSON(KEY, DEFAULT))

  useEffect(() => { saveJSON(KEY, s) }, [s])

  const exportData = () => {
    const data = {
      notes: loadJSON('aurora-notes', []),
      tasks: loadJSON('aurora-tasks', []),
      projects: loadJSON('aurora-projects', []),
      bookmarks: loadJSON('aurora-bookmarks', []),
      scratchpad: loadJSON('aurora-scratchpad', ''),
      settings: s
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = 'aurora-backup.json'
    a.click()
  }

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!confirm('Import will overwrite existing local data. Continue?')) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.notes) saveJSON('aurora-notes', data.notes)
        if (data.tasks) saveJSON('aurora-tasks', data.tasks)
        if (data.projects) saveJSON('aurora-projects', data.projects)
        if (data.bookmarks) saveJSON('aurora-bookmarks', data.bookmarks)
        if (data.scratchpad !== undefined) saveJSON('aurora-scratchpad', data.scratchpad)
        if (data.settings) { setS({ ...DEFAULT, ...data.settings }); saveJSON(KEY, data.settings) }
        alert('Imported. Refresh to see changes.')
      } catch { alert('Invalid file') }
    }
    reader.readAsText(f)
  }

  const reset = () => {
    if (!confirm('Reset all local notes, tasks, projects, bookmarks and settings?')) return
    ;['aurora-notes','aurora-tasks','aurora-projects','aurora-bookmarks','aurora-scratchpad', KEY].forEach(resetKey)
    setS(DEFAULT)
    alert('Reset. Refresh the page.')
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="subtitle">Preferences and local data. Everything stays on this device.</p>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Appearance</h3>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label>Accent colour <input type="color" value={s.accent} onChange={e => setS({ ...s, accent: e.target.value })} style={{ marginLeft: 8 }} /></label>
          <label>Background overlay <input type="range" min="0.3" max="0.8" step="0.05" value={s.overlay} onChange={e => setS({ ...s, overlay: +e.target.value })} style={{ marginLeft: 8 }} /> {s.overlay}</label>
          <label><input type="checkbox" checked={s.reduceMotion} onChange={e => setS({ ...s, reduceMotion: e.target.checked })} /> Reduce motion</label>
          <label><input type="checkbox" checked={s.clock12} onChange={e => setS({ ...s, clock12: e.target.checked })} /> 12-hour clock</label>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Data</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '8px 0' }}>Notes, tasks, projects, bookmarks and settings are stored in your browser. Clearing site data will remove them.</p>
        <div className="quick-actions">
          <button className="btn" onClick={exportData}>Export backup</button>
          <label className="btn">Import <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} /></label>
          <button className="btn" onClick={reset}>Reset all local data</button>
        </div>
      </div>
    </div>
  )
}
