'use client'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [username, setUsername] = useState('')
  const [circleName, setCircleName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setUsername(data.username ?? '')
        setCircleName(data.circle_name ?? '')
      }
    }
    init()
  }, [])

  const handleSave = async () => {
    if (!username) return
    setLoading(true)
    await supabase.from('profiles').upsert({
      id: userId,
      username,
      circle_name: circleName,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ padding: '28px 24px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>プロフィール設定</h1>
          <p style={{ fontSize: '12px', color: '#999' }}>公開ページのURLとサークル名を設定します</p>
        </div>

        <div style={{ ...card, padding: '24px', marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>ユーザー名（URL）*</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#999', whiteSpace: 'nowrap' }}>doujin-manager.vercel.app/u/</span>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_]/g, ''))} placeholder="username" style={{ ...input, flex: 1 }} />
            </div>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>英数字・アンダースコアのみ</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>サークル名</label>
            <input value={circleName} onChange={e => setCircleName(e.target.value)} placeholder="例：〇〇サークル" style={input} />
          </div>

          <button onClick={handleSave} disabled={loading || !username}
            style={{ width: '100%', padding: '11px', background: saved ? '#10b981' : loading || !username ? '#ccc' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}>
            {saved ? '✓ 保存しました！' : loading ? '保存中...' : '保存する'}
          </button>
        </div>

        {username && (
          <div style={{ ...card, padding: '16px 20px' }}>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>公開ページURL</p>
            <a href={`/u/${username}`} target="_blank" style={{ fontSize: '14px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
              doujin-manager.vercel.app/u/{username} →
            </a>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>このURLをSNSでシェアするとお客さんが在庫を確認できます</p>
          </div>
        )}
      </div>
    </div>
  )
}