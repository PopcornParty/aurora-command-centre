import { useState, useEffect } from 'react'
import { Home, StickyNote, CheckSquare, Folder, Bookmark, FileText, Calculator as CalcIcon, ArrowLeftRight, Timer as TimerIcon, StopCircle, Type, Braces, Palette, Calendar, Key, FileSearch, Settings, Search, Menu } from 'lucide-react'
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
import { loadJSON } from './lib/storage'

type Page = 'home' | 'tasks' | 'notes' | 'projects' | 'bookmarks' | 'scratchpad' | 'calculator' | 'converter' | 'timer' | 'stopwatch' | 'textutils' | 'json' | 'color' | 'datecalc' | 'password' | 'fileviewer' | 'settings'

const VALID: Page[] = ['home','tasks','notes','projects','bookmarks','scratchpad','calculator','converter','timer','stopwatch','textutils','json','color','datecalc','password','fileviewer','settings']

function getPageFromHash(): Page {
  const h = window.location.hash.replace('#', '') as Page
  return VALID.includes(h) ? h : 'home'
}

export default function App() {
  const [page, setPageState] = useState<Page>(getPageFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const [commandOpen, setCommandOpen] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const settings = loadJSON('aurora-settings', { accent: '#D9273E', overlay: 0.55, reduceMotion: false, clock12: true })
  const base = import.meta.env.BASE_URL || '/'

  const setPage = (p: Page) => {
    setPageState(p)
    window.location.hash = p
    setSidebarOpen(false)
  }

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
      { id: 'bookmarks' as Page, label: 'Bookmarks', icon: Bookmark },
      { id: 'scratchpad' as Page, label: 'Scratchpad', icon: FileText },
    ]},
    { section: 'TOOLS', items: [
      { id: 'calculator' as Page, label: 'Calculator', icon: CalcIcon },
      { id: 'converter' as Page, label: 'Converter', icon: ArrowLeftRight },
      { id: 'timer' as Page, label: 'Timer', icon: TimerIcon },
      { id: 'stopwatch' as Page, label: 'Stopwatch', icon: StopCircle },
      { id: 'textutils' as Page, label: 'Text Utils', icon: Type },
      { id: 'json' as Page, label: 'JSON', icon: Braces },
      { id: 'color' as Page, label: 'Colour', icon: Palette },
      { id: 'datecalc' as Page, label: 'Date Calc', icon: Calendar },
      { id: 'password' as Page, label: 'Password', icon: Key },
      { id: 'fileviewer' as Page, label: 'File Viewer', icon: FileSearch },
    ]},
    { section: 'SYSTEM', items: [
      { id: 'settings' as Page, label: 'Settings', icon: Settings },
    ]},
  ]

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
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu"><Menu size={18} /></button>
          <span className="wordmark">AURORA</span>
        </div>
        <div className="topbar-right">
          <span className="hide-mobile">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: settings.clock12 })}</span>
          <span className="hide-mobile">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <button className="icon-btn" onClick={() => setCommandOpen(true)} aria-label="Search"><Search size={18} /></button>
          <button className="icon-btn" onClick={() => setPage('settings')} aria-label="Settings"><Settings size={18} /></button>
        </div>
      </header>

      <div className="app-shell">
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {nav.map(group => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <button key={item.id} type="button" className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPage(item.id) }} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', font: 'inherit' }}>
                    <Icon size={16} />{item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <main className="main-content">{renderPage()}</main>
      </div>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <nav className="bottom-nav">
        <button className={page==='home'?'active':''} onClick={() => setPage('home')}><Home size={18} /><span>Home</span></button>
        <button className={page==='tasks'?'active':''} onClick={() => setPage('tasks')}><CheckSquare size={18} /><span>Tasks</span></button>
        <button className={page==='notes'?'active':''} onClick={() => setPage('notes')}><StickyNote size={18} /><span>Notes</span></button>
        <button className={page==='projects'?'active':''} onClick={() => setPage('projects')}><Folder size={18} /><span>Projects</span></button>
        <button onClick={() => setSidebarOpen(true)}><Menu size={18} /><span>More</span></button>
      </nav>

      {commandOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh' }} onClick={() => setCommandOpen(false)}>
          <div className="panel" style={{ width: 420, maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <input autoFocus placeholder="Jump to page…" style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 16, outline: 'none', padding: '4px 0' }} onKeyDown={e => {
              if (e.key === 'Escape') setCommandOpen(false)
              if (e.key === 'Enter') {
                const v = (e.target as HTMLInputElement).value.toLowerCase()
                const match = VALID.find(p => p.includes(v) || p === v)
                if (match) setPage(match)
                setCommandOpen(false)
              }
            }} />
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Try: tasks, notes, calculator, settings</div>
          </div>
        </div>
      )}
    </div>
  )
}
