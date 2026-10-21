export type PokerPlayer = {
  id: string
  name: string
  color: string
  chips: number
  folded: boolean
  contribution: number
  streetBet: number
}

export type SidePot = {
  amount: number
  eligible: string[]
}

export type HistoryEntry = {
  type: 'bet' | 'call' | 'raise' | 'fold' | 'check' | 'manual' | 'payout' | 'blind' | 'ante'
  player: string
  amount: number
  note?: string
}

export type PokerState = {
  players: PokerPlayer[]
  smallBlind: number
  bigBlind: number
  ante: number
  startingChips: number
  dealer: number
  current: number
  currentBet: number
  phase: 'idle' | 'betting' | 'showdown'
  history: HistoryEntry[]
  handActive: boolean
}

const COLORS = ['#D9273E', '#3B82F6', '#22C55E', '#F59E0B']

export function createPoker(names: string[], starting = 1000, sb = 10, bb = 20, ante = 0): PokerState {
  return {
    players: names.slice(0, 4).map((n, i) => ({
      id: `p${i}`,
      name: n || `Player ${i + 1}`,
      color: COLORS[i],
      chips: starting,
      folded: false,
      contribution: 0,
      streetBet: 0
    })),
    smallBlind: sb,
    bigBlind: bb,
    ante,
    startingChips: starting,
    dealer: 0,
    current: 0,
    currentBet: 0,
    phase: 'idle',
    history: [],
    handActive: false
  }
}

export function potTotal(s: PokerState): number {
  return s.players.reduce((sum, p) => sum + p.contribution, 0)
}

export function toCall(s: PokerState, idx: number): number {
  const p = s.players[idx]
  if (!p || p.folded) return 0
  return Math.max(0, s.currentBet - p.streetBet)
}

export function canAct(s: PokerState, idx: number): boolean {
  if (s.phase !== 'betting' || !s.handActive) return false
  const p = s.players[idx]
  return !!p && !p.folded && p.chips > 0 && idx === s.current
}

export function nextActive(s: PokerState, from: number): number {
  const n = s.players.length
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n
    const p = s.players[idx]
    if (!p.folded && p.chips > 0) return idx
  }
  return from
}

export function activePlayers(s: PokerState): PokerPlayer[] {
  return s.players.filter(p => !p.folded)
}

export function startHand(s: PokerState): PokerState {
  const players = s.players.map(p => ({ ...p, folded: false, contribution: 0, streetBet: 0 }))
  const hist: HistoryEntry[] = []
  if (s.ante > 0) {
    for (const p of players) {
      const amt = Math.min(s.ante, p.chips)
      p.chips -= amt
      p.contribution += amt
      hist.push({ type: 'ante', player: p.name, amount: amt })
    }
  }
  const sbIdx = nextActive({ ...s, players }, s.dealer)
  const bbIdx = nextActive({ ...s, players }, sbIdx)
  const post = (idx: number, amt: number) => {
    const p = players[idx]
    const paid = Math.min(amt, p.chips)
    p.chips -= paid
    p.contribution += paid
    p.streetBet += paid
    hist.push({ type: 'blind', player: p.name, amount: paid, note: idx === sbIdx ? 'SB' : 'BB' })
    return paid
  }
  const sbPaid = post(sbIdx, s.smallBlind)
  const bbPaid = post(bbIdx, s.bigBlind)
  const currentBet = Math.max(sbPaid, bbPaid)
  const current = nextActive({ ...s, players }, bbIdx)
  return { ...s, players, currentBet, current, phase: 'betting', handActive: true, history: [...s.history, ...hist] }
}

export function action(s: PokerState, idx: number, type: 'check' | 'call' | 'bet' | 'raise' | 'fold', amount = 0): PokerState | { error: string } {
  if (!canAct(s, idx)) return { error: 'Not this player\u2019s turn or cannot act' }
  const players = s.players.map(p => ({ ...p }))
  const p = players[idx]
  const hist = [...s.history]
  const need = toCall(s, idx)

  if (type === 'fold') {
    p.folded = true
    hist.push({ type: 'fold', player: p.name, amount: 0 })
  } else if (type === 'check') {
    if (need > 0) return { error: 'Cannot check, must call or fold' }
    hist.push({ type: 'check', player: p.name, amount: 0 })
  } else if (type === 'call') {
    const pay = Math.min(need, p.chips)
    p.chips -= pay
    p.contribution += pay
    p.streetBet += pay
    hist.push({ type: 'call', player: p.name, amount: pay })
  } else if (type === 'bet' || type === 'raise') {
    if (amount <= 0) return { error: 'Amount must be positive' }
    const total = need + amount
    if (total > p.chips) return { error: 'Not enough chips' }
    p.chips -= total
    p.contribution += total
    p.streetBet += total
    hist.push({ type, player: p.name, amount: total })
  }

  const next = nextActive({ ...s, players }, idx)
  const stillIn = players.filter(pl => !pl.folded)
  const maxStreet = Math.max(...players.filter(pl => !pl.folded).map(pl => pl.streetBet))
  const allMatched = players.filter(pl => !pl.folded && pl.chips > 0).every(pl => pl.streetBet === maxStreet)
  const onlyOne = stillIn.length <= 1

  let phase = s.phase
  let current = next
  const currentBet = Math.max(...players.map(pl => pl.streetBet))
  if (onlyOne || (allMatched && next === s.dealer)) {
    phase = 'showdown'
    current = -1
  }

  return { ...s, players, current, currentBet, phase, history: hist }
}

export function sidePots(s: PokerState): SidePot[] {
  const contribs = s.players.map(p => ({ id: p.id, amt: p.contribution, folded: p.folded }))
  const levels = [...new Set(contribs.map(c => c.amt))].filter(a => a > 0).sort((a, b) => a - b)
  const pots: SidePot[] = []
  let prev = 0
  for (const level of levels) {
    const eligible = contribs.filter(c => c.amt >= level && !c.folded).map(c => c.id)
    const amount = (level - prev) * contribs.filter(c => c.amt >= level).length
    if (amount > 0 && eligible.length) pots.push({ amount, eligible })
    prev = level
  }
  return pots
}

export function awardPot(s: PokerState, potIdx: number, winnerId: string): PokerState | { error: string } {
  const pots = sidePots(s)
  const pot = pots[potIdx]
  if (!pot) return { error: 'Pot not found' }
  if (!pot.eligible.includes(winnerId)) return { error: 'Player not eligible for this pot' }
  const players = s.players.map(p => p.id === winnerId ? { ...p, chips: p.chips + pot.amount } : { ...p })
  const winner = players.find(p => p.id === winnerId)!
  const hist = [...s.history, { type: 'payout' as const, player: winner.name, amount: pot.amount }]
  return { ...s, players, history: hist }
}

export function resetHand(s: PokerState): PokerState {
  return {
    ...s,
    players: s.players.map(p => ({ ...p, folded: false, contribution: 0, streetBet: 0 })),
    currentBet: 0,
    phase: 'idle',
    handActive: false,
    current: s.dealer
  }
}

export function resetTable(s: PokerState, starting?: number): PokerState {
  const start = starting ?? s.startingChips
  return {
    ...s,
    players: s.players.map(p => ({ ...p, chips: start, folded: false, contribution: 0, streetBet: 0 })),
    startingChips: start,
    currentBet: 0,
    phase: 'idle',
    handActive: false,
    history: [],
    current: 0,
    dealer: 0
  }
}

export function setChips(s: PokerState, idx: number, amount: number): PokerState {
  if (amount < 0) return s
  const players = s.players.map((p, i) => i === idx ? { ...p, chips: amount } : { ...p })
  const hist = [...s.history, { type: 'manual' as const, player: players[idx].name, amount, note: 'manual set' }]
  return { ...s, players, history: hist }
}

export function totalChips(s: PokerState): number {
  return s.players.reduce((sum, p) => sum + p.chips, 0) + potTotal(s)
}
