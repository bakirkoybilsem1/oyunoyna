'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const EMOJI_LISTESI = ['🎮','🚀','⚽','🎯','🧩','🎲','🏆','🌟','🦄','🐉','🎪','🎨','🏎️','🤖','👾','🎸','🌈','🦋','🎭','🎠','🔮','🎡','🌺','🏄','🦊','🐬','🌙','⚡','🎋','🎻'];
const RENK_LISTESI = ['#FF6B6B','#4ECDC4','#FCCB90','#96FBC4','#FBC2EB','#FDDB92','#E0C3FC','#a1ffce','#F59E0B','#10B981','#A78BFA','#F472B6','#34D399','#60A5FA','#FB923C'];

export default function AdminPanel() {
  const [sifre, setSifre] = useState('');
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sifreHata, setSifreHata] = useState('');
  const ADMIN_SIFRE = 'Bb12345678';

  const [tab, setTab] = useState('odalar'); // 'odalar' | 'oyunlar'
  const [odalar, setOdalar] = useState([]);
  const [oyunlar, setOyunlar] = useState([]);
  const [seciliOda, setSeciliOda] = useState(null);

  // Oda formu
  const [odaFormu, setOdaFormu] = useState({ isim:'', emoji:'🎮', renk:'#4ECDC4', sira:0 });
  const [odaDuzenleId, setOdaDuzenleId] = useState(null);
  const [odaFormAcik, setOdaFormAcik] = useState(false);

  // Oyun formu
  const [oyunFormu, setOyunFormu] = useState({ isim:'', slug:'', url:'', oda_id:'', renk:'#4ECDC4', is_active:true });
  const [oyunDuzenleId, setOyunDuzenleId] = useState(null);
  const [oyunFormAcik, setOyunFormAcik] = useState(false);

  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (girisYapildi) { fetchOdalar(); fetchOyunlar(); }
  }, [girisYapildi]);

  function handleGiris() {
    if (sifre === ADMIN_SIFRE) { setGirisYapildi(true); setSifreHata(''); }
    else setSifreHata('Şifre hatalı!');
  }

  async function fetchOdalar() {
    const { data } = await supabase.from('odalar').select('*').order('sira');
    if (data) setOdalar(data);
  }
  async function fetchOyunlar() {
    const { data } = await supabase.from('oyunlar').select('*').order('created_at', { ascending: false });
    if (data) setOyunlar(data);
  }

  function goster(m, ok=true) { setMesaj(ok ? '✓ '+m : '❌ '+m); setTimeout(()=>setMesaj(''), 3000); }

  // ODALAR
  async function odaKaydet() {
    setYukleniyor(true);
    if (!odaFormu.isim.trim()) { goster('Oda adı zorunlu!', false); setYukleniyor(false); return; }
    const payload = { isim:odaFormu.isim, emoji:odaFormu.emoji, renk:odaFormu.renk, sira:Number(odaFormu.sira), is_active:true };
    const { error } = odaDuzenleId
      ? await supabase.from('odalar').update(payload).eq('id', odaDuzenleId)
      : await supabase.from('odalar').insert(payload);
    setYukleniyor(false);
    if (error) { goster(error.message, false); return; }
    goster(odaDuzenleId ? 'Oda güncellendi!' : 'Oda eklendi!');
    setOdaFormAcik(false); setOdaDuzenleId(null); setOdaFormu({ isim:'', emoji:'🎮', renk:'#4ECDC4', sira:0 });
    fetchOdalar();
  }
  async function odaSil(id) {
    if (!confirm('Bu odayı silmek istiyor musunuz? Oyunlar silinmez ama odası kalkar.')) return;
    await supabase.from('odalar').delete().eq('id', id);
    goster('Oda silindi.'); fetchOdalar();
  }
  function odaDuzenle(oda) {
    setOdaFormu({ isim:oda.isim, emoji:oda.emoji, renk:oda.renk, sira:oda.sira });
    setOdaDuzenleId(oda.id); setOdaFormAcik(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  // OYUNLAR
  function slugOlustur(isim) {
    return isim.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  }
  async function oyunKaydet() {
    setYukleniyor(true);
    if (!oyunFormu.isim.trim() || !oyunFormu.url.trim() || !oyunFormu.oda_id) {
      goster('Ad, URL ve Oda zorunlu!', false); setYukleniyor(false); return;
    }
    const slug = oyunFormu.slug || slugOlustur(oyunFormu.isim);
    const payload = { isim:oyunFormu.isim, slug, url:oyunFormu.url, oda_id:oyunFormu.oda_id, renk:oyunFormu.renk, is_active:oyunFormu.is_active };
    const { error } = oyunDuzenleId
      ? await supabase.from('oyunlar').update(payload).eq('id', oyunDuzenleId)
      : await supabase.from('oyunlar').insert(payload);
    setYukleniyor(false);
    if (error) { goster(error.message, false); return; }
    goster(oyunDuzenleId ? 'Oyun güncellendi!' : 'Oyun eklendi!');
    setOyunFormAcik(false); setOyunDuzenleId(null); setOyunFormu({ isim:'', slug:'', url:'', oda_id:'', renk:'#4ECDC4', is_active:true });
    fetchOyunlar();
  }
  async function oyunSil(id) {
    if (!confirm('Bu oyunu silmek istiyor musunuz?')) return;
    await supabase.from('oyunlar').delete().eq('id', id);
    goster('Oyun silindi.'); fetchOyunlar();
  }
  async function oyunAktifToggle(oyun) {
    await supabase.from('oyunlar').update({ is_active: !oyun.is_active }).eq('id', oyun.id);
    fetchOyunlar();
  }
  function oyunDuzenle(oyun) {
    setOyunFormu({ isim:oyun.isim, slug:oyun.slug, url:oyun.url||'', oda_id:oyun.oda_id||'', renk:oyun.renk||'#4ECDC4', is_active:oyun.is_active });
    setOyunDuzenleId(oyun.id); setOyunFormAcik(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  const filtreliOyunlar = seciliOda ? oyunlar.filter(o=>o.oda_id===seciliOda) : oyunlar;

  const inp = (s) => ({ border:'1.5px solid #ddd', borderRadius:8, padding:'9px 12px', fontSize:14, fontFamily:'sans-serif', outline:'none', background:'#fff', width:'100%', boxSizing:'border-box', ...s });
  const btn = (bg, s) => ({ background:bg, color:'#fff', border:'none', padding:'9px 20px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'sans-serif', ...s });

  // ŞİFRE EKRANI
  if (!girisYapildi) return (
    <div style={{ fontFamily:'sans-serif', background:'#f5f5f5', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 36px', width:'100%', maxWidth:360, boxShadow:'0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:40 }}>🎮</div>
          <div style={{ fontSize:22, fontWeight:700, marginTop:8 }}>Admin Paneli</div>
          <div style={{ fontSize:13, color:'#888', marginTop:4 }}>Bakırköy BİLSEM Oyun Atölyesi</div>
        </div>
        <input type="password" placeholder="Şifre" value={sifre} onChange={e=>setSifre(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGiris()} style={inp({ marginBottom:12 })}/>
        {sifreHata && <div style={{ color:'#e53e3e', fontSize:13, marginBottom:8 }}>{sifreHata}</div>}
        <button onClick={handleGiris} style={btn('linear-gradient(135deg,#667eea,#764ba2)', { width:'100%', padding:'12px', fontSize:14 })}>Giriş Yap →</button>
        <div style={{ textAlign:'center', marginTop:16 }}><a href="/" style={{ color:'#764ba2', fontSize:12, textDecoration:'none' }}>← Siteye dön</a></div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:'sans-serif', background:'#f0f2f5', minHeight:'100vh' }}>
      {/* TOP BAR */}
      <div style={{ background:'linear-gradient(135deg,#667eea,#764ba2)', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:24 }}>🎮</span>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:16 }}>Admin Paneli</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:11 }}>Bakırköy BİLSEM Oyun Atölyesi</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <a href="/" target="_blank" style={{ color:'rgba(255,255,255,0.8)', fontSize:13, textDecoration:'none' }}>🌐 Siteyi Gör</a>
          <button onClick={()=>setGirisYapildi(false)} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'5px 14px', borderRadius:16, cursor:'pointer', fontSize:12 }}>Çıkış</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, padding:'20px 24px 0' }}>
        {[
          { label:'Toplam Oda', value:odalar.length, emoji:'🏠', bg:'#EEF2FF' },
          { label:'Toplam Oyun', value:oyunlar.length, emoji:'🎮', bg:'#F0FDF4' },
          { label:'Aktif Oyun', value:oyunlar.filter(o=>o.is_active).length, emoji:'✅', bg:'#FFF7ED' },
          { label:'Pasif Oyun', value:oyunlar.filter(o=>!o.is_active).length, emoji:'⏸️', bg:'#FFF1F2' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'16px 18px', border:'1px solid #e5e7eb' }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{s.emoji}</div>
            <div style={{ fontSize:28, fontWeight:700 }}>{s.value}</div>
            <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'16px 24px 40px' }}>
        {/* MESAJ */}
        {mesaj && <div style={{ background:mesaj.startsWith('✓')?'#f0fdf4':'#fff1f2', border:`1px solid ${mesaj.startsWith('✓')?'#86efac':'#fca5a5'}`, borderRadius:8, padding:'10px 16px', marginBottom:16, fontSize:13, fontWeight:600, color:mesaj.startsWith('✓')?'#16a34a':'#dc2626' }}>{mesaj}</div>}

        {/* TABS */}
        <div style={{ display:'flex', gap:0, marginBottom:20, background:'#fff', borderRadius:10, padding:4, width:'fit-content', border:'1px solid #e5e7eb' }}>
          {[['odalar','🏠 Odalar'],['oyunlar','🎮 Oyunlar']].map(([key,label]) => (
            <button key={key} onClick={()=>setTab(key)} style={{ background:tab===key?'linear-gradient(135deg,#667eea,#764ba2)':'none', color:tab===key?'#fff':'#6b7280', border:'none', padding:'8px 20px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'sans-serif' }}>{label}</button>
          ))}
        </div>

        {/* ===== ODALAR TAB ===== */}
        {tab === 'odalar' && (
          <div>
            {odaFormAcik && (
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'24px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div style={{ fontSize:18, fontWeight:700 }}>{odaDuzenleId ? '✏️ Oda Düzenle' : '➕ Yeni Oda Ekle'}</div>
                  <button onClick={()=>{setOdaFormAcik(false);setOdaDuzenleId(null);setOdaFormu({isim:'',emoji:'🎮',renk:'#4ECDC4',sira:0});}} style={{ background:'none', border:'1px solid #ddd', borderRadius:16, padding:'3px 12px', cursor:'pointer', fontSize:12 }}>✕ Kapat</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Oda Adı *</label>
                    <input value={odaFormu.isim} onChange={e=>setOdaFormu(p=>({...p,isim:e.target.value}))} placeholder="Hayal Odası" style={inp()}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Sıra No</label>
                    <input type="number" value={odaFormu.sira} onChange={e=>setOdaFormu(p=>({...p,sira:e.target.value}))} placeholder="1" style={inp()}/>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:6 }}>Emoji Seç</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {EMOJI_LISTESI.map(e => (
                      <button key={e} onClick={()=>setOdaFormu(p=>({...p,emoji:e}))} style={{ background:odaFormu.emoji===e?'#667eea22':'#f9fafb', border:`2px solid ${odaFormu.emoji===e?'#667eea':'#e5e7eb'}`, borderRadius:8, padding:'6px 8px', cursor:'pointer', fontSize:20 }}>{e}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:6 }}>Renk Seç</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {RENK_LISTESI.map(r => (
                      <button key={r} onClick={()=>setOdaFormu(p=>({...p,renk:r}))} style={{ width:32, height:32, borderRadius:'50%', background:r, border:`3px solid ${odaFormu.renk===r?'#333':'transparent'}`, cursor:'pointer' }}/>
                    ))}
                  </div>
                </div>
                {/* Önizleme */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ background:`radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), ${odaFormu.renk}88)`, border:`2px solid ${odaFormu.renk}`, borderRadius:16, padding:'14px 20px', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:32 }}>{odaFormu.emoji}</span>
                    <span style={{ fontWeight:700, fontSize:16 }}>{odaFormu.isim || 'Oda Adı'}</span>
                  </div>
                  <span style={{ fontSize:12, color:'#9ca3af' }}>Önizleme</span>
                </div>
                <button onClick={odaKaydet} disabled={yukleniyor} style={btn('linear-gradient(135deg,#667eea,#764ba2)', { opacity:yukleniyor?0.6:1 })}>
                  {yukleniyor ? 'Kaydediliyor...' : odaDuzenleId ? 'Güncelle ✓' : 'Oda Ekle ✓'}
                </button>
              </div>
            )}

            {!odaFormAcik && <button onClick={()=>setOdaFormAcik(true)} style={btn('linear-gradient(135deg,#667eea,#764ba2)', { marginBottom:16 })}>+ Yeni Oda Ekle</button>}

            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #e5e7eb', fontWeight:700, fontSize:14 }}>Oda Listesi ({odalar.length})</div>
              {odalar.length === 0 && <div style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>Henüz oda eklenmemiş.</div>}
              {odalar.map((oda, idx) => {
                const oyunSayisi = oyunlar.filter(o=>o.oda_id===oda.id).length;
                return (
                  <div key={oda.id} style={{ padding:'12px 18px', borderBottom:idx<odalar.length-1?'1px solid #f3f4f6':'none', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), ${oda.renk}88)`, border:`2px solid ${oda.renk}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{oda.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{oda.isim}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>Sıra: {oda.sira} · {oyunSayisi} oyun</div>
                    </div>
                    <a href={`/oda/${oda.id}`} target="_blank" style={{ color:'#667eea', fontSize:12, textDecoration:'none' }}>Görüntüle</a>
                    <button onClick={()=>odaDuzenle(oda)} style={btn('#dbeafe', { color:'#1d4ed8', padding:'6px 12px' })}>✏️</button>
                    <button onClick={()=>odaSil(oda.id)} style={btn('#fee2e2', { color:'#dc2626', padding:'6px 12px' })}>🗑️</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== OYUNLAR TAB ===== */}
        {tab === 'oyunlar' && (
          <div>
            {oyunFormAcik && (
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'24px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div style={{ fontSize:18, fontWeight:700 }}>{oyunDuzenleId ? '✏️ Oyun Düzenle' : '➕ Yeni Oyun Ekle'}</div>
                  <button onClick={()=>{setOyunFormAcik(false);setOyunDuzenleId(null);setOyunFormu({isim:'',slug:'',url:'',oda_id:'',renk:'#4ECDC4',is_active:true});}} style={{ background:'none', border:'1px solid #ddd', borderRadius:16, padding:'3px 12px', cursor:'pointer', fontSize:12 }}>✕ Kapat</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Oyun Adı *</label>
                    <input value={oyunFormu.isim} onChange={e=>{ setOyunFormu(p=>({...p,isim:e.target.value,slug:slugOlustur(e.target.value)})); }} placeholder="Mila'nın Macerası" style={inp()}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Slug (otomatik)</label>
                    <input value={oyunFormu.slug} onChange={e=>setOyunFormu(p=>({...p,slug:e.target.value}))} placeholder="milanin-macerasi" style={inp({ background:'#f9fafb' })}/>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Oyun URL * (embed linki)</label>
                  <input value={oyunFormu.url} onChange={e=>setOyunFormu(p=>({...p,url:e.target.value}))} placeholder="https://..." style={inp()}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Oda Seç *</label>
                    <select value={oyunFormu.oda_id} onChange={e=>setOyunFormu(p=>({...p,oda_id:e.target.value}))} style={inp()}>
                      <option value="">-- Oda Seçin --</option>
                      {odalar.map(o => <option key={o.id} value={o.id}>{o.emoji} {o.isim}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, textTransform:'uppercase', color:'#9ca3af', fontWeight:700, display:'block', marginBottom:4 }}>Durum</label>
                    <select value={oyunFormu.is_active?'1':'0'} onChange={e=>setOyunFormu(p=>({...p,is_active:e.target.value==='1'}))} style={inp()}>
                      <option value="1">✅ Aktif</option>
                      <option value="0">⏸️ Pasif</option>
                    </select>
                  </div>
                </div>
                <button onClick={oyunKaydet} disabled={yukleniyor} style={btn('linear-gradient(135deg,#f093fb,#f5576c)', { opacity:yukleniyor?0.6:1 })}>
                  {yukleniyor ? 'Kaydediliyor...' : oyunDuzenleId ? 'Güncelle ✓' : 'Oyun Ekle ✓'}
                </button>
              </div>
            )}

            {!oyunFormAcik && <button onClick={()=>setOyunFormAcik(true)} style={btn('linear-gradient(135deg,#f093fb,#f5576c)', { marginBottom:16 })}>+ Yeni Oyun Ekle</button>}

            {/* Oda filtresi */}
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <button onClick={()=>setSeciliOda(null)} style={{ background:seciliOda===null?'#374151':'#fff', color:seciliOda===null?'#fff':'#6b7280', border:'1px solid #e5e7eb', padding:'5px 14px', borderRadius:16, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                Tümü ({oyunlar.length})
              </button>
              {odalar.map(o => (
                <button key={o.id} onClick={()=>setSeciliOda(o.id)} style={{ background:seciliOda===o.id?o.renk:'#fff', color:seciliOda===o.id?'#fff':'#6b7280', border:`1px solid ${o.renk}`, padding:'5px 14px', borderRadius:16, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                  {o.emoji} {o.isim} ({oyunlar.filter(x=>x.oda_id===o.id).length})
                </button>
              ))}
            </div>

            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #e5e7eb', fontWeight:700, fontSize:14 }}>Oyun Listesi ({filtreliOyunlar.length})</div>
              {filtreliOyunlar.length === 0 && <div style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>Bu odada henüz oyun yok.</div>}
              {filtreliOyunlar.map((oyun, idx) => {
                const odasi = odalar.find(o=>o.id===oyun.oda_id);
                return (
                  <div key={oyun.id} style={{ padding:'12px 18px', borderBottom:idx<filtreliOyunlar.length-1?'1px solid #f3f4f6':'none', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <div style={{ flex:1, minWidth:160 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>{oyun.isim}</span>
                        <span style={{ fontSize:10, background:oyun.is_active?'#dcfce7':'#fee2e2', color:oyun.is_active?'#16a34a':'#dc2626', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{oyun.is_active?'Aktif':'Pasif'}</span>
                      </div>
                      {odasi && <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{odasi.emoji} {odasi.isim}</div>}
                      <div style={{ fontSize:11, color:'#9ca3af' }}>{oyun.slug}</div>
                    </div>
                    <button onClick={()=>oyunAktifToggle(oyun)} style={btn(oyun.is_active?'#fee2e2':'#dcfce7', { color:oyun.is_active?'#dc2626':'#16a34a', padding:'5px 12px', fontSize:11 })}>
                      {oyun.is_active?'Pasif Yap':'Aktif Yap'}
                    </button>
                    <button onClick={()=>oyunDuzenle(oyun)} style={btn('#dbeafe', { color:'#1d4ed8', padding:'5px 12px' })}>✏️</button>
                    <button onClick={()=>oyunSil(oyun.id)} style={btn('#fee2e2', { color:'#dc2626', padding:'5px 12px' })}>🗑️</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
