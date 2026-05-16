import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Github, Twitter, Instagram, Youtube, Twitch, Globe,
  MapPin, Eye, Play, Pause, SkipBack, SkipForward, Volume2,
} from 'lucide-react'

const CONFIG = {
  name: 'seunick',
  bio: 'fazendo nada de útil desde sempre',
  location: 'BR',
  avatar: 'https://i.pravatar.cc/150?img=11',
  tags: ['dev', 'noturno'],
  badges: ['⭐', '🎮', '🔥', '💀'],
  socials: [
    { icon: 'github',    label: 'GitHub',    href: 'https://github.com/seuuser' },
    { icon: 'discord',   label: 'Discord',   href: 'https://discord.gg/seuservidor' },
    { icon: 'twitter',   label: 'Twitter',   href: 'https://twitter.com/seuuser' },
    { icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/seuuser' },
    { icon: 'twitch',    label: 'Twitch',    href: 'https://twitch.tv/seuuser' },
    { icon: 'youtube',   label: 'YouTube',   href: '' },
    { icon: 'website',   label: 'Site',      href: '' },
  ],
  profileCard: {
    show: true,
    avatar: 'https://i.pravatar.cc/150?img=11',
    username: 'seuuser#0000',
    status: '🌙 dormindo',
    presence: 'idle', // online | idle | dnd | offline
    href: 'https://discord.com/users/000000000000000000',
  },
  music: {
    show: true,
    tracks: [
      { cover: 'https://i.scdn.co/image/ab67616d0000b2730e58a0f8308c1ad403d105c7', title: 'Звезда',              artist: 'JONY', duration: 197, src: '/zvezda-jony.mp3' },
      { cover: 'https://i.scdn.co/image/ab67616d0000b273a1c37f3fd969287c03482a3e', title: 'Камин (Slowed Reverb)', artist: 'Eibell', duration: 245, src: '/kamin-eibell.mp3' },
      { cover: 'https://i.scdn.co/image/ab67616d0000b2734b7aea8dab816b498e68d0b0', title: 'Это ли счастье',       artist: 'Rauf & Faik', duration: 228, src: '/schastye-rauf-faik.mp3' },
    ],
  },
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}

/* ─── Discord Status Indicator ───────────────────────────────────────────── */
function DiscordPresence({ presence = 'online', size = 15 }) {
  if (presence === 'online') {
    return (
      <span className="presence-dot">
        <svg width={size} height={size} viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="8" fill="#3ba55c" />
        </svg>
      </span>
    )
  }

  if (presence === 'idle') {
    return (
      <span className="presence-dot">
        <svg width={size} height={size} viewBox="0 0 16 16">
          <mask id="idle-mask">
            <rect width="16" height="16" fill="white" />
            <circle cx="4.5" cy="3.5" r="6.5" fill="black" />
          </mask>
          <circle cx="8" cy="8" r="8" fill="#f9a825" mask="url(#idle-mask)" />
        </svg>
      </span>
    )
  }

  if (presence === 'dnd') {
    return (
      <span className="presence-dot">
        <svg width={size} height={size} viewBox="0 0 16 16">
          <mask id="dnd-mask">
            <rect width="16" height="16" fill="white" />
            <rect x="3.2" y="5.5" width="9.6" height="5" rx="2.5" fill="black" />
          </mask>
          <circle cx="8" cy="8" r="8" fill="#ed4245" mask="url(#dnd-mask)" />
        </svg>
      </span>
    )
  }

  // offline / invisible
  return (
    <span className="presence-dot">
      <svg width={size} height={size} viewBox="0 0 16 16">
        <mask id="offline-mask">
          <rect width="16" height="16" fill="white" />
          <circle cx="8" cy="8" r="4.5" fill="black" />
        </mask>
        <circle cx="8" cy="8" r="8" fill="#747f8d" mask="url(#offline-mask)" />
      </svg>
    </span>
  )
}

function SocialIcon({ type }) {
  const map = {
    github: <Github size={18} />, discord: <DiscordIcon />, twitter: <Twitter size={18} />,
    instagram: <Instagram size={18} />, twitch: <Twitch size={18} />,
    youtube: <Youtube size={18} />, website: <Globe size={18} />,
  }
  return map[type] || <Globe size={18} />
}

function fmt(s) {
  const t = Math.max(0, Math.floor(s))
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/* ─── Slider helper ─────────────────────────────────────────────────────── */
function Slider({ value, onChange, color = 'rgba(255,255,255,0.9)' }) {
  const ref = useRef(null)

  function calc(e) {
    const r = ref.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
  }

  function onDown(e) {
    e.preventDefault()
    onChange(calc(e))
    const onMove = ev => onChange(calc(ev))
    const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={ref}
      onMouseDown={onDown}
      style={{
        flex: 1, height: 4, borderRadius: 99,
        background: 'rgba(255,255,255,0.15)',
        position: 'relative', cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${value * 100}%`,
        background: color,
        borderRadius: 99,
      }} />
      <div style={{
        position: 'absolute', top: '50%',
        left: `${value * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: 12, height: 12,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 6px rgba(0,0,0,0.5)',
      }} />
    </div>
  )
}

/* ─── Btn helper ─────────────────────────────────────────────────────────── */
function Btn({ onClick, size = 36, children, primary = false }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        border: primary
          ? '1px solid rgba(255,255,255,0.3)'
          : '1px solid rgba(255,255,255,0.15)',
        background: primary
          ? (hover ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)')
          : (hover ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'),
        color: primary ? '#fff' : (hover ? '#fff' : 'rgba(255,255,255,0.7)'),
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  )
}

/* ─── Music Player ───────────────────────────────────────────────────────── */
function MusicPlayer({ music }) {
  const tracks = music.tracks || []
  const [idx, setIdx]       = useState(0)
  const [playing, setPlay]  = useState(false)
  const [current, setCur]   = useState(0)
  const [volume, setVol]    = useState(0.8)

  const audioRef   = useRef(null)
  const timerRef   = useRef(null)
  const idxRef     = useRef(0)
  const playRef    = useRef(false)

  idxRef.current  = idx
  playRef.current = playing

  const track = tracks[idx] || tracks[0]

  const go = useCallback((n) => {
    clearInterval(timerRef.current)
    setCur(0)
    setIdx(n)
  }, [])

  const next = useCallback(() => go((idxRef.current + 1) % tracks.length), [go, tracks.length])
  const prev = useCallback(() => go((idxRef.current - 1 + tracks.length) % tracks.length), [go, tracks.length])

  useEffect(() => {
    setCur(0)
    if (audioRef.current && track?.src) {
      audioRef.current.volume = volume
      audioRef.current.load()
      if (playRef.current) audioRef.current.play().catch(() => {})
    }
  }, [idx]) // eslint-disable-line

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (playing) {
      if (audioRef.current && track?.src) audioRef.current.play().catch(() => {})
      timerRef.current = setInterval(() => {
        setCur(p => {
          const dur = tracks[idxRef.current]?.duration || 0
          if (p >= dur - 1) { setTimeout(() => go((idxRef.current + 1) % tracks.length), 50); return 0 }
          return p + 1
        })
      }, 1000)
    } else {
      if (audioRef.current) audioRef.current.pause()
    }
    return () => clearInterval(timerRef.current)
  }, [playing, idx]) // eslint-disable-line

  if (!track) return null

  const progress = track.duration > 0 ? current / track.duration : 0

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
      {track.src && <audio ref={audioRef} src={track.src} />}

      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={track.cover} alt="cover" style={{
          width: 54, height: 54, borderRadius: 10, objectFit: 'cover',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            fontSize: 15, fontWeight: 600, color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            letterSpacing: '-0.2px',
          }}>
            {track.title}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {track.artist}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>
          {fmt(current)}
        </span>
        <Slider value={progress} onChange={v => {
          const t = Math.floor(v * track.duration)
          setCur(t)
          if (audioRef.current && track.src) audioRef.current.currentTime = t
        }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(track.duration)}
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Btn onClick={prev} size={34}><SkipBack size={15} /></Btn>
          <Btn onClick={() => setPlay(p => !p)} size={42} primary>
            {playing ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
          </Btn>
          <Btn onClick={next} size={34}><SkipForward size={15} /></Btn>
        </div>
        
        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 85 }}>
          <Volume2 size={15} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <Slider value={volume} onChange={setVol} color="rgba(255,255,255,0.6)" />
        </div>
      </div>
    </div>
  )
}

/* ─── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [views, setViews] = useState(0)

  useEffect(() => {
    const run = async () => { 
      try {
        const ns  = (CONFIG.name || 'default').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()
        const key = 'hv_' + ns
        const visited = localStorage.getItem(key)
        const url = visited
          ? `https://api.counterapi.dev/v1/${ns}/views`
          : `https://api.counterapi.dev/v1/${ns}/views/up`
        const d = await fetch(url).then(r => r.json())
        if (!visited) localStorage.setItem(key, '1')
        if (typeof d?.count === 'number') setViews(d.count)
      } catch {}
    }
    run()
  }, [])

  const socials = CONFIG.socials.filter(s => s.href)

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">

        <div className="views">
          <Eye size={12} />
          <span>{views > 0 ? views.toLocaleString() : '–'}</span>
        </div>

        <div className="av-ring">
          <img src={CONFIG.avatar} alt="av" className="av" />
        </div>

        <h1 className="uname">{CONFIG.name}</h1>

        {CONFIG.badges.length > 0 && (
          <div className="badges">
            {CONFIG.badges.map((b, i) => <span key={i} className="badge">{b}</span>)}
          </div>
        )}

        {CONFIG.tags.length > 0 && (
          <div className="tags">
            {CONFIG.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
          </div>
        )}

        {CONFIG.bio      && <p className="bio">{CONFIG.bio}</p>}
        {CONFIG.location && (
          <div className="loc"><MapPin size={12} /><span>{CONFIG.location}</span></div>
        )}

        {socials.length > 0 && (
          <div className="socials">
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="soc" title={s.label}>
                <SocialIcon type={s.icon} />
              </a>
            ))}
          </div>
        )}

        {CONFIG.profileCard.show && (
          <a href={CONFIG.profileCard.href} target="_blank" rel="noopener noreferrer"
            className="card pcard">
            <div className="pcard-l">
              <div className="pav-wrap">
                <img src={CONFIG.profileCard.avatar} alt="p" className="pav" />
                <DiscordPresence presence={CONFIG.profileCard.presence} />
              </div>
              <div className="ptxt">
                <span className="pname">{CONFIG.profileCard.username}</span>
                <span className="pstatus">{CONFIG.profileCard.status}</span>
              </div>
            </div>
            <span className="pbtn">Profile</span>
          </a>
        )}

        {CONFIG.music.show && <MusicPlayer music={CONFIG.music} />}

      </div>
    </>
  )
}

const CSS = `
  .wrap {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; width: 100%; max-width: 400px;
    position: relative; padding-top: 8px;
  }
  .views {
    position: absolute; top: 0; right: 0;
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px; font-size: 11px;
    color: rgba(255,255,255,0.35); letter-spacing: 0.3px;
  }
  .av-ring {
    width: 88px; height: 88px; border-radius: 50%; padding: 2px;
    background: linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.04));
    margin-top: 24px; box-shadow: 0 0 30px rgba(255,255,255,0.05);
  }
  .av { width:100%; height:100%; border-radius:50%; object-fit:cover; display:block; }
  .uname { font-size:20px; font-weight:600; letter-spacing:-0.4px; color:#fff; margin-top:-4px; }
  .badges { display:flex; gap:4px; align-items:center; margin-top:-6px; }
  .badge {
    font-size:15px; opacity:0.8; cursor:default; user-select:none;
    transition: transform 0.2s, opacity 0.2s;
  }
  .badge:hover { transform:scale(1.35) translateY(-2px); opacity:1; }
  .tags { display:flex; gap:7px; flex-wrap:wrap; justify-content:center; }
  .tag {
    border:1px solid rgba(255,255,255,0.14); border-radius:20px;
    padding:3px 13px; font-size:11px; color:rgba(255,255,255,0.6);
    background:rgba(255,255,255,0.03); transition:border-color 0.2s,color 0.2s;
  }
  .tag:hover { border-color:rgba(255,255,255,0.3); color:rgba(255,255,255,0.9); }
  .bio {
    font-size:12.5px; color:rgba(255,255,255,0.38);
    text-align:center; max-width:260px; line-height:1.6; margin-top:-4px;
  }
  .loc { display:flex; align-items:center; gap:4px; font-size:11px; color:rgba(255,255,255,0.3); margin-top:-6px; }
  .socials { display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:center; }
  .soc {
    width:36px; height:36px; border-radius:50%;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:center;
    color:rgba(255,255,255,0.5); text-decoration:none;
    transition:background 0.2s,color 0.2s,transform 0.2s,border-color 0.2s;
  }
  .soc:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.18); color:#fff; transform:translateY(-3px); }
  .card {
    width:100%; background:rgba(255,255,255,0.035);
    border:1px solid rgba(255,255,255,0.07); border-radius:16px;
    padding:14px 16px; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    transition:background 0.2s,border-color 0.2s,transform 0.2s;
  }
  .card:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.11); transform:translateY(-1px); }
  .pcard { display:flex; align-items:center; justify-content:space-between; text-decoration:none; color:inherit; }
  .pcard-l { display:flex; align-items:center; gap:11px; }
  .pav-wrap { position:relative; width:42px; height:42px; flex-shrink:0; }
  .pav { width:42px; height:42px; border-radius:50%; object-fit:cover; }
  .dot { position:absolute; bottom:0; right:0; width:11px; height:11px; background:#23a55a; border-radius:50%; border:2px solid #080808; }
  .presence-dot {
    position:absolute; bottom:-2px; right:-2px;
    display:block; line-height:0;
    background:#080808; border-radius:50%;
    padding:3px;
  }
  .ptxt { display:flex; flex-direction:column; gap:3px; }
  .pname { font-size:13px; font-weight:500; color:rgba(255,255,255,0.82); }
  .pstatus { font-size:11px; color:rgba(255,255,255,0.3); }
  .pbtn {
    font-size:11.5px; font-weight:500; background:rgba(255,255,255,0.08);
    border:1px solid rgba(255,255,255,0.1); border-radius:8px;
    padding:5px 14px; color:rgba(255,255,255,0.6);
    transition:background 0.2s,color 0.2s; white-space:nowrap;
  }
  .pcard:hover .pbtn { background:rgba(255,255,255,0.15); color:#fff; }
`
