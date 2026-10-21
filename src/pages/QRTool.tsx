import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

type Mode = 'url' | 'text' | 'wifi' | 'contact' | 'email' | 'sms' | 'phone' | 'geo' | 'event' | 'custom'
type Level = 'L' | 'M' | 'Q' | 'H'

const PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Inverted', fg: '#ffffff', bg: '#000000' },
  { name: 'Aurora', fg: '#D9273E', bg: '#0d0d0d' },
  { name: 'Ocean', fg: '#0ea5e9', bg: '#f0f9ff' },
  { name: 'Forest', fg: '#16a34a', bg: '#f0fdf4' },
  { name: 'Sunset', fg: '#ea580c', bg: '#fff7ed' },
  { name: 'Purple', fg: '#7c3aed', bg: '#faf5ff' },
  { name: 'Gold', fg: '#ca8a04', bg: '#1c1917' },
  { name: 'Pink', fg: '#db2777', bg: '#fdf2f8' },
  { name: 'Teal', fg: '#0d9488', bg: '#f0fdfa' },
  { name: 'High contrast', fg: '#000000', bg: '#ffff00' },
  { name: 'Soft', fg: '#334155', bg: '#f8fafc' },
]

const SIZES = [128, 192, 256, 384, 512, 768, 1024]
const MARGINS = [0, 1, 2, 3, 4, 6, 8]
const LEVELS: Level[] = ['L', 'M', 'Q', 'H']

export default function QRTool() {
  const [mode, setMode] = useState<Mode>('url')
  const [text, setText] = useState('')
  const [ssid, setSsid] = useState('')
  const [pass, setPass] = useState('')
  const [sec, setSec] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [hidden, setHidden] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [custom, setCustom] = useState('')
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [size, setSize] = useState(512)
  const [level, setLevel] = useState<Level>('M')
  const [margin, setMargin] = useState(2)
  const [dataUrl, setDataUrl] = useState('')
  const [svg, setSvg] = useState('')
  const [err, setErr] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(0.2)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const payload = (): string => {
    if (mode === 'url' || mode === 'text') return text.trim()
    if (mode === 'wifi') return `WIFI:T:${sec};S:${ssid};P:${pass};H:${hidden ? 'true' : 'false'};;`
    if (mode === 'contact') {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0']
      if (name) lines.push(`FN:${name}`)
      if (phone) lines.push(`TEL:${phone}`)
      if (email) lines.push(`EMAIL:${email}`)
      if (org) lines.push(`ORG:${org}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    if (mode === 'email') return `mailto:${email}${subject || body ? '?' : ''}${subject ? `subject=${encodeURIComponent(subject)}` : ''}${subject && body ? '&' : ''}${body ? `body=${encodeURIComponent(body)}` : ''}`
    if (mode === 'sms') return `sms:${phone}${body ? `?body=${encodeURIComponent(body)}` : ''}`
    if (mode === 'phone') return `tel:${phone}`
    if (mode === 'geo') return `geo:${lat},${lng}`
    if (mode === 'event') {
      const fmt = (d: string) => d.replace(/[-:]/g, '').replace('T', '')
      return `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${fmt(eventStart)}\nDTEND:${fmt(eventEnd)}\nEND:VEVENT`
    }
    if (mode === 'custom') return custom
    return ''
  }

  useEffect(() => {
    const content = payload()
    if (!content) { setDataUrl(''); setSvg(''); setErr(''); return }
    if (content.length > 2500) { setErr('Content too long (max ~2500 chars)'); setDataUrl(''); setSvg(''); return }
    const opts = { width: size, margin, color: { dark: fg, light: bg }, errorCorrectionLevel: level }
    Promise.all([
      QRCode.toDataURL(content, opts),
      QRCode.toString(content, { ...opts, type: 'svg' })
    ]).then(([url, svgStr]) => {
      setDataUrl(url)
      setSvg(svgStr)
      setErr('')
      if (logo && canvasRef.current) drawWithLogo(url, logo)
    }).catch(() => { setErr('Could not generate QR'); setDataUrl(''); setSvg('') })
  }, [text, ssid, pass, sec, hidden, name, phone, email, org, subject, body, lat, lng, eventTitle, eventStart, eventEnd, custom, mode, fg, bg, size, level, margin, logo, logoSize])

  const drawWithLogo = (qrUrl: string, logoUrl: string) => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      c.width = size
      c.height = size
      ctx.drawImage(img, 0, 0, size, size)
      const logoImg = new Image()
      logoImg.onload = () => {
        const s = size * logoSize
        const x = (size - s) / 2
        const y = (size - s) / 2
        ctx.fillStyle = bg
        ctx.fillRect(x - 4, y - 4, s + 8, s + 8)
        ctx.drawImage(logoImg, x, y, s, s)
        setDataUrl(c.toDataURL('image/png'))
      }
      logoImg.src = logoUrl
    }
    img.src = qrUrl
  }

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setErr('Logo must be an image'); return }
    const r = new FileReader()
    r.onload = () => setLogo(String(r.result))
    r.readAsDataURL(f)
  }

  const download = (type: 'png' | 'svg') => {
    if (type === 'png' && dataUrl) {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'qrcode.png'
      a.click()
    } else if (type === 'svg' && svg) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      a.download = 'qrcode.svg'
      a.click()
    }
  }

  const share = async () => {
    if (!dataUrl || !navigator.share) return
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'qrcode.png', { type: 'image/png' })
      await navigator.share({ files: [file], title: 'QR Code' })
    } catch { /* cancelled */ }
  }

  const applyPreset = (p: typeof PRESETS[0]) => { setFg(p.fg); setBg(p.bg) }

  return (
    <div>
      <h2>QR Code</h2>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Local generation. Nothing is sent anywhere.</p>

      <div className="quick-actions" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
        {(['url', 'text', 'wifi', 'contact', 'email', 'sms', 'phone', 'geo', 'event', 'custom'] as Mode[]).map(m => (
          <button key={m} className={`btn ${mode === m ? 'btn-primary' : ''}`} onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>

      {(mode === 'url' || mode === 'text') && <textarea value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'url' ? 'https://\u2026' : 'Any text'} style={areaStyle} />}
      {mode === 'wifi' && (
        <div>
          <input value={ssid} onChange={e => setSsid(e.target.value)} placeholder="Network name" style={inputStyle} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" style={inputStyle} />
          <select value={sec} onChange={e => setSec(e.target.value as typeof sec)} style={inputStyle}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option></select>
          <label style={{ fontSize: 13 }}><input type="checkbox" checked={hidden} onChange={e => setHidden(e.target.checked)} /> Hidden network</label>
        </div>
      )}
      {mode === 'contact' && (
        <div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={inputStyle} />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" style={inputStyle} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Organisation" style={inputStyle} />
        </div>
      )}
      {mode === 'email' && (
        <div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="To" style={inputStyle} />
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" style={inputStyle} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Body" style={areaStyle} />
        </div>
      )}
      {mode === 'sms' && (
        <div>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Number" style={inputStyle} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Message" style={areaStyle} />
        </div>
      )}
      {mode === 'phone' && <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" style={inputStyle} />}
      {mode === 'geo' && (
        <div>
          <input value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" style={inputStyle} />
          <input value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" style={inputStyle} />
        </div>
      )}
      {mode === 'event' && (
        <div>
          <input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event title" style={inputStyle} />
          <input type="datetime-local" value={eventStart} onChange={e => setEventStart(e.target.value)} style={inputStyle} />
          <input type="datetime-local" value={eventEnd} onChange={e => setEventEnd(e.target.value)} style={inputStyle} />
        </div>
      )}
      {mode === 'custom' && <textarea value={custom} onChange={e => setCustom(e.target.value)} placeholder="Any custom payload" style={areaStyle} />}

      <h3 style={{ marginTop: 14, fontSize: 14 }}>Style</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {PRESETS.map(p => (
          <button key={p.name} className="btn" style={{ fontSize: 12, borderColor: p.fg }} onClick={() => applyPreset(p)}>{p.name}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <label>Foreground <input type="color" value={fg} onChange={e => setFg(e.target.value)} /></label>
        <input value={fg} onChange={e => setFg(e.target.value)} style={{ ...inputStyle, width: 90, margin: 0 }} />
        <label>Background <input type="color" value={bg} onChange={e => setBg(e.target.value)} /></label>
        <input value={bg} onChange={e => setBg(e.target.value)} style={{ ...inputStyle, width: 90, margin: 0 }} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <label>Size <select value={size} onChange={e => setSize(+e.target.value)} style={inputStyle}>{SIZES.map(s => <option key={s} value={s}>{s}px</option>)}</select></label>
        <label>Error correction <select value={level} onChange={e => setLevel(e.target.value as Level)} style={inputStyle}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></label>
        <label>Margin <select value={margin} onChange={e => setMargin(+e.target.value)} style={inputStyle}>{MARGINS.map(m => <option key={m} value={m}>{m}</option>)}</select></label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 13 }}>Logo (optional) <input type="file" accept="image/*" onChange={onLogo} /></label>
        {logo && <label style={{ marginLeft: 10, fontSize: 13 }}>Logo size <input type="range" min={0.1} max={0.35} step={0.05} value={logoSize} onChange={e => setLogoSize(+e.target.value)} /></label>}
        {logo && <button className="btn" style={{ marginLeft: 8 }} onClick={() => setLogo(null)}>Remove logo</button>}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Error correction: L (7%), M (15%), Q (25%), H (30%). Higher allows more damage but makes a denser code. Logo works best with Q or H.</p>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {err && <p style={{ color: 'var(--accent)' }}>{err}</p>}
      {dataUrl && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <img src={dataUrl} alt="QR code" style={{ maxWidth: '100%', borderRadius: 8, background: bg }} />
          <div className="quick-actions" style={{ marginTop: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => download('png')}>Download PNG</button>
            <button className="btn" onClick={() => download('svg')}>Download SVG</button>
            {typeof navigator !== 'undefined' && 'share' in navigator && <button className="btn" onClick={share}>Share</button>}
          </div>
        </div>
      )}
      {!dataUrl && !err && <p style={{ color: 'var(--text-muted)' }}>Enter content to generate a QR code.</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 16 }
const areaStyle: React.CSSProperties = { ...inputStyle, minHeight: 70, resize: 'vertical' }
