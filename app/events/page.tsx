'use client'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

type Event = {
  id: string
  name: string
  event_date: string
  location: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      fetchEvents()
    }
    init()
  }, [])

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false })
    if (data) setEvents(data)
  }

  const handleAdd = async () => {
    if (!name) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('events').insert({
      user_id: user!.id,
      name,
      event_date: date || null,
      location,
    })
    setName(''); setDate(''); setLocation('')
    await fetchEvents()
    setLoading(false)
  }

  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ padding: '28px 24px', maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>イベント管理</h1>
            <p style={{ fontSize: '12px', color: '#999' }}>{events.length}件のイベント</p>
          </div>
        </div>

        <div style={{ ...card, padding: '20px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#f59e0b', marginBottom: '14px', letterSpacing: '0.05em' }}>＋ 新しいイベントを追加</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="イベント名*（例：コミックマーケット105）" style={{ ...input, marginBottom: '8px' }} />
          <input value={date} onChange={e => setDate(e.target.value)} type="date" style={{ ...input, marginBottom: '8px' }} />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="場所（例：東京ビッグサイト）" style={{ ...input, marginBottom: '14px' }} />
          <button onClick={handleAdd} disabled={loading || !name}
            style={{ width: '100%', padding: '11px', background: loading || !name ? '#ccc' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: loading || !name ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
            {loading ? '追加中...' : '追加する'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.length === 0 &&
            <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎪</p>
              <p style={{ fontSize: '14px', color: '#999' }}>まだイベントがありません</p>
              <p style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>上のフォームから追加してください</p>
            </div>
          }
          {events.map(e => (
            <div key={e.id} style={{ ...card, padding: '16px 20px' }}
              onMouseEnter={e2 => (e2.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)')}
              onMouseLeave={e2 => (e2.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎪</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{e.name}</p>
                    <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#666', padding: '2px 8px', borderRadius: '20px' }}>{e.location || '場所未設定'}</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '500', padding: '4px 10px', borderRadius: '20px', background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a' }}>
                  {e.event_date || '日付未設定'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}