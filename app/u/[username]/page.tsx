import { createClient } from '@supabase/supabase-js'

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
  const { username } = await params

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
          <p style={{ fontSize: '16px', color: '#555' }}>ユーザーが見つかりません</p>
        </div>
      </div>
    )
  }

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', color: '#999' }}>同人誌マネージャー</span>
        <a href="/login" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>自分も使ってみる →</a>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>📚</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{profile.circle_name || username}</h1>
          <p style={{ fontSize: '13px', color: '#999' }}>@{username} の在庫一覧</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!works || works.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#999' }}>現在在庫がありません</p>
            </div>
          ) : works.map(w => (
            <div key={w.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📖</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{w.title}</p>
                    <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#666', padding: '2px 8px', borderRadius: '20px' }}>{w.genre || 'ジャンル未設定'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>¥{w.price.toLocaleString()}</p>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: w.stock === 0 ? '#fef2f2' : w.stock < 5 ? '#fffbeb' : '#ecfdf5', color: w.stock === 0 ? '#ef4444' : w.stock < 5 ? '#f59e0b' : '#10b981' }}>
                    {w.stock === 0 ? '在庫なし' : w.stock < 5 ? `残り${w.stock}部` : `在庫${w.stock}部`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '11px', color: '#ccc', textAlign: 'center', marginTop: '32px' }}>
          このページは同人誌マネージャーで作成されました
        </p>
      </div>
    </div>
  )
}