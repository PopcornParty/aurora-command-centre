import { useState, useMemo } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import QRTool from './QRTool'
import ClipboardPanel from './ClipboardPanel'
import QuickNotes from './QuickNotes'
import {
  textStats, toCase, removeDuplicateLines, trimLines, sortLines, findReplace,
  validateJson, formatJson, jsonDiff, jsonToCsv, csvToJson,
  urlEncode, urlDecode, b64Encode, b64Decode, uuid,
  hexToRgb, rgbToHsl, regexTest, hashText,
  percentage, discount, simplifyRatio, convertUnit, dateDiff, addDays, generatePassword
} from '../lib/tools'

const RECENT_KEY = 'aurora-toolhub-recent'
const FAV_KEY = 'aurora-toolhub-fav'

const TOOLS = [
  { id: 'text', name: 'Text Toolkit', cat: 'Text', desc: 'Counts, case, sort, find/replace' },
  { id: 'json', name: 'JSON & Data', cat: 'Data', desc: 'Format, validate, diff, CSV' },
  { id: 'dev', name: 'Developer Utils', cat: 'Dev', desc: 'URL, Base64, UUID, hash, regex' },
  { id: 'calc', name: 'Calculators', cat: 'Math', desc: 'Percentage, discount, ratio, units' },
  { id: 'date', name: 'Date & Time', cat: 'Time', desc: 'Difference, add days, timezone' },
  { id: 'file', name: 'File Tools', cat: 'Files', desc: 'Read text, JSON, CSV locally' },
  { id: 'pass', name: 'Password', cat: 'Security', desc: 'Secure random passwords' },
  { id: 'color', name: 'Colour', cat: 'Dev', desc: 'HEX, RGB, HSL' },
  { id: 'qr', name: 'QR Code', cat: 'Dev', desc: 'Generate QR from text, URL, Wi-Fi, contact' },
  { id: 'clip', name: 'Clipboard', cat: 'Text', desc: 'Quick transforms, encode, JSON' },
  { id: 'qnotes', name: 'Quick Notes', cat: 'Notes', desc: 'Lightweight notes, separate from main Notes' },
]

export default function ToolsHub() {
  const [q, setQ] = useState('')
  const [active, setActive] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>(() => loadJSON(RECENT_KEY, []))
  const [fav, setFav] = useState<string[]>(() => loadJSON(FAV_KEY, []))

  const open = (id: string) => {
    setActive(id)
    const next = [id, ...recent.filter(x => x !== id)].slice(0, 6)
    setRecent(next)
    saveJSON(RECENT_KEY, next)
  }
  const toggleFav = (id: string) => {
    const next = fav.includes(id) ? fav.filter(x => x !== id) : [...fav, id]
    setFav(next)
    saveJSON(FAV_KEY, next)
  }

  const filtered = useMemo(() => TOOLS.filter(t =>
    t.name.toLowerCase().includes(q.toLowerCase()) || t.desc.toLowerCase().includes(q.toLowerCase())
  ), [q])

  if (active) {
    return (
      <div>
        <button className="btn" onClick={() => setActive(null)} style={{ marginBottom: 12 }}>← Back</button>
        {active === 'text' && <TextTool />}
        {active === 'json' && <JsonTool />}
        {active === 'dev' && <DevTool />}
        {active === 'calc' && <CalcTool />}
        {active === 'date' && <DateTool />}
        {active === 'file' && <FileTool />}
        {active === 'pass' && <PassTool />}
        {active === 'color' && <ColorTool />}
        {active === 'qr' && <QRTool />}
        {active === 'clip' && <ClipboardPanel />}
        {active === 'qnotes' && <QuickNotes />}
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Tools</h1>
      <p className="subtitle">Local utilities. Nothing leaves this device.</p>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tools…" style={inputStyle} />

      {fav.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Favourites</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {fav.map(id => {
              const t = TOOLS.find(x => x.id === id)
              return t ? <button key={id} className="btn" onClick={() => open(id)}>{t.name}</button> : null
            })}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Recent</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {recent.map(id => {
              const t = TOOLS.find(x => x.id === id)
              return t ? <button key={id} className="btn" onClick={() => open(id)}>{t.name}</button> : null
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No tools match.</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map(t => (
          <div key={t.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }} onClick={() => open(t.id)} role="button" tabIndex={0}>
              <strong>{t.name}</strong>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.cat}</span>
            </div>
            <button className="btn" style={{ minWidth: 40 }} onClick={() => toggleFav(t.id)} aria-label="Favourite">{fav.includes(t.id) ? '★' : '☆'}</button>
            <button className="btn btn-primary" onClick={() => open(t.id)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', margin: '12px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 16 }
const areaStyle: React.CSSProperties = { width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 14, resize: 'vertical' }

function TextTool() {
  const [text, setText] = useState('')
  const [find, setFind] = useState('')
  const [repl, setRepl] = useState('')
  const s = textStats(text)
  const copy = () => navigator.clipboard.writeText(text)
  const dl = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = 'text.txt'
    a.click()
  }
  return (
    <div>
      <h2>Text Toolkit</h2>
      <textarea value={text} onChange={e => setText(e.target.value)} style={areaStyle} placeholder="Paste text…" />
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0' }}>
        {s.words} words · {s.chars} chars · {s.sentences} sentences · {s.paragraphs} paragraphs · ~{s.readingMin} min read
      </p>
      <div className="quick-actions">
        <button className="btn" onClick={() => setText(toCase(text, 'upper'))}>UPPER</button>
        <button className="btn" onClick={() => setText(toCase(text, 'lower'))}>lower</button>
        <button className="btn" onClick={() => setText(toCase(text, 'title'))}>Title</button>
        <button className="btn" onClick={() => setText(toCase(text, 'sentence'))}>Sentence</button>
        <button className="btn" onClick={() => setText(removeDuplicateLines(text))}>Dedupe lines</button>
        <button className="btn" onClick={() => setText(trimLines(text))}>Trim</button>
        <button className="btn" onClick={() => setText(sortLines(text))}>Sort</button>
        <button className="btn" onClick={copy}>Copy</button>
        <button className="btn" onClick={dl}>Download</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <input value={find} onChange={e => setFind(e.target.value)} placeholder="Find" style={{ ...inputStyle, margin: 0, flex: 1 }} />
        <input value={repl} onChange={e => setRepl(e.target.value)} placeholder="Replace" style={{ ...inputStyle, margin: 0, flex: 1 }} />
        <button className="btn" onClick={() => setText(findReplace(text, find, repl))}>Replace</button>
      </div>
    </div>
  )
}

function JsonTool() {
  const [text, setText] = useState('')
  const [other, setOther] = useState('')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const run = (fn: () => { ok: boolean; result?: string; csv?: string; json?: string; error?: string; diffs?: string[] }) => {
    const r = fn()
    if (!r.ok) { setErr(r.error || 'Error'); setOut('') }
    else { setErr(''); setOut(r.result || r.csv || r.json || (r.diffs ? r.diffs.join('\n') || 'No differences' : '')) }
  }
  return (
    <div>
      <h2>JSON & Data</h2>
      <textarea value={text} onChange={e => setText(e.target.value)} style={areaStyle} placeholder="JSON or CSV…" />
      <div className="quick-actions">
        <button className="btn" onClick={() => run(() => formatJson(text, true))}>Pretty</button>
        <button className="btn" onClick={() => run(() => formatJson(text, false))}>Minify</button>
        <button className="btn" onClick={() => { const v = validateJson(text); setErr(v.ok ? '' : (v.error || '') + (v.line ? ` (line ${v.line})` : '')); setOut(v.ok ? 'Valid JSON' : '') }}>Validate</button>
        <button className="btn" onClick={() => run(() => jsonToCsv(text))}>To CSV</button>
        <button className="btn" onClick={() => run(() => csvToJson(text))}>CSV to JSON</button>
      </div>
      <textarea value={other} onChange={e => setOther(e.target.value)} style={{ ...areaStyle, minHeight: 60, marginTop: 8 }} placeholder="Second JSON for diff…" />
      <button className="btn" style={{ marginTop: 6 }} onClick={() => run(() => jsonDiff(text, other))}>Compare</button>
      {err && <p style={{ color: 'var(--accent)', marginTop: 8 }}>{err}</p>}
      {out && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 13 }}>{out}</pre>}
    </div>
  )
}

function DevTool() {
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [algo, setAlgo] = useState<'SHA-256' | 'SHA-1' | 'SHA-384' | 'SHA-512'>('SHA-256')
  const go = (r: { ok: boolean; result?: string; error?: string }) => { if (r.ok) { setOut(r.result || ''); setErr('') } else { setErr(r.error || ''); setOut('') } }
  return (
    <div>
      <h2>Developer Utilities</h2>
      <textarea value={text} onChange={e => setText(e.target.value)} style={areaStyle} placeholder="Text…" />
      <div className="quick-actions">
        <button className="btn" onClick={() => { setOut(urlEncode(text)); setErr('') }}>URL encode</button>
        <button className="btn" onClick={() => go(urlDecode(text))}>URL decode</button>
        <button className="btn" onClick={() => { setOut(b64Encode(text)); setErr('') }}>Base64 encode</button>
        <button className="btn" onClick={() => go(b64Decode(text))}>Base64 decode</button>
        <button className="btn" onClick={() => { setOut(uuid()); setErr('') }}>UUID</button>
        <button className="btn" onClick={async () => { setOut(await hashText(text, algo)); setErr('') }}>Hash</button>
      </div>
      <select value={algo} onChange={e => setAlgo(e.target.value as typeof algo)} style={{ ...inputStyle, width: 'auto' }}>
        <option>SHA-256</option><option>SHA-1</option><option>SHA-384</option><option>SHA-512</option>
      </select>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="Regex" style={{ ...inputStyle, margin: 0, flex: 1 }} />
        <input value={flags} onChange={e => setFlags(e.target.value)} placeholder="flags" style={{ ...inputStyle, margin: 0, width: 60 }} />
        <button className="btn" onClick={() => { const r = regexTest(pattern, flags, text); if (r.ok) { setOut(r.matches.join('\n') || 'No matches'); setErr('') } else { setErr(r.error || ''); setOut('') } }}>Test</button>
      </div>
      {err && <p style={{ color: 'var(--accent)', marginTop: 8 }}>{err}</p>}
      {out && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13 }}>{out}</pre>}
    </div>
  )
}

function CalcTool() {
  const [pctVal, setPctVal] = useState('100')
  const [pct, setPct] = useState('10')
  const [price, setPrice] = useState('100')
  const [disc, setDisc] = useState('20')
  const [ra, setRa] = useState('10')
  const [rb, setRb] = useState('5')
  const [cat, setCat] = useState('length')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('km')
  const [val, setVal] = useState('1')
  const units: Record<string, string[]> = {
    length: ['m', 'km', 'cm', 'mm', 'ft', 'in', 'mi'],
    mass: ['kg', 'g', 'lb', 'oz'],
    temperature: ['C', 'F', 'K'],
    speed: ['m/s', 'km/h', 'mph'],
    storage: ['B', 'KB', 'MB', 'GB', 'TB']
  }
  const conv = convertUnit(cat, from, to, parseFloat(val) || 0)
  return (
    <div>
      <h2>Calculators</h2>
      <div className="panel" style={{ marginBottom: 10 }}>
        <div>Percentage</div>
        <input value={pct} onChange={e => setPct(e.target.value)} style={{ ...inputStyle, width: 80 }} />% of
        <input value={pctVal} onChange={e => setPctVal(e.target.value)} style={{ ...inputStyle, width: 80, marginLeft: 6 }} />
        = <strong>{percentage(+pctVal || 0, +pct || 0).toFixed(2)}</strong>
      </div>
      <div className="panel" style={{ marginBottom: 10 }}>
        <div>Discount</div>
        Price <input value={price} onChange={e => setPrice(e.target.value)} style={{ ...inputStyle, width: 80 }} />
        − <input value={disc} onChange={e => setDisc(e.target.value)} style={{ ...inputStyle, width: 60 }} />%
        = <strong>{discount(+price || 0, +disc || 0).final.toFixed(2)}</strong>
      </div>
      <div className="panel" style={{ marginBottom: 10 }}>
        <div>Ratio</div>
        <input value={ra} onChange={e => setRa(e.target.value)} style={{ ...inputStyle, width: 70 }} /> :
        <input value={rb} onChange={e => setRb(e.target.value)} style={{ ...inputStyle, width: 70, marginLeft: 6 }} />
        = <strong>{simplifyRatio(+ra || 0, +rb || 1).a}:{simplifyRatio(+ra || 0, +rb || 1).b}</strong>
      </div>
      <div className="panel">
        <div>Convert</div>
        <select value={cat} onChange={e => { setCat(e.target.value); setFrom(units[e.target.value][0]); setTo(units[e.target.value][1] || units[e.target.value][0]) }} style={inputStyle}>
          {Object.keys(units).map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={val} onChange={e => setVal(e.target.value)} style={{ ...inputStyle, width: 80 }} />
        <select value={from} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>{units[cat].map(u => <option key={u}>{u}</option>)}</select>
        →
        <select value={to} onChange={e => setTo(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>{units[cat].map(u => <option key={u}>{u}</option>)}</select>
        = <strong>{conv !== null ? conv.toFixed(4) : '—'}</strong>
      </div>
    </div>
  )
}

function DateTool() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [iso, setIso] = useState('')
  const [days, setDays] = useState('7')
  const [tz, setTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const diff = a && b ? dateDiff(a, b) : null
  const added = iso ? addDays(iso, +days || 0) : null
  const zones = ['UTC', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney']
  const now = new Date()
  return (
    <div>
      <h2>Date & Time</h2>
      <div className="panel" style={{ marginBottom: 10 }}>
        <div>Difference</div>
        <input type="date" value={a} onChange={e => setA(e.target.value)} style={inputStyle} />
        <input type="date" value={b} onChange={e => setB(e.target.value)} style={inputStyle} />
        {diff && (diff.ok ? <p>{diff.days} days</p> : <p style={{ color: 'var(--accent)' }}>{diff.error}</p>)}
      </div>
      <div className="panel" style={{ marginBottom: 10 }}>
        <div>Add days</div>
        <input type="date" value={iso} onChange={e => setIso(e.target.value)} style={inputStyle} />
        <input value={days} onChange={e => setDays(e.target.value)} style={{ ...inputStyle, width: 70 }} />
        {added && (added.ok ? <p>{added.result}</p> : <p style={{ color: 'var(--accent)' }}>{added.error}</p>)}
      </div>
      <div className="panel">
        <div>Timezone</div>
        <select value={tz} onChange={e => setTz(e.target.value)} style={inputStyle}>
          {zones.map(z => <option key={z}>{z}</option>)}
        </select>
        <p>Local: {now.toLocaleString()}</p>
        <p>UTC: {now.toISOString()}</p>
        <p>{tz}: {now.toLocaleString('en-GB', { timeZone: tz })}</p>
      </div>
    </div>
  )
}

function FileTool() {
  const [content, setContent] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2_000_000) { setErr('File too large (max 2 MB)'); return }
    if (!/\.(txt|md|json|csv)$/i.test(f.name)) { setErr('Supported: .txt, .md, .json, .csv'); return }
    setName(f.name)
    const r = new FileReader()
    r.onload = () => { setContent(String(r.result)); setErr('') }
    r.readAsText(f)
  }
  const dl = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
    a.download = name || 'output.txt'
    a.click()
  }
  return (
    <div>
      <h2>File Tools</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Text, Markdown, JSON, CSV only. Processed locally.</p>
      <input type="file" accept=".txt,.md,.json,.csv" onChange={onFile} style={{ margin: '10px 0' }} />
      {err && <p style={{ color: 'var(--accent)' }}>{err}</p>}
      {name && <p style={{ fontSize: 13 }}>{name}</p>}
      <textarea value={content} onChange={e => setContent(e.target.value)} style={areaStyle} placeholder="Preview…" />
      <button className="btn" onClick={dl} disabled={!content}>Download</button>
    </div>
  )
}

function PassTool() {
  const [len, setLen] = useState(16)
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: false })
  const [pw, setPw] = useState('')
  const gen = () => setPw(generatePassword(len, opts))
  return (
    <div>
      <h2>Password Generator</h2>
      <p style={{ fontSize: 13, color: 'var(--warning)', marginBottom: 8 }}>Generated locally. Not stored. Do not reuse passwords.</p>
      <label>Length <input type="number" min={8} max={64} value={len} onChange={e => setLen(+e.target.value)} style={{ ...inputStyle, width: 70 }} /></label>
      <div style={{ margin: '8px 0' }}>
        {(['upper', 'lower', 'digits', 'symbols'] as const).map(k => (
          <label key={k} style={{ marginRight: 12 }}><input type="checkbox" checked={opts[k]} onChange={e => setOpts({ ...opts, [k]: e.target.checked })} /> {k}</label>
        ))}
      </div>
      <button className="btn btn-primary" onClick={gen}>Generate</button>
      {pw && (
        <div style={{ marginTop: 10 }}>
          <code style={{ fontSize: 16, wordBreak: 'break-all' }}>{pw}</code>
          <button className="btn" style={{ marginLeft: 8 }} onClick={() => navigator.clipboard.writeText(pw)}>Copy</button>
        </div>
      )}
    </div>
  )
}

function ColorTool() {
  const [hex, setHex] = useState('#D9273E')
  const rgb = hexToRgb(hex)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null
  return (
    <div>
      <h2>Colour</h2>
      <input type="color" value={hex} onChange={e => setHex(e.target.value)} style={{ width: 60, height: 40 }} />
      <input value={hex} onChange={e => setHex(e.target.value)} style={{ ...inputStyle, width: 120, marginLeft: 8 }} />
      {rgb && <p>RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>}
      {hsl && <p>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</p>}
      {!rgb && <p style={{ color: 'var(--accent)' }}>Invalid HEX</p>}
    </div>
  )
}
