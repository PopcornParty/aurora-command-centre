import { useState } from 'react'
import { toCase, removeDuplicateLines, trimLines, sortLines, urlEncode, urlDecode, b64Encode, b64Decode, formatJson, textStats } from '../lib/tools'
import { loadJSON, saveJSON } from '../lib/storage'

const HIST_KEY = 'aurora-clipboard-history-enabled'

export default function ClipboardPanel() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [err, setErr] = useState('')
  const [histOn, setHistOn] = useState(() => loadJSON(HIST_KEY, false))
  const [recent, setRecent] = useState<string[]>([])

  const apply = (fn: (s: string) => string | { ok: boolean; result?: string; error?: string }) => {
    const r = fn(input)
    if (typeof r === 'string') {
      setOutput(r)
      setErr('')
      if (histOn) setRecent(prev => [r.slice(0, 40), ...prev].slice(0, 5))
    } else if (r.ok) {
      setOutput(r.result || '')
      setErr('')
    } else {
      setErr(r.error || 'Error')
      setOutput('')
    }
  }

  const copy = async () => {
    if (!output) return
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(output)
      else {
        const ta = document.createElement('textarea')
        ta.value = output
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
    } catch {
      setErr('Clipboard permission denied. Select the text manually.')
    }
  }

  const dl = () => {
    if (!output) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([output], { type: 'text/plain' }))
    a.download = 'output.txt'
    a.click()
  }

  const stats = textStats(output || input)

  return (
    <div>
      <h2>Clipboard Tools</h2>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Clipboard is only accessed when you press Copy. Nothing is stored by default.</p>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste or type…" style={areaStyle} />
      <div className="quick-actions">
        <button className="btn" onClick={() => apply(s => trimLines(s))}>Trim</button>
        <button className="btn" onClick={() => apply(s => s.replace(/\n\s*\n/g, '\n').trim())}>Remove blank lines</button>
        <button className="btn" onClick={() => apply(s => toCase(s, 'upper'))}>UPPER</button>
        <button className="btn" onClick={() => apply(s => toCase(s, 'lower'))}>lower</button>
        <button className="btn" onClick={() => apply(s => sortLines(s))}>Sort</button>
        <button className="btn" onClick={() => apply(s => removeDuplicateLines(s))}>Dedupe</button>
        <button className="btn" onClick={() => apply(s => urlEncode(s))}>URL encode</button>
        <button className="btn" onClick={() => apply(s => urlDecode(s))}>URL decode</button>
        <button className="btn" onClick={() => apply(s => b64Encode(s))}>Base64</button>
        <button className="btn" onClick={() => apply(s => b64Decode(s))}>Decode64</button>
        <button className="btn" onClick={() => apply(s => formatJson(s, true))}>Pretty JSON</button>
        <button className="btn" onClick={() => apply(s => formatJson(s, false))}>Minify JSON</button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0' }}>{stats.words} words · {stats.chars} chars</p>
      <textarea value={output} readOnly style={areaStyle} placeholder="Output…" />
      {err && <p style={{ color: 'var(--accent)' }}>{err}</p>}
      <div className="quick-actions" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={copy} disabled={!output}>Copy</button>
        <button className="btn" onClick={() => { setInput(output); setOutput('') }}>Swap</button>
        <button className="btn" onClick={() => { setInput(''); setOutput(''); setErr('') }}>Clear</button>
        <button className="btn" onClick={dl} disabled={!output}>Download</button>
      </div>
      <label style={{ display: 'block', marginTop: 10, fontSize: 13 }}>
        <input type="checkbox" checked={histOn} onChange={e => { setHistOn(e.target.checked); saveJSON(HIST_KEY, e.target.checked) }} /> Remember recent (session only)
      </label>
      {histOn && recent.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Recent: {recent.join(' · ')}</div>
      )}
    </div>
  )
}

const areaStyle: React.CSSProperties = { width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 14, resize: 'vertical', marginBottom: 8 }
