'use client'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

type Work = {
  id: string
  title: string
  genre: string
  price: number
  stock: number
}

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      fetchWorks()
    }
    init()
  }, [])

  const fetchWorks = async () => {
    const { data } = await supabase.from('works').select('*').order('created_at', { ascending: false })
    if (data) setWorks(data)
  }

  const handleAdd = async () => {
    if (!title) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('works').insert({
      user_id: user!.id,
      title,
      genre,
      price: parseInt(price) || 0,
      stock: parseInt(stock) || 0,
    })
    setTitle(''); setGenre(''); setPrice(''); setStock('')
    await fetchWorks()
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <Navbar />

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>作品を追加</h2>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル*" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', color: '#111' }} />
          <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="ジャンル" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', color: '#111' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="頒布価格（円）" type="number" style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#111' }} />
            <input value={stock} onChange={e => setStock(e.target.value)} placeholder="在庫数" type="number" style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#111' }} />
          </div>
          <button onClick={handleAdd} disabled={loading || !title} style={{ width: '100%', padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            {loading ? '追加中...' : '追加する'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {works.length === 0 && <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center' }}>まだ作品がありません</p>}
          {works.map(w => (
            <div key={w.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{w.title}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>{w.genre || 'ジャンル未設定'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>¥{w.price.toLocaleString()}</p>
                  <p style={{ fontSize: '12px', color: w.stock > 0 ? '#22c55e' : '#ef4444' }}>在庫 {w.stock}部</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}