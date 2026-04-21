'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

const EMOJIS = ['🎮', '🚀', '⚽', '🎯', '🧩', '🎲', '🏆', '🌟', '🦄', '🐉', '🎪', '🎨', '🏎️', '🤖', '👾', '🎸'];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('list'); // 'list' | 'add'
  const fileInputRef = useRef();

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    emoji: '🎮',
    html_content: '',
    game_url: '',
    uploadType: 'file', // 'file' | 'url' | 'paste'
  });

  const fetchGames = async () => {
    setLoading(true);
    const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    setGames(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchGames(); }, []);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(f => ({ ...f, title, slug: slugify(title) }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setMsg('❌ Sadece .html dosyası yükleyebilirsiniz!');
      return;
    }
    const text = await file.text();
    setForm(f => ({ ...f, html_content: text }));
    setMsg(`✅ "${file.name}" dosyası yüklendi (${Math.round(text.length / 1024)}KB)`);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setMsg('❌ Oyun adı zorunlu!'); return; }
    if (form.uploadType === 'file' && !form.html_content) { setMsg('❌ HTML dosyası seçin!'); return; }
    if (form.uploadType === 'paste' && !form.html_content) { setMsg('❌ HTML kodunu yapıştırın!'); return; }
    if (form.uploadType === 'url' && !form.game_url) { setMsg('❌ URL girin!'); return; }

    setSaving(true);
    setMsg('');

    const payload = {
      title: form.title.trim(),
      slug: form.slug || slugify(form.title),
      emoji: form.emoji,
      html_content: form.uploadType !== 'url' ? form.html_content : null,
      game_url: form.uploadType === 'url' ? form.game_url : null,
    };

    const { error } = await supabase.from('games').insert([payload]);

    if (error) {
      setMsg(`❌ Hata: ${error.message}`);
    } else {
      setMsg('✅ Oyun başarıyla eklendi!');
      setForm({ title: '', slug: '', emoji: '🎮', html_content: '', game_url: '', uploadType: 'file' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchGames();
      setTimeout(() => setTab('list'), 1500);
    }
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" oyununu silmek istediğine emin misin?`)) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) { setMsg(`❌ Silinemedi: ${error.message}`); }
    else { setMsg(`✅ "${title}" silindi.`); fetchGames(); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: "'Fredoka One', cursive" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');`}</style>

      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="text-3xl text-white font-bold">🎮 OyunOyna Admin</h1>
          <p className="text-white/50 text-sm">{games.length} oyun mevcut</p>
        </div>
        <a href="/" className="text-white/60 hover:text-white text-sm transition-colors">← Siteye Dön</a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4">
        {['list', 'add'].map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg(''); }}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all"
            style={tab === t ? { background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' } : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            {t === 'list' ? '📋 Oyun Listesi' : '➕ Yeni Oyun'}
          </button>
        ))}
      </div>

      <div className="px-6 py-4 max-w-4xl">
        {/* Message */}
        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {msg}
          </div>
        )}

        {/* GAME LIST */}
        {tab === 'list' && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-white/50 text-center py-10">Yükleniyor...</div>
            ) : games.length === 0 ? (
              <div className="text-white/50 text-center py-10">Henüz oyun yok. Ekle!</div>
            ) : (
              games.map(g => (
                <div key={g.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="text-3xl">{g.emoji || '🎮'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{g.title}</div>
                    <div className="text-white/40 text-xs">/oyun/{g.slug}</div>
                    <div className="text-white/30 text-xs mt-1">
                      {g.html_content ? `HTML (${Math.round(g.html_content.length / 1024)}KB)` : g.game_url ? `URL: ${g.game_url}` : '—'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/oyun/${g.slug}`} target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(79,209,197,0.2)', color: '#4fd1c5', border: '1px solid rgba(79,209,197,0.3)' }}>
                      ▶ Oyna
                    </a>
                    <button onClick={() => handleDelete(g.id, g.title)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(245,87,108,0.2)', color: '#f5576c', border: '1px solid rgba(245,87,108,0.3)' }}>
                      🗑 Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ADD GAME */}
        {tab === 'add' && (
          <div className="space-y-5 max-w-xl">
            {/* Title */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">Oyun Adı *</label>
              <input
                value={form.title}
                onChange={handleTitleChange}
                placeholder="örn: Araba Yarışı"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">URL Slug</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-white/30 text-sm">/oyun/</span>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="flex-1 bg-transparent text-white outline-none text-sm"
                />
              </div>
            </div>

            {/* Emoji picker */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className="text-2xl w-10 h-10 rounded-xl transition-all"
                    style={form.emoji === e ? { background: 'rgba(240,147,251,0.4)', border: '2px solid #f093fb' } : { background: 'rgba(255,255,255,0.07)', border: '2px solid transparent' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload type */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">Oyun Tipi</label>
              <div className="flex gap-2">
                {[['file', '📁 HTML Dosyası'], ['paste', '📝 HTML Yapıştır'], ['url', '🔗 URL']].map(([val, label]) => (
                  <button key={val} onClick={() => setForm(f => ({ ...f, uploadType: val, html_content: '', game_url: '' }))}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={form.uploadType === val ? { background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            {form.uploadType === 'file' && (
              <div>
                <label className="text-white/70 text-sm mb-1.5 block">HTML Dosyası Seç</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 rounded-2xl text-center cursor-pointer transition-all hover:border-purple-400"
                  style={{ border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)' }}
                >
                  {form.html_content ? (
                    <div>
                      <div className="text-4xl mb-2">✅</div>
                      <div className="text-green-300 text-sm">Dosya yüklendi ({Math.round(form.html_content.length / 1024)}KB)</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📁</div>
                      <div className="text-white/50 text-sm">Tıkla veya sürükle bırak</div>
                      <div className="text-white/30 text-xs mt-1">.html veya .htm dosyası</div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
              </div>
            )}

            {/* Paste HTML */}
            {form.uploadType === 'paste' && (
              <div>
                <label className="text-white/70 text-sm mb-1.5 block">HTML Kodunu Yapıştır</label>
                <textarea
                  value={form.html_content}
                  onChange={e => setForm(f => ({ ...f, html_content: e.target.value }))}
                  placeholder="<!DOCTYPE html>..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl text-white/80 placeholder-white/20 outline-none text-xs font-mono resize-y"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              </div>
            )}

            {/* URL */}
            {form.uploadType === 'url' && (
              <div>
                <label className="text-white/70 text-sm mb-1.5 block">Oyun URL'si</label>
                <input
                  value={form.game_url}
                  onChange={e => setForm(f => ({ ...f, game_url: e.target.value }))}
                  placeholder="https://example.com/oyun"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', boxShadow: '0 8px 32px rgba(240,147,251,0.3)' }}
            >
              {saving ? '⏳ Kaydediliyor...' : '✅ Oyunu Kaydet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
