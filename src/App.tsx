import { useState, useEffect, useCallback } from 'react'
import { Home, StickyNote, CheckSquare, Folder, Bookmark, FileText, Calculator as CalcIcon, ArrowLeftRight, Timer as TimerIcon, StopCircle, Type, Braces, Palette, Calendar, Key, FileSearch, Settings, Search, Menu, X, Trophy, LayoutGrid, Focus, FolderOpen } from 'lucide-react'
import HomePage from './pages/Home'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Projects from './pages/Projects'
import Bookmarks from './pages/Bookmarks'
import Scratchpad from './pages/Scratchpad'
import Calculator from './pages/Calculator'
import Converter from './pages/Converter'
import Timer from './pages/Timer'
import Stopwatch from './pages/Stopwatch'
import TextUtils from './pages/TextUtils'
import JsonFormatter from './pages/JsonFormatter'
import ColorUtil from './pages/ColorUtil'
import DateCalc from './pages/DateCalc'
import PasswordGen from './pages/PasswordGen'
import FileViewer from './pages/FileViewer'
import SettingsPage from './pages/SettingsPage'
import Scoreboard from './pages/Scoreboard'
import CalendarPage from './pages/CalendarPage'
import Kanban from './pages/Kanban'
import FocusMode from './pages/FocusMode'
import FileWorkspace from './pages/FileWorkspace'
import ToolsHub from './pages/ToolsHub'
import Tracker from './pages/Tracker'
import { loadJSON } from './lib/storage'

type Page = 'home' | 'tasks' | 'notes' | 'projects' | 'bookmarks' | 'scratchpad' | 'calculator' | 'converter' | 'timer' | 'stopwatch' | 'textutils' | 'json' | 'color' | 'datecalc' | 'password' | 'fileviewer' | 'settings' | 'scoreboard' | 'calendar' | 'kanban' | 'focus' | 'files' | 'toolshub' | 'tracker'

const VALID: Page[] = ['home','tasks','notes','projects','bookmarks','scratchpad','calculator','converter','timer','stopwatch','textutils','json','color','datecalc','password','fileviewer','settings','scoreboard','calendar','kanban','focus','files','toolshub','tracker']

const PAGE_LABELS: Record<Page, string> = {
  home: 'Home', tasks: 'Tasks', notes: 'Notes', projects: 'Projects', bookmarks: 'Bookmarks',
  scratchpad: 'Scratchpad', calculator: 'Calculator', converter: 'Converter', timer: 'Timer',
  stopwatch: 'Stopwatch', textutils: 'Text Utils', json: 'JSON', color: 'Colour',
  datecalc: 'Date Calc', password: 'Password', fileviewer: 'File Viewer', settings: 'Settings',
  scoreboard: 'Scoreboard', calendar: 'Calendar', kanban: 'Kanban', focus: 'Focus', files: 'Files', toolshub: 'Tools Hub', tracker: 'Tracker'
}

function getPageFromHash(): Page {
  const h = window.location.hash.replace('#', '') as Page
  return VALID.includes(h) ? h : 'home'
}

export default function App() {
  const [page, setPageState] = useState<Page>(getPageFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const [commandOpen, setCommandOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const [reduceMotion, setReduceMotion] = useState(false)
  const settings = loadJSON('aurora-settings', { accent: '#D9273E', overlay: 0.55, reduceMotion: false, clock12: true })
  const base = import.meta.env.BASE_URL || '/'

  const setPage = useCallback((p: Page) => {
    setPageState(p)
    window.location.hash = p
    setSidebarOpen(false)
    setCommandOpen(false)
    setCmdQuery('')
  }, [])

  useEffect(() => {
    const onHash = () => setPageState(getPageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches || settings.reduceMotion)
    const handler = () => setReduceMotion(mq.matches || settings.reduceMotion)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.reduceMotion])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accent || '#D9273E')
    document.documentElement.style.setProperty('--overlay', String(settings.overlay ?? 0.55))
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [settings, reduceMotion])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        setCommandOpen(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const nav = [
    { section: 'COMMAND', items: [
      { id: 'home' as Page, label: 'Home', icon: Home },
    ]},
    { section: 'PRODUCTIVITY', items: [
      { id: 'tasks' as Page, label: 'Tasks', icon: CheckSquare },
      { id: 'notes' as Page, label: 'Notes', icon: StickyNote },
      { id: 'projects' as Page, label: 'Projects', icon: Folder },
      { id: 'tracker' as Page, label: 'Tracker', icon: Folder },
      { id: 'kanban' as Page, label: 'Kanban', icon: LayoutGrid },
      { id: 'calendar' as Page, label: 'Calendar', icon: Calendar },
      { id: 'bookmarks' as Page, label: 'Bookmarks', icon: Bookmark },
      { id: 'scratchpad' as Page, label: 'Scratchpad', icon: FileText },
    ]},
    { section: 'SPORTS', items: [
      { id: 'scoreboard' as Page, label: 'Scoreboard', icon: Trophy },
    ]},
    { section: 'TOOLS', items: [
      { id: 'toolshub' as Page, label: 'Tools Hub', icon: Search },
      { id: 'calculator' as Page, label: 'Calculator', icon: CalcIcon },
      { id: 'converter' as Page, label: 'Converter', icon: ArrowLeftRight },
      { id: 'timer' as Page, label: 'Timer', icon: TimerIcon },
      { id: 'stopwatch' as Page, label: 'Stopwatch', icon: StopCircle },
      { id: 'focus' as Page, label: 'Focus', icon: Focus },
      { id: 'textutils' as Page, label: 'Text Utils', icon: Type },
      { id: 'json' as Page, label: 'JSON', icon: Braces },
      { id: 'color' as Page, label: 'Colour', icon: Palette },
      { id: 'datecalc' as Page, label: 'Date Calc', icon: Calendar },
      { id: 'password' as Page, label: 'Password', icon: Key },
      { id: 'fileviewer' as Page, label: 'File Viewer', icon: FileSearch },
      { id: 'files' as Page, label: 'Files', icon: FolderOpen },
    ]},
    { section: 'SYSTEM', items: [
      { id: 'settings' as Page, label: 'Settings', icon: Settings },
    ]},
  ]

  const filteredPages = VALID.filter(p => PAGE_LABELS[p].toLowerCase().includes(cmdQuery.toLowerCase()) || p.includes(cmdQuery.toLowerCase()))

  type SearchHit = { type: string; label: string; page: Page }
  const searchHits: SearchHit[] = (() => {
    if (!cmdQuery.trim()) return []
    const q = cmdQuery.toLowerCase()
    const hits: SearchHit[] = filteredPages.map(p => ({ type: 'Page', label: PAGE_LABELS[p], page: p }))
    try {
      const tracker = loadJSON<{ projects?: { name: string }[] }>('aurora-tracker', { projects: [] })
      for (const proj of tracker.projects || []) {
        if (proj.name?.toLowerCase().includes(q)) hits.push({ type: 'Project', label: proj.name, page: 'tracker' })
      }
      const notes = loadJSON<{ title?: string }[]>('aurora-notes', [])
      for (const n of notes) {
        if (n.title?.toLowerCase().includes(q)) hits.push({ type: 'Note', label: n.title || 'Untitled', page: 'notes' })
      }
      const tasks = loadJSON<{ text?: string }[]>('aurora-tasks', [])
      for (const t of tasks) {
        if (t.text?.toLowerCase().includes(q)) hits.push({ type: 'Task', label: t.text || '', page: 'tasks' })
      }
    } catch { /* ignore */ }
    return hits.slice(0, 12)
  })()

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage greeting={greeting} setPage={setPage} />
      case 'tasks': return <Tasks />
      case 'notes': return <Notes />
      case 'projects': return <Projects />
      case 'bookmarks': return <Bookmarks />
      case 'scratchpad': return <Scratchpad />
      case 'calculator': return <Calculator />
      case 'converter': return <Converter />
      case 'timer': return <Timer />
      case 'stopwatch': return <Stopwatch />
      case 'textutils': return <TextUtils />
      case 'json': return <JsonFormatter />
      case 'color': return <ColorUtil />
      case 'datecalc': return <DateCalc />
      case 'password': return <PasswordGen />
      case 'fileviewer': return <FileViewer />
      case 'settings': return <SettingsPage />
      case 'scoreboard': return <Scoreboard />
      case 'calendar': return <CalendarPage />
      case 'kanban': return <Kanban />
      case 'focus': return <FocusMode />
      case 'files': return <FileWorkspace />
      case 'toolshub': return <ToolsHub />
      case 'tracker': return <Tracker />
      default: return <HomePage greeting={greeting} setPage={setPage} />
    }
  }

  return (
    <div className="app">
      <div className="background-scene">
        <img src={`${base}media/IMG_0281.jpeg`} alt="Ferrari night rain" style={{ opacity: 1, position: 'absolute', inset: 0, objectFit: 'cover', objectPosition: 'center 40%' }} />
        <div className="background-overlay" />
        {!reduceMotion && <div className="rain-layer" />}
      </div>

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={() => setSidebarOpen(s => !s)} aria-label={sidebarOpen ? 'Close menu' : 'Open menu'} aria-expanded={sidebarOpen}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="wordmark">AURORA</span>
        </div>
        <div className="topbar-right">
          <span className="hide-mobile">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings.clock12 })}</span>
          <span className="hide-mobile">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <button className="icon-btn" onClick={() => setCommandOpen(true)} aria-label="Search"><Search size={18} /></button>
          <button className="icon-btn" onClick={() => setPage('settings')} aria-label="Settings"><Settings size={18} /></button>
        </div>
      </header>

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-hidden={!sidebarOpen}>
        {nav.map(group => (
          <div key={group.section}>
            <div className="nav-section">{group.section}</div>
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                  aria-label={item.label}
                >
                  <Icon size={16} />{item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="app-shell">
        <main className="main-content">{renderPage()}</main>
      </div>

      <nav className="bottom-nav">
        <button className={page==='home'?'active':''} onClick={() => setPage('home')}><Home size={18} /><span>Home</span></button>
        <button className={page==='tasks'?'active':''} onClick={() => setPage('tasks')}><CheckSquare size={18} /><span>Tasks</span></button>
        <button className={page==='scoreboard'?'active':''} onClick={() => setPage('scoreboard')}><Trophy size={18} /><span>Score</span></button>
        <button className={page==='calendar'?'active':''} onClick={() => setPage('calendar')}><Calendar size={18} /><span>Cal</span></button>
        <button onClick={() => setSidebarOpen(true)} aria-label="More"><Menu size={18} /><span>More</span></button>
      </nav>

      {commandOpen && (
        <div className="command-overlay" onClick={() => setCommandOpen(false)}>
          <div className="panel command-panel" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={cmdQuery}
              onChange={e => setCmdQuery(e.target.value)}
              placeholder="Search pages, projects, notes…"
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 16, outline: 'none', padding: '8px 0' }}
              onKeyDown={e => {
                if (e.key === 'Escape') setCommandOpen(false)
                if (e.key === 'Enter' && searchHits[0]) setPage(searchHits[0].page)
              }}
            />
            <div style={{ marginTop: 8, maxHeight: 280, overflowY: 'auto' }}>
              {searchHits.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No matches</p>}
              {searchHits.map((h, i) => (
                <button key={i} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }} onClick={() => setPage(h.page)}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 6 }}>{h.type}</span>{h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
