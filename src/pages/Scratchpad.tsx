import { useState } from 'react'
import { Copy, Download } from 'lucide-react'

export default function Scratchpad() {
  const [text, setText] = useState('')

  const copy = () => navigator.clipboard.writeText(text)
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = 'aurora-scratchpad.txt'
    a.click()
  }

  return (
    <div>
      <h1 className="page-title">Scratchpad</h1>
      <p className="subtitle">Temporary text. Not saved automatically.</p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={14} style={{ width: '100%', marginTop: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, color: 'var(--text)', fontFamily: 'var(--font-ui)', resize: 'vertical' }} placeholder="Type anything…" />
      <div className="quick-actions" style={{ marginTop: 12 }}>
        <button className="btn" onClick={copy}><Copy size={14} /> Copy</button>
        <button className="btn" onClick={download}><Download size={14} /> Download</button>
        <button className="btn" onClick={() => setText('')}>Clear</button>
      </div>
    </div>
  )
}
