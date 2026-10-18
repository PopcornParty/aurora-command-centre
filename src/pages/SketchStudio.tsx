import { useState, useRef, useEffect, useCallback } from 'react'

type Tool = 'pencil' | 'brush' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'ellipse'
type Doc = { id: string; name: string; dataUrl: string; updated: number }

const DB_NAME = 'aurora-sketch'
const STORE = 'drawings'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveDoc(doc: Doc): Promise<boolean> {
  try {
    const db = await openDB()
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(doc)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
    })
  } catch { return false }
}

async function loadDocs(): Promise<Doc[]> {
  try {
    const db = await openDB()
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  } catch { return [] }
}

async function deleteDoc(id: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
  } catch { /* ignore */ }
}

export default function SketchStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pencil')
  const [size, setSize] = useState(4)
  const [opacity, setOpacity] = useState(1)
  const [color, setColor] = useState('#ffffff')
  const [bg] = useState('#1a1a1a')
  const [docs, setDocs] = useState<Doc[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [name, setName] = useState('Untitled')
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState('')
  const history = useRef<string[]>([])
  const future = useRef<string[]>([])
  const drawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const snapshot = useRef('')

  useEffect(() => { loadDocs().then(setDocs) }, [])

  const getCtx = () => canvasRef.current?.getContext('2d')

  const pushHistory = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const url = c.toDataURL()
    history.current.push(url)
    if (history.current.length > 20) history.current.shift()
    future.current = []
  }, [])

  const undo = () => {
    const c = canvasRef.current
    const ctx = getCtx()
    if (!c || !ctx || history.current.length < 2) return
    const current = history.current.pop()!
    future.current.push(current)
    const prev = history.current[history.current.length - 1]
    const img = new Image()
    img.onload = () => { ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0); setDirty(true) }
    img.src = prev
  }

  const redo = () => {
    const c = canvasRef.current
    const ctx = getCtx()
    if (!c || !ctx || !future.current.length) return
    const next = future.current.pop()!
    history.current.push(next)
    const img = new Image()
    img.onload = () => { ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0); setDirty(true) }
    img.src = next
  }

  const clear = () => {
    const c = canvasRef.current
    const ctx = getCtx()
    if (!c || !ctx) return
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, c.width, c.height)
    pushHistory()
    setDirty(true)
  }

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = 800 * dpr
    c.height = 500 * dpr
    c.style.width = '100%'
    c.style.maxWidth = '800px'
    c.style.height = 'auto'
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, 800, 500)
    }
    history.current = [c.toDataURL()]
  }, [])

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    const scaleX = 800 / rect.width
    const scaleY = 500 / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const c = canvasRef.current
    if (!c) return
    c.setPointerCapture(e.pointerId)
    drawing.current = true
    const p = pos(e)
    startPos.current = p
    snapshot.current = c.toDataURL()
    const ctx = getCtx()
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    }
    ctx.lineWidth = tool === 'brush' ? size * 2 : tool === 'highlighter' ? size * 3 : size
    ctx.globalAlpha = tool === 'highlighter' ? 0.4 : opacity
  }

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = getCtx()
    const c = canvasRef.current
    if (!ctx || !c) return
    const p = pos(e)
    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, 800, 500)
        ctx.drawImage(img, 0, 0, 800, 500)
        ctx.globalCompositeOperation = 'source-over'
        ctx.strokeStyle = color
        ctx.lineWidth = size
        ctx.globalAlpha = opacity
        if (tool === 'line') {
          ctx.beginPath()
          ctx.moveTo(startPos.current.x, startPos.current.y)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
        } else if (tool === 'rect') {
          ctx.strokeRect(startPos.current.x, startPos.current.y, p.x - startPos.current.x, p.y - startPos.current.y)
        } else {
          const rx = Math.abs(p.x - startPos.current.x) / 2
          const ry = Math.abs(p.y - startPos.current.y) / 2
          const cx = startPos.current.x + (p.x - startPos.current.x) / 2
          const cy = startPos.current.y + (p.y - startPos.current.y) / 2
          ctx.beginPath()
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      img.src = snapshot.current
    } else {
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
  }

  const onUp = () => {
    if (!drawing.current) return
    drawing.current = false
    const ctx = getCtx()
    if (ctx) ctx.globalCompositeOperation = 'source-over'
    pushHistory()
    setDirty(true)
  }

  const save = async () => {
    const c = canvasRef.current
    if (!c) return
    const doc: Doc = { id: currentId || crypto.randomUUID(), name, dataUrl: c.toDataURL('image/png'), updated: Date.now() }
    const ok = await saveDoc(doc)
    if (ok) {
      setCurrentId(doc.id)
      setDirty(false)
      setMsg('Saved')
      setDocs(await loadDocs())
    } else setMsg('Save failed')
    setTimeout(() => setMsg(''), 2000)
  }

  const open = (doc: Doc) => {
    const c = canvasRef.current
    const ctx = getCtx()
    if (!c || !ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, 800, 500)
      ctx.drawImage(img, 0, 0, 800, 500)
      history.current = [c.toDataURL()]
      future.current = []
    }
    img.src = doc.dataUrl
    setCurrentId(doc.id)
    setName(doc.name)
    setDirty(false)
  }

  const newDoc = () => {
    if (dirty && !confirm('Discard unsaved changes?')) return
    setCurrentId(null)
    setName('Untitled')
    clear()
    setDirty(false)
  }

  const exportPng = () => {
    const c = canvasRef.current
    if (!c) return
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.png`
    a.click()
  }

  return (
    <div>
      <h1 className="page-title">Sketch Studio</h1>
      <p className="subtitle">Draw with finger or stylus. Saved locally in your browser.</p>

      <div style={{ display: 'flex', gap: 6, margin: '10px 0', flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <button className="btn" onClick={newDoc}>New</button>
        <button className="btn btn-primary" onClick={save}>Save</button>
        <button className="btn" onClick={exportPng}>Export PNG</button>
      </div>
      {msg && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{msg}</p>}
      {dirty && <p style={{ fontSize: 12, color: 'var(--warning)' }}>Unsaved changes</p>}

      <div className="quick-actions" style={{ marginBottom: 8 }}>
        {(['pencil', 'brush', 'highlighter', 'eraser', 'line', 'rect', 'ellipse'] as Tool[]).map(t => (
          <button key={t} className={`btn ${tool === t ? 'btn-primary' : ''}`} onClick={() => setTool(t)}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 13 }}>Size <input type="range" min={1} max={40} value={size} onChange={e => setSize(+e.target.value)} /></label>
        <label style={{ fontSize: 13 }}>Opacity <input type="range" min={0.1} max={1} step={0.1} value={opacity} onChange={e => setOpacity(+e.target.value)} /></label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <input value={color} onChange={e => setColor(e.target.value)} style={{ ...inputStyle, width: 80 }} />
        <button className="btn" onClick={undo} disabled={history.current.length < 2}>Undo</button>
        <button className="btn" onClick={redo} disabled={!future.current.length}>Redo</button>
        <button className="btn" onClick={clear}>Clear</button>
      </div>

      <div style={{ touchAction: 'none', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: bg }}>
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
        />
      </div>

      <h3 style={{ marginTop: 16 }}>Saved drawings</h3>
      {docs.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>None yet.</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {docs.map(d => (
          <div key={d.id} className="panel" style={{ width: 120, padding: 6 }}>
            <img src={d.dataUrl} alt={d.name} style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 4 }} />
            <div style={{ fontSize: 12, marginTop: 4 }}>{d.name}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <button className="btn" style={{ fontSize: 11 }} onClick={() => open(d)}>Open</button>
              <button className="btn" style={{ fontSize: 11 }} onClick={() => { if (confirm('Delete?')) { deleteDoc(d.id); setDocs(docs.filter(x => x.id !== d.id)) } }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)', fontSize: 14 }
