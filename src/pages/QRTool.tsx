import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

type Mode = 'url' | 'text' | 'contact' | 'wifi'

export default function QRTool() {
  const [mode, setMode] = useState<Mode>('url')
  const [text, setText] = useState('')
  const [ssid, setSsid] = useState('')
  const [pass, setPass] = useState('')
  const [sec, setSec] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [dataUrl, setDataUrl] = useState('')
  const [err, setErr] = useState('')

  const payload = (): string => {
    if (mode === 'url' || mode === 'text') return text.trim()
    if (mode === 'wifi') return `WIFI:T:${sec};S:${ssid};P:${pass};;`
    if (mode === 'contact') {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0']
      if (name) lines.push(`FN:${name}`)
      if (phone) lines.push(`TEL:${phone}`)
      if (email) lines.push(`EMAIL:${email}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    return ''
  }

  useEffect(() => {
    const content = payload()
    if (!content) { setDataUrl(''); setErr(''); return }
    if (content.length > 2000) { setErr('Content too long'); setDataUrl(''); return }
    QRCode.toDataURL(content, { width: size, margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: level })
      .then(url => { setDataUrl(url); setErr('') })
      .catch(() => { setErr('Could not generate QR'); setDataUrl('') })
  }, [text, ssid, pass, sec, name, phone, email, mode, fg, bg, size, level])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  const share = async () => {
    if (!dataUrl || !navigator.share) return
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'qrcode.png', { type: 'image/png' })
      await navigator.share({ files: [file], title: 'QR Code' })
    } catch { /* user cancelled or unsupported */ }
  }

  return (
    <div>
      <h2>QR Code</h2>
      <div className="quick-actions" style={{ marginBottom: 10 }}>
        {(['url', 'text', 'contact', 'wifi'] as Mode[]).map(m => (
          <button key={m} className={`btn ${mode === m ? 'btn-primary' : ''}`} onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>
      {(mode === 'url' || mode === 'text') && (
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'url' ? 'https://…' : 'Any text'} style={areaStyle} />
      )}
      {mode === 'wifi' && (
        <div>
          <input value={ssid} onChange={e => setSsid(e.target.value)} placeholder="Network name" style={inputStyle} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" style={inputStyle} />
          <select value={sec} onChange={e => setSec(e.target.value as typeof sec)} style={inputStyle}>
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
        </div>
      )}
      {mode === 'contact' && (
        <div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={inputStyle} />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" style={inputStyle} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '10px 0' }}>
        <label>Foreground <input type="color" value={fg} onChange={e => setFg(e.target.value)} /></label>
        <label>Background <input type="color" value={bg} onChange={e => setBg(e.target.value)} /></label>
        <label>Size <select value={size} onChange={e => setSize(+e.target.value)} style={{ marginLeft: 4 }}><option value={128}>128</option><option value={256}>256</option><option value={512}>512</option></select></label>
        <label>Error correction <select value={level} onChange={e => setLevel(e.target.value as typeof level)} style={{ marginLeft: 4 }}><option>L</option><option>M</option><option>Q</option><option>H</option></select></label>
      </div>
      {err && <p style={{ color: 'var(--accent)' }}>{err}</p>}
      {dataUrl && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <img src={dataUrl} alt="QR code" style={{ maxWidth: '100%', borderRadius: 8 }} />
          <div className="quick-actions" style={{ marginTop: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={download}>Download PNG</button>
            {typeof navigator !== 'undefined' && 'share' in navigator && <button className="btn" onClick={share}>Share</button>}
          </div>
        </div>
      )}
      {!dataUrl && !err && <p style={{ color: 'var(--text-muted)' }}>Enter content to generate a QR code.</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)', fontSize: 16 }
const areaStyle: React.CSSProperties = { ...inputStyle, minHeight: 80, resize: 'vertical' }
