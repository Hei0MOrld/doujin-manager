'use client'

import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [worksCount, setWorksCount] = useState(0)
  const [eventsCount, setEventsCount] = useState(0)
  const [recentSales, setRecentSales] = useState<{ name: string; revenue: number }[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')

      const [{ data: sales }, { count: wCount }, { count: eCount }] = await Promise.all([
        supabase.from('sales').select('revenue, events(name)'),
        supabase.from('works').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
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
    }
    init()
  }, [])

  const maxRevenue = Math.max(...recentSales.map(s => s.revenue), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0' }}>
      <Navbar />
      <div style={{ padding: '32px 24px', maxWidth: '900px', margin: '0 auto' }}>

        {/* サマリーカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#111', borderRadius: '16px', padding: '24px', color: '#fff' }}>
            <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '8px' }}>累計売上</p>
            <p style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px' }}>¥{totalRevenue.toLocaleString()}</p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>作品数</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#111', letterSpacing: '-1px' }}>{worksCount}<span style={{ fontSize: '14px', fontWeight: '400', color: '#888', marginLeft: '4px' }}>作品</span></p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>参加イベント</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#111', letterSpacing: '-1px' }}>{eventsCount}<span style={{ fontSize: '14px', fontWeight: '400', color: '#888', marginLeft: '4px' }}>回</span></p>
          </div>
        </div>

        {/* 売上グラフ */}
        {recentSales.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '20px' }}>イベント別売上</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentSales.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#555' }}>{s.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>¥{s.revenue.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f3f3f3', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.revenue / maxRevenue) * 100}%`, background: '#111', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ナビカード */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { href: '/works', emoji: '📚', label: '作品管理', desc: '在庫・価格を管理' },
            { href: '/events', emoji: '🎪', label: 'イベント管理', desc: '参加イベントを記録' },
            { href: '/sales', emoji: '💰', label: '売上記録', desc: '収支を管理' },
          ].map(item => (
            <div key={item.href} onClick={() => router.push(item.href)} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#ccc')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#eee')}
            >
              <p style={{ fontSize: '24px', marginBottom: '8px' }}>{item.emoji}</p>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}