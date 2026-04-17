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
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [editStockVal, setEditStockVal] = useState('')
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

  const handleDelete = async (id: string) => {
    if (!confirm('この作品を削除しますか？')) return
    await supabase.from('works').delete().eq('id', id)
    await fetchWorks()
  }

  const handleStockSave = async (id: string) => {
    await supabase.from('works').update({ stock: parseInt(editStockVal) || 0 }).eq('id', id)
    setEditingStock(null)
    await fetchWorks()
  }

  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ padding: '28px 24px', maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>作品管理</h1>
            <p style={{ fontSize: '12px', color: '#999' }}>{works.length}作品登録済み</p>
          </div>
        </div>

        <div style={{ ...card, padding: '20px', marginBottom: '20px', borderLeft: '4px solid #6366f1' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1', marginBottom: '14px', letterSpacing: '0.05em' }}>＋ 新しい作品を追加</h2>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル*" style={{ ...input, marginBottom: '8px' }} />
          <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="ジャンル（例：オリジナル・東方）" style={{ ...input, marginBottom: '8px' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="頒布価格（円）" type="number" style={{ ...input, flex: 1 }} />
            <input value={stock} onChange={e => setStock(e.target.value)} placeholder="在庫数" type="number" style={{ ...input, flex: 1 }} />
          </div>
          <button onClick={handleAdd} disabled={loading || !title}
            style={{ width: '100%', padding: '11px', background: loading || !title ? '#ccc' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: loading || !title ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
            {loading ? '追加中...' : '追加する'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {works.length === 0 &&
            <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📚</p>
              <p style={{ fontSize: '14px', color: '#999' }}>まだ作品がありません</p>
              <p style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>上のフォームから追加してください</p>
            </div>
          }
          {works.map(w => (
            <div key={w.id} style={{ ...card, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📖</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{w.title}</p>
                    <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#666', padding: '2px 8px', borderRadius: '20px' }}>{w.genre || 'ジャンル未設定'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>¥{w.price.toLocaleString()}</p>
                    {editingStock === w.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input type="number" value={editStockVal} onChange={e => setEditStockVal(e.target.value)}
                          style={{ width: '60px', padding: '4px 8px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '12px', color: '#111' }} />
                        <button onClick={() => handleStockSave(w.id)}
                          style={{ padding: '4px 8px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>保存</button>
                        <button onClick={() => setEditingStock(null)}
                          style={{ padding: '4px 8px', background: '#f3f4f6', color: '#666', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <span onClick={() => { setEditingStock(w.id); setEditStockVal(String(w.stock)) }}
                        style={{ fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px', cursor: 'pointer', background: w.stock === 0 ? '#fef2f2' : w.stock < 5 ? '#fffbeb' : '#ecfdf5', color: w.stock === 0 ? '#ef4444' : w.stock < 5 ? '#f59e0b' : '#10b981' }}>
                        在庫 {w.stock}部 ✏️
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(w.id)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}