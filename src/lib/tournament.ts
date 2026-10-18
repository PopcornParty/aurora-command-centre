export type Format = 'knockout' | 'league' | 'groups'
export type MatchStatus = 'upcoming' | 'in-progress' | 'completed' | 'bye'

export type Participant = { id: string; name: string }

export type TMatch = {
  id: string
  round: number
  slot: number
  a: string | null
  b: string | null
  scoreA: number | null
  scoreB: number | null
  winner: string | null
  status: MatchStatus
  nextId: string | null
  nextSlot: 'a' | 'b' | null
  group?: number
}

export type Tournament = {
  id: string
  name: string
  format: Format
  participants: Participant[]
  matches: TMatch[]
  groups?: string[][]
  qualifyPerGroup?: number
  winPoints: number
  drawPoints: number
  lossPoints: number
  created: number
}

export type Standing = {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  scored: number
  conceded: number
  diff: number
  points: number
}

export function nextPowerOf2(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

export function generateKnockout(participants: Participant[]): TMatch[] {
  const n = participants.length
  if (n < 2) return []
  const size = nextPowerOf2(n)
  const byes = size - n
  const rounds = Math.log2(size)
  const matches: TMatch[] = []
  let matchCount = size / 2

  for (let r = 0; r < rounds; r++) {
    for (let s = 0; s < matchCount; s++) {
      const id = `r${r}-s${s}`
      const nextId = r < rounds - 1 ? `r${r + 1}-s${Math.floor(s / 2)}` : null
      const nextSlot: 'a' | 'b' = s % 2 === 0 ? 'a' : 'b'
      matches.push({
        id, round: r, slot: s,
        a: null, b: null,
        scoreA: null, scoreB: null, winner: null,
        status: 'upcoming',
        nextId, nextSlot
      })
    }
    matchCount /= 2
  }

  const first = matches.filter(m => m.round === 0)
  let pi = 0
  for (let i = 0; i < byes && pi < n; i++) {
    first[i].a = participants[pi++].id
    first[i].b = null
    first[i].status = 'bye'
    first[i].winner = first[i].a
  }
  for (let i = byes; i < first.length && pi < n; i++) {
    first[i].a = participants[pi++].id
    if (pi < n) first[i].b = participants[pi++].id
  }

  return advanceByes(matches)
}

function advanceByes(matches: TMatch[]): TMatch[] {
  const m = matches.map(x => ({ ...x }))
  for (const match of m) {
    if (match.status === 'bye' && match.winner && match.nextId) {
      const next = m.find(x => x.id === match.nextId)
      if (next && match.nextSlot) {
        if (match.nextSlot === 'a') next.a = match.winner
        else next.b = match.winner
      }
    }
  }
  return m
}

export function generateLeague(participants: Participant[]): TMatch[] {
  const matches: TMatch[] = []
  const ids = participants.map(p => p.id)
  let slot = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      matches.push({
        id: `rr-${slot}`,
        round: 0,
        slot: slot++,
        a: ids[i],
        b: ids[j],
        scoreA: null,
        scoreB: null,
        winner: null,
        status: 'upcoming',
        nextId: null,
        nextSlot: null
      })
    }
  }
  return matches
}

export function generateGroups(participants: Participant[], numGroups: number, _qualify: number): { groups: string[][]; matches: TMatch[] } {
  const groups: string[][] = Array.from({ length: numGroups }, () => [])
  participants.forEach((p, i) => groups[i % numGroups].push(p.id))

  const matches: TMatch[] = []
  let slot = 0
  groups.forEach((g, gi) => {
    for (let i = 0; i < g.length; i++) {
      for (let j = i + 1; j < g.length; j++) {
        matches.push({
          id: `g${gi}-${slot}`,
          round: 0,
          slot: slot++,
          a: g[i],
          b: g[j],
          scoreA: null,
          scoreB: null,
          winner: null,
          status: 'upcoming',
          nextId: null,
          nextSlot: null,
          group: gi
        })
      }
    }
  })
  return { groups, matches }
}

export function setResult(matches: TMatch[], matchId: string, scoreA: number, scoreB: number, allowDraw: boolean): TMatch[] {
  const m = matches.map(x => ({ ...x }))
  const match = m.find(x => x.id === matchId)
  if (!match || match.status === 'bye') return m
  if (scoreA < 0 || scoreB < 0 || !Number.isFinite(scoreA) || !Number.isFinite(scoreB)) return m
  if (!match.a || !match.b) return m

  if (match.winner && match.nextId) {
    clearDownstream(m, match.nextId, match.nextSlot)
  }

  match.scoreA = scoreA
  match.scoreB = scoreB
  if (scoreA > scoreB) {
    match.winner = match.a
    match.status = 'completed'
  } else if (scoreB > scoreA) {
    match.winner = match.b
    match.status = 'completed'
  } else if (allowDraw) {
    match.winner = null
    match.status = 'completed'
  } else {
    match.winner = null
    match.status = 'in-progress'
    return m
  }

  if (match.winner && match.nextId && match.nextSlot) {
    const next = m.find(x => x.id === match.nextId)
    if (next) {
      if (match.nextSlot === 'a') next.a = match.winner
      else next.b = match.winner
    }
  }
  return m
}

function clearDownstream(matches: TMatch[], matchId: string | null, slot: 'a' | 'b' | null) {
  if (!matchId) return
  const match = matches.find(x => x.id === matchId)
  if (!match) return
  if (slot === 'a') match.a = null
  else if (slot === 'b') match.b = null
  match.scoreA = null
  match.scoreB = null
  match.winner = null
  match.status = 'upcoming'
  if (match.nextId) clearDownstream(matches, match.nextId, match.nextSlot)
}

export function clearResult(matches: TMatch[], matchId: string): TMatch[] {
  const m = matches.map(x => ({ ...x }))
  const match = m.find(x => x.id === matchId)
  if (!match || match.status === 'bye') return m
  if (match.nextId) clearDownstream(m, match.nextId, match.nextSlot)
  match.scoreA = null
  match.scoreB = null
  match.winner = null
  match.status = 'upcoming'
  return m
}

export function standings(participants: Participant[], matches: TMatch[], groupIds?: string[], rules = { win: 3, draw: 1, loss: 0 }): Standing[] {
  const ids = groupIds || participants.map(p => p.id)
  const map = new Map<string, Standing>()
  ids.forEach(id => {
    const p = participants.find(x => x.id === id)
    map.set(id, { id, name: p?.name || id, played: 0, won: 0, drawn: 0, lost: 0, scored: 0, conceded: 0, diff: 0, points: 0 })
  })

  for (const match of matches) {
    if (match.status !== 'completed' || match.scoreA === null || match.scoreB === null) continue
    if (!match.a || !match.b) continue
    if (groupIds && (!groupIds.includes(match.a) || !groupIds.includes(match.b))) continue
    const a = map.get(match.a)
    const b = map.get(match.b)
    if (!a || !b) continue
    a.played++; b.played++
    a.scored += match.scoreA; a.conceded += match.scoreB
    b.scored += match.scoreB; b.conceded += match.scoreA
    if (match.scoreA > match.scoreB) {
      a.won++; b.lost++
      a.points += rules.win; b.points += rules.loss
    } else if (match.scoreB > match.scoreA) {
      b.won++; a.lost++
      b.points += rules.win; a.points += rules.loss
    } else {
      a.drawn++; b.drawn++
      a.points += rules.draw; b.points += rules.draw
    }
  }

  const list = Array.from(map.values())
  list.forEach(s => { s.diff = s.scored - s.conceded })
  list.sort((a, b) => b.points - a.points || b.diff - a.diff || b.scored - a.scored || a.name.localeCompare(b.name))
  return list
}

export function champion(matches: TMatch[]): string | null {
  const final = matches.filter(m => m.nextId === null).sort((a, b) => b.round - a.round)[0]
  return final?.status === 'completed' ? final.winner : null
}

export function countByes(matches: TMatch[]): number {
  return matches.filter(m => m.status === 'bye').length
}

export function bracketSize(n: number): number {
  return nextPowerOf2(n)
}
