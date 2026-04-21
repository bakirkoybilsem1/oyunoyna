"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPanel() {
  const [oyun, setOyun] = useState({ isim: "", renk: "#33ccff", html: "", slug: "" });
  const [loading, setLoading] = useState(false);

  const oyunKaydet = async () => {
    if (!oyun.isim || !oyun.slug || !oyun.html) {
      return alert("Lütfen tüm alanları doldur!");
    }
    
    setLoading(true);
    const { error } = await supabase
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
      alert("Eyvah, bir hata oldu: " + error.message);
    } else {
      alert("Uçurtma başarıyla havalandı! 🪁");
      setOyun({ isim: "", renk: "#33ccff", html: "", slug: "" });
    }
    setLoading(false);
  };

  return (
    <div className="p-10 bg-sky-100 min-h-screen flex flex-col items-center font-sans">
      <h1 className="text-3xl font-black text-blue-600 mb-8 uppercase">🪁 Oyun Yönetim Merkezi</h1>
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-blue-200">
        <div className="space-y-4">
          <input type="text" placeholder="Oyunun Adı" className="w-full border-2 p-3 rounded-xl outline-none focus:border-orange-400"
            value={oyun.isim} onChange={(e) => setOyun({...oyun, isim: e.target.value})} />
          
          <input type="color" className="w-full h-12 cursor-pointer rounded-lg"
            value={oyun.renk} onChange={(e) => setOyun({...oyun, renk: e.target.value})} />
          
          <input type="text" placeholder="URL-adi (örn: araba-oyunu)" className="w-full border-2 p-3 rounded-xl outline-none focus:border-orange-400"
            value={oyun.slug} onChange={(e) => setOyun({...oyun, slug: e.target.value})} />
          
          <textarea placeholder="HTML veya Iframe Kodu" className="w-full border-2 p-3 rounded-xl h-32 outline-none focus:border-orange-400 font-mono text-xs"
            value={oyun.html} onChange={(e) => setOyun({...oyun, html: e.target.value})} />
          
          <button onClick={oyunKaydet} disabled={loading}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
            {loading ? "GÖNDERİLİYOR..." : "YAYINLA! 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
