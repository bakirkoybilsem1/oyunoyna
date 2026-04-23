'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function slugify(t) {
  return t.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

const EMPTY = { isim:'', slug:'', renk:'#33ccff', html_kodu:'', game_url:'' };

export default function Admin() {
  const [oyunlar, setOyunlar] = useState([]);
  const [tab, setTab] = useState('list');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(true);
  const [uploadType, setUploadType] = useState('file');
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const fileRef = useRef();

  const loadOyunlar = async () => {
    const { data } = await supabase.from('oyunlar').select('*').order('created_at',{ascending:false});
    setOyunlar(data || []);
  };

  useEffect(() => { loadOyunlar(); }, []);

  const showMsg = (text, isOk=true) => { setMsg(text); setOk(isOk); setTimeout(()=>setMsg(''),4000); };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(html|htm)$/i)) { showMsg('❌ Sadece .html dosyası!', false); return; }
    const text = await file.text();
    setForm(f=>({...f, html_kodu:text}));
    showMsg(`✅ ${file.name} yüklendi (${Math.round(text.length/1024)}KB)`);
  };

  const handleEdit = (o) => {
    setEditId(o.id);
    const isUrl = o.html_kodu?.startsWith('http');
    setUploadType(isUrl ? 'url' : 'paste');
    setForm({ isim:o.isim, slug:o.slug, renk:o.renk||'#33ccff', html_kodu: isUrl ? '' : (o.html_kodu||''), game_url: isUrl ? o.html_kodu : '' });
    setTab('add');
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(EMPTY);
    setUploadType('file');
    setTab('list');
  };

  const handleSave = async () => {
    if (!form.isim.trim()) { showMsg('❌ Oyun adı zorunlu!',false); return; }
    let html_kodu = '';
    if (uploadType==='file'||uploadType==='paste') {
      if (!form.html_kodu.trim()) { showMsg('❌ HTML gerekli!',false); return; }
      html_kodu = form.html_kodu;
    } else {
      if (!form.game_url.trim()) { showMsg('❌ URL gerekli!',false); return; }
      html_kodu = form.game_url;
    }
    setSaving(true);
    let error;
    if (editId) {
      ({ error } = await supabase.from('oyunlar').update({ isim:form.isim.trim(), slug:form.slug||slugify(form.isim), renk:form.renk, html_kodu }).eq('id', editId));
    } else {
      ({ error } = await supabase.from('oyunlar').insert([{ isim:form.isim.trim(), slug:form.slug||slugify(form.isim), renk:form.renk, html_kodu, is_active:true }]));
    }
    if (error) { showMsg(`❌ ${error.message}`,false); }
    else {
      showMsg(editId ? '✅ Oyun güncellendi!' : '✅ Oyun eklendi!');
      setForm(EMPTY);
      setEditId(null);
      if (fileRef.current) fileRef.current.value='';
      await loadOyunlar();
      setTimeout(()=>setTab('list'),1200);
    }
    setSaving(false);
  };

  const handleDelete = async (id, isim) => {
    if (!confirm(`"${isim}" silinsin mi?`)) return;
    await supabase.from('oyunlar').delete().eq('id',id);
    showMsg(`✅ "${isim}" silindi`);
    loadOyunlar();
  };

  const handleToggle = async (id, current) => {
    await supabase.from('oyunlar').update({ is_active:!current }).eq('id',id);
    loadOyunlar();
  };

  const inp = { width:'100%', padding:'12px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'1rem', fontFamily:"'Fredoka One',cursive", outline:'none', boxSizing:'border-box' };
  const btnTab = (a) => ({ padding:'8px 20px', borderRadius:50, border:'none', cursor:'pointer', fontFamily:"'Fredoka One',cursive", fontWeight:700, background:a?'linear-gradient(135deg,#f093fb,#f5576c)':'rgba(255,255,255,0.1)', color:a?'white':'rgba(255,255,255,0.5)' });

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c29,#302b63)', fontFamily:"'Fredoka One',cursive", color:'white' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet"/>
      <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ margin:0, fontSize:'1.8rem' }}>🎮 Admin Panel</h1>
        <a href="/" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Siteye Dön</a>
      </div>

      <div style={{ display:'flex', gap:8, padding:'16px 28px' }}>
        <button style={btnTab(tab==='list')} onClick={handleCancel}>📋 Oyunlar ({oyunlar.length})</button>
        <button style={btnTab(tab==='add')} onClick={()=>{ setEditId(null); setForm(EMPTY); setUploadType('file'); setTab('add'); }}>➕ Yeni Oyun</button>
      </div>

      {msg && <div style={{ margin:'0 28px 12px', padding:'12px 16px', borderRadius:12, background:ok?'rgba(79,209,197,0.15)':'rgba(245,87,108,0.15)', color:ok?'#4fd1c5':'#f5576c', border:`1px solid ${ok?'rgba(79,209,197,0.4)':'rgba(245,87,108,0.4)'}` }}>{msg}</div>}

      <div style={{ padding:'0 28px 40px' }}>

        {tab==='list' && (
          <div>
            {oyunlar.length===0 && <p style={{ color:'rgba(255,255,255,0.4)', marginTop:40, textAlign:'center' }}>Henüz oyun yok. ➕ Yeni Oyun ile ekle!</p>}
            {oyunlar.map(o => (
              <div key={o.id} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, marginBottom:10 }}>
                <div style={{ width:14, height:40, borderRadius:4, background:o.renk||'#33ccff', flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.isim}</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.75rem' }}>/oyun/{o.slug}</div>
                  <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:2 }}>
                    {o.html_kodu?(o.html_kodu.startsWith('http')?'🔗 URL':'📄 HTML'):'—'} {o.is_active?'✅ Aktif':'❌ Gizli'}
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <a href={`/oyun/${o.slug}`} target="_blank" rel="noreferrer" style={{ padding:'6px 12px', borderRadius:8, textDecoration:'none', background:'rgba(79,209,197,0.15)', color:'#4fd1c5', border:'1px solid rgba(79,209,197,0.25)', fontSize:'0.85rem' }}>▶</a>
                  <button onClick={()=>handleEdit(o)} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid rgba(255,200,0,0.3)', background:'rgba(255,200,0,0.1)', color:'#ffd700', cursor:'pointer', fontFamily:"'Fredoka One',cursive" }}>✏️</button>
                  <button onClick={()=>handleToggle(o.id,o.is_active)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', cursor:'pointer', fontSize:'0.85rem' }}>{o.is_active?'🙈':'👁'}</button>
                  <button onClick={()=>handleDelete(o.id,o.isim)} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid rgba(245,87,108,0.3)', background:'rgba(245,87,108,0.15)', color:'#f5576c', cursor:'pointer', fontFamily:"'Fredoka One',cursive" }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='add' && (
          <div style={{ maxWidth:520 }}>
            {editId && <div style={{ marginBottom:16, padding:'10px 16px', borderRadius:10, background:'rgba(255,200,0,0.1)', border:'1px solid rgba(255,200,0,0.3)', color:'#ffd700', fontSize:'0.9rem' }}>✏️ Düzenleme modu — mevcut oyunu güncelliyorsun</div>}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginBottom:6 }}>Oyun Adı *</label>
              <input style={inp} value={form.isim} onChange={e=>setForm(f=>({...f,isim:e.target.value,slug:editId?f.slug:slugify(e.target.value)}))} placeholder="örn: Araba Yarışı"/>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginBottom:6 }}>Slug (URL)</label>
              <input style={inp} value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="araba-yarisi"/>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginBottom:6 }}>Renk</label>
              <input type="color" value={form.renk} onChange={e=>setForm(f=>({...f,renk:e.target.value}))} style={{ width:48, height:40, borderRadius:8, border:'none', cursor:'pointer' }}/>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginBottom:6 }}>Oyun Tipi</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[['file','📁 Dosya'],['paste','📝 Yapıştır'],['url','🔗 URL']].map(([v,l])=>(
                  <button key={v} style={btnTab(uploadType===v)} onClick={()=>setUploadType(v)}>{l}</button>
                ))}
              </div>
            </div>
            {uploadType==='file' && (
              <div style={{ marginBottom:18 }}>
                <div onClick={()=>fileRef.current?.click()} style={{ padding:'36px 20px', borderRadius:16, textAlign:'center', border:'2px dashed rgba(255,255,255,0.2)', background:form.html_kodu?'rgba(79,209,197,0.08)':'rgba(255,255,255,0.04)', cursor:'pointer' }}>
                  {form.html_kodu?<><div style={{fontSize:'2rem'}}>✅</div><div style={{color:'#4fd1c5',marginTop:8}}>Yüklendi ({Math.round(form.html_kodu.length/1024)}KB)</div></>:<><div style={{fontSize:'2rem'}}>📁</div><div style={{color:'rgba(255,255,255,0.5)',marginTop:8}}>.html dosyası seç</div></>}
                </div>
                <input ref={fileRef} type="file" accept=".html,.htm" onChange={handleFile} style={{ display:'none' }}/>
              </div>
            )}
            {uploadType==='paste' && (
              <div style={{ marginBottom:18 }}>
                <textarea value={form.html_kodu} onChange={e=>setForm(f=>({...f,html_kodu:e.target.value}))} placeholder="<!DOCTYPE html>..." rows={10} style={{ ...inp, fontFamily:'monospace', fontSize:'0.8rem', resize:'vertical', color:'#a8ff78' }}/>
              </div>
            )}
            {uploadType==='url' && (
              <div style={{ marginBottom:18 }}>
                <input style={inp} value={form.game_url} onChange={e=>setForm(f=>({...f,game_url:e.target.value}))} placeholder="https://example.com/oyun"/>
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:'14px', borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#f093fb,#f5576c)', color:'white', fontSize:'1.1rem', fontFamily:"'Fredoka One',cursive", opacity:saving?0.6:1 }}>
                {saving?'⏳ Kaydediliyor...':editId?'💾 Güncelle':'✅ Oyunu Kaydet'}
              </button>
              {editId && <button onClick={handleCancel} style={{ padding:'14px 20px', borderRadius:14, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontFamily:"'Fredoka One',cursive" }}>İptal</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
