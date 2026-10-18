import { useState } from 'react'

export default function FileWorkspace() {
  const [content, setContent] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('File too large (max 5 MB)'); return }
    setName(f.name)
    setError('')
    const reader = new FileReader()
    reader.onload = () => setContent(String(reader.result || ''))
    reader.onerror = () => setError('Could not read file')
    reader.readAsText(f)
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    a.download = name || 'file.txt'
    a.click()
  }

  const formatJson = () => {
    try {
      const obj = JSON.parse(content)
      setContent(JSON.stringify(obj, null, 2))
      setError('')
    } catch (e: any) { setError(e.message || 'Invalid JSON') }
  }

  return (
    <div>
      <h1 className="page-title">File Workspace</h1>
      <p className="subtitle">Opens files you select. Nothing is uploaded.</p>
      <input type="file" accept=".txt,.md,.json,.csv,.log" onChange={onFile} style={{ marginTop: 16 }} />
      {error && <p style={{ color: 'var(--accent)', marginTop: 8 }}>{error}</p>}
      {name && <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{name}</p>}
      {content && (
        <>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)' }} />
          <div className="quick-actions" style={{ marginTop: 8 }}>
            <button className="btn" onClick={formatJson}>Format JSON</button>
            <button className="btn" onClick={download}>Download</button>
          </div>
        </>
      )}
    </div>
  )
}
