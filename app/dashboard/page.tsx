'use client'

import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setEmail(user.email ?? '')
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <Navbar />
      <div style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '800px' }}>
  <div onClick={() => router.push('/works')} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
    <p style={{ fontSize: '24px', marginBottom: '8px' }}>📚</p>
    <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>作品管理</p>
    <p style={{ fontSize: '12px', color: '#888' }}>在庫・価格を管理</p>
  </div>
  <div onClick={() => router.push('/events')} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
    <p style={{ fontSize: '24px', marginBottom: '8px' }}>🎪</p>
    <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>イベント管理</p>
    <p style={{ fontSize: '12px', color: '#888' }}>参加イベントを記録</p>
  </div>
  <div onClick={() => router.push('/sales')} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
    <p style={{ fontSize: '24px', marginBottom: '8px' }}>💰</p>
    <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>売上記録</p>
    <p style={{ fontSize: '12px', color: '#888' }}>収支を管理</p>
  </div>
</div>
      </div>
    </div>
  )
}