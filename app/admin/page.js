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

export default function Admin() {
  const [oyunlar, setOyunlar] = useState([]);
  const [tab, setTab] = useState('list');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(true);
  const [uploadType, setUploadType] = useState('file');
  const [form, setForm] = useState({
    isim:'', slug:'', renk:'#33ccff',
    html_kodu:'', game_url:'', kaynak_url:''
  });
  const fileRef = useRef();

  const fetchOyunlar = async () => {
    const { data } = await supabase.from('oyunlar').select('*').order('created_at',{ascending:false});
    setOyunlar(data || []);
  };
  useEffect(() => { fetchOyunlar(); }, []);

  const showMsg = (text, isOk=true) => { setMsg(text); setOk(isOk); setTimeout(()=>setMsg(''),4000); };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(html|htm)$/i)) { showMsg('❌ Sadece .html dosyası!', false); return; }
    const text = await file.text();
    setForm(f=>({...f, html_kodu:text}));
    showMsg(`✅ ${file.name} yüklendi (${Math.round(text.length/1024)}KB)`);
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
    const { error } = await supabase.from('oyunlar').insert([{
      isim: form.isim.trim(),
      slug: form.slug || slugify(form.isim),
      renk: form.renk,
      html_kodu,
      kaynak_url: form.kaynak_url || null,
      is_active: true,
    }]);
    if (error) { showMsg(`❌ ${error.message}`,false); }
    else {
      showMsg('✅ Oyun eklendi!');
      setForm({ isim:'', slug:'', renk:'#33ccff', html_kodu:'', game_url:'', kaynak_url:'' });
      if (fileRef.current) fileRef.current.value='';
      await fetchOyunlar();
      setTimeout(()=>setTab('list'),1200);
    }
    setSaving(false);
  };

  const handleDelete = async (id, isim) => {
    if (!confirm(`"${isim}" silinsin mi?`)) return;
    await supabase.from('oyunlar').delete().eq('id',id);
    showMsg(`✅ "${isim}" silindi`);
    fetchOyunlar();
  };

  const inp = { width:'100%', padding:'12px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.08)', color:'white', fontSize:'1rem', fontFamily:"'Fredoka One',cursive", outline:'none', boxSizing:'border-box' };
  const btnTab = (a) => ({ padding:'8px 20px', borderRadius:50, border:'none', cursor:'pointer', fontFamily:"'Fredoka One',cursive", fontWeight:700, background: a?'linear-gradient(135deg,#f093fb,#f5576c)':'rgba(255,255,255,0.1)', color: a?'white':'rgba(255,255,255,0.5)' });
  const lbl = { display:'block', color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginBottom:6 };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c29,#302b63)', fontFamily:"'Fredoka One',cursive", color:'white' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />

      <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ margin:0, fontSize:'1.8rem' }}>🎮 Admin Panel</h1>
        <a href="/" style={{ color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Siteye Dön</a>
      </div>

      <div style={{ display:'flex', gap:8, padding:'16px 28px' }}>
        <button style={btnTab(tab==='list')} onClick={()=>setTab('list')}>📋 Oyunlar ({oyunlar.length})</button>
        <button style={btnTab(tab==='add')} onClick={()=>setTab('add')}>➕ Yeni Oyun</button>
      </div>

      {msg && (
        <div style={{ margin:'0 28px 12px', padding:'12px 16px', borderRadius:12, background:ok?'rgba(79,209,197,0.15)':'rgba(245,87,108,0.15)', color:ok?'#4fd1c5':'#f5576c', border:`1px solid ${ok?'rgba(79,209,197,0.4)':'rgba(245,87,108,0.4)'}` }}>
          {msg}
        </div>
      )}

      <div style={
