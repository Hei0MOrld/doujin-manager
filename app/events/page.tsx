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

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <Navbar />

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>イベントを追加</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="イベント名*（例：コミックマーケット105）" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', color: '#111' }} />
          <input value={date} onChange={e => setDate(e.target.value)} type="date" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', color: '#111' }} />
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="場所（例：東京ビッグサイト）" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', color: '#111' }} />
          <button onClick={handleAdd} disabled={loading || !name} style={{ width: '100%', padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            {loading ? '追加中...' : '追加する'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.length === 0 && <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center' }}>まだイベントがありません</p>}
          {events.map(e => (
            <div key={e.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{e.name}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>{e.location || '場所未設定'}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#888' }}>{e.event_date || '日付未設定'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}