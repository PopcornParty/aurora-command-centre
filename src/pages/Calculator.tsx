import { useState } from 'react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)

  const input = (d: string) => {
    if (fresh) { setDisplay(d === '.' ? '0.' : d); setFresh(false) }
    else if (d === '.' && display.includes('.')) return
    else setDisplay(display === '0' && d !== '.' ? d : display + d)
  }

  const operate = (next: string) => {
    const n = parseFloat(display)
    if (acc === null) setAcc(n)
    else if (op) {
      const res = calc(acc, n, op)
      setAcc(res); setDisplay(String(res))
    }
    setOp(next); setFresh(true)
  }

  const equals = () => {
    if (acc === null || !op) return
    const res = calc(acc, parseFloat(display), op)
    setDisplay(String(res)); setAcc(null); setOp(null); setFresh(true)
  }

  const calc = (a: number, b: number, o: string) => {
    if (o === '+') return a + b
    if (o === '-') return a - b
    if (o === '×') return a * b
    if (o === '÷') return b === 0 ? NaN : a / b
    return b
  }

  const clear = () => { setDisplay('0'); setAcc(null); setOp(null); setFresh(true) }

  const keys = ['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+']

  return (
    <div>
      <h1 className="page-title">Calculator</h1>
      <div className="panel" style={{ maxWidth: 320, marginTop: 16 }}>
        <div style={{ textAlign: 'right', fontSize: 28, fontFamily: 'var(--font-display)', marginBottom: 12, minHeight: 36 }}>{display}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <button className="btn" onClick={clear} style={{ gridColumn: 'span 4' }}>C</button>
          {keys.map(k => (
            <button key={k} className={`btn ${k==='=' ? 'btn-primary' : ''}`} onClick={() => {
              if ('0123456789.'.includes(k)) input(k)
              else if (k === '=') equals()
              else operate(k)
            }}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
