import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

const KEY = 'aurora-scratchpad'

export default function Scratchpad() {
  const [text, setText] = useState(() => loadJSON(KEY, ''))

  useEffect(() => { saveJSON(KEY, text) }, [text])

  const copy = () => navigator.clipboard.writeText(text).then(() => alert('Copied'))
  const clear = () => { if (confirm('Clear scratchpad?')) setText('') }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = 'scratchpad.txt'
    a.click()
  }

  return (
    <div>
      <h1 className="page-title">Scratchpad</h1>
      <p className="subtitle">Fast notes. Autosaves locally.</p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={12} placeholder="Type anything…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)', marginTop: 16, resize: 'vertical', fontFamily: 'inherit' }} />
      <div className="quick-actions" style={{ marginTop: 12 }}>
        <button className="btn" onClick={copy}>Copy</button>
        <button className="btn" onClick={download}>Download</button>
        <button className="btn" onClick={clear}>Clear</button>
      </div>
    </div>
  )
}
