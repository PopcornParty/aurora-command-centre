import { useState } from 'react'

export default function FileViewer() {
  const [content, setContent] = useState('')
  const [name, setName] = useState('')

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setName(f.name)
    const reader = new FileReader()
    reader.onload = () => setContent(String(reader.result || ''))
    reader.readAsText(f)
  }

  return (
    <div>
      <h1 className="page-title">File Viewer</h1>
      <p className="subtitle">Opens text and JSON files locally in your browser. Nothing is uploaded.</p>
      <input type="file" accept=".txt,.json,.md,.csv,.log" onChange={onFile} style={{ marginTop: 16 }} />
      {name && <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{name}</p>}
      {content && <textarea readOnly value={content} rows={12} style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)' }} />}
    </div>
  )
}
