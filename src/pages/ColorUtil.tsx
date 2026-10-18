import { useState } from 'react'

export default function ColorUtil() {
  const [hex, setHex] = useState('#D9273E')
  const valid = /^#[0-9A-Fa-f]{6}$/.test(hex)

  let rgb = ''
  let hsl = ''
  if (valid) {
    const r = parseInt(hex.slice(1,3), 16)
    const g = parseInt(hex.slice(3,5), 16)
    const b = parseInt(hex.slice(5,7), 16)
    rgb = `rgb(${r}, ${g}, ${b})`
    const rr = r/255, gg = g/255, bb = b/255
    const max = Math.max(rr,gg,bb), min = Math.min(rr,gg,bb)
    let h = 0, s = 0, l = (max+min)/2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break
        case gg: h = (bb - rr) / d + 2; break
        case bb: h = (rr - gg) / d + 4; break
      }
      h /= 6
    }
    hsl = `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`
  }

  return (
    <div>
      <h1 className="page-title">Colour Utility</h1>
      <div className="panel" style={{ marginTop: 16, maxWidth: 360 }}>
        <input value={hex} onChange={e => setHex(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)', marginBottom: 12 }} />
        <div style={{ height: 60, borderRadius: 8, background: valid ? hex : '#333', border: '1px solid var(--border)', marginBottom: 12 }} />
        {valid ? (
          <>
            <div>RGB: {rgb}</div>
            <div>HSL: {hsl}</div>
          </>
        ) : <p style={{ color: 'var(--text-muted)' }}>Enter a valid #RRGGBB hex.</p>}
      </div>
    </div>
  )
}
