import { useState, useEffect, useRef } from 'react'
import { Home, Activity, Lightbulb, Camera, Youtube, Network, Settings, Search, User, Menu, StickyNote, CheckSquare, Calculator as CalcIcon, ArrowLeftRight, Timer as TimerIcon, FileText, Bookmark, BarChart3 } from 'lucide-react'
import Overview from './pages/Overview'
import Devices from './pages/Devices'
import Cameras from './pages/Cameras'
import Lighting from './pages/Lighting'
import YouTube from './pages/YouTube'
import ActivityPage from './pages/Activity'
import SettingsPage from './pages/SettingsPage'
import Notes from './pages/Notes'
import Tasks from './pages/Tasks'
import Calculator from './pages/Calculator'
import Converter from './pages/Converter'
import Timer from './pages/Timer'
import Scratchpad from './pages/Scratchpad'
import Bookmarks from './pages/Bookmarks'
import ChannelStats from './pages/ChannelStats'
import SystemMonitor from './pages/SystemMonitor'

type Page = 'home' | 'activity' | 'devices' | 'cameras' | 'lighting' | 'youtube' | 'stats' | 'network' | 'settings' | 'notes' | 'tasks' | 'calculator' | 'converter' | 'timer' | 'scratchpad' | 'bookmarks'

const VALID: Page[] = ['home','activity','devices','cameras','lighting','youtube','stats','network','settings','notes','tasks','calculator','converter','timer','scratchpad','bookmarks']

function getPageFromHash(): Page {
  const h = window.location.hash.replace('#', '') as Page
  return VALID.includes(h) ? h : 'home'
}

export default function App() {
  const [page, setPageState] = useState<Page>(getPageFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const [commandOpen, setCommandOpen] = useState(false)
  const [videoFailed, setVideoFailed] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
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
    setReduceMotion(mq.matches)
    const handler = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reduceMotion && videoRef.current) videoRef.current.pause()
  }, [reduceMotion])

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const nav = [
    { section: 'OVERVIEW', items: [
      { id: 'home' as Page, label: 'Home', icon: Home },
      { id: 'activity' as Page, label: 'Activity', icon: Activity },
    ]},
    { section: 'TOOLS', items: [
      { id: 'notes' as Page, label: 'Notes', icon: StickyNote },
      { id: 'tasks' as Page, label: 'Tasks', icon: CheckSquare },
      { id: 'calculator' as Page, label: 'Calculator', icon: CalcIcon },
      { id: 'converter' as Page, label: 'Converter', icon: ArrowLeftRight },
      { id: 'timer' as Page, label: 'Timer', icon: TimerIcon },
      { id: 'scratchpad' as Page, label: 'Scratchpad', icon: FileText },
      { id: 'bookmarks' as Page, label: 'Bookmarks', icon: Bookmark },
    ]},
    { section: 'CREATOR', items: [
      { id: 'stats' as Page, label: 'Channel Stats', icon: BarChart3 },
      { id: 'youtube' as Page, label: 'YouTube Ideas', icon: Youtube },
    ]},
    { section: 'SMART HOME', items: [
      { id: 'devices' as Page, label: 'Devices', icon: Lightbulb },
      { id: 'cameras' as Page, label: 'Cameras', icon: Camera },
      { id: 'lighting' as Page, label: 'Lighting', icon: Lightbulb },
    ]},
    { section: 'SYSTEM', items: [
      { id: 'network' as Page, label: 'System Monitor', icon: Network },
      { id: 'settings' as Page, label: 'Settings', icon: Settings },
    ]},
  ]

  const renderPage = () => {
    switch (page) {
      case 'home': return <Overview greeting={greeting} setPage={setPage} />
      case 'activity': return <ActivityPage />
      case 'devices': return <Devices />
      case 'cameras': return <Cameras />
      case 'lighting': return <Lighting />
      case 'youtube': return <YouTube />
      case 'stats': return <ChannelStats />
      case 'network': return <SystemMonitor />
      case 'settings': return <SettingsPage />
      case 'notes': return <Notes />
      case 'tasks': return <Tasks />
      case 'calculator': return <Calculator />
      case 'converter': return <Converter />
      case 'timer': return <Timer />
      case 'scratchpad': return <Scratchpad />
      case 'bookmarks': return <Bookmarks />
      default: return <Overview greeting={greeting} setPage={setPage} />
    }
  }

  return (
    <div className="app">
      <div className="background-scene">
        {!videoFailed && !reduceMotion ? (
          <video ref={videoRef} src={`${base}media/ferrari-rain.mp4`} autoPlay muted loop playsInline onError={() => setVideoFailed(true)} style={{ opacity: videoFailed ? 0 : 1, transition: 'opacity 0.6s' }} />
        ) : null}
        <img src={`${base}media/IMG_0281.jpeg`} alt="Ferrari night rain" style={{ opacity: 1, position: 'absolute', inset: 0, objectFit: 'cover', objectPosition: 'center 40%' }} />
        <div className="background-overlay" />
        {!reduceMotion && <div className="rain-layer" />}
      </div>

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu"><Menu size={18} /></button>
          <span className="wordmark">AURORA</span>
          <div className="status-dot" title="Operating normally" />
        </div>
        <div className="topbar-right">
          <span className="hide-mobile">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="hide-mobile">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <button className="icon-btn" onClick={() => setCommandOpen(true)} aria-label="Search"><Search size={18} /></button>
          <button className="icon-btn" onClick={() => setPage('settings')} aria-label="Settings"><Settings size={18} /></button>
          <a href="https://www.youtube.com/@popcorn_party1" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="YouTube channel"><User size={18} /></a>
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
                  <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                    <Icon size={16} />{item.label}
                  </div>
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
        <button className={page==='notes'?'active':''} onClick={() => setPage('notes')}><StickyNote size={18} /><span>Notes</span></button>
        <button className={page==='tasks'?'active':''} onClick={() => setPage('tasks')}><CheckSquare size={18} /><span>Tasks</span></button>
        <button className={page==='stats'?'active':''} onClick={() => setPage('stats')}><BarChart3 size={18} /><span>Stats</span></button>
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
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Try: notes, tasks, stats, calculator, settings</div>
          </div>
        </div>
      )}
    </div>
  )
}
