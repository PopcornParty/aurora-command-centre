import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import {
  createPoker, potTotal, toCall, startHand, action, sidePots, awardPot,
  resetHand, resetTable, setChips, totalChips, type PokerState
} from '../lib/poker'

const KEY = 'aurora-poker'

export default function PokerTable() {
  const [state, setState] = useState<PokerState>(() => loadJSON(KEY, createPoker(['Player 1', 'Player 2', 'Player 3', 'Player 4'])))
  const [betAmt, setBetAmt] = useState(20)
  const [config, setConfig] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { saveJSON(KEY, state) }, [state])

  const doAction = (type: 'check' | 'call' | 'bet' | 'raise' | 'fold') => {
    const r = action(state, state.current, type, betAmt)
    if ('error' in r) { setMsg(r.error); return }
    setState(r)
    setMsg('')
  }

  const start = () => {
    setState(startHand(state))
    setMsg('Hand started')
  }

  const award = (potIdx: number, winnerId: string) => {
    if (!confirm('Award this pot to the selected player?')) return
    const r = awardPot(state, potIdx, winnerId)
    if ('error' in r) { setMsg(r.error); return }
    setState(r)
    setMsg('Pot awarded')
  }

  const pots = sidePots(state)
  const pot = potTotal(state)

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Simulated chips only. No real money.</p>

      <div className="panel" style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pot</div>
        <div style={{ fontSize: 48, fontFamily: 'var(--font-display)' }}>{pot}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total chips in play: {totalChips(state)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {state.players.map((pl, i) => (
          <div key={pl.id} className="panel" style={{ borderTop: `3px solid ${pl.color}`, opacity: pl.folded ? 0.5 : 1, outline: state.current === i && state.phase === 'betting' ? '2px solid var(--accent)' : 'none' }}>
            <div style={{ fontWeight: 600 }}>{pl.name} {pl.folded && <span style={{ color: 'var(--text-muted)' }}>(folded)</span>}</div>
            <div style={{ fontSize: 28 }}>{pl.chips}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>In: {pl.contribution} {toCall(state, i) > 0 && state.phase === 'betting' && `(call ${toCall(state, i)})`}</div>
            <input type="number" value={pl.chips} onChange={e => setState(setChips(state, i, Math.max(0, +e.target.value || 0)))} style={inputStyle} />
          </div>
        ))}
      </div>

      {state.phase === 'betting' && state.handActive && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 8 }}>Turn: <strong>{state.players[state.current]?.name}</strong> — needs {toCall(state, state.current)} to call</div>
          <div className="quick-actions">
            <button className="btn" onClick={() => doAction('check')} disabled={toCall(state, state.current) > 0}>Check</button>
            <button className="btn" onClick={() => doAction('call')} disabled={toCall(state, state.current) === 0}>Call</button>
            <button className="btn" onClick={() => doAction('fold')}>Fold</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input type="number" min={1} value={betAmt} onChange={e => setBetAmt(Math.max(1, +e.target.value || 1))} style={{ ...inputStyle, width: 80 }} />
            <button className="btn btn-primary" onClick={() => doAction(state.currentBet === 0 ? 'bet' : 'raise')}>{state.currentBet === 0 ? 'Bet' : 'Raise'}</button>
          </div>
        </div>
      )}

      {state.phase === 'showdown' && pots.length > 0 && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <h3>Choose winner</h3>
          {pots.map((pt, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div>Pot {i + 1}: {pt.amount} — eligible: {pt.eligible.map(id => state.players.find(p => p.id === id)?.name).join(', ')}</div>
              <div className="quick-actions" style={{ marginTop: 4 }}>
                {pt.eligible.map(id => (
                  <button key={id} className="btn" onClick={() => award(i, id)}>{state.players.find(p => p.id === id)?.name}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {msg && <p style={{ color: 'var(--accent)', fontSize: 13 }}>{msg}</p>}

      <div className="quick-actions" style={{ marginTop: 12 }}>
        {!state.handActive && <button className="btn btn-primary" onClick={start}>New Hand</button>}
        <button className="btn" onClick={() => setState(resetHand(state))}>Reset Hand</button>
        <button className="btn" onClick={() => { if (confirm('Reset table? All chips return to starting amount.')) setState(resetTable(state)) }}>Reset Table</button>
        <button className="btn" onClick={() => setConfig(!config)}>Settings</button>
      </div>

      {config && (
        <div className="panel" style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Starting chips <input type="number" value={state.startingChips} onChange={e => setState({ ...state, startingChips: +e.target.value || 1000 })} style={inputStyle} /></label>
          <label style={{ display: 'block', marginBottom: 6 }}>Small blind <input type="number" value={state.smallBlind} onChange={e => setState({ ...state, smallBlind: +e.target.value || 0 })} style={inputStyle} /></label>
          <label style={{ display: 'block', marginBottom: 6 }}>Big blind <input type="number" value={state.bigBlind} onChange={e => setState({ ...state, bigBlind: +e.target.value || 0 })} style={inputStyle} /></label>
          <label style={{ display: 'block', marginBottom: 6 }}>Ante <input type="number" value={state.ante} onChange={e => setState({ ...state, ante: +e.target.value || 0 })} style={inputStyle} /></label>
          {state.players.map((pl, i) => (
            <input key={pl.id} value={pl.name} onChange={e => setState({ ...state, players: state.players.map((p, j) => j === i ? { ...p, name: e.target.value } : p) })} style={{ ...inputStyle, marginBottom: 4 }} />
          ))}
        </div>
      )}

      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer' }}>Hand history</summary>
        <div style={{ fontSize: 12, maxHeight: 150, overflowY: 'auto', marginTop: 6 }}>
          {state.history.slice(-20).reverse().map((h, i) => (
            <div key={i}>{h.player}: {h.type} {h.amount > 0 ? h.amount : ''} {h.note || ''}</div>
          ))}
          {state.history.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No actions yet</div>}
        </div>
      </details>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, color: 'var(--text)', fontSize: 14 }
