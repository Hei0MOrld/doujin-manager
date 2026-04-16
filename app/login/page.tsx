'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが違います')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('登録に失敗しました: ' + error.message)
    } else {
      setError('確認メールを送りました！メールを確認してください。')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #eee', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px',color: '#111' }}>同人誌マネージャー</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>ログインまたは新規登録</p>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            placeholder="example@email.com"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            placeholder="6文字以上"
          />
        </div>

        {error && <p style={{ fontSize: '12px', color: error.includes('送り') ? '#22c55e' : '#ef4444', marginBottom: '12px' }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '11px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}
        >
          {loading ? '処理中...' : 'ログイン'}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ width: '100%', padding: '11px', background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
        >
          新規登録
        </button>
      </div>
    </div>
  )
}