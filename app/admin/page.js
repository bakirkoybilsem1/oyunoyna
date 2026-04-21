"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPanel() {
  const [oyun, setOyun] = useState({ isim: "", renk: "#33ccff", html: "", slug: "" });
  const [loading, setLoading] = useState(false);

  const oyunKaydet = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('oyunlar')
      .insert([
        { 
          isim: oyun.isim, 
          renk: oyun.renk, 
          html_kodu: oyun.html, 
          slug: oyun.slug.toLowerCase().replace(/ /g, '-') 
        }
      ]);

    if (error) {
      alert("Hata oluştu: " + error.message);
    } else {
      alert("Uçurtma başarıyla havalandı! 🪁");
      window.location.reload(); // Sayfayı yenile
    }
    setLoading(false);
  };

  return (
    <div className="p-10 bg-sky-100 min-h-screen font-sans flex flex-col items-center">
      <h1 className="text-3xl font-black text-blue-600 mb-8 uppercase tracking-tighter">🪁 Oyun Yönetim Merkezi</h1>
      
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg border-4 border-blue-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1">Oyunun Adı</label>
            <input type="text" placeholder="Örn: Renkli Boyama" className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 outline-none transition-all"
              onChange={(e) => setOyun({...oyun, isim: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1">Uçurtma Rengi</label>
            <input type="color" className="w-full h-12 p-1 rounded-xl cursor-pointer border-2 border-gray-200"
              value={oyun.renk} onChange={(e) => setOyun({...oyun, renk: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1">URL Adı (Slug)</label>
            <input type="text" placeholder="araba-oyunu" className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 outline-none"
              onChange={(e) => setOyun({...oyun, slug: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1">HTML / Iframe Kodu</label>
            <textarea placeholder="<iframe src='...'></iframe>" className="w-full border-2 border-gray-200 p-3 rounded-xl h-32 focus:border-blue-400 outline-none font-mono text-xs"
              onChange={(e) => setOyun({...oyun, html: e.target.value})} />
          </div>

          <button onClick={oyunKaydet} disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-white text-xl shadow-lg transition-transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}>
            {loading ? "GÖNDERİLİYOR..." : "OYUNU YAYINLA! 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
