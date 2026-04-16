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
    // 在庫を減らす
    await supabase.rpc('decrement_stock', { work_id: workId, qty })
    setWorkId(''); setEventId(''); setQuantity('')
    await fetchAll()
    setLoading(false)
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <Navbar />

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#111', borderRadius: '12px', padding: '20px', marginBottom: '24px', color: '#fff' }}>
          <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '4px' }}>累計売上</p>
          <p style={{ fontSize: '28px', fontWeight: '600' }}>¥{totalRevenue.toLocaleString()}</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>売上を記録</h2>
          <select value={workId} onChange={e => setWorkId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', color: '#111' }}>
            <option value="">作品を選択*</option>
            {works.map(w => <option key={w.id} value={w.id}>{w.title}（¥{w.price}）</option>)}
          </select>
          <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', color: '#111' }}>
            <option value="">イベントを選択*</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="販売数*" type="number" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', color: '#111' }} />
          <button onClick={handleAdd} disabled={loading || !workId || !eventId || !quantity} style={{ width: '100%', padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            {loading ? '記録中...' : '記録する'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sales.length === 0 && <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center' }}>まだ売上記録がありません</p>}
          {sales.map(s => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{s.works?.title}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>{s.events?.name} · {s.quantity}部</p>
                </div>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>¥{s.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}