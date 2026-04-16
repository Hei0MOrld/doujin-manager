'use client'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

type Sale = {
  id: string
  quantity: number
  revenue: number
  works: { title: string }
  events: { name: string }
}

type Work = { id: string; title: string; price: number }
type Event = { id: string; name: string }

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [workId, setWorkId] = useState('')
  const [eventId, setEventId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'normal' | 'live'>('normal')
  const [liveEventId, setLiveEventId] = useState('')
  const [liveCounts, setLiveCounts] = useState<{ [id: string]: number }>({})
  const [liveLoading, setLiveLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      fetchAll()
    }
    init()
  }, [])

  const fetchAll = async () => {
    const [{ data: w }, { data: e }, { data: s }] = await Promise.all([
      supabase.from('works').select('id, title, price'),
      supabase.from('events').select('id, name'),
      supabase.from('sales').select('id, quantity, revenue, works(title), events(name)').order('created_at', { ascending: false }),
    ])
    if (w) setWorks(w)
    if (e) setEvents(e)
    if (s) setSales(s as any)
  }

  const handleAdd = async () => {
    if (!workId || !eventId || !quantity) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const work = works.find(w => w.id === workId)
    const qty = parseInt(quantity)
    await supabase.from('sales').insert({
      user_id: user!.id,
      work_id: workId,
      event_id: eventId,
      quantity: qty,
      revenue: (work?.price ?? 0) * qty,
    })
    await supabase.rpc('decrement_stock', { work_id: workId, qty })
    setWorkId(''); setEventId(''); setQuantity('')
    await fetchAll()
    setLoading(false)
  }

  const handleLiveSave = async () => {
    if (!liveEventId) return
    const entries = Object.entries(liveCounts).filter(([_, qty]) => qty > 0)
    if (entries.length === 0) return
    setLiveLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    for (const [wId, qty] of entries) {
      const work = works.find(w => w.id === wId)
      await supabase.from('sales').insert({
        user_id: user!.id,
        work_id: wId,
        event_id: liveEventId,
        quantity: qty,
        revenue: (work?.price ?? 0) * qty,
      })
      await supabase.rpc('decrement_stock', { work_id: wId, qty })
    }
    setLiveCounts({})
    setLiveEventId('')
    setMode('normal')
    await fetchAll()
    setLiveLoading(false)
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0)
  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
  const select = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none', background: '#fff' }
  const liveTotal = Object.entries(liveCounts).reduce((sum, [id, qty]) => {
    const work = works.find(w => w.id === id)
    return sum + (work?.price ?? 0) * qty
  }, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ padding: '28px 24px', maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>売上記録</h1>
            <p style={{ fontSize: '12px', color: '#999' }}>{sales.length}件の記録</p>
          </div>
          <button onClick={() => setMode(mode === 'live' ? 'normal' : 'live')}
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: mode === 'live' ? '#10b981' : '#111', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            {mode === 'live' ? '🟢 イベント中' : '🎪 イベントモード'}
          </button>
        </div>

        {/* 累計売上カード */}
        <div style={{ background: '#111', borderRadius: '16px', padding: '24px', marginBottom: '20px', color: '#fff', border: '1px solid #333', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '6px', letterSpacing: '0.05em' }}>累計売上</p>
          <p style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-2px', marginBottom: '4px' }}>¥{totalRevenue.toLocaleString()}</p>
          <p style={{ fontSize: '11px', opacity: 0.4 }}>{sales.length}件の販売記録</p>
        </div>

        {/* イベントモード */}
        {mode === 'live' && (
          <div style={{ ...card, padding: '20px', marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', marginBottom: '14px' }}>🎪 イベントモード</h2>
            <select value={liveEventId} onChange={e => setLiveEventId(e.target.value)} style={{ ...select, marginBottom: '16px' }}>
              <option value="">イベントを選択*</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>

            {liveEventId && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {works.map(w => (
                    <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9f9f7', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>{w.title}</p>
                        <p style={{ fontSize: '11px', color: '#999' }}>¥{w.price.toLocaleString()}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setLiveCounts(p => ({ ...p, [w.id]: Math.max(0, (p[w.id] ?? 0) - 1) }))}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e5e5e5', background: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>－</button>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#111', minWidth: '24px', textAlign: 'center' }}>{liveCounts[w.id] ?? 0}</span>
                        <button onClick={() => setLiveCounts(p => ({ ...p, [w.id]: (p[w.id] ?? 0) + 1 }))}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#111', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>＋</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e5e5e5', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>合計</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>¥{liveTotal.toLocaleString()}</span>
                </div>
                <button onClick={handleLiveSave} disabled={liveLoading || liveTotal === 0}
                  style={{ width: '100%', padding: '13px', background: liveTotal === 0 ? '#ccc' : '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: liveTotal === 0 ? 'not-allowed' : 'pointer' }}>
                  {liveLoading ? '記録中...' : `¥${liveTotal.toLocaleString()} を記録する`}
                </button>
              </>
            )}
          </div>
        )}

        {/* 通常記録フォーム */}
        {mode === 'normal' && (
          <div style={{ ...card, padding: '20px', marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', marginBottom: '14px', letterSpacing: '0.05em' }}>＋ 売上を記録</h2>
            <select value={workId} onChange={e => setWorkId(e.target.value)} style={{ ...select, marginBottom: '8px' }}>
              <option value="">作品を選択*</option>
              {works.map(w => <option key={w.id} value={w.id}>{w.title}（¥{w.price}）</option>)}
            </select>
            <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ ...select, marginBottom: '8px' }}>
              <option value="">イベントを選択*</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="販売数*" type="number"
              style={{ ...select, marginBottom: '14px' }} />
            <button onClick={handleAdd} disabled={loading || !workId || !eventId || !quantity}
              style={{ width: '100%', padding: '11px', background: loading || !workId || !eventId || !quantity ? '#ccc' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
              {loading ? '記録中...' : '記録する'}
            </button>
          </div>
        )}

        {/* 売上一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sales.length === 0 &&
            <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>💰</p>
              <p style={{ fontSize: '14px', color: '#999' }}>まだ売上記録がありません</p>
              <p style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>上のフォームから記録してください</p>
            </div>
          }
          {sales.map(s => (
            <div key={s.id} style={{ ...card, padding: '16px 20px' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>💰</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{s.works?.title}</p>
                    <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#666', padding: '2px 8px', borderRadius: '20px' }}>{s.events?.name} · {s.quantity}部</span>
                  </div>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#10b981' }}>
                  ¥{s.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}