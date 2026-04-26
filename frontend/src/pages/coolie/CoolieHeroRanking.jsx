import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { useApp } from '../../context/AppContext'
import {
    Trophy, Star, Zap, Flame, TrendingUp, Lock, CheckCircle,
    X, Share2, ChevronRight, Medal, Crown, Gift, Target, Clock
} from 'lucide-react'

// ─── LEAGUE CONFIG ────────────────────────────────────────────────────────────
const LEAGUES = [
    { name: 'Bronze',  icon: '🥉', color: '#cd7f32', glow: 'rgba(205,127,50,0.4)',  minXP: 0,     maxXP: 999,   tiers: 5, tierXP: 200,  reward: 'Profile badge + visible rank' },
    { name: 'Silver',  icon: '🥈', color: '#c0c0c0', glow: 'rgba(192,192,192,0.4)', minXP: 1000,  maxXP: 2999,  tiers: 5, tierXP: 400,  reward: 'Priority in customer search results' },
    { name: 'Gold',    icon: '🥇', color: '#ffd700', glow: 'rgba(255,215,0,0.4)',   minXP: 3000,  maxXP: 5999,  tiers: 5, tierXP: 600,  reward: '"Verified Pro" green tag on profile' },
    { name: 'Diamond', icon: '💎', color: '#b9f2ff', glow: 'rgba(185,242,255,0.4)', minXP: 6000,  maxXP: 9999,  tiers: 5, tierXP: 800,  reward: 'Access to premium high-value trips' },
    { name: 'Master',  icon: '👑', color: '#a855f7', glow: 'rgba(168,85,247,0.4)',  minXP: 10000, maxXP: 14999, tiers: 3, tierXP: 1667, reward: '₹50 platform bonus per completed trip' },
    { name: 'Legend',  icon: '🔥', color: '#ff4d4d', glow: 'rgba(255,77,77,0.4)',   minXP: 15000, maxXP: Infinity, tiers: 1, tierXP: 0, reward: 'Homepage feature + ₹100 bonus per trip' },
]

// ─── ACHIEVEMENTS LIST ────────────────────────────────────────────────────────
const ALL_ACHIEVEMENTS = [
    // Earnings
    { id: 'tip_1k',      icon: '💰', title: 'Tip Collector',   desc: 'Earn ₹1,000 in tips total',          xp: 200,  cat: 'Earnings', condVal: 1000,  condField: 'totalTips',   status: 'unlocked',    progress: 100, unlockedAt: 'Feb 12, 2024' },
    { id: 'tip_10k',     icon: '💵', title: 'Money Magnet',    desc: 'Earn ₹10,000 in tips total',         xp: 500,  cat: 'Earnings', condVal: 10000, condField: 'totalTips',   status: 'in-progress', progress: 32  },
    { id: 'income_50k',  icon: '🤑', title: 'Big Earner',      desc: 'Earn ₹50,000 total income',          xp: 1000, cat: 'Earnings', condVal: 50000, condField: 'income',      status: 'locked',      progress: 0   },
    // Trips
    { id: 'first_trip',  icon: '👣', title: 'First Step',      desc: 'Complete your 1st trip',              xp: 50,   cat: 'Trips',    condVal: 1,     condField: 'trips',       status: 'unlocked',    progress: 100, unlockedAt: 'Jan 5, 2024' },
    { id: '29_club',     icon: '⚡', title: '29 Club',         desc: 'Complete exactly 29 trips',           xp: 290,  cat: 'Trips',    condVal: 29,    condField: 'trips',       status: 'unlocked',    progress: 100, unlockedAt: 'Mar 1, 2024' },
    { id: 'veteran',     icon: '🎖️', title: 'Station Veteran', desc: 'Complete 50 trips',                   xp: 400,  cat: 'Trips',    condVal: 50,    condField: 'trips',       status: 'unlocked',    progress: 100, unlockedAt: 'Mar 20, 2024' },
    { id: 'century',     icon: '💯', title: 'Century',         desc: 'Complete 100 trips',                  xp: 1000, cat: 'Trips',    condVal: 100,   condField: 'trips',       status: 'unlocked',    progress: 100, unlockedAt: 'Apr 2, 2024' },
    { id: 'legend_500',  icon: '🏛️', title: 'Legend Porter',   desc: 'Complete 500 trips',                  xp: 5000, cat: 'Trips',    condVal: 500,   condField: 'trips',       status: 'in-progress', progress: 25  },
    // Ratings
    { id: 'first_5star', icon: '⭐', title: 'Good Start',      desc: 'Get your first 5-star rating',        xp: 50,   cat: 'Ratings',  condVal: 1,     condField: 'fiveStars',   status: 'unlocked',    progress: 100, unlockedAt: 'Jan 6, 2024' },
    { id: '50_five',     icon: '🌟', title: 'Crowd Favourite', desc: 'Receive 50 five-star ratings',        xp: 400,  cat: 'Ratings',  condVal: 50,    condField: 'fiveStars',   status: 'in-progress', progress: 62  },
    { id: 'perfect_30',  icon: '👑', title: 'Perfect Score',   desc: 'Maintain 5.0 rating for 30 days',    xp: 800,  cat: 'Ratings',  condVal: 30,    condField: 'perfStreak',  status: 'locked',      progress: 0   },
    // Speed & Special
    { id: 'speed',       icon: '⚡', title: 'Speed Demon',     desc: 'Complete a trip in under 5 minutes', xp: 100,  cat: 'Speed',    condVal: 1,     condField: 'fastTrips',   status: 'unlocked',    progress: 100, unlockedAt: 'Feb 3, 2024' },
    { id: 'heavy',       icon: '🏋️', title: 'Heavy Lifter',    desc: 'Carry 500 kg cumulative luggage',    xp: 300,  cat: 'Special',  condVal: 500,   condField: 'luggageKg',   status: 'in-progress', progress: 74  },
    { id: 'night_owl',   icon: '🦉', title: 'Night Owl',       desc: 'Complete 10 trips after midnight',   xp: 250,  cat: 'Special',  condVal: 10,    condField: 'nightTrips',  status: 'in-progress', progress: 40  },
    // Streaks
    { id: 'on_fire',     icon: '🔥', title: 'On Fire',         desc: '7-day working streak',               xp: 350,  cat: 'Streaks',  condVal: 7,     condField: 'streak',      status: 'unlocked',    progress: 100, unlockedAt: 'Apr 10, 2024' },
    { id: 'unstoppable', icon: '⚡', title: 'Unstoppable',     desc: '30-day working streak',              xp: 1500, cat: 'Streaks',  condVal: 30,    condField: 'streak',      status: 'locked',      progress: 0   },
    // Ranking
    { id: 'league_master', icon: '🏆', title: 'League Master', desc: 'Reach Master League',               xp: 2000, cat: 'Ranking',  condVal: 1,     condField: 'league',      status: 'locked',      progress: 0   },
]

// ─── LEADERBOARD MOCK ─────────────────────────────────────────────────────────
const LEADERBOARD = [
    { rank: 1,  name: 'Vikram Singh',  id: 'CHL-0021', weeklyXP: 2150, league: 'Diamond', tier: 1, isMe: false },
    { rank: 2,  name: 'Suresh Nair',   id: 'CHL-1143', weeklyXP: 1890, league: 'Diamond', tier: 2, isMe: false },
    { rank: 3,  name: 'Arjun Patil',   id: 'CHL-2298', weeklyXP: 1720, league: 'Gold',    tier: 1, isMe: false },
    { rank: 4,  name: 'Mohan Das',     id: 'CHL-3310', weeklyXP: 1540, league: 'Gold',    tier: 2, isMe: false },
    { rank: 5,  name: 'Ravi Sharma',   id: 'CHL-4102', weeklyXP: 1420, league: 'Gold',    tier: 3, isMe: false },
    { rank: 6,  name: 'You',           id: 'CHL-4821', weeklyXP: 820,  league: 'Gold',    tier: 2, isMe: true  },
    { rank: 7,  name: 'Dinesh Rao',    id: 'CHL-5533', weeklyXP: 790,  league: 'Silver',  tier: 1, isMe: false },
    { rank: 8,  name: 'Kishan Mehta',  id: 'CHL-6144', weeklyXP: 650,  league: 'Silver',  tier: 2, isMe: false },
    { rank: 9,  name: 'Prakash Iyer',  id: 'CHL-7821', weeklyXP: 580,  league: 'Silver',  tier: 3, isMe: false },
    { rank: 10, name: 'Anand Gupta',   id: 'CHL-8932', weeklyXP: 520,  league: 'Bronze',  tier: 1, isMe: false },
]

const PRIZES = { 1: '₹500 bonus', 2: '₹300 bonus', 3: '₹200 bonus' }

// ─── MOCK COOLIE DATA ─────────────────────────────────────────────────────────
const MOCK = {
    name: 'You', id: 'CHL-4821', league: 'Gold', tier: 2,
    lifetimeXP: 4350, weeklyXP: 820, trips: 127, rating: 4.8,
    totalTips: 3200, totalIncome: 18400, streak: 12,
    memberSince: 'Jan 2024', fiveStars: 31, luggageKg: 370,
}

function getLeagueConfig(name) { return LEAGUES.find(l => l.name === name) || LEAGUES[0] }
function getNextTierXP(league, tier) {
    const l = getLeagueConfig(league)
    if (league === 'Legend') return null
    const nextLeague = LEAGUES[LEAGUES.indexOf(l) + 1]
    if (tier === 1) return nextLeague ? nextLeague.minXP : null
    return l.minXP + (l.tiers - tier + 1) * l.tierXP
}
function getCurrentTierXP(league, tier) {
    const l = getLeagueConfig(league)
    return l.minXP + (l.tiers - tier) * l.tierXP
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1800, prefix = '', suffix = '' }) {
    const [val, setVal] = useState(0)
    const ref = useRef(null)
    useEffect(() => {
        const start = performance.now()
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setVal(Math.floor(eased * target))
            if (p < 1) ref.current = requestAnimationFrame(step)
        }
        ref.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(ref.current)
    }, [target, duration])
    return <span>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>
}

// ─── COUNTDOWN TIMER ─────────────────────────────────────────────────────────
function useCountdown() {
    const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
    useEffect(() => {
        const calc = () => {
            const now = new Date()
            const next = new Date(now)
            next.setDate(now.getDate() + (1 - now.getDay() + 7) % 7 || 7)
            next.setHours(0, 1, 0, 0)
            const diff = next - now
            setTime({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            })
        }
        calc()
        const id = setInterval(calc, 1000)
        return () => clearInterval(id)
    }, [])
    return time
}

// ─── LEAGUE BADGE ─────────────────────────────────────────────────────────────
function LeagueBadge({ league, tier, size = 'sm' }) {
    const cfg = getLeagueConfig(league)
    const pad = size === 'lg' ? 'px-4 py-2' : 'px-2 py-1'
    const text = size === 'lg' ? 'text-base' : 'text-xs'
    return (
        <span className={`inline-flex items-center gap-1.5 ${pad} rounded-full font-bold ${text}`}
            style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}66`, color: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }}>
            {cfg.icon} {league}{tier > 1 ? ` ${tier}` : ''}
        </span>
    )
}

// ─── ACHIEVEMENT MODAL ────────────────────────────────────────────────────────
function AchievementModal({ ach, onClose }) {
    if (!ach) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
            <div className="relative w-full max-w-sm rounded-2xl p-6 text-center"
                style={{ background: '#12102a', border: '1px solid #ffd70066', boxShadow: '0 0 40px rgba(255,215,0,0.2)' }}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white"><X size={18} /></button>
                <div className="text-6xl mb-3">{ach.icon}</div>
                <h3 className="text-xl font-bold text-white mb-1">{ach.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{ach.desc}</p>
                <div className="flex justify-center gap-4 mb-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">XP Earned</p>
                        <p className="text-lg font-bold text-yellow-400">+{ach.xp} XP</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Unlocked</p>
                        <p className="text-lg font-bold text-green-400">{ach.unlockedAt}</p>
                    </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#7B2FFF,#a855f7)' }}>
                    <Share2 size={15} /> Share Achievement
                </button>
            </div>
        </div>
    )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const FILTER_CATS = ['All', 'Earnings', 'Trips', 'Ratings', 'Speed', 'Special', 'Streaks', 'Ranking']
const TABS = ['Achievements', 'Leaderboard', 'Rewards', 'League Map']

export default function CoolieHeroRanking() {
    const { user } = useApp()
    const [activeTab, setActiveTab] = useState('Achievements')
    const [achFilter, setAchFilter] = useState('All')
    const [selectedAch, setSelectedAch] = useState(null)
    const countdown = useCountdown()

    const [loading, setLoading] = useState(true)
    const [coolieData, setCoolieData] = useState(null)
    const [achievements, setAchievements] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [leaguesConfig, setLeaguesConfig] = useState(LEAGUES)
    const [activeLeagueIdx, setActiveLeagueIdx] = useState(0)

    useEffect(() => {
        if (!user?.id) return;
        const fetchData = async () => {
            try {
                // In a real app we'd fetch from actual endpoints. For UI demo we use mock if fail.
                const profRes = await fetch(`/api/v1/rankings/profile/${user.id}`).catch(() => null)
                const achRes = await fetch(`/api/v1/rankings/achievements/${user.id}`).catch(() => null)
                const leadRes = await fetch(`/api/v1/rankings/leaderboard/weekly`).catch(() => null)
                
                if (profRes && profRes.ok) {
                    const data = await profRes.json()
                    setCoolieData(data.data)
                } else {
                    setCoolieData({ ...MOCK, name: user?.name || MOCK.name })
                }
                
                if (achRes && achRes.ok) {
                    const achData = await achRes.json()
                    setAchievements(achData.data)
                } else {
                    setAchievements(ALL_ACHIEVEMENTS)
                }
                
                if (leadRes && leadRes.ok) {
                    const leadData = await leadRes.json()
                    setLeaderboard(leadData.data.leaderboard)
                } else {
                    setLeaderboard(LEADERBOARD)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user?.id])

    if (loading || !coolieData) {
        return <div className="min-h-screen hero-rank-page flex items-center justify-center text-white" style={{ background: '#08080f' }}>Loading Hero Rankings...</div>
    }

    const coolie = { ...MOCK, ...coolieData } // Fallback merges
    const leagueCfg = getLeagueConfig(coolie.league)
    const currentTierXP = getCurrentTierXP(coolie.league, coolie.tier)
    const nextTierXP = getNextTierXP(coolie.league, coolie.tier) || coolie.lifetimeXP
    const xpProgress = Math.min(((coolie.lifetimeXP - currentTierXP) / (nextTierXP - currentTierXP)) * 100, 100)
    const xpToNext = nextTierXP - coolie.lifetimeXP

    const filteredAch = achFilter === 'All'
        ? achievements
        : achievements.filter(a => a.cat === achFilter)

    const leagueIdx = leaguesConfig.findIndex(l => l.name === coolie.league)

    return (
        <>
            <style>{`
                .hero-rank-page { font-family: 'Rajdhani', sans-serif !important; }
                .hero-rank-page h1, .hero-rank-page h2, .hero-rank-page .orbitron { font-family: 'Orbitron', sans-serif !important; }
                .xp-bar-fill { box-shadow: 8px 0 20px currentColor; }
                .ach-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .ach-card:hover { transform: translateY(-4px); }
                .league-node { transition: all 0.2s ease; }
                .league-node:hover { transform: scale(1.03); }
                .tab-fade { animation: tabFadeIn 0.25s ease; }
                @keyframes tabFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .shimmer { background: linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 50%,transparent 100%); background-size:200% 100%; animation: shimmer 2s infinite; }
                @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
                .glow-pulse { animation: glowPulse 2s ease-in-out infinite; }
                @keyframes glowPulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
                .stat-card:hover { border-color: var(--league-color) !important; }
            `}</style>

            <div className="flex min-h-screen hero-rank-page" style={{ background: '#08080f' }}>
                <Sidebar role="coolie" />

                <main className="flex-1 md:ml-64 relative overflow-x-hidden">
                    {/* Ambient Orbs */}
                    <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle,${leagueCfg.glow} 0%,transparent 70%)`, pointerEvents: 'none', zIndex: 0, filter: 'blur(60px)' }} />
                    <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle,rgba(123,47,255,0.25) 0%,transparent 70%)`, pointerEvents: 'none', zIndex: 0, filter: 'blur(60px)' }} />

                    <div className="relative z-10 p-4 md:p-8 space-y-6 max-w-6xl mx-auto">

                        {/* ══ PAGE HEADER ══ */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${leagueCfg.color}22`, border: `1px solid ${leagueCfg.color}44` }}>
                                <Trophy size={20} style={{ color: leagueCfg.color }} />
                            </div>
                            <div>
                                <h1 className="orbitron text-xl md:text-2xl font-black text-white leading-tight">Hero Rankings</h1>
                                <p className="text-xs text-gray-500">Your gamified journey as a CoolieSeva porter</p>
                            </div>
                        </div>

                        {/* ══ SECTION 1 — PROFILE CARD ══ */}
                        <div className="rounded-2xl p-5 md:p-7 relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,#12102a 0%,#0e0c1e 100%)', border: `1px solid ${leagueCfg.color}44`, boxShadow: `0 0 40px ${leagueCfg.glow}` }}>
                            {/* Background pattern */}
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                            <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                                {/* Avatar */}
                                <div className="flex-shrink-0 relative">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                                        style={{ background: `linear-gradient(135deg,${leagueCfg.color}44,${leagueCfg.color}22)`, border: `2px solid ${leagueCfg.color}`, boxShadow: `0 0 24px ${leagueCfg.glow}` }}>
                                        {coolie.name.split(' ').map(p => p[0]).join('')}
                                    </div>
                                    {/* Streak badge */}
                                    <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold"
                                        style={{ background: '#ff4d4d22', border: '1px solid #ff4d4d66', color: '#ff4d4d' }}>
                                        🔥{coolie.streak}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h2 className="orbitron text-xl font-bold text-white">{coolie.name}</h2>
                                        <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-0.5 rounded">{coolie.id}</span>
                                    </div>
                                    <div className="mb-3">
                                        <LeagueBadge league={coolie.league} tier={coolie.tier} size="lg" />
                                    </div>

                                    {/* XP display */}
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="orbitron text-3xl font-black" style={{ color: leagueCfg.color }}>
                                            <AnimatedNumber target={coolie.lifetimeXP} duration={2000} />
                                        </span>
                                        <span className="text-sm text-gray-400">Lifetime XP</span>
                                        <span className="text-xs ml-2 text-green-400 font-semibold">+{coolie.weeklyXP} this week</span>
                                    </div>

                                    {/* XP Progress Bar */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{coolie.lifetimeXP.toLocaleString('en-IN')} XP</span>
                                            <span>{nextTierXP.toLocaleString('en-IN')} XP</span>
                                        </div>
                                        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                            <div className="h-full rounded-full transition-all duration-1500 xp-bar-fill"
                                                style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg,${leagueCfg.color}aa,${leagueCfg.color})`, color: leagueCfg.color, boxShadow: `0 0 12px ${leagueCfg.color}` }} />
                                        </div>
                                        <div className="flex justify-between text-xs mt-1">
                                            <span style={{ color: leagueCfg.color }}>{Math.round(xpProgress)}% to next tier</span>
                                            {xpToNext <= 200 && (
                                                <span className="text-yellow-400 font-semibold glow-pulse">⚡ Only {xpToNext} XP away!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 flex-shrink-0 w-full md:w-auto">
                                    {[
                                        { icon: '🎯', label: 'Trips', val: coolie.trips },
                                        { icon: '⭐', label: 'Rating', val: coolie.rating, suffix: '/5.0' },
                                        { icon: '💰', label: 'Tips', val: coolie.totalTips, prefix: '₹' },
                                        { icon: '📅', label: 'Since', val: coolie.memberSince, noAnim: true },
                                    ].map(s => (
                                        <div key={s.label} className="rounded-xl p-3 text-center stat-card"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', '--league-color': leagueCfg.color, transition: 'border-color 0.2s' }}>
                                            <div className="text-xl mb-1">{s.icon}</div>
                                            <div className="text-xs text-gray-500 mb-0.5">{s.label}</div>
                                            <div className="text-base font-bold text-white">
                                                {s.noAnim ? s.val : <AnimatedNumber target={typeof s.val === 'number' ? s.val : 0} duration={1500} prefix={s.prefix || ''} suffix={s.suffix || ''} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ══ TABS ══ */}
                        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {TABS.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className="flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all"
                                    style={{
                                        background: activeTab === tab ? leagueCfg.color + '22' : 'transparent',
                                        color: activeTab === tab ? leagueCfg.color : '#6b7280',
                                        border: activeTab === tab ? `1px solid ${leagueCfg.color}44` : '1px solid transparent',
                                        boxShadow: activeTab === tab ? `0 0 12px ${leagueCfg.glow}` : 'none',
                                    }}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* ══ SECTION 3 — ACHIEVEMENTS ══ */}
                        {activeTab === 'Achievements' && (
                            <div className="tab-fade space-y-4">
                                {/* Filter chips */}
                                <div className="flex flex-wrap gap-2">
                                    {FILTER_CATS.map(cat => (
                                        <button key={cat} onClick={() => setAchFilter(cat)}
                                            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                            style={{
                                                background: achFilter === cat ? leagueCfg.color + '22' : 'rgba(255,255,255,0.05)',
                                                color: achFilter === cat ? leagueCfg.color : '#9ca3af',
                                                border: achFilter === cat ? `1px solid ${leagueCfg.color}55` : '1px solid rgba(255,255,255,0.08)',
                                            }}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Achievement grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {filteredAch.map(ach => {
                                        const isUnlocked = ach.status === 'unlocked'
                                        const isProgress = ach.status === 'in-progress'
                                        return (
                                            <div key={ach.id}
                                                className="ach-card rounded-xl p-4 relative overflow-hidden cursor-pointer"
                                                onClick={() => isUnlocked && setSelectedAch(ach)}
                                                style={{
                                                    background: isUnlocked ? 'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,215,0,0.03))' : 'rgba(255,255,255,0.03)',
                                                    border: isUnlocked ? '1px solid rgba(255,215,0,0.35)' : '1px solid rgba(255,255,255,0.07)',
                                                    boxShadow: isUnlocked ? '0 0 20px rgba(255,215,0,0.1)' : 'none',
                                                }}>
                                                {/* Shimmer on unlocked */}
                                                {isUnlocked && <div className="absolute inset-0 shimmer opacity-30 rounded-xl" />}

                                                {/* Lock overlay */}
                                                {ach.status === 'locked' && (
                                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
                                                        <Lock size={20} className="text-gray-600" />
                                                    </div>
                                                )}

                                                <div className="relative text-3xl mb-2" style={{ filter: ach.status === 'locked' ? 'grayscale(0.8) opacity(0.4)' : 'none' }}>
                                                    {ach.icon}
                                                </div>

                                                {isUnlocked && (
                                                    <CheckCircle size={14} className="absolute top-3 right-3 text-yellow-400" />
                                                )}

                                                <h4 className="text-sm font-bold text-white mb-0.5" style={{ opacity: ach.status === 'locked' ? 0.4 : 1 }}>{ach.title}</h4>
                                                <p className="text-xs text-gray-500 mb-2 leading-tight" style={{ opacity: ach.status === 'locked' ? 0.4 : 1 }}>{ach.desc}</p>
                                                <span className="text-xs font-bold" style={{ color: isUnlocked ? '#ffd700' : '#6b7280' }}>+{ach.xp} XP</span>

                                                {/* Progress bar for in-progress */}
                                                {isProgress && (
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>{ach.progress}%</span>
                                                        </div>
                                                        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                                            <div className="h-full rounded-full"
                                                                style={{ width: `${ach.progress}%`, background: `linear-gradient(90deg,${leagueCfg.color}88,${leagueCfg.color})` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ══ SECTION 4 — LEADERBOARD ══ */}
                        {activeTab === 'Leaderboard' && (
                            <div className="tab-fade space-y-4">
                                {/* Header info */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div>
                                        <h2 className="orbitron text-lg font-bold text-white">Weekly Top 10</h2>
                                        <p className="text-xs text-gray-500">Rankings reset every Monday midnight</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                                        style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', color: '#ff4d4d' }}>
                                        <Clock size={14} />
                                        Resets in {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s
                                    </div>
                                </div>

                                {/* Prize banner */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ rank: 1, prize: '₹500', icon: '🥇', col: '#ffd700' }, { rank: 2, prize: '₹300', icon: '🥈', col: '#c0c0c0' }, { rank: 3, prize: '₹200', icon: '🥉', col: '#cd7f32' }].map(p => (
                                        <div key={p.rank} className="rounded-xl p-3 text-center"
                                            style={{ background: `${p.col}11`, border: `1px solid ${p.col}33` }}>
                                            <div className="text-2xl mb-1">{p.icon}</div>
                                            <div className="text-xs text-gray-400">Rank {p.rank}</div>
                                            <div className="text-base font-bold" style={{ color: p.col }}>{p.prize}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Leaderboard list */}
                                <div className="space-y-2">
                                    {LEADERBOARD.map(entry => {
                                        const medalIcons = { 1: '🥇', 2: '🥈', 3: '🥉' }
                                        return (
                                            <div key={entry.id}
                                                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                                                style={{
                                                    background: entry.isMe ? `${leagueCfg.color}15` : 'rgba(255,255,255,0.03)',
                                                    border: entry.isMe ? `1px solid ${leagueCfg.color}44` : '1px solid rgba(255,255,255,0.06)',
                                                    boxShadow: entry.isMe ? `0 0 16px ${leagueCfg.glow}` : 'none',
                                                }}>
                                                {/* Rank */}
                                                <div className="w-8 text-center font-bold">
                                                    {medalIcons[entry.rank] || <span className="text-sm text-gray-400">#{entry.rank}</span>}
                                                </div>
                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                                                    style={{ background: entry.isMe ? `${leagueCfg.color}44` : '#1e1a40', border: `1px solid ${entry.isMe ? leagueCfg.color : '#2a2550'}` }}>
                                                    {entry.name.split(' ').map(p => p[0]).join('')}
                                                </div>
                                                {/* Name & ID */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">
                                                        {entry.name} {entry.isMe && <span className="text-xs ml-1" style={{ color: leagueCfg.color }}>(You)</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">{entry.id}</p>
                                                </div>
                                                {/* League */}
                                                <div className="hidden sm:block">
                                                    <LeagueBadge league={entry.league} tier={entry.tier} />
                                                </div>
                                                {/* XP */}
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold" style={{ color: leagueCfg.color }}>{entry.weeklyXP.toLocaleString('en-IN')} XP</p>
                                                    {PRIZES[entry.rank] && <p className="text-xs text-green-400">{PRIZES[entry.rank]}</p>}
                                                    {entry.rank >= 4 && entry.rank <= 10 && <p className="text-xs text-gray-500">Platform credit</p>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* My rank if not in top 10 */}
                                {!LEADERBOARD.find(e => e.isMe) && (
                                    <div className="rounded-xl px-4 py-3 text-center text-sm text-gray-400"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        You are <strong className="text-white">#34</strong> this week — keep earning XP to break the top 10!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══ SECTION 5 — REWARDS ══ */}
                        {activeTab === 'Rewards' && (
                            <div className="tab-fade space-y-4">
                                <div>
                                    <h2 className="orbitron text-lg font-bold text-white mb-1">League Rewards</h2>
                                    <p className="text-xs text-gray-500">Perks you unlock as you climb through the leagues</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {LEAGUES.map((lg, idx) => {
                                        const unlocked = idx <= leagueIdx
                                        return (
                                            <div key={lg.name}
                                                className="rounded-2xl p-5 relative overflow-hidden"
                                                style={{
                                                    background: unlocked ? `linear-gradient(135deg,${lg.color}15,${lg.color}05)` : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${unlocked ? lg.color + '44' : 'rgba(255,255,255,0.07)'}`,
                                                    boxShadow: unlocked ? `0 0 24px ${lg.glow}` : 'none',
                                                }}>
                                                {unlocked && <div className="absolute inset-0 shimmer opacity-20" />}

                                                <div className="relative flex items-start gap-3">
                                                    <div className="text-3xl">{lg.icon}</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="orbitron text-base font-bold" style={{ color: unlocked ? lg.color : '#4b5563' }}>{lg.name}</h3>
                                                            {unlocked
                                                                ? <CheckCircle size={14} className="text-green-400" />
                                                                : <Lock size={12} className="text-gray-600" />
                                                            }
                                                        </div>
                                                        <p className="text-xs mb-2" style={{ color: unlocked ? '#d1d5db' : '#4b5563' }}>{lg.reward}</p>
                                                        <div className="text-xs font-mono" style={{ color: unlocked ? lg.color + 'aa' : '#374151' }}>
                                                            {lg.minXP.toLocaleString('en-IN')}+ XP
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Current badge */}
                                                {lg.name === coolie.league && (
                                                    <div className="relative mt-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit"
                                                        style={{ background: `${lg.color}22`, border: `1px solid ${lg.color}44`, color: lg.color }}>
                                                        <Target size={11} /> Current League
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ══ SECTION 2 — LEAGUE MAP ══ */}
                        {activeTab === 'League Map' && (
                            <div className="tab-fade space-y-4">
                                <div>
                                    <h2 className="orbitron text-lg font-bold text-white mb-1">League Roadmap</h2>
                                    <p className="text-xs text-gray-500">Your journey from Bronze to Legend</p>
                                </div>

                                <div className="space-y-3">
                                    {LEAGUES.map((lg, idx) => {
                                        const isCurrentLeague = lg.name === coolie.league
                                        const isDone = idx < leagueIdx
                                        const isLocked = idx > leagueIdx

                                        return (
                                            <div key={lg.name} className="league-node rounded-2xl p-5 relative overflow-hidden"
                                                style={{
                                                    background: isDone ? 'rgba(255,255,255,0.03)' : isCurrentLeague ? `${lg.color}12` : 'rgba(255,255,255,0.02)',
                                                    border: isCurrentLeague ? `2px solid ${lg.color}77` : `1px solid ${isDone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                                                    boxShadow: isCurrentLeague ? `0 0 30px ${lg.glow}` : 'none',
                                                    opacity: isLocked ? 0.5 : 1,
                                                }}>

                                                {isCurrentLeague && (
                                                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold glow-pulse"
                                                        style={{ background: `${lg.color}22`, color: lg.color, border: `1px solid ${lg.color}44` }}>
                                                        ◉ You are here
                                                    </div>
                                                )}
                                                {isDone && (
                                                    <div className="absolute top-3 right-3">
                                                        <CheckCircle size={18} className="text-green-500" />
                                                    </div>
                                                )}
                                                {isLocked && (
                                                    <div className="absolute top-3 right-3">
                                                        <Lock size={16} className="text-gray-700" />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="text-3xl">{lg.icon}</div>
                                                    <div>
                                                        <h3 className="orbitron text-base font-bold" style={{ color: isDone || isCurrentLeague ? lg.color : '#4b5563' }}>
                                                            {lg.name} League
                                                        </h3>
                                                        <p className="text-xs text-gray-500">{lg.minXP.toLocaleString('en-IN')} — {lg.maxXP === Infinity ? '∞' : lg.maxXP.toLocaleString('en-IN')} XP</p>
                                                    </div>
                                                </div>

                                                {/* Tier track */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    {Array.from({ length: lg.tiers }).map((_, ti) => {
                                                        const tierNum = lg.tiers - ti
                                                        const tierActive = isCurrentLeague && coolie.tier === tierNum
                                                        const tierDone = isDone || (isCurrentLeague && coolie.tier < tierNum)
                                                        return (
                                                            <React.Fragment key={tierNum}>
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                                                        style={{
                                                                            background: tierActive ? lg.color : tierDone ? lg.color + '33' : 'rgba(255,255,255,0.06)',
                                                                            border: tierActive ? `2px solid ${lg.color}` : `1px solid ${tierDone ? lg.color + '55' : 'rgba(255,255,255,0.1)'}`,
                                                                            color: tierActive ? '#000' : tierDone ? lg.color : '#4b5563',
                                                                            boxShadow: tierActive ? `0 0 12px ${lg.glow}` : 'none',
                                                                        }}>
                                                                        {tierNum}
                                                                    </div>
                                                                    <span className="text-xs text-gray-600 mt-1">T{tierNum}</span>
                                                                </div>
                                                                {ti < lg.tiers - 1 && (
                                                                    <div className="flex-1 h-0.5 rounded" style={{ background: tierDone ? lg.color + '55' : 'rgba(255,255,255,0.06)' }} />
                                                                )}
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </div>

                                                {/* Reward */}
                                                <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <Gift size={13} className="flex-shrink-0" style={{ color: lg.color }} />
                                                    <span style={{ color: isDone || isCurrentLeague ? '#d1d5db' : '#4b5563' }}>{lg.reward}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* Achievement Modal */}
            <AchievementModal ach={selectedAch} onClose={() => setSelectedAch(null)} />
        </>
    )
}
