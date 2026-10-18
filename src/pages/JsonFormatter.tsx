import { useState } from 'react'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = () => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj, null, 2))
      setError('')
    } catch (e: any) {
      setError(e.message || 'Invalid JSON')
      setOutput('')
    }
  }

  const copy = () => navigator.clipboard.writeText(output)

  return (
    <div>
      <h1 className="page-title">JSON Formatter</h1>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} placeholder='{"example": true}' style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)', marginTop: 16 }} />
      <button className="btn btn-primary" style={{ margin: '12px 0' }} onClick={format}>Format / Validate</button>
      {error && <p style={{ color: 'var(--accent)' }}>{error}</p>}
      {output && (
        <>
          <textarea readOnly value={output} rows={8} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)' }} />
          <button className="btn" style={{ marginTop: 8 }} onClick={copy}>Copy</button>
        </>
      )}
    </div>
  )
}
