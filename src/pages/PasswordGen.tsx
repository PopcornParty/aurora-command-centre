import { useState } from 'react'

export default function PasswordGen() {
  const [len, setLen] = useState(16)
  const [pwd, setPwd] = useState('')

  const generate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
    const arr = new Uint32Array(len)
    crypto.getRandomValues(arr)
    let out = ''
    for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length]
    setPwd(out)
  }

  const copy = () => navigator.clipboard.writeText(pwd)

  return (
    <div>
      <h1 className="page-title">Password Generator</h1>
      <p className="subtitle">Generated locally. Nothing is stored or transmitted.</p>
      <div className="panel" style={{ marginTop: 16, maxWidth: 360 }}>
        <label>Length <input type="number" min={8} max={64} value={len} onChange={e => setLen(+e.target.value)} style={{ width: 70, marginLeft: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        <button className="btn btn-primary" style={{ marginLeft: 12 }} onClick={generate}>Generate</button>
        {pwd && (
          <div style={{ marginTop: 16 }}>
            <code style={{ display: 'block', padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, wordBreak: 'break-all' }}>{pwd}</code>
            <button className="btn" style={{ marginTop: 8 }} onClick={copy}>Copy</button>
          </div>
        )}
      </div>
    </div>
  )
}
