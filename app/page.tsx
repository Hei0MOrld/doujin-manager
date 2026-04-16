import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: 'sans-serif' }}>

      {/* ナビ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '0 24px', height: '52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>同人誌マネージャー</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#888', textDecoration: 'none', padding: '6px 14px' }}>ログイン</Link>
          <Link href="/login" style={{ fontSize: '13px', color: '#fff', background: '#111', textDecoration: 'none', padding: '6px 16px', borderRadius: '8px', fontWeight: '500' }}>無料で始める</Link>
        </div>
      </div>

      {/* ヒーロー */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#eef2ff', color: '#6366f1', fontSize: '12px', fontWeight: '600', padding: '4px 14px', borderRadius: '20px', marginBottom: '20px', letterSpacing: '0.05em' }}>
          同人作家のための管理ツール
        </div>
        <h1 style={{ fontSize: '44px', fontWeight: '800', color: '#111', letterSpacing: '-2px', lineHeight: 1.15, marginBottom: '20px' }}>
          在庫・売上・イベントを<br />ひとつで管理
        </h1>
        <p style={{ fontSize: '16px', color: '#666', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
          Excelはもう卒業。コミケ当日もスマホから売上を記録。在庫状況をお客さんと共有できる公開ページも作成できます。
        </p>
        <Link href="/login" style={{ display: 'inline-block', background: '#111', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', letterSpacing: '0.02em' }}>
          無料で始める →
        </Link>
        <p style={{ fontSize: '12px', color: '#bbb', marginTop: '12px' }}>クレジットカード不要・登録1分</p>
      </div>

      {/* 特徴 */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '60px' }}>
          {[
            { icon: '📚', title: '作品・在庫管理', desc: '作品ごとの在庫数をリアルタイムで管理。売れるたびに自動で在庫が減ります。', color: '#eef2ff', accent: '#6366f1' },
            { icon: '🎪', title: 'イベント売上記録', desc: 'コミケ当日はイベントモードで素早く記録。＋－ボタンで簡単入力。', color: '#fffbeb', accent: '#f59e0b' },
            { icon: '💰', title: '収支レポート', desc: '印刷代・参加費を引いた実質利益を自動計算。確定申告にも役立ちます。', color: '#ecfdf5', accent: '#10b981' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e5e5', borderLeft: `4px solid ${f.accent}`, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{f.icon}</div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>{f.title}</p>
              <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* 料金 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '8px', letterSpacing: '-1px' }}>シンプルな料金</h2>
          <p style={{ fontSize: '14px', color: '#999' }}>まずは無料で試してください</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
          {[
            { name: '無料', price: '¥0', period: '/月', features: ['作品登録 3件まで', 'イベント記録 5件まで', '基本在庫管理'], accent: '#e5e5e5' },
            { name: 'Pro', price: '¥400', period: '/月', features: ['作品・イベント無制限', 'CSVエクスポート', '公開プロフィールページ', '収支レポート詳細版'], accent: '#6366f1', featured: true },
          ].map((p, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: p.featured ? '2px solid #6366f1' : '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'relative' }}>
              {p.featured && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '3px 12px', borderRadius: '20px' }}>おすすめ</div>}
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{p.name}</p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#111', letterSpacing: '-1px', marginBottom: '16px' }}>{p.price}<span style={{ fontSize: '13px', fontWeight: '400', color: '#999' }}>{p.period}</span></p>
              {p.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                  <span style={{ fontSize: '13px', color: '#555' }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <div style={{ borderTop: '1px solid #e5e5e5', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#bbb' }}>© 2025 同人誌マネージャー</p>
      </div>

    </div>
  )
}