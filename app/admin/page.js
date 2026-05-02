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
    const text = await file.text();
    setForm(f=>({...f, html_kodu:text}));
    showMsg(`✅ ${file.name} yüklendi`);
  };

  const handleSave = async () => {
    if (!form.isim.trim()) { showMsg('❌ Oyun adı zorunlu!',false); return; }
    let final_html = uploadType === 'url' ? form.game_url : form.html_kodu;
    setSaving(true);
    const { error } = await supabase.from('oyunlar').insert([{
      isim: form.isim.trim(),
      slug: form.slug || slugify(form.isim),
      renk: form.renk,
      html_kodu: final_html,
      is_active: true,
    }]);
    if (error) showMsg(`❌ ${error.message}`,false);
    else {
      showMsg('✅ Oyun eklendi!');
      setTab('list');
      fetchOyunlar();
    }
    setSaving(false);
  };

  const handleDelete = async (id, isim) => {
    if (!confirm(`"${isim}" silinsin mi?`)) return;
    await supabase.from('oyunlar').delete().eq('id',id);
    fetchOyunlar();
  };

  const inp = { width:'100%', padding:'12px', borderRadius:8, border:'1px solid #444', background:'#222', color:'white', marginBottom:10 };
  const btnTab = (a) => ({ padding:'10px 20px', borderRadius:20, border:'none', cursor:'pointer', background: a?'#f5576c':'#444', color:'white', marginRight:10 });
  const lbl = { display:'block', fontSize:'0.9rem', marginBottom:5, color:'#aaa' };

  return (
    <div style={{ minHeight:'100vh', background:'#0f0c29', color:'white', padding:20, fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
        <h1>Admin Panel</h1>
        <a href="/" style={{ color:'#aaa' }}>← Geri</a>
      </div>

      <div style={{ marginBottom:20 }}>
        <button style={btnTab(tab==='list')} onClick={()=>setTab('list')}>Liste</button>
        <button style={btnTab(tab==='add')} onClick={()=>setTab('add')}>Ekle</button>
      </div>

      {msg && <div style={{ padding:10, marginBottom:10, borderRadius:8, background: ok?'#1a4731':'#4a1a1a' }}>{msg}</div>}

      {tab === 'list' ? (
        <div>
          {oyunlar.map(o => (
            <div key={o.id} style={{ display:'flex', justifyContent:'space-between', padding:10, borderBottom:'1px solid #333' }}>
              <span>{o.isim}</span>
              <button onClick={()=>handleDelete(o.id, o.isim)} style={{ background:'none', border:'none', color:'red', cursor:'pointer' }}>Sil</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth:500 }}>
          <label style={lbl}>Oyun Adı</label>
          <input style={inp} value={form.isim} onChange={e=>setForm({...form, isim:e.target.value})} />
          
          <label style={lbl}>Yükleme Tipi</label>
          <select style={inp} value={uploadType} onChange={e=>setUploadType(e.target.value)}>
            <option value="file">Dosya</option>
            <option value="url">Link (URL)</option>
          </select>

          {uploadType === 'file' ? <input type="file" onChange={handleFile} style={inp} /> : <input style={inp} placeholder="https://..." value={form.game_url} onChange={e=>setForm({...form, game_url:e.target.value})} />}
          
          <button onClick={handleSave} disabled={saving} style={{ width:'100%', padding:12, background:'green', color:'white', border:'none', borderRadius:8 }}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}
    </div>
  );
}
