import { useState, useEffect, useRef } from 'react'
import { Home, Activity, Lightbulb, Camera, Youtube, Network, Settings, Search, User, Menu } from 'lucide-react'
import Overview from './pages/Overview'
import Devices from './pages/Devices'
import Cameras from './pages/Cameras'
import Lighting from './pages/Lighting'
import YouTube from './pages/YouTube'
import ActivityPage from './pages/Activity'
import NetworkPage from './pages/Network'
import SettingsPage from './pages/Settings'

type Page = 'home' | 'activity' | 'devices' | 'cameras' | 'lighting' | 'youtube' | 'network' | 'settings'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState(new Date())
  const [commandOpen, setCommandOpen] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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
    if (reduceMotion && videoRef.current) {
      videoRef.current.pause()
    }
  }, [reduceMotion])

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const nav = [
    { section: 'OVERVIEW', items: [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'activity', label: 'Activity', icon: Activity },
    ]},
    { section: 'SMART HOME', items: [
      { id: 'devices', label: 'Devices', icon: Lightbulb },
      { id: 'cameras', label: 'Cameras', icon: Camera },
      { id: 'lighting', label: 'Lighting', icon: Lightbulb },
    ]},
    { section: 'CREATOR', items: [
      { id: 'youtube', label: 'YouTube', icon: Youtube },
    ]},
    { section: 'SYSTEM', items: [
      { id: 'network', label: 'Network', icon: Network },
      { id: 'settings', label: 'Settings', icon: Settings },
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
      case 'network': return <NetworkPage />
      case 'settings': return <SettingsPage />
      default: return <Overview greeting={greeting} setPage={setPage} />
    }
  }

  return (
    <div className="app">
      <div className="background-scene">
        {!videoFailed && !reduceMotion ? (
          <video
            ref={videoRef}
            src="/media/ferrari-rain.mp4"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
            style={{ opacity: videoFailed ? 0 : 1, transition: 'opacity 0.6s' }}
          />
        ) : null}
        <img
          src="/media/ferrari-fallback.jpg"
          alt=""
          style={{ opacity: videoFailed || reduceMotion ? 1 : 0, transition: 'opacity 0.6s', position: 'absolute', inset: 0 }}
        />
        <div className="background-overlay" />
        {!reduceMotion && <div className="rain-layer" />}
      </div>

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
            <Menu size={18} />
          </button>
          <span className="wordmark">AURORA</span>
          <div className="status-dot" title="Operating normally" />
        </div>
        <div className="topbar-right">
          <span className="hide-mobile">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="hide-mobile">{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <button className="icon-btn" onClick={() => setCommandOpen(true)} aria-label="Search">
            <Search size={18} />
          </button>
          <button className="icon-btn" onClick={() => setPage('settings')} aria-label="Settings">
            <Settings size={18} />
          </button>
          <a href="https://www.youtube.com/@popcorn_party1" target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="YouTube channel">
            <User size={18} />
          </a>
        </div>
      </header>

      <div className="app-shell">
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {nav.map((group) => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className={`nav-item ${page === item.id ? 'active' : ''}`}
                    onClick={() => { setPage(item.id as Page); setSidebarOpen(false) }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <main className="main-content">
          {renderPage()}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {commandOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh'
        }} onClick={() => setCommandOpen(false)}>
          <div className="panel" style={{ width: 420, maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              placeholder="Search or jump to…"
              style={{
                width: '100%', background: 'transparent', border: 'none', color: 'var(--text)',
                fontSize: 16, outline: 'none', padding: '4px 0'
              }}
              onKeyDown={e => { if (e.key === 'Escape') setCommandOpen(false) }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              Try: Home, Cameras, YouTube, Settings
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
