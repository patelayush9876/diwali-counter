import { useState, useEffect, useRef, useCallback } from 'react'

type Event = 'dhanteras' | 'diwali'

const EVENTS = {
  dhanteras: {
    name: 'Dhanteras',
    subtitle: 'Festival of Wealth & Prosperity',
    date: new Date('2026-11-06T00:00:00'),
    dateLabel: '6 November 2026',
    color: 'from-amber-400 to-yellow-500',
  },
  diwali: {
    name: 'Diwali',
    subtitle: 'Festival of Lights',
    date: new Date('2026-11-08T00:00:00'),
    dateLabel: '8 November 2026',
    color: 'from-orange-400 to-amber-500',
  },
}

function getTimeLeft(target: Date) {
  const now = Date.now()
  const diff = Math.max(0, target.getTime() - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Deterministic particles so they don't re-render every second
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  size: 2 + (i % 4),
  dur: `${6 + (i % 8)}s`,
  delay: `-${(i * 1.3) % 10}s`,
  drift: `${((i % 7) - 3) * 30}px`,
  opacity: 0.3 + (i % 5) * 0.1,
  color: i % 3 === 0 ? '#f0c040' : i % 3 === 1 ? '#e07b20' : '#fde68a',
}))

function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            '--dur': p.dur,
            '--delay': p.delay,
            '--drift': p.drift,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function DiayIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* Flame */}
      <g className="flame" style={{ transformOrigin: '24px 14px' }}>
        <ellipse cx="24" cy="10" rx="3.5" ry="7" fill="#fde68a" opacity="0.95" />
        <ellipse cx="24" cy="10" rx="2" ry="4.5" fill="#fff" opacity="0.7" />
        <ellipse cx="24" cy="10" rx="3.5" ry="7" fill="url(#flame-grad)" opacity="0.8" />
        <filter id="f-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </g>
      {/* Glow halo */}
      <ellipse cx="24" cy="12" rx="6" ry="6" fill="#f0c040" opacity="0.15" filter="url(#f-glow)" />
      {/* Diya body */}
      <path d="M10 30 Q12 22 24 22 Q36 22 38 30 Q34 36 24 36 Q14 36 10 30Z" fill="#c0392b" />
      <path d="M10 30 Q12 22 24 22 Q36 22 38 30 Q34 36 24 36 Q14 36 10 30Z" fill="url(#diya-grad)" opacity="0.7" />
      {/* Rim highlight */}
      <path d="M12 29 Q15 24 24 24 Q33 24 36 29" stroke="#fde68a" strokeWidth="1" fill="none" opacity="0.5" />
      {/* Wick */}
      <rect x="23" y="18" width="2" height="6" rx="1" fill="#6b4226" />
      {/* Oil glint */}
      <ellipse cx="19" cy="31" rx="3" ry="1.2" fill="#fff" opacity="0.12" />
      <defs>
        <linearGradient id="flame-grad" x1="24" y1="3" x2="24" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#e07b20" />
        </linearGradient>
        <linearGradient id="diya-grad" x1="10" y1="22" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e07b20" />
          <stop offset="100%" stopColor="#8b2500" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function SmallDiya({ x, y, scale = 1, opacity = 0.7 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      {/* flame */}
      <ellipse cx="0" cy="-10" rx="2.5" ry="5" fill="#fde68a" className="flame" style={{ transformOrigin: '0px -10px' }} />
      <ellipse cx="0" cy="-10" rx="1.5" ry="3" fill="#fff" opacity="0.6" />
      {/* body */}
      <path d="M-9 2 Q-8 -4 0 -4 Q8 -4 9 2 Q6 7 0 7 Q-6 7 -9 2Z" fill="#c0392b" />
      <path d="M-9 2 Q-8 -4 0 -4 Q8 -4 9 2 Q6 7 0 7 Q-6 7 -9 2Z" fill="#e07b20" opacity="0.4" />
      {/* wick */}
      <rect x="-1" y="-7" width="2" height="4" rx="1" fill="#6b4226" />
    </g>
  )
}

function RangoliPattern() {
  const n = 8
  const r = 80
  return (
    <svg
      viewBox="-120 -120 240 240"
      className="absolute inset-0 m-auto w-full h-full rangoli"
      style={{ opacity: 0.06, maxWidth: 320, maxHeight: 320 }}
      aria-hidden
    >
      {Array.from({ length: n }, (_, i) => {
        const angle = (i * 360) / n
        const rad = (angle * Math.PI) / 180
        const x = r * Math.cos(rad)
        const y = r * Math.sin(rad)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="8" fill="none" stroke="#d4a017" strokeWidth="1" />
            <line x1="0" y1="0" x2={x} y2={y} stroke="#d4a017" strokeWidth="0.5" opacity="0.5" />
            <circle cx={x * 0.5} cy={y * 0.5} r="3" fill="none" stroke="#d4a017" strokeWidth="0.8" />
          </g>
        )
      })}
      <circle cx="0" cy="0" r={r} fill="none" stroke="#d4a017" strokeWidth="0.5" strokeDasharray="4 6" />
      <circle cx="0" cy="0" r={r * 0.6} fill="none" stroke="#d4a017" strokeWidth="0.8" />
      <circle cx="0" cy="0" r={r * 0.3} fill="none" stroke="#d4a017" strokeWidth="1" />
      <circle cx="0" cy="0" r="6" fill="#d4a017" opacity="0.5" />
    </svg>
  )
}

function CountdownCard({
  value,
  label,
  isSeconds,
}: {
  value: number
  label: string
  isSeconds?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
      <div
        className={`glass-card w-full flex flex-col items-center justify-center px-4 py-8 sm:py-10 relative overflow-hidden ${isSeconds ? 'card-glow' : ''}`}
        style={{
          boxShadow: isSeconds
            ? undefined
            : '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,160,23,0.1)',
        }}
      >
        {/* subtle inner glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), transparent)' }}
        />
        <span
          className={`font-display font-bold tracking-tight leading-none text-gold-light ${isSeconds ? 'seconds-animate' : ''}`}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(2.8rem, 8vw, 5rem)',
            color: '#f0c040',
            textShadow: '0 0 30px rgba(240,192,64,0.5)',
          }}
        >
          {pad(value)}
        </span>
      </div>
      <span
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          color: 'rgba(253,230,138,0.5)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function App() {
  const [activeEvent, setActiveEvent] = useState<Event>('diwali')
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(EVENTS.dhanteras.date))
  const [key, setKey] = useState(0)
  const eventRef = useRef(activeEvent)
  eventRef.current = activeEvent

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(EVENTS[eventRef.current].date))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeEvent])

  const switchEvent = useCallback((ev: Event) => {
    if (ev === activeEvent) return
    setActiveEvent(ev)
    setTimeLeft(getTimeLeft(EVENTS[ev].date))
    setKey(k => k + 1)
  }, [activeEvent])

  const evt = EVENTS[activeEvent]

  return (
    <div
      className="relative min-h-screen flex flex-col items-center"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% -10%, #1a1030 0%, #0a0d1a 40%, #06080f 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Background star field */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 43 + 7) % 100}%`,
              top: `${(i * 29 + 13) % 100}%`,
              width: i % 4 === 0 ? 2 : 1,
              height: i % 4 === 0 ? 2 : 1,
              background: '#fde68a',
              opacity: 0.05 + (i % 5) * 0.04,
            }}
          />
        ))}
      </div>

      <Particles />

      {/* Rangoli bg decoration */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="relative w-[500px] h-[500px] opacity-60">
          <RangoliPattern />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 flex flex-col items-center py-12 sm:py-16 gap-14">

        {/* Header */}
        <header className="flex flex-col items-center gap-4 text-center">
          <div
            className="relative"
            style={{
              filter: 'drop-shadow(0 0 16px rgba(240,192,64,0.6)) drop-shadow(0 0 40px rgba(240,192,64,0.25))',
            }}
          >
            <DiayIcon size={56} />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <h1
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
                fontWeight: 600,
                color: '#f0c040',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textShadow: '0 0 20px rgba(240,192,64,0.4)',
              }}
            >
              Festival Countdown
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(253,230,138,0.45)',
                letterSpacing: '0.08em',
              }}
            >
              Counting down to the festival of lights
            </p>
          </div>
        </header>

        {/* Event Switcher */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* <div
            className="glass-card flex p-1.5 gap-1.5"
            style={{
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {(['dhanteras', 'diwali'] as Event[]).map(ev => {
              const active = ev === activeEvent
              return (
                <button
                  key={ev}
                  onClick={() => switchEvent(ev)}
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                    fontWeight: active ? 600 : 400,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '10px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: active
                      ? 'linear-gradient(135deg, #d4a017, #e07b20)'
                      : 'transparent',
                    color: active ? '#06080f' : 'rgba(253,230,138,0.5)',
                    boxShadow: active
                      ? '0 0 20px rgba(212,160,23,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                      : 'none',
                  }}
                >
                  {EVENTS[ev].name}
                </button>
              )
            })}
          </div> */}

          {/* Event info */}
          <div key={key} className="fade-slide flex flex-col items-center gap-1 text-center">
            <h2
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(1.5rem, 5vw, 2.4rem)',
                fontWeight: 700,
                color: '#fde68a',
                letterSpacing: '0.06em',
                textShadow: '0 0 30px rgba(253,230,138,0.25)',
              }}
            >
              {evt.name}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(253,230,138,0.45)', letterSpacing: '0.06em' }}>
              {evt.subtitle}
            </p>
            <p
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.78rem',
                color: '#d4a017',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              {evt.dateLabel}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <section className="w-full flex flex-col items-center gap-2">
          {/* Decorative line */}
          <div
            className="w-24 h-px mb-6"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.6), transparent)' }}
          />

          <div key={key + '-countdown'} className="fade-slide w-full">
            <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full">
              <CountdownCard value={timeLeft.days} label="Days" />
              <CountdownCard value={timeLeft.hours} label="Hours" />
              <CountdownCard value={timeLeft.minutes} label="Minutes" />
              <CountdownCard value={timeLeft.seconds} label="Seconds" isSeconds />
            </div>
          </div>

          {/* Decorative line */}
          <div
            className="w-24 h-px mt-6"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.6), transparent)' }}
          />
        </section>

        {/* Diya decorations */}
        <div className="w-full relative flex justify-center pointer-events-none" aria-hidden style={{ height: 60 }}>
          <svg viewBox="0 0 600 60" width="100%" height="60" style={{ overflow: 'visible' }}>
            <defs>
              <filter id="glow-diya">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* glow halos */}
            <ellipse cx="100" cy="40" rx="18" ry="12" fill="#f0c040" opacity="0.08" filter="url(#glow-diya)" />
            <ellipse cx="300" cy="38" rx="20" ry="14" fill="#f0c040" opacity="0.10" filter="url(#glow-diya)" />
            <ellipse cx="500" cy="40" rx="18" ry="12" fill="#f0c040" opacity="0.08" filter="url(#glow-diya)" />

            <SmallDiya x={100} y={40} scale={1.1} />
            <SmallDiya x={220} y={44} scale={0.8} opacity={0.5} />
            <SmallDiya x={300} y={38} scale={1.3} />
            <SmallDiya x={380} y={44} scale={0.8} opacity={0.5} />
            <SmallDiya x={500} y={40} scale={1.1} />
          </svg>
        </div>

        {/* Footer */}
        {/* <footer className="flex flex-col items-center gap-2 pb-4 text-center">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
              color: 'rgba(253,230,138,0.35)',
              letterSpacing: '0.04em',
              lineHeight: 1.6,
            }}
          >
            May your Diwali be filled with light, happiness & prosperity ✨
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem',
              color: 'rgba(253,230,138,0.2)',
              letterSpacing: '0.08em',
            }}
          >
            © 2026 Festival Countdown
          </p>
        </footer> */}
      </div>
    </div>
  )
}
