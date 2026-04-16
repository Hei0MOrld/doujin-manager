'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'ホーム' },
    { href: '/works', label: '作品' },
    { href: '/events', label: 'イベント' },
    { href: '/sales', label: '売上' },
  ]

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '52px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginRight: '16px' }}>同人誌マネージャー</span>
        {links.map(link => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            style={{
              fontSize: '13px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: pathname === link.href ? '#f3f3f3' : 'transparent',
              color: pathname === link.href ? '#111' : '#888',
              cursor: 'pointer',
              fontWeight: pathname === link.href ? '500' : '400',
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
      <button onClick={handleLogout} style={{ fontSize: '13px', padding: '6px 14px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', color: '#888' }}>ログアウト</button>
    </div>
  )
}