'use client'

import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [worksCount, setWorksCount] = useState(0)
  const [eventsCount, setEventsCount] = useState(0)
  const [lowStock, setLowStock] = useState<{ title: string; stock: number }[]>([])
  const [recentSales, setRecentSales] = useState<{ name: string; revenue: number }[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: sales }, { count: wCount }, { count: eCount }, { data: works }] = await Promise.all([
        supabase.from('sales').select('revenue, events(name)'),
        supabase.from('works').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('works').select('title, stock').lt('stock', 5).order('stock'),
      ])

      if (sales) {
        setTotalRevenue(sales.reduce((sum, s) => sum + s.revenue, 0))
        const byEvent: { [key: string]: number } = {}
        sales.forEach((s: any) => {
          const name = s.events?.name ?? '不明'
          byEvent[name] = (byEvent[name] ?? 0) + s.revenue
        })
        setRecentSales(Object.entries(byEvent).map(([name, revenue]) => ({ name, revenue })))
      }
      if (wCount !== null) setWorksCount(wCount)
      if (eCount !== null) setEventsCount(eCount)
      if (works) setLowStock(works)
    }
    init()
  }, [])

  const maxRevenue = Math.max(...recentSales.map(s => s.revenue), 1)
  const card = { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e5e5e5' }

  const navItems = [
    { href: '/works', label: '作品管理', desc: '在庫・価格を管理', accent: '#6366f1', bg: '#eef2ff', icon: '📚' },
    { href: '/events', label: 'イベント管理', desc: '参加イベントを記録', accent: '#f59e0b', bg: '#fffbeb', icon: '🎪' },
    { href: '/sales', label: '売上記録', desc: '収支を管理', accent: '#10b981', bg: '#ecfdf5', icon: '💰' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ padding: '28px 24px', maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div style={{ background: '#111', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '1px solid #333' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '6px', letterSpacing: '0.05em' }}>累計売上</p>
            <p style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-2px', marginBottom: '4px' }}>¥{totalRevenue.toLocaleString()}</p>
            <p style={{ fontSize: '11px', opacity: 0.4 }}>全イベント合計</p>
          </div>
          <div style={{ ...card, borderLeft: '4px solid #6366f1' }}>
            <p style={{ fontSize: '11px', color: '#999', marginBottom: '6px', letterSpacing: '0.05em' }}>登録作品</p>
            <p style={{ fontSize: '36px', fontWeight: '700', color: '#111', letterSpacing: '-2px', marginBottom: '4px' }}>{worksCount}</p>
            <p style={{ fontSize: '11px', color: '#999' }}>作品</p>
          </div>
          <div style={{ ...card, borderLeft: '4px solid #f59e0b' }}>
            <p style={{ fontSize: '11px', color: '#999', marginBottom: '6px', letterSpacing: '0.05em' }}>参加イベント</p>
            <p style={{ fontSize: '36px', fontWeight: '700', color: '#111', letterSpacing: '-2px', marginBottom: '4px' }}>{eventsCount}</p>
            <p style={{ fontSize: '11px', color: '#999' }}>回</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div style={card}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>📊 イベント別売上</p>
            {recentSales.length === 0
              ? <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '24px 0' }}>売上データなし</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentSales.map((s, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#555' }}>{s.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#111' }}>¥{s.revenue.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f3f3f3', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(s.revenue / maxRevenue) * 100}%`, background: '#6366f1', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>

          <div style={card}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>⚠️ 在庫少ない作品</p>
            {lowStock.length === 0
              ? <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', padding: '24px 0' }}>在庫十分です</p>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStock.map((w, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: w.stock === 0 ? '#fef2f2' : '#fffbeb', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#333' }}>{w.title}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: w.stock === 0 ? '#ef4444' : '#f59e0b' }}>{w.stock}部</span>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {navItems.map(item => (
            <div key={item.href} onClick={() => router.push(item.href)}
              style={{ background: item.bg, borderRadius: '16px', padding: '20px', cursor: 'pointer', borderLeft: `4px solid ${item.accent}`, border: `1px solid ${item.accent}33`, transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <p style={{ fontSize: '22px', marginBottom: '8px' }}>{item.icon}</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{item.label}</p>
              <p style={{ fontSize: '11px', color: '#888' }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}