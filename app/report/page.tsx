'use client'
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

type Event = { id: string; name: string }
type Cost = { id: string; label: string; amount: number; cost_type: string; event_id: string }
type Sale = { revenue: number; event_id: string }

export default function ReportPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [costType, setCostType] = useState('print')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      fetchAll()
    }
    init()
  }, [])

  const fetchAll = async () => {
    const [{ data: e }, { data: c }, { data: s }] = await Promise.all([
      supabase.from('events').select('id, name'),
      supabase.from('costs').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('revenue, event_id'),
    ])
    if (e) setEvents(e)
    if (c) setCosts(c)
    if (s) setSales(s)
  }

  const handleAddCost = async () => {
    if (!label || !amount || !selectedEvent) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('costs').insert({
      user_id: user!.id,
      event_id: selectedEvent,
      label,
      amount: parseInt(amount),
      cost_type: costType,
    })
    setLabel(''); setAmount('')
    await fetchAll()
    setLoading(false)
  }

  const handleDeleteCost = async (id: string) => {
    await supabase.from('costs').delete().eq('id', id)
    setCosts(prev => prev.filter(c => c.id !== id))
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0)
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)
  const totalProfit = totalRevenue - totalCosts

  const eventReport = events.map(e => {
    const rev = sales.filter(s => s.event_id === e.id).reduce((sum, s) => sum + s.revenue, 0)
    const cost = costs.filter(c => c.event_id === e.id).reduce((sum, c) => sum + c.amount, 0)
    return { ...e, revenue: rev, cost, profit: rev - cost }
  }).filter(e => e.revenue > 0 || e.cost > 0)

  const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
  const select = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none', background: '#fff' }
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#111', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar />
      <div style={{ padding: '28px 24px', maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>収支レポート</h1>
          <p style={{ fontSize: '12px', color: '#999' }}>印刷代・参加費を引いた実質利益を確認できます</p>
        </div>

        {/* サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ ...card, padding: '16px' }}>
            <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>累計売上</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: '#111' }}>¥{totalRevenue.toLocaleString()}</p>
          </div>
          <div style={{ ...card, padding: '16px' }}>
            <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>累計経費</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: '#ef4444' }}>¥{totalCosts.toLocaleString()}</p>
          </div>
          <div style={{ ...card, padding: '16px', borderLeft: `4px solid ${totalProfit >= 0 ? '#10b981' : '#ef4444'}` }}>
            <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>実質利益</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
              {totalProfit >= 0 ? '' : '-'}¥{Math.abs(totalProfit).toLocaleString()}
            </p>
          </div>
        </div>

        {/* イベント別収支 */}
        {eventReport.length > 0 && (
          <div style={{ ...card, padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>📊 イベント別収支</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {eventReport.map(e => (
                <div key={e.id} style={{ padding: '12px 16px', background: '#f9f9f7', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{e.name}</p>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: e.profit >= 0 ? '#10b981' : '#ef4444' }}>
                      {e.profit >= 0 ? '+' : ''}¥{e.profit.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#888' }}>売上 ¥{e.revenue.toLocaleString()}</span>
                    <span style={{ fontSize: '11px', color: '#ef4444' }}>経費 ¥{e.cost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 経費追加フォーム */}
        <div style={{ ...card, padding: '20px', marginBottom: '20px', borderLeft: '4px solid #6366f1' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1', marginBottom: '14px' }}>＋ 経費を追加</h2>
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ ...select, marginBottom: '8px' }}>
            <option value="">イベントを選択*</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={costType} onChange={e => setCostType(e.target.value)} style={{ ...select, marginBottom: '8px' }}>
            <option value="print">印刷代</option>
            <option value="entry">参加費・スペース代</option>
            <option value="travel">交通費</option>
            <option value="supply">備品・消耗品</option>
            <option value="other">その他</option>
          </select>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="内容（例：コミケ参加費）" style={{ ...input, marginBottom: '8px' }} />
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="金額（円）" type="number" style={{ ...input, marginBottom: '14px' }} />
          <button onClick={handleAddCost} disabled={loading || !label || !amount || !selectedEvent}
            style={{ width: '100%', padding: '11px', background: loading || !label || !amount || !selectedEvent ? '#ccc' : '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
            {loading ? '追加中...' : '追加する'}
          </button>
        </div>

        {/* 経費一覧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {costs.length === 0 &&
            <div style={{ ...card, padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
              <p style={{ fontSize: '14px', color: '#999' }}>まだ経費がありません</p>
            </div>
          }
          {costs.map(c => {
            const event = events.find(e => e.id === c.event_id)
            const typeLabel = { print: '印刷代', entry: '参加費', travel: '交通費', supply: '備品', other: 'その他' }[c.cost_type] ?? 'その他'
            return (
              <div key={c.id} style={{ ...card, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{c.label}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#666', padding: '2px 8px', borderRadius: '20px' }}>{typeLabel}</span>
                      <span style={{ fontSize: '11px', background: '#f3f4f6', color: '#666', padding: '2px 8px', borderRadius: '20px' }}>{event?.name ?? ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>¥{c.amount.toLocaleString()}</p>
                    <button onClick={() => handleDeleteCost(c.id)}
                      style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}