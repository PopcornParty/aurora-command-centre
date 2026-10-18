import { useState } from 'react'

export default function TextUtils() {
  const [text, setText] = useState('')
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const lines = text.split('\n').length

  const clean = () => setText(text.replace(/\s+/g, ' ').trim())
  const upper = () => setText(text.toUpperCase())
  const lower = () => setText(text.toLowerCase())
  const title = () => setText(text.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()))
  const copy = () => navigator.clipboard.writeText(text)

  return (
    <div>
      <h1 className="page-title">Text Utilities</h1>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder="Paste text…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)', marginTop: 16, resize: 'vertical' }} />
      <div style={{ margin: '12px 0', color: 'var(--text-secondary)' }}>{words} words · {chars} characters · {lines} lines</div>
      <div className="quick-actions">
        <button className="btn" onClick={clean}>Clean whitespace</button>
        <button className="btn" onClick={upper}>UPPER</button>
        <button className="btn" onClick={lower}>lower</button>
        <button className="btn" onClick={title}>Title Case</button>
        <button className="btn" onClick={copy}>Copy</button>
      </div>
    </div>
  )
}
