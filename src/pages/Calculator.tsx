import { useState, useEffect, useCallback } from 'react'

type Token = string

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let num = ''
  for (const ch of expr.replace(/\s/g, '')) {
    if ('0123456789.'.includes(ch)) {
      num += ch
    } else if ('+-\u00d7\u00f7*/%'.includes(ch)) {
      if (num) { tokens.push(num); num = '' }
      tokens.push(ch === '*' ? '\u00d7' : ch === '/' ? '\u00f7' : ch)
    }
  }
  if (num) tokens.push(num)
  return tokens
}

function evaluate(tokens: Token[]): number {
  if (!tokens.length) return NaN
  const t = [...tokens]
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '%') {
      const prev = parseFloat(t[i - 1] || '0')
      t.splice(i - 1, 2, String(prev / 100))
      i--
    }
  }
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '\u00d7' || t[i] === '\u00f7') {
      const a = parseFloat(t[i - 1])
      const b = parseFloat(t[i + 1])
      const res = t[i] === '\u00d7' ? a * b : (b === 0 ? NaN : a / b)
      t.splice(i - 1, 3, String(res))
      i--
    }
  }
  let result = parseFloat(t[0])
  for (let i = 1; i < t.length; i += 2) {
    const op = t[i]
    const b = parseFloat(t[i + 1])
    if (op === '+') result += b
    else if (op === '-') result -= b
  }
  return result
}

function formatResult(n: number): string {
  if (!isFinite(n)) return 'Error'
  const s = n.toPrecision(12)
  return String(parseFloat(s))
}

export default function Calculator() {
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [justEvaluated, setJustEvaluated] = useState(false)

  const display = result !== null ? result : (expr || '0')

  const append = useCallback((ch: string) => {
    setResult(null)
    if (justEvaluated && '0123456789.'.includes(ch)) {
      setExpr(ch === '.' ? '0.' : ch)
      setJustEvaluated(false)
      return
    }
    setJustEvaluated(false)
    if (ch === '.' && (expr === '' || /[+\-\u00d7\u00f7]$/.test(expr))) {
      setExpr(expr + '0.')
      return
    }
    if (ch === '.' && /\.\d*$/.test(expr.split(/[+\-\u00d7\u00f7]/).pop() || '')) return
    if ('+-\u00d7\u00f7'.includes(ch) && (expr === '' || /[+\-\u00d7\u00f7]$/.test(expr))) {
      if (expr === '' && ch === '-') setExpr('-')
      else if (/[+\-\u00d7\u00f7]$/.test(expr)) setExpr(expr.slice(0, -1) + ch)
      return
    }
    setExpr(expr + ch)
  }, [expr, justEvaluated])

  const doEquals = useCallback(() => {
    if (!expr) return
    try {
      const tokens = tokenize(expr)
      if (!tokens.length) return
      const res = evaluate(tokens)
      const formatted = formatResult(res)
      setResult(formatted)
      setExpr(formatted === 'Error' ? '' : formatted)
      setJustEvaluated(true)
    } catch {
      setResult('Error')
      setExpr('')
      setJustEvaluated(true)
    }
  }, [expr])

  const clear = () => { setExpr(''); setResult(null); setJustEvaluated(false) }
  const del = () => {
    if (result !== null) { clear(); return }
    setExpr(expr.slice(0, -1))
  }
  const sign = () => {
    if (result !== null) {
      const n = parseFloat(result)
      if (!isNaN(n)) { setResult(String(-n)); setExpr(String(-n)); setJustEvaluated(true) }
      return
    }
    const parts = expr.split(/([+\-\u00d7\u00f7])/)
    if (parts.length === 1) setExpr(expr.startsWith('-') ? expr.slice(1) : '-' + expr)
    else {
      const last = parts[parts.length - 1]
      parts[parts.length - 1] = last.startsWith('-') ? last.slice(1) : '-' + last
      setExpr(parts.join(''))
    }
  }
  const percent = () => {
    if (result !== null) {
      const n = parseFloat(result) / 100
      setResult(formatResult(n)); setExpr(formatResult(n)); setJustEvaluated(true)
      return
    }
    append('%')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') append(e.key)
      else if (e.key === '.') append('.')
      else if (e.key === '+') append('+')
      else if (e.key === '-') append('-')
      else if (e.key === '*' || e.key === 'x' || e.key === 'X') append('\u00d7')
      else if (e.key === '/') append('\u00f7')
      else if (e.key === '%') percent()
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); doEquals() }
      else if (e.key === 'Backspace') del()
      else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [append, doEquals, expr, result])

  const keys = [
    ['C', '\u00b1', '%', '\u00f7'],
    ['7', '8', '9', '\u00d7'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '\u232b', '=']
  ]

  const handle = (k: string) => {
    if (k === 'C') clear()
    else if (k === '\u00b1') sign()
    else if (k === '%') percent()
    else if (k === '\u232b') del()
    else if (k === '=') doEquals()
    else append(k)
  }

  return (
    <div>
      <h1 className="page-title">Calculator</h1>
      <div className="panel" style={{ maxWidth: 320, marginTop: 16 }}>
        <div style={{
          textAlign: 'right',
          fontSize: result !== null ? 32 : 22,
          fontFamily: 'var(--font-display)',
          marginBottom: 4,
          minHeight: 48,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          wordBreak: 'break-all'
        }}>{display}</div>
        {result === null && expr && (
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, minHeight: 18 }}>
            {expr}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {keys.flat().map(k => (
            <button
              key={k}
              className={`btn ${k === '=' ? 'btn-primary' : ''}`}
              style={{ minHeight: 48, fontSize: 16 }}
              onClick={() => handle(k)}
            >{k}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
